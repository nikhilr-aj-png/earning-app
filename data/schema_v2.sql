-- RUN THIS IN SUPABASE PROJECT 1 (MAIN) --

-- 1. User Profiles (Extends Supabase Auth)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE,
  name TEXT,
  coins BIGINT DEFAULT 100, -- Welcome bonus
  referral_code TEXT UNIQUE,
  referred_by TEXT,
  joined_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tasks Ledger
CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  reward INT NOT NULL,
  type TEXT DEFAULT 'visit',
  url TEXT,
  cooldown INT DEFAULT 1440, -- Minutes
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Transactions Log
CREATE TABLE transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  amount INT NOT NULL,
  type TEXT NOT NULL, -- 'task', 'game', 'probo', 'referral'
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Probo-style Opinion Trading
CREATE TABLE probo_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  category TEXT DEFAULT 'finance',
  image_url TEXT,
  end_time TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'active', -- 'active', 'closed', 'void'
  result TEXT, -- 'yes', 'no'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE probo_predictions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  event_id UUID REFERENCES probo_events ON DELETE CASCADE,
  choice TEXT NOT NULL, -- 'yes', 'no'
  amount INT NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'won', 'lost', 'void'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS & RPC for Project 1
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admin full access profiles" ON profiles FOR ALL USING (true);
CREATE POLICY "Allow public profile creation" ON profiles FOR INSERT WITH CHECK (true);

ALTER TABLE probo_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read events" ON probo_events FOR SELECT USING (true);

ALTER TABLE probo_predictions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own predictions" ON probo_predictions FOR SELECT USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION increment_user_coins(u_id UUID, amount INT)
RETURNS void AS $$
BEGIN
  UPDATE profiles SET coins = coins + amount WHERE id = u_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- RUN THIS IN SUPABASE PROJECT 2 (GAME) --

-- 1. Round-based Gaming (Color Trading, Aviator 2-Card)
CREATE TABLE game_rounds (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  game_type TEXT NOT NULL, -- 'color', 'aviator'
  status TEXT DEFAULT 'open', -- 'open', 'calculating', 'finished'
  total_bet_a INT DEFAULT 0,
  total_bet_b INT DEFAULT 0,
  total_bet_violet INT DEFAULT 0, -- For color game
  winner TEXT, -- 'A', 'B', 'V'
  multiplier NUMERIC DEFAULT 2.0,
  end_time TIMESTAMPTZ DEFAULT (NOW() + interval '30 seconds'),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Live Betting Log
CREATE TABLE game_bets_live (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL, -- UUID from Project 1
  round_id UUID REFERENCES game_rounds ON DELETE CASCADE,
  choice TEXT NOT NULL, -- 'A', 'B' (or colors)
  amount INT NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'win', 'loss'
  payout INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS & RPC for Project 2
ALTER TABLE game_rounds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read rounds" ON game_rounds FOR SELECT USING (true);

ALTER TABLE game_bets_live ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read bets" ON game_bets_live FOR SELECT USING (true);

CREATE OR REPLACE FUNCTION increment_round_total(row_id UUID, col_name TEXT, inc_val INT)
RETURNS void AS $$
BEGIN
  EXECUTE format('UPDATE game_rounds SET %I = %I + $1 WHERE id = $2', col_name, col_name)
  USING inc_val, row_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
