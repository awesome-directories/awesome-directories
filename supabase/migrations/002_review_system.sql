-- Migration: Replace directory_votes with comprehensive review/rating system
-- Description: Implements 1-5 star reviews with nested comments, voting, and flagging

-- ============================================================================
-- STEP 1: Drop old directory_votes system
-- ============================================================================

-- Drop triggers first
DROP TRIGGER IF EXISTS increment_directory_helpful ON directory_votes;
DROP TRIGGER IF EXISTS decrement_directory_helpful ON directory_votes;

-- Drop functions
DROP FUNCTION IF EXISTS increment_helpful_count();
DROP FUNCTION IF EXISTS decrement_helpful_count();

-- Drop table
DROP TABLE IF EXISTS directory_votes CASCADE;

-- ============================================================================
-- STEP 2: Update directories table
-- ============================================================================

-- Remove old helpful_count, add new rating columns
ALTER TABLE directories
  DROP COLUMN IF EXISTS helpful_count,
  ADD COLUMN IF NOT EXISTS average_rating DECIMAL(3,2) DEFAULT 0 CHECK (average_rating >= 0 AND average_rating <= 5),
  ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;

-- Update indexes
DROP INDEX IF EXISTS idx_directories_helpful;
CREATE INDEX IF NOT EXISTS idx_directories_rating ON directories(average_rating DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_directories_review_count ON directories(review_count DESC);

-- ============================================================================
-- STEP 3: Create user_profiles table
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure display name is not empty
  CONSTRAINT display_name_not_empty CHECK (char_length(trim(display_name)) > 0)
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_display_name ON user_profiles(display_name);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);

-- ============================================================================
-- STEP 4: Create reviews table
-- ============================================================================

CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  directory_id UUID REFERENCES directories(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  parent_id UUID REFERENCES reviews(id) ON DELETE CASCADE,

  -- Review content
  content TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),

  -- Engagement metrics
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  helpfulness_score INTEGER DEFAULT 0, -- Computed: upvotes - downvotes
  flag_count INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  edited_at TIMESTAMP WITH TIME ZONE,
  is_edited BOOLEAN DEFAULT false,

  -- Constraints
  CONSTRAINT content_not_empty CHECK (char_length(trim(content)) > 0),
  CONSTRAINT rating_only_on_top_level CHECK (
    (parent_id IS NULL AND rating IS NOT NULL) OR
    (parent_id IS NOT NULL AND rating IS NULL)
  )
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_reviews_directory ON reviews(directory_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_parent ON reviews(parent_id);
CREATE INDEX IF NOT EXISTS idx_reviews_helpfulness ON reviews(helpfulness_score DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_created ON reviews(created_at DESC);

-- Prevent nesting beyond 2 levels
CREATE OR REPLACE FUNCTION check_review_nesting_level()
RETURNS TRIGGER AS $$
DECLARE
  parent_level INTEGER;
BEGIN
  IF NEW.parent_id IS NOT NULL THEN
    -- Check if parent has a parent (would make this a 3rd level)
    SELECT COUNT(*) INTO parent_level
    FROM reviews
    WHERE id = NEW.parent_id AND parent_id IS NOT NULL;

    IF parent_level > 0 THEN
      RAISE EXCEPTION 'Reviews can only be nested 2 levels deep';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_review_nesting
  BEFORE INSERT OR UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION check_review_nesting_level();

-- ============================================================================
-- STEP 5: Create review_votes table
-- ============================================================================

CREATE TABLE IF NOT EXISTS review_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID REFERENCES reviews(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ip_hash TEXT,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- One vote per user/IP per review
  UNIQUE(review_id, user_id),
  UNIQUE(review_id, ip_hash)
);

CREATE INDEX IF NOT EXISTS idx_review_votes_review ON review_votes(review_id);
CREATE INDEX IF NOT EXISTS idx_review_votes_user ON review_votes(user_id);

-- ============================================================================
-- STEP 6: Create review_flags table
-- ============================================================================

CREATE TABLE IF NOT EXISTS review_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID REFERENCES reviews(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ip_hash TEXT,
  reason TEXT NOT NULL CHECK (reason IN ('spam', 'offensive', 'inappropriate', 'other')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- One flag per user/IP per review
  UNIQUE(review_id, user_id),
  UNIQUE(review_id, ip_hash)
);

CREATE INDEX IF NOT EXISTS idx_review_flags_review ON review_flags(review_id);
CREATE INDEX IF NOT EXISTS idx_review_flags_user ON review_flags(user_id);

-- ============================================================================
-- STEP 7: Triggers for automatic updates
-- ============================================================================

-- Update review updated_at timestamp
CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update user_profiles updated_at timestamp
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update edited timestamp and flag on review edit
CREATE OR REPLACE FUNCTION update_review_edited()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.content != OLD.content THEN
    NEW.edited_at = NOW();
    NEW.is_edited = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER track_review_edits
  BEFORE UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_review_edited();

-- Update helpfulness score on vote
CREATE OR REPLACE FUNCTION update_review_helpfulness()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE reviews
    SET
      upvotes = CASE WHEN NEW.vote_type = 'upvote' THEN upvotes + 1 ELSE upvotes END,
      downvotes = CASE WHEN NEW.vote_type = 'downvote' THEN downvotes + 1 ELSE downvotes END,
      helpfulness_score = upvotes - downvotes
    WHERE id = NEW.review_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE reviews
    SET
      upvotes = CASE WHEN OLD.vote_type = 'upvote' THEN GREATEST(upvotes - 1, 0) ELSE upvotes END,
      downvotes = CASE WHEN OLD.vote_type = 'downvote' THEN GREATEST(downvotes - 1, 0) ELSE downvotes END,
      helpfulness_score = upvotes - downvotes
    WHERE id = OLD.review_id;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE reviews
    SET
      upvotes = CASE
        WHEN OLD.vote_type = 'upvote' AND NEW.vote_type = 'downvote' THEN GREATEST(upvotes - 1, 0)
        WHEN OLD.vote_type = 'downvote' AND NEW.vote_type = 'upvote' THEN upvotes + 1
        ELSE upvotes
      END,
      downvotes = CASE
        WHEN OLD.vote_type = 'downvote' AND NEW.vote_type = 'upvote' THEN GREATEST(downvotes - 1, 0)
        WHEN OLD.vote_type = 'upvote' AND NEW.vote_type = 'downvote' THEN downvotes + 1
        ELSE downvotes
      END,
      helpfulness_score = upvotes - downvotes
    WHERE id = NEW.review_id;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_review_votes_count
  AFTER INSERT OR UPDATE OR DELETE ON review_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_review_helpfulness();

-- Update flag count on review
CREATE OR REPLACE FUNCTION update_review_flag_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE reviews
    SET flag_count = flag_count + 1
    WHERE id = NEW.review_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE reviews
    SET flag_count = GREATEST(flag_count - 1, 0)
    WHERE id = OLD.review_id;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_review_flags_count
  AFTER INSERT OR DELETE ON review_flags
  FOR EACH ROW
  EXECUTE FUNCTION update_review_flag_count();

-- Update directory average rating and review count
CREATE OR REPLACE FUNCTION update_directory_rating_stats()
RETURNS TRIGGER AS $$
DECLARE
  dir_id UUID;
BEGIN
  -- Get directory_id from NEW or OLD
  dir_id := COALESCE(NEW.directory_id, OLD.directory_id);

  -- Update directory stats
  UPDATE directories
  SET
    average_rating = COALESCE(
      (SELECT AVG(rating) FROM reviews WHERE directory_id = dir_id AND rating IS NOT NULL),
      0
    ),
    review_count = (
      SELECT COUNT(*) FROM reviews WHERE directory_id = dir_id AND rating IS NOT NULL
    )
  WHERE id = dir_id;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_directory_rating_on_review
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_directory_rating_stats();

-- ============================================================================
-- STEP 8: Row Level Security (RLS) Policies
-- ============================================================================

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_flags ENABLE ROW LEVEL SECURITY;

-- User Profiles: Users can read all, manage their own
CREATE POLICY "User profiles are viewable by everyone"
  ON user_profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can delete their own profile"
  ON user_profiles FOR DELETE
  USING (auth.uid() = id);

-- Reviews: Public read, authenticated users can create
CREATE POLICY "Reviews are viewable by everyone"
  ON reviews FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create reviews"
  ON reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own reviews"
  ON reviews FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews"
  ON reviews FOR DELETE
  USING (auth.uid() = user_id);

-- Review Votes: Anyone can vote (with IP tracking)
CREATE POLICY "Review votes are viewable by everyone"
  ON review_votes FOR SELECT
  USING (true);

CREATE POLICY "Anyone can vote on reviews"
  ON review_votes FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own votes"
  ON review_votes FOR UPDATE
  USING (
    (auth.uid() IS NOT NULL AND user_id = auth.uid())
    OR (auth.uid() IS NULL AND ip_hash IS NOT NULL)
  );

CREATE POLICY "Users can delete their own votes"
  ON review_votes FOR DELETE
  USING (
    auth.uid() IS NOT NULL AND user_id = auth.uid()
  );

-- Review Flags: Authenticated users can flag
CREATE POLICY "Authenticated users can view flags they created"
  ON review_flags FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can flag reviews"
  ON review_flags FOR INSERT
  WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete their own flags"
  ON review_flags FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- STEP 9: Helper function to create user profile on signup
-- ============================================================================

CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
DECLARE
  default_display_name TEXT;
BEGIN
  -- Extract username from email (before @)
  default_display_name := split_part(NEW.email, '@', 1);

  -- Create profile
  INSERT INTO user_profiles (id, display_name, email, avatar_url)
  VALUES (
    NEW.id,
    default_display_name,
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_profile();

-- ============================================================================
-- STEP 10: Create view for review statistics
-- ============================================================================

CREATE OR REPLACE VIEW review_stats AS
SELECT
  r.id,
  r.directory_id,
  r.user_id,
  r.parent_id,
  r.content,
  r.rating,
  r.upvotes,
  r.downvotes,
  r.helpfulness_score,
  r.flag_count,
  r.created_at,
  r.updated_at,
  r.edited_at,
  r.is_edited,
  up.display_name,
  up.avatar_url,
  (SELECT COUNT(*) FROM reviews WHERE parent_id = r.id) as reply_count
FROM reviews r
JOIN user_profiles up ON r.user_id = up.id;

-- Grant access to the view
GRANT SELECT ON review_stats TO authenticated, anon;
