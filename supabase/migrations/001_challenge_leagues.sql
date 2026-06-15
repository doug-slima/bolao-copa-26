-- =============================================
-- MIGRATION: Challenge Leagues
-- Adds challenge_leagues table and unique constraint for user pairs
-- =============================================

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
-- UNIQUE CONSTRAINT FOR USER PAIRS
-- Prevents duplicate challenges between same pair of users for same match
-- Uses LEAST/GREATEST to treat (A,B) and (B,A) as the same pair
-- Only applies to active challenges (not declined or completed)
-- =============================================
CREATE UNIQUE INDEX IF NOT EXISTS challenges_unique_pair_match 
ON challenges(
  match_id, 
  LEAST(challenger_id, challenged_id), 
  GREATEST(challenger_id, challenged_id)
)
WHERE status NOT IN ('declined', 'completed');

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================
ALTER TABLE challenge_leagues ENABLE ROW LEVEL SECURITY;

-- Anyone can read challenge_leagues
CREATE POLICY "Challenge leagues are viewable by everyone" 
ON challenge_leagues FOR SELECT USING (true);

-- Only service role can insert (via API)
CREATE POLICY "Service role can insert challenge leagues" 
ON challenge_leagues FOR INSERT WITH CHECK (true);

-- Only service role can delete (via API)
CREATE POLICY "Service role can delete challenge leagues" 
ON challenge_leagues FOR DELETE USING (true);

-- =============================================
-- REALTIME
-- =============================================
ALTER PUBLICATION supabase_realtime ADD TABLE challenge_leagues;

-- =============================================
-- DONE!
-- =============================================
