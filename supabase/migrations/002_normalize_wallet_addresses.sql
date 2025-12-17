-- Normalize all wallet addresses to lowercase
-- This migration ensures consistency with the new normalization logic in the API

-- Update all wallet addresses in users table to lowercase
UPDATE users
SET wallet_address = LOWER(wallet_address)
WHERE wallet_address IS NOT NULL
  AND wallet_address != LOWER(wallet_address);

-- Create index on lowercase wallet_address if it doesn't exist
-- This improves query performance when searching by wallet address
DROP INDEX IF EXISTS idx_users_wallet;
CREATE INDEX idx_users_wallet ON users(LOWER(wallet_address));

-- Add a check to ensure future inserts are lowercase
-- Note: This is enforced by the API, but we add it here for safety
CREATE OR REPLACE FUNCTION normalize_wallet_address()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.wallet_address IS NOT NULL THEN
    NEW.wallet_address := LOWER(NEW.wallet_address);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-normalize wallet addresses on insert/update
DROP TRIGGER IF EXISTS trigger_normalize_wallet ON users;
CREATE TRIGGER trigger_normalize_wallet
  BEFORE INSERT OR UPDATE OF wallet_address ON users
  FOR EACH ROW
  EXECUTE FUNCTION normalize_wallet_address();
