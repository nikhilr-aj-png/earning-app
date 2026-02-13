-- FUNCTION: increment_user_coins
-- Drops potential duplicates and recreates a single, definitive function.

-- 1. DROP BOTH POTENTIAL VERSIONS to remove ambiguity
DROP FUNCTION IF EXISTS increment_user_coins(uuid, numeric);
DROP FUNCTION IF EXISTS increment_user_coins(uuid, integer);

-- 2. CREATE A SINGLE VERSION (Using NUMERIC for safety)
CREATE OR REPLACE FUNCTION increment_user_coins(u_id UUID, amount NUMERIC)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE profiles
  SET coins = coins + amount
  WHERE id = u_id;
END;
$$;
