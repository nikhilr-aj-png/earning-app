-- Add 'status' column to transactions table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'status') THEN
        ALTER TABLE transactions ADD COLUMN status TEXT DEFAULT 'completed';
    END IF;
END $$;

-- Force Schema Cache Reload (Important for API to see new column)
NOTIFY pgrst, 'reload config';
