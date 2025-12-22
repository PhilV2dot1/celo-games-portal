-- ============================================================================
-- Migration 005: Display Name and Personalization
-- ============================================================================
-- Adds display name, theme colors, and privacy settings for enhanced profiles

-- ============================================================================
-- 1. Display Name
-- ============================================================================

-- Add display_name column (supports spaces, unicode, emojis)
ALTER TABLE users ADD COLUMN IF NOT EXISTS display_name TEXT;

COMMENT ON COLUMN users.display_name IS 'Display name with spaces, unicode, and emojis (max 50 chars). Falls back to username if not set.';

-- Initialize display_name with existing username for current users
UPDATE users
SET display_name = username
WHERE display_name IS NULL AND username IS NOT NULL;

-- ============================================================================
-- 2. Theme Colors
-- ============================================================================

-- Add theme_color column (7 color options)
ALTER TABLE users ADD COLUMN IF NOT EXISTS theme_color TEXT DEFAULT 'yellow';

COMMENT ON COLUMN users.theme_color IS 'Profile theme color: yellow, blue, purple, green, red, orange, pink';

-- Add constraint for valid theme colors
ALTER TABLE users ADD CONSTRAINT valid_theme_color
  CHECK (theme_color IN ('yellow', 'blue', 'purple', 'green', 'red', 'orange', 'pink'));

-- ============================================================================
-- 3. Privacy Settings
-- ============================================================================

-- Profile visibility
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_visibility TEXT DEFAULT 'public';

COMMENT ON COLUMN users.profile_visibility IS 'Profile visibility: public, authenticated, private';

ALTER TABLE users ADD CONSTRAINT valid_profile_visibility
  CHECK (profile_visibility IN ('public', 'authenticated', 'private'));

-- Section visibility toggles
ALTER TABLE users ADD COLUMN IF NOT EXISTS show_stats BOOLEAN DEFAULT TRUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS show_badges BOOLEAN DEFAULT TRUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS show_game_history BOOLEAN DEFAULT TRUE;

COMMENT ON COLUMN users.show_stats IS 'Show statistics section on profile';
COMMENT ON COLUMN users.show_badges IS 'Show badges section on profile';
COMMENT ON COLUMN users.show_game_history IS 'Show game history section on profile';

-- ============================================================================
-- 4. Update Materialized View for Display Name
-- ============================================================================

-- Drop and recreate leaderboard to include display_name
DROP MATERIALIZED VIEW IF EXISTS leaderboard;

CREATE MATERIALIZED VIEW leaderboard AS
SELECT
  u.id as user_id,
  u.username,
  u.display_name,
  u.fid,
  u.theme_color,
  u.avatar_type,
  u.avatar_url,
  u.total_points,
  COUNT(gs.id) as games_played,
  COUNT(CASE WHEN gs.result = 'win' THEN 1 END) as wins,
  ROW_NUMBER() OVER (ORDER BY u.total_points DESC, u.created_at ASC) as rank
FROM users u
LEFT JOIN game_sessions gs ON u.id = gs.user_id
GROUP BY u.id, u.username, u.display_name, u.fid, u.theme_color, u.avatar_type, u.avatar_url, u.total_points, u.created_at
ORDER BY u.total_points DESC;

-- Recreate indexes
CREATE UNIQUE INDEX idx_leaderboard_user ON leaderboard(user_id);
CREATE INDEX idx_leaderboard_rank ON leaderboard(rank);

-- ============================================================================
-- Migration Complete
-- ============================================================================
