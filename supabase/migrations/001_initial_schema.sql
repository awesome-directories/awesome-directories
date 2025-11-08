-- Enable UUID extension (try multiple approaches)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Directories table
CREATE TABLE IF NOT EXISTS directories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  logo_url TEXT,

  -- SEO Metrics
  domain_rating INTEGER,
  is_dofollow BOOLEAN DEFAULT false,

  -- Categorization
  categories TEXT[] DEFAULT '{}',

  -- Pricing
  pricing_type TEXT CHECK (pricing_type IN ('free', 'paid', 'freemium')),
  pricing_amount INTEGER,

  -- Metadata
  traffic_estimate TEXT CHECK (traffic_estimate IN ('high', 'medium', 'low')),
  avg_approval_days INTEGER,
  submission_url TEXT,
  is_affiliate BOOLEAN DEFAULT false,
  affiliate_url TEXT,

  -- Engagement
  helpful_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,

  -- Tracking
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_dr_check TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,

  -- GitHub sync
  github_pr_number INTEGER,
  added_by TEXT
);

-- Directory votes table (helpful button)
CREATE TABLE IF NOT EXISTS directory_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  directory_id UUID REFERENCES directories(id) ON DELETE CASCADE NOT NULL,
  ip_hash TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(directory_id, ip_hash)
);

-- User favorites table
CREATE TABLE IF NOT EXISTS user_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  directory_id UUID REFERENCES directories(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id, directory_id)
);

-- User submissions tracking table
CREATE TABLE IF NOT EXISTS user_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  directory_id UUID REFERENCES directories(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'submitted', 'approved', 'rejected')),
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,

  UNIQUE(user_id, directory_id)
);

-- Newsletter signups table
CREATE TABLE IF NOT EXISTS newsletter_signups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  product_name TEXT,
  source TEXT,
  mautic_contact_id INTEGER,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  unsubscribed_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_directories_categories ON directories USING GIN(categories);
CREATE INDEX IF NOT EXISTS idx_directories_dr ON directories(domain_rating DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_directories_helpful ON directories(helpful_count DESC);
CREATE INDEX IF NOT EXISTS idx_directories_slug ON directories(slug);
CREATE INDEX IF NOT EXISTS idx_directories_active ON directories(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_directories_pricing ON directories(pricing_type);

CREATE INDEX IF NOT EXISTS idx_votes_directory ON directory_votes(directory_id);
CREATE INDEX IF NOT EXISTS idx_votes_ip_hash ON directory_votes(ip_hash);

CREATE INDEX IF NOT EXISTS idx_favorites_user ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_directory ON user_favorites(directory_id);

CREATE INDEX IF NOT EXISTS idx_submissions_user ON user_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_directory ON user_submissions(directory_id);

CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_signups(email);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_directories_updated_at
  BEFORE UPDATE ON directories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to increment helpful count
CREATE OR REPLACE FUNCTION increment_helpful_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE directories
  SET helpful_count = helpful_count + 1
  WHERE id = NEW.directory_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to increment helpful count on vote
CREATE TRIGGER increment_directory_helpful
  AFTER INSERT ON directory_votes
  FOR EACH ROW
  EXECUTE FUNCTION increment_helpful_count();

-- Function to decrement helpful count on vote deletion
CREATE OR REPLACE FUNCTION decrement_helpful_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE directories
  SET helpful_count = GREATEST(helpful_count - 1, 0)
  WHERE id = OLD.directory_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Trigger to decrement helpful count on vote removal
CREATE TRIGGER decrement_directory_helpful
  AFTER DELETE ON directory_votes
  FOR EACH ROW
  EXECUTE FUNCTION decrement_helpful_count();

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE directories ENABLE ROW LEVEL SECURITY;
ALTER TABLE directory_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_signups ENABLE ROW LEVEL SECURITY;

-- Directories: Public read, no write (managed by admin/GitHub Actions)
CREATE POLICY "Directories are viewable by everyone"
  ON directories FOR SELECT
  USING (is_active = true);

CREATE POLICY "Only service role can insert directories"
  ON directories FOR INSERT
  WITH CHECK (false);

CREATE POLICY "Only service role can update directories"
  ON directories FOR UPDATE
  USING (false);

-- Directory votes: Public can insert (with IP hash), read own votes
CREATE POLICY "Anyone can view votes"
  ON directory_votes FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert votes"
  ON directory_votes FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can delete their own votes"
  ON directory_votes FOR DELETE
  USING (
    (auth.uid() IS NOT NULL AND user_id = auth.uid())
    OR (auth.uid() IS NULL AND ip_hash IS NOT NULL)
  );

-- User favorites: Users can manage their own favorites
CREATE POLICY "Users can view their own favorites"
  ON user_favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorites"
  ON user_favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites"
  ON user_favorites FOR DELETE
  USING (auth.uid() = user_id);

-- User submissions: Users can manage their own submissions
CREATE POLICY "Users can view their own submissions"
  ON user_submissions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own submissions"
  ON user_submissions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own submissions"
  ON user_submissions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own submissions"
  ON user_submissions FOR DELETE
  USING (auth.uid() = user_id);

-- Newsletter signups: Anyone can insert, only admins can view
CREATE POLICY "Anyone can signup for newsletter"
  ON newsletter_signups FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Only service role can view newsletter signups"
  ON newsletter_signups FOR SELECT
  USING (false);
