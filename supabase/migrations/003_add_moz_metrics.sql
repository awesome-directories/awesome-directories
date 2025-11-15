-- Add additional Moz metrics columns to directories table
ALTER TABLE directories
ADD COLUMN IF NOT EXISTS spam_score INTEGER,
ADD COLUMN IF NOT EXISTS linking_root_domains INTEGER,
ADD COLUMN IF NOT EXISTS ranking_keywords INTEGER,
ADD COLUMN IF NOT EXISTS moz_data JSONB;

-- Add index for last_dr_check to optimize queries for finding directories that need updates
CREATE INDEX IF NOT EXISTS idx_directories_last_dr_check ON directories(last_dr_check NULLS FIRST);

-- Add comments for documentation
COMMENT ON COLUMN directories.spam_score IS 'Moz spam score (0-100, higher is worse)';
COMMENT ON COLUMN directories.linking_root_domains IS 'Number of unique domains linking to this directory';
COMMENT ON COLUMN directories.ranking_keywords IS 'Number of keywords this domain ranks for';
COMMENT ON COLUMN directories.moz_data IS 'Full Moz API response data for reference';
