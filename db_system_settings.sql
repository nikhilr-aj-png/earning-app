-- Create a system_settings table for global feature flags
CREATE TABLE IF NOT EXISTS system_settings (
    id SERIAL PRIMARY KEY,
    buy_flow_enabled BOOLEAN DEFAULT TRUE,
    game_section_enabled BOOLEAN DEFAULT TRUE,
    maintenance_mode BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert a default row if it doesn't exist (Singleton Pattern)
INSERT INTO system_settings (id, buy_flow_enabled, game_section_enabled, maintenance_mode)
SELECT 1, TRUE, TRUE, FALSE
WHERE NOT EXISTS (SELECT 1 FROM system_settings WHERE id = 1);

-- Enable RLS
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can READ settings (so users know what's enabled)
DROP POLICY IF EXISTS "Allow public read access" ON system_settings;
CREATE POLICY "Allow public read access" ON system_settings FOR SELECT USING (true);

-- Policy: Only authenticated users can update (Admin check happens in API via service role usually, but just in case)
DROP POLICY IF EXISTS "Allow service role update" ON system_settings;
CREATE POLICY "Allow service role update" ON system_settings FOR UPDATE USING (true) WITH CHECK (true);
