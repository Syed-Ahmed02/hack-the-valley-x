-- Quick fix for RLS policies
-- Run this in your Supabase SQL Editor

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Allow user creation" ON users;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON users;
DROP POLICY IF EXISTS "Enable select for authenticated users" ON users;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON users;

-- Create simple policies that allow all operations
-- (Your API will handle authorization via Auth0)
CREATE POLICY "Enable all operations for users table" ON users
  FOR ALL 
  USING (true)
  WITH CHECK (true);
