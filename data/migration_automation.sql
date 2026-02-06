-- AI Automation Settings Table
CREATE TABLE IF NOT EXISTS automation_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    is_enabled BOOLEAN DEFAULT FALSE,
    free_task_count INT DEFAULT 5,
    premium_task_count INT DEFAULT 5,
    free_reward INT DEFAULT 50,
    premium_reward INT DEFAULT 150,
    exp_h TEXT DEFAULT '11',
    exp_m TEXT DEFAULT '59',
    exp_p TEXT DEFAULT 'PM',
    last_sync TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default entry if not exists
INSERT INTO automation_settings (is_enabled, free_task_count, premium_task_count, free_reward, premium_reward, exp_h, exp_m, exp_p)
SELECT FALSE, 5, 5, 50, 150, '11', '59', 'PM'
WHERE NOT EXISTS (SELECT 1 FROM automation_settings);

-- Enable RLS
ALTER TABLE automation_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin full access automation" ON automation_settings FOR ALL USING (true);
