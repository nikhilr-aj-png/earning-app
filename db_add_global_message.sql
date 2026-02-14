-- Add global_message column to system_settings
ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS global_message TEXT DEFAULT 'Welcome to EarnFlow! Stay tuned for updates.';

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
