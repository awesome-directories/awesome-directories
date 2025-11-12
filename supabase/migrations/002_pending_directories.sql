-- Pending directories table for user submissions awaiting review
CREATE TABLE IF NOT EXISTS pending_directories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Directory information
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  url TEXT NOT NULL,
  logo_url TEXT,

  -- SEO Metrics (optional)
  domain_rating INTEGER,
  is_dofollow BOOLEAN,

  -- Categorization
  categories TEXT[] DEFAULT '{}',

  -- Pricing
  pricing_type TEXT CHECK (pricing_type IN ('free', 'paid', 'freemium')) NOT NULL,
  pricing_amount INTEGER,

  -- Additional metadata
  submission_url TEXT,
  traffic_estimate TEXT CHECK (traffic_estimate IN ('high', 'medium', 'low')),
  avg_approval_days INTEGER,

  -- Review status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')) NOT NULL,
  admin_notes TEXT,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,

  -- Tracking
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_email TEXT NOT NULL,

  -- Prevent duplicate submissions
  UNIQUE(user_id, url)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_pending_directories_user ON pending_directories(user_id);
CREATE INDEX IF NOT EXISTS idx_pending_directories_status ON pending_directories(status);
CREATE INDEX IF NOT EXISTS idx_pending_directories_submitted ON pending_directories(submitted_at DESC);

-- Enable RLS
ALTER TABLE pending_directories ENABLE ROW LEVEL SECURITY;

-- Users can view their own submissions
CREATE POLICY "Users can view their own pending submissions"
  ON pending_directories FOR SELECT
  USING (auth.uid() = user_id);

-- Authenticated users can insert submissions
CREATE POLICY "Authenticated users can submit directories"
  ON pending_directories FOR INSERT
  WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL);

-- Users can update their own pending submissions (before review)
CREATE POLICY "Users can update their own pending submissions"
  ON pending_directories FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending');

-- Users can delete their own pending submissions (before review)
CREATE POLICY "Users can delete their own pending submissions"
  ON pending_directories FOR DELETE
  USING (auth.uid() = user_id AND status = 'pending');

-- Service role can do everything (for admin actions)
CREATE POLICY "Service role has full access to pending directories"
  ON pending_directories FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');
