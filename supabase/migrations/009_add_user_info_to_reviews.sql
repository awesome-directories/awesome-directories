-- Migration 009: Add user display info to directory_reviews
-- This migration adds user_name and user_avatar_url columns to store
-- user display information at review creation time, avoiding the need
-- to join with auth.users (which has RLS restrictions for anonymous users).

-- ============================================
-- 1. ADD USER DISPLAY COLUMNS
-- ============================================

ALTER TABLE directory_reviews
ADD COLUMN IF NOT EXISTS user_name TEXT,
ADD COLUMN IF NOT EXISTS user_avatar_url TEXT;

-- ============================================
-- 2. ADD COMMENTS
-- ============================================

COMMENT ON COLUMN directory_reviews.user_name IS 'Display name of the reviewer, captured at review creation time from OAuth metadata';
COMMENT ON COLUMN directory_reviews.user_avatar_url IS 'Avatar URL of the reviewer, captured at review creation time from OAuth metadata';

-- ============================================
-- 3. NOTES
-- ============================================
-- The directory_reviews_with_user view remains available for server-side use
-- but client-side queries should now select user_name and user_avatar_url
-- directly from the directory_reviews table for proper display.
--
-- Existing reviews will have NULL values for these columns, which the
-- frontend handles gracefully with fallback display ("Anonymous" / initials).
