-- Migration 006: Reviews, Projects, and Schema Updates
-- This migration adds:
-- 1. Directory reviews (ratings + comments) system
-- 2. Projects feature for tracking submissions per project
-- 3. Email notification support for approved directories
-- 4. Removes dependency on helpfulness voting

-- ============================================
-- 1. DIRECTORY REVIEWS TABLE
-- ============================================
-- Supports both ratings (1-5 stars) and comments
-- One rating per user per directory (can update)
-- Multiple comments per user per directory allowed

CREATE TABLE IF NOT EXISTS directory_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  directory_id UUID NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Rating (1-5 stars, nullable for comment-only entries)
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),

  -- Comment content
  comment TEXT,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraint: Must have either rating or comment
  CONSTRAINT review_has_content CHECK (rating IS NOT NULL OR comment IS NOT NULL)
);

-- Create a separate table for storing the single rating per user per directory
-- This ensures clean aggregate ratings
CREATE TABLE IF NOT EXISTS directory_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  directory_id UUID NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- One rating per user per directory
  UNIQUE(user_id, directory_id)
);

-- Add rating statistics columns to directories table
ALTER TABLE directories
ADD COLUMN IF NOT EXISTS average_rating DECIMAL(2,1) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS rating_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;

-- Indexes for reviews
CREATE INDEX IF NOT EXISTS idx_reviews_directory ON directory_reviews(directory_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON directory_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created ON directory_reviews(created_at DESC);

-- Indexes for ratings
CREATE INDEX IF NOT EXISTS idx_ratings_directory ON directory_ratings(directory_id);
CREATE INDEX IF NOT EXISTS idx_ratings_user ON directory_ratings(user_id);

-- ============================================
-- 2. PROJECTS TABLE
-- ============================================
-- Allows users to create multiple projects and track submissions per project

CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Project information
  name TEXT NOT NULL,
  url TEXT,
  description TEXT,
  logo_url TEXT,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Prevent duplicate project names per user
  UNIQUE(user_id, name)
);

-- Indexes for projects
CREATE INDEX IF NOT EXISTS idx_projects_user ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_created ON projects(created_at DESC);

-- ============================================
-- 3. PROJECT SUBMISSIONS TABLE
-- ============================================
-- Tracks directory submissions per project (replaces user_submissions concept)

CREATE TABLE IF NOT EXISTS project_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  directory_id UUID NOT NULL, -- Can reference directories or pending_directories

  -- Submission tracking
  status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'submitted', 'approved', 'rejected', 'featured')),

  -- User's submission link (e.g., producthunt.com/products/myapp)
  submission_link TEXT,

  -- Personal notes
  notes TEXT,

  -- Timestamps
  submitted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- One entry per project per directory
  UNIQUE(project_id, directory_id)
);

-- Indexes for project submissions
CREATE INDEX IF NOT EXISTS idx_project_submissions_project ON project_submissions(project_id);
CREATE INDEX IF NOT EXISTS idx_project_submissions_directory ON project_submissions(directory_id);
CREATE INDEX IF NOT EXISTS idx_project_submissions_status ON project_submissions(status);

-- ============================================
-- 4. UPDATE PENDING_DIRECTORIES FOR NOTIFICATIONS
-- ============================================

-- Add notification tracking fields
ALTER TABLE pending_directories
ADD COLUMN IF NOT EXISTS notification_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS notification_sent_at TIMESTAMP WITH TIME ZONE;

-- ============================================
-- 5. TRIGGERS FOR RATING STATISTICS
-- ============================================

-- Function to update directory rating statistics
CREATE OR REPLACE FUNCTION update_directory_rating_stats()
RETURNS TRIGGER AS $$
DECLARE
  dir_id UUID;
  new_avg DECIMAL(2,1);
  new_count INTEGER;
BEGIN
  -- Determine which directory_id to update
  IF TG_OP = 'DELETE' THEN
    dir_id := OLD.directory_id;
  ELSE
    dir_id := NEW.directory_id;
  END IF;

  -- Calculate new statistics
  SELECT
    ROUND(AVG(rating)::numeric, 1),
    COUNT(*)
  INTO new_avg, new_count
  FROM directory_ratings
  WHERE directory_id = dir_id;

  -- Update directories table (only if it exists there)
  UPDATE directories
  SET
    average_rating = new_avg,
    rating_count = COALESCE(new_count, 0),
    updated_at = NOW()
  WHERE id = dir_id;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for rating changes
DROP TRIGGER IF EXISTS update_rating_stats_on_insert ON directory_ratings;
CREATE TRIGGER update_rating_stats_on_insert
  AFTER INSERT ON directory_ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_directory_rating_stats();

DROP TRIGGER IF EXISTS update_rating_stats_on_update ON directory_ratings;
CREATE TRIGGER update_rating_stats_on_update
  AFTER UPDATE ON directory_ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_directory_rating_stats();

DROP TRIGGER IF EXISTS update_rating_stats_on_delete ON directory_ratings;
CREATE TRIGGER update_rating_stats_on_delete
  AFTER DELETE ON directory_ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_directory_rating_stats();

-- Function to update review count
CREATE OR REPLACE FUNCTION update_directory_review_count()
RETURNS TRIGGER AS $$
DECLARE
  dir_id UUID;
  new_count INTEGER;
BEGIN
  IF TG_OP = 'DELETE' THEN
    dir_id := OLD.directory_id;
  ELSE
    dir_id := NEW.directory_id;
  END IF;

  SELECT COUNT(*) INTO new_count
  FROM directory_reviews
  WHERE directory_id = dir_id AND comment IS NOT NULL;

  UPDATE directories
  SET
    review_count = COALESCE(new_count, 0),
    updated_at = NOW()
  WHERE id = dir_id;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for review count
DROP TRIGGER IF EXISTS update_review_count_on_change ON directory_reviews;
CREATE TRIGGER update_review_count_on_change
  AFTER INSERT OR UPDATE OR DELETE ON directory_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_directory_review_count();

-- Auto-update updated_at for reviews
DROP TRIGGER IF EXISTS update_reviews_updated_at ON directory_reviews;
CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON directory_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-update updated_at for ratings
DROP TRIGGER IF EXISTS update_ratings_updated_at ON directory_ratings;
CREATE TRIGGER update_ratings_updated_at
  BEFORE UPDATE ON directory_ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-update updated_at for projects
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-update updated_at for project_submissions
DROP TRIGGER IF EXISTS update_project_submissions_updated_at ON project_submissions;
CREATE TRIGGER update_project_submissions_updated_at
  BEFORE UPDATE ON project_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 6. ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on new tables
ALTER TABLE directory_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE directory_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_submissions ENABLE ROW LEVEL SECURITY;

-- Directory Reviews: Public read, authenticated write
CREATE POLICY "Anyone can view reviews"
  ON directory_reviews FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert reviews"
  ON directory_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews"
  ON directory_reviews FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews"
  ON directory_reviews FOR DELETE
  USING (auth.uid() = user_id);

-- Directory Ratings: Public read, authenticated write
CREATE POLICY "Anyone can view ratings"
  ON directory_ratings FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert ratings"
  ON directory_ratings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ratings"
  ON directory_ratings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ratings"
  ON directory_ratings FOR DELETE
  USING (auth.uid() = user_id);

-- Projects: Users can only see and manage their own projects
CREATE POLICY "Users can view their own projects"
  ON projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own projects"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects"
  ON projects FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects"
  ON projects FOR DELETE
  USING (auth.uid() = user_id);

-- Project Submissions: Users can manage submissions for their own projects
CREATE POLICY "Users can view their project submissions"
  ON project_submissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_submissions.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert project submissions"
  ON project_submissions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_submissions.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their project submissions"
  ON project_submissions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_submissions.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their project submissions"
  ON project_submissions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_submissions.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- ============================================
-- 7. HELPER VIEWS
-- ============================================

-- View for directory ratings with user info (for display)
CREATE OR REPLACE VIEW directory_reviews_with_user AS
SELECT
  dr.id,
  dr.directory_id,
  dr.user_id,
  dr.comment,
  dr.created_at,
  dr.updated_at,
  drat.rating,
  COALESCE(
    raw_user_meta_data->>'full_name',
    raw_user_meta_data->>'name',
    split_part(au.email, '@', 1)
  ) as user_name,
  raw_user_meta_data->>'avatar_url' as user_avatar
FROM directory_reviews dr
LEFT JOIN directory_ratings drat ON drat.directory_id = dr.directory_id AND drat.user_id = dr.user_id
LEFT JOIN auth.users au ON au.id = dr.user_id
WHERE dr.comment IS NOT NULL;

-- ============================================
-- 8. COMMENTS
-- ============================================

COMMENT ON TABLE directory_reviews IS 'User comments on directories (can have multiple per user per directory)';
COMMENT ON TABLE directory_ratings IS 'User ratings for directories (one per user per directory, 1-5 stars)';
COMMENT ON TABLE projects IS 'User projects for tracking directory submissions';
COMMENT ON TABLE project_submissions IS 'Tracks which directories a project has been submitted to';

COMMENT ON COLUMN directories.average_rating IS 'Calculated average rating (1.0-5.0) from directory_ratings';
COMMENT ON COLUMN directories.rating_count IS 'Total number of ratings received';
COMMENT ON COLUMN directories.review_count IS 'Total number of comments/reviews received';

COMMENT ON COLUMN project_submissions.submission_link IS 'URL to the actual submission (e.g., producthunt.com/products/myapp)';
COMMENT ON COLUMN project_submissions.status IS 'Submission status: not_started, in_progress, submitted, approved, rejected, featured';
