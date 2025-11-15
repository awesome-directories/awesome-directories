-- Add additional Moz metrics columns to directories table
ALTER TABLE directories
ADD COLUMN IF NOT EXISTS spam_score INTEGER,
ADD COLUMN IF NOT EXISTS linking_root_domains INTEGER,
ADD COLUMN IF NOT EXISTS ranking_keywords INTEGER,
ADD COLUMN IF NOT EXISTS backlinks_count BIGINT,
ADD COLUMN IF NOT EXISTS referring_domains INTEGER,
ADD COLUMN IF NOT EXISTS organic_search_traffic INTEGER,
ADD COLUMN IF NOT EXISTS seo_data JSONB;

-- Add index for last_dr_check to optimize queries for finding directories that need updates
CREATE INDEX IF NOT EXISTS idx_directories_last_dr_check ON directories(last_dr_check NULLS FIRST);
CREATE INDEX IF NOT EXISTS idx_directories_backlinks ON directories(backlinks_count DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_directories_traffic ON directories(organic_search_traffic DESC NULLS LAST);

-- Add comments for documentation
COMMENT ON COLUMN directories.spam_score IS 'Spam score (0-100, higher is worse) from various SEO providers';
COMMENT ON COLUMN directories.linking_root_domains IS 'Number of unique domains linking to this directory';
COMMENT ON COLUMN directories.ranking_keywords IS 'Number of keywords this domain ranks for';
COMMENT ON COLUMN directories.backlinks_count IS 'Total number of backlinks pointing to this domain';
COMMENT ON COLUMN directories.referring_domains IS 'Number of unique referring domains (similar to linking_root_domains)';
COMMENT ON COLUMN directories.organic_search_traffic IS 'Estimated monthly organic search traffic';
COMMENT ON COLUMN directories.seo_data IS 'Consolidated SEO API response data from all providers (Moz, Semrush, Ahrefs, etc.)';
