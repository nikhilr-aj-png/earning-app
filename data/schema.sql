-- RUN THIS IN SUPABASE PROJECT 1 (MAIN) SQL EDITOR --

-- User Profiles (Extends Supabase Auth)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE,
  name TEXT,
  coins BIGINT DEFAULT 0,
  referral_code TEXT UNIQUE,
  referred_by TEXT,
  joined_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Tasks
CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  reward INT NOT NULL,
  type TEXT,
  url TEXT,
  cooldown INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert initial tasks
INSERT INTO tasks (id, title, reward, type, url, cooldown) VALUES
('t1', 'Daily Check-in', 50, 'checkin', NULL, 1440),
('t2', 'Watch Video Ad', 20, 'ad', 'https://youtube.com', 30),
('t3', 'Visit Sponsor Site', 15, 'visit', 'https://google.com', 60);

-- Transactions
CREATE TABLE transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  amount INT NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for Transactions
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own transactions" ON transactions FOR SELECT USING (auth.uid() = user_id);


-- RUN THIS IN SUPABASE PROJECT 2 (GAME) SQL EDITOR --

-- Game History (Decoupled from User Table, uses User ID string)
CREATE TABLE game_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID, -- We'll store the UUID from Project 1 here
  bet INT NOT NULL,
  result TEXT NOT NULL, -- 'win' | 'loss'
  choice TEXT,
  winning_card TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Basic RLS for Game History (View only)
ALTER TABLE game_history ENABLE ROW LEVEL SECURITY;
-- For simplicity, we might use service role or public write for now, 
-- but ideally you'd verify JWT from Project 1.
