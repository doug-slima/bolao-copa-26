-- =============================================
-- BOLÃO COPA 26 - RLS Security Update
-- Run this in Supabase SQL Editor AFTER the initial schema
-- This makes RLS more restrictive (SELECT only for anon key)
-- Write operations now go through API routes with service role
-- =============================================

-- =============================================
-- DROP OLD PERMISSIVE POLICIES
-- =============================================

-- Users table
DROP POLICY IF EXISTS "Users can update own record" ON users;
DROP POLICY IF EXISTS "Users can insert" ON users;

-- Predictions table
DROP POLICY IF EXISTS "Users can insert own predictions" ON predictions;
DROP POLICY IF EXISTS "Users can update own predictions" ON predictions;
DROP POLICY IF EXISTS "Users can delete own predictions" ON predictions;

-- Challenges table
DROP POLICY IF EXISTS "Users can create challenges" ON challenges;
DROP POLICY IF EXISTS "Users can update challenges" ON challenges;

-- Leagues table
DROP POLICY IF EXISTS "Users can create leagues" ON leagues;
DROP POLICY IF EXISTS "League creators can update" ON leagues;

-- League members table
DROP POLICY IF EXISTS "Users can join leagues" ON league_members;
DROP POLICY IF EXISTS "Users can leave leagues" ON league_members;

-- =============================================
-- SELECT POLICIES REMAIN (read-only for anon)
-- These already exist from initial schema:
-- - "Users are viewable by everyone"
-- - "Predictions are viewable by everyone"
-- - "Challenges are viewable by everyone"
-- - "Leagues are viewable by everyone"
-- - "League members are viewable by everyone"
-- =============================================

-- =============================================
-- VERIFICATION
-- Run this to verify policies are correct:
-- =============================================
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd
-- FROM pg_policies
-- WHERE schemaname = 'public';

-- Expected result: Only SELECT policies should remain
-- All INSERT, UPDATE, DELETE operations now require service_role key
-- which is only available on the server (API routes)
-- =============================================
