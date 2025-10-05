-- Create lecture_sessions table
CREATE TABLE IF NOT EXISTS lecture_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  target_language TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  CONSTRAINT fk_user
    FOREIGN KEY (user_id)
    REFERENCES users(auth0_id)
    ON DELETE CASCADE
);

-- Create transcriptions table
CREATE TABLE IF NOT EXISTS transcriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL,
  original_text TEXT NOT NULL,
  translated_text TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  sequence_number INTEGER NOT NULL,
  confidence_score FLOAT,
  CONSTRAINT fk_session
    FOREIGN KEY (session_id)
    REFERENCES lecture_sessions(id)
    ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_lecture_sessions_user_id ON lecture_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_lecture_sessions_created_at ON lecture_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transcriptions_session_id ON transcriptions(session_id);
CREATE INDEX IF NOT EXISTS idx_transcriptions_sequence ON transcriptions(session_id, sequence_number);

-- Enable Row Level Security
ALTER TABLE lecture_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transcriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for lecture_sessions
CREATE POLICY "Users can view their own sessions"
  ON lecture_sessions
  FOR SELECT
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can create their own sessions"
  ON lecture_sessions
  FOR INSERT
  WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can update their own sessions"
  ON lecture_sessions
  FOR UPDATE
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can delete their own sessions"
  ON lecture_sessions
  FOR DELETE
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- RLS Policies for transcriptions
CREATE POLICY "Users can view transcriptions of their own sessions"
  ON transcriptions
  FOR SELECT
  USING (
    session_id IN (
      SELECT id FROM lecture_sessions
      WHERE user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

CREATE POLICY "Users can create transcriptions for their own sessions"
  ON transcriptions
  FOR INSERT
  WITH CHECK (
    session_id IN (
      SELECT id FROM lecture_sessions
      WHERE user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

CREATE POLICY "Users can update transcriptions of their own sessions"
  ON transcriptions
  FOR UPDATE
  USING (
    session_id IN (
      SELECT id FROM lecture_sessions
      WHERE user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

CREATE POLICY "Users can delete transcriptions of their own sessions"
  ON transcriptions
  FOR DELETE
  USING (
    session_id IN (
      SELECT id FROM lecture_sessions
      WHERE user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );
