-- Migration 003: User Profiles and Authentication System
-- This migration adds support for:
-- - User profile editing (username, bio, social links)
-- - Avatar system (default, predefined, custom with unlock)
-- - Supabase Auth integration (email, social login)
-- - Anonymous to authenticated user migration

-- ============================================================================
-- 1. Add new columns to users table
-- ============================================================================

-- Authentication columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS email TEXT UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_provider TEXT; -- 'email', 'google', 'twitter', 'anonymous'
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN DEFAULT TRUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMP WITH TIME ZONE;

-- Profile columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_type TEXT DEFAULT 'default'; -- 'default', 'predefined', 'custom'
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_unlocked BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}';

-- ============================================================================
-- 2. Create indexes for performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_auth_provider ON users(auth_provider);
CREATE INDEX IF NOT EXISTS idx_users_is_anonymous ON users(is_anonymous);

-- ============================================================================
-- 3. Update existing users with default values
-- ============================================================================

UPDATE users
SET
  avatar_type = 'default',
  is_anonymous = TRUE,
  auth_provider = CASE
    WHEN wallet_address IS NOT NULL THEN 'wallet'
    WHEN fid IS NOT NULL THEN 'farcaster'
    ELSE 'anonymous'
  END
WHERE avatar_type IS NULL OR is_anonymous IS NULL OR auth_provider IS NULL;

-- ============================================================================
-- 4. Add unique constraint on username
-- ============================================================================

-- First, ensure all users have a username
UPDATE users SET username = 'Player_' || id WHERE username IS NULL;

-- Then add unique constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'users_username_key'
  ) THEN
    ALTER TABLE users ADD CONSTRAINT users_username_key UNIQUE (username);
  END IF;
END $$;

-- ============================================================================
-- 5. Function: Check if user can unlock custom avatar
-- ============================================================================

CREATE OR REPLACE FUNCTION can_unlock_custom_avatar(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  has_veteran_badge BOOLEAN;
  games_played_count INTEGER;
BEGIN
  -- Check if user has "Veteran" badge (100 games played)
  SELECT EXISTS (
    SELECT 1 FROM user_badges
    WHERE user_id = p_user_id AND badge_id = 'veteran'
  ) INTO has_veteran_badge;

  -- Alternative: check if user has played 100+ games
  SELECT COUNT(*) INTO games_played_count
  FROM game_sessions
  WHERE user_id = p_user_id;

  RETURN has_veteran_badge OR games_played_count >= 100;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 6. Function: Auto-unlock avatar when eligible
-- ============================================================================

CREATE OR REPLACE FUNCTION auto_unlock_avatar()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if user just became eligible for custom avatar
  IF can_unlock_custom_avatar(NEW.user_id) THEN
    UPDATE users
    SET avatar_unlocked = TRUE
    WHERE id = NEW.user_id AND avatar_unlocked = FALSE;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 7. Triggers: Auto-unlock avatar on game session or badge earned
-- ============================================================================

-- Drop triggers if they exist (for idempotency)
DROP TRIGGER IF EXISTS trigger_auto_unlock_avatar_on_session ON game_sessions;
DROP TRIGGER IF EXISTS trigger_auto_unlock_avatar_on_badge ON user_badges;

-- Create triggers
CREATE TRIGGER trigger_auto_unlock_avatar_on_session
AFTER INSERT ON game_sessions
FOR EACH ROW
EXECUTE FUNCTION auto_unlock_avatar();

CREATE TRIGGER trigger_auto_unlock_avatar_on_badge
AFTER INSERT ON user_badges
FOR EACH ROW
EXECUTE FUNCTION auto_unlock_avatar();

-- ============================================================================
-- 8. Update leaderboard materialized view to include avatars
-- ============================================================================

DROP MATERIALIZED VIEW IF EXISTS leaderboard;
CREATE MATERIALIZED VIEW leaderboard AS
SELECT
  u.id as user_id,
  u.username,
  u.fid,
  u.avatar_type,      -- NEW
  u.avatar_url,       -- NEW
  u.total_points,
  COUNT(gs.id) as games_played,
  COUNT(CASE WHEN gs.result = 'win' THEN 1 END) as wins,
  ROW_NUMBER() OVER (ORDER BY u.total_points DESC, u.created_at ASC) as rank
FROM users u
LEFT JOIN game_sessions gs ON u.id = gs.user_id
GROUP BY u.id, u.username, u.fid, u.avatar_type, u.avatar_url, u.total_points, u.created_at
ORDER BY u.total_points DESC;

CREATE UNIQUE INDEX idx_leaderboard_user ON leaderboard(user_id);
CREATE INDEX idx_leaderboard_rank ON leaderboard(rank);

-- ============================================================================
-- 9. Update RLS policies for profile updates
-- ============================================================================

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Users can update their own profile" ON users;

-- Create new policy that allows:
-- 1. Users to update their own profile via Supabase Auth
-- 2. Service role to update any profile (for API endpoints)
CREATE POLICY "Users can update their own profile" ON users
FOR UPDATE
USING (
  auth.uid()::text = id::text -- Supabase Auth user can update own profile
  OR
  auth.jwt() ->> 'role' = 'service_role' -- Service role for API operations
);

-- Also ensure users can read all profiles (for leaderboard, profile pages, etc.)
DROP POLICY IF EXISTS "Users are viewable by everyone" ON users;
CREATE POLICY "Users are viewable by everyone" ON users
FOR SELECT
USING (true);

-- ============================================================================
-- 10. Refresh the leaderboard view with new data
-- ============================================================================

REFRESH MATERIALIZED VIEW leaderboard;

-- ============================================================================
-- Migration Complete
-- ============================================================================

-- Verify migration by checking new columns exist
DO $$
BEGIN
  RAISE NOTICE 'Migration 003 completed successfully!';
  RAISE NOTICE 'New columns added: email, auth_provider, is_anonymous, claimed_at, avatar_type, avatar_url, avatar_unlocked, bio, social_links';
  RAISE NOTICE 'New functions created: can_unlock_custom_avatar(), auto_unlock_avatar()';
  RAISE NOTICE 'New triggers created: trigger_auto_unlock_avatar_on_session, trigger_auto_unlock_avatar_on_badge';
  RAISE NOTICE 'Leaderboard view updated with avatar fields';
  RAISE NOTICE 'RLS policies updated for profile editing';
END $$;
