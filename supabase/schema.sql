-- =============================================
-- BOLÃO COPA 26 - Database Schema
-- Run this in Supabase SQL Editor
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- USERS TABLE
-- Stores user stats and profile info
-- =============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  total_points INTEGER DEFAULT 0,
  exact_predictions INTEGER DEFAULT 0,
  correct_results INTEGER DEFAULT 0,
  correct_first_scorers INTEGER DEFAULT 0,
  total_predictions INTEGER DEFAULT 0,
  challenge_wins INTEGER DEFAULT 0,
  challenge_losses INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- Index for fast lookups by clerk_id
CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_id);

-- =============================================
-- PREDICTIONS TABLE
-- Stores user predictions for matches
-- =============================================
CREATE TABLE IF NOT EXISTS predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_avatar_url TEXT,
  home_score INTEGER NOT NULL,
  away_score INTEGER NOT NULL,
  first_to_score TEXT NOT NULL CHECK (first_to_score IN ('home', 'away', 'none')),
  points_exact_score INTEGER,
  points_result INTEGER,
  points_first_scorer INTEGER,
  points_total INTEGER,
  is_unique_exact BOOLEAN,
  is_unique_result BOOLEAN,
  is_unique_first_scorer BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ,
  locked_at TIMESTAMPTZ,
  UNIQUE(match_id, user_id)
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_predictions_match_id ON predictions(match_id);
CREATE INDEX IF NOT EXISTS idx_predictions_user_id ON predictions(user_id);

-- =============================================
-- CHALLENGES TABLE
-- Stores challenges between users
-- =============================================
CREATE TABLE IF NOT EXISTS challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id TEXT NOT NULL,
  challenger_id TEXT NOT NULL,
  challenger_name TEXT NOT NULL,
  challenged_id TEXT NOT NULL,
  challenged_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'completed')),
  challenger_points INTEGER,
  challenged_points INTEGER,
  winner TEXT CHECK (winner IN ('challenger', 'challenged', 'tie', 'void')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_challenges_match_id ON challenges(match_id);
CREATE INDEX IF NOT EXISTS idx_challenges_challenger_id ON challenges(challenger_id);
CREATE INDEX IF NOT EXISTS idx_challenges_challenged_id ON challenges(challenged_id);
CREATE INDEX IF NOT EXISTS idx_challenges_status ON challenges(status);

-- Unique constraint: one active challenge per pair of users per match
CREATE UNIQUE INDEX IF NOT EXISTS challenges_unique_pair_match 
ON challenges(
  match_id, 
  LEAST(challenger_id, challenged_id), 
  GREATEST(challenger_id, challenged_id)
)
WHERE status NOT IN ('declined', 'completed');

-- =============================================
-- CHALLENGE LEAGUES TABLE
-- Links challenges to multiple leagues
-- =============================================
CREATE TABLE IF NOT EXISTS challenge_leagues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  league_id UUID NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(challenge_id, league_id)
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_challenge_leagues_challenge_id ON challenge_leagues(challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_leagues_league_id ON challenge_leagues(league_id);

-- =============================================
-- LEAGUES TABLE
-- Stores private leagues
-- =============================================
CREATE TABLE IF NOT EXISTS leagues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  invite_code TEXT UNIQUE NOT NULL,
  created_by TEXT NOT NULL,
  created_by_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for invite code lookups
CREATE INDEX IF NOT EXISTS idx_leagues_invite_code ON leagues(invite_code);

-- =============================================
-- LEAGUE MEMBERS TABLE
-- Stores league memberships
-- =============================================
CREATE TABLE IF NOT EXISTS league_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  league_id UUID NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_avatar_url TEXT,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(league_id, user_id)
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_league_members_league_id ON league_members(league_id);
CREATE INDEX IF NOT EXISTS idx_league_members_user_id ON league_members(user_id);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_leagues ENABLE ROW LEVEL SECURITY;
ALTER TABLE leagues ENABLE ROW LEVEL SECURITY;
ALTER TABLE league_members ENABLE ROW LEVEL SECURITY;

-- Users: anyone can read, only owner can update
CREATE POLICY "Users are viewable by everyone" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own record" ON users FOR UPDATE USING (true);
CREATE POLICY "Users can insert" ON users FOR INSERT WITH CHECK (true);

-- Predictions: anyone can read, only owner can insert/update/delete
CREATE POLICY "Predictions are viewable by everyone" ON predictions FOR SELECT USING (true);
CREATE POLICY "Users can insert own predictions" ON predictions FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own predictions" ON predictions FOR UPDATE USING (true);
CREATE POLICY "Users can delete own predictions" ON predictions FOR DELETE USING (true);

-- Challenges: anyone can read, users can manage their own
CREATE POLICY "Challenges are viewable by everyone" ON challenges FOR SELECT USING (true);
CREATE POLICY "Users can create challenges" ON challenges FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update challenges" ON challenges FOR UPDATE USING (true);

-- Challenge Leagues: anyone can read, service role manages writes
CREATE POLICY "Challenge leagues are viewable by everyone" ON challenge_leagues FOR SELECT USING (true);
CREATE POLICY "Service role can insert challenge leagues" ON challenge_leagues FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role can delete challenge leagues" ON challenge_leagues FOR DELETE USING (true);

-- Leagues: anyone can read, creator can update
CREATE POLICY "Leagues are viewable by everyone" ON leagues FOR SELECT USING (true);
CREATE POLICY "Users can create leagues" ON leagues FOR INSERT WITH CHECK (true);
CREATE POLICY "League creators can update" ON leagues FOR UPDATE USING (true);

-- League members: anyone can read, users can join/leave
CREATE POLICY "League members are viewable by everyone" ON league_members FOR SELECT USING (true);
CREATE POLICY "Users can join leagues" ON league_members FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can leave leagues" ON league_members FOR DELETE USING (true);

-- =============================================
-- REALTIME
-- Enable realtime for all tables
-- =============================================

ALTER PUBLICATION supabase_realtime ADD TABLE predictions;
ALTER PUBLICATION supabase_realtime ADD TABLE challenges;
ALTER PUBLICATION supabase_realtime ADD TABLE challenge_leagues;
ALTER PUBLICATION supabase_realtime ADD TABLE leagues;
ALTER PUBLICATION supabase_realtime ADD TABLE league_members;
ALTER PUBLICATION supabase_realtime ADD TABLE users;

-- =============================================
-- DONE!
-- =============================================
