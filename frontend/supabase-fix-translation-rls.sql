-- Drop existing RLS policies that use Supabase Auth JWT
DROP POLICY IF EXISTS "Users can view their own sessions" ON lecture_sessions;
DROP POLICY IF EXISTS "Users can create their own sessions" ON lecture_sessions;
DROP POLICY IF EXISTS "Users can update their own sessions" ON lecture_sessions;
DROP POLICY IF EXISTS "Users can delete their own sessions" ON lecture_sessions;
DROP POLICY IF EXISTS "Users can view transcriptions of their own sessions" ON transcriptions;
DROP POLICY IF EXISTS "Users can create transcriptions for their own sessions" ON transcriptions;
DROP POLICY IF EXISTS "Users can update transcriptions of their own sessions" ON transcriptions;
DROP POLICY IF EXISTS "Users can delete transcriptions of their own sessions" ON transcriptions;

-- Disable RLS temporarily to allow service key access
-- Since we're using Auth0, we'll rely on application-level security
ALTER TABLE lecture_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE transcriptions DISABLE ROW LEVEL SECURITY;

-- Alternative: If you want to keep RLS enabled with service key bypass
-- Re-enable RLS
ALTER TABLE lecture_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transcriptions ENABLE ROW LEVEL SECURITY;

-- Create permissive policies that allow service key access
-- These policies allow all operations when using the service role key
CREATE POLICY "Allow service role full access to lecture_sessions"
  ON lecture_sessions
  FOR ALL
  TO authenticated, anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow service role full access to transcriptions"
  ON transcriptions
  FOR ALL
  TO authenticated, anon
  USING (true)
  WITH CHECK (true);
