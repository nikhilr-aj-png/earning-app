
-- Update RLS for transactions table
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Allow users to see their own transactions
CREATE POLICY "Users can view own transactions" 
ON transactions FOR SELECT 
USING (auth.uid() = user_id);

-- Ensure Admin has full access
CREATE POLICY "Admin full access transactions" 
ON transactions FOR ALL 
USING (true);
