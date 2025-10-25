-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE user_role AS ENUM ('student', 'alumni', 'admin');
CREATE TYPE connection_status AS ENUM ('pending', 'accepted', 'rejected');
CREATE TYPE job_type AS ENUM ('internship', 'full_time', 'part_time', 'contract');

-- Profiles table with user details
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role user_role NOT NULL,
  department TEXT,
  graduation_year INTEGER,
  bio TEXT,
  skills TEXT[],
  interests TEXT[],
  company TEXT,
  job_title TEXT,
  linkedin_url TEXT,
  avatar_url TEXT,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Job postings table
CREATE TABLE job_postings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  posted_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  description TEXT NOT NULL,
  job_type job_type NOT NULL,
  location TEXT,
  skills_required TEXT[],
  application_url TEXT,
  is_referral BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- Mentor connections table
CREATE TABLE mentor_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  mentor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status connection_status DEFAULT 'pending',
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, mentor_id)
);

-- Messages table for basic chat
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  connection_id UUID REFERENCES mentor_connections(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentor_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Job postings policies
CREATE POLICY "Jobs are viewable by everyone"
  ON job_postings FOR SELECT
  USING (true);

CREATE POLICY "Alumni can create jobs"
  ON job_postings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'alumni'
    )
  );

CREATE POLICY "Alumni can update own jobs"
  ON job_postings FOR UPDATE
  USING (posted_by = auth.uid());

CREATE POLICY "Alumni can delete own jobs"
  ON job_postings FOR DELETE
  USING (posted_by = auth.uid());

-- Mentor connections policies
CREATE POLICY "Users can view their own connections"
  ON mentor_connections FOR SELECT
  USING (student_id = auth.uid() OR mentor_id = auth.uid());

CREATE POLICY "Students can create connection requests"
  ON mentor_connections FOR INSERT
  WITH CHECK (
    student_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'student'
    )
  );

CREATE POLICY "Users can update connections they're part of"
  ON mentor_connections FOR UPDATE
  USING (student_id = auth.uid() OR mentor_id = auth.uid());

-- Messages policies
CREATE POLICY "Users can view messages in their connections"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM mentor_connections 
      WHERE id = connection_id 
      AND (student_id = auth.uid() OR mentor_id = auth.uid())
    )
  );

CREATE POLICY "Users can send messages in their connections"
  ON messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM mentor_connections 
      WHERE id = connection_id 
      AND (student_id = auth.uid() OR mentor_id = auth.uid())
      AND status = 'accepted'
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mentor_connections_updated_at
  BEFORE UPDATE ON mentor_connections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE messages;