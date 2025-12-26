-- Migration 007: Profile Banners
-- Adds banner customization support to user profiles

-- Add banner columns to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS banner_url TEXT,
ADD COLUMN IF NOT EXISTS banner_type TEXT DEFAULT 'default';

-- Add comments for documentation
COMMENT ON COLUMN users.banner_url IS 'URL of the profile banner image (predefined or custom)';
COMMENT ON COLUMN users.banner_type IS 'Type of banner: default, predefined, or custom';

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_users_banner_type ON users(banner_type);

-- Set default banner for existing users
UPDATE users
SET banner_type = 'default',
    banner_url = '/banners/predefined/gradient-yellow.jpg'
WHERE banner_type IS NULL OR banner_url IS NULL;

-- Add check constraint for banner_type
ALTER TABLE users
ADD CONSTRAINT check_banner_type
CHECK (banner_type IN ('default', 'predefined', 'custom'));
