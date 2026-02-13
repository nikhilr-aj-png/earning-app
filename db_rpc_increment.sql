-- FUNCTION: increment_user_coins
-- Handles safe atomic updates to user coin balance.
-- Used for both deposits (positive amount) and withdrawals (negative amount).

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
