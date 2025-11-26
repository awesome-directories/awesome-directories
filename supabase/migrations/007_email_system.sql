-- Migration: Email System
-- Description: Add email preferences, email logs, and notification tracking columns

-- ============================================================================
-- Email Preferences Table
-- ============================================================================
-- Stores user email preferences for opt-out management

CREATE TABLE IF NOT EXISTS email_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Email categories (all default to true - opt-out model)
    submission_updates BOOLEAN NOT NULL DEFAULT TRUE,  -- approval/rejection emails
    welcome_emails BOOLEAN NOT NULL DEFAULT TRUE,       -- welcome email on signup
    review_notifications BOOLEAN NOT NULL DEFAULT TRUE, -- when someone reviews your directory
    weekly_digest BOOLEAN NOT NULL DEFAULT TRUE,        -- weekly summary emails
    marketing_emails BOOLEAN NOT NULL DEFAULT FALSE,    -- promotional content (opt-in)

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT email_preferences_user_unique UNIQUE (user_id)
);

-- Create index on user_id for fast lookups
CREATE INDEX IF NOT EXISTS idx_email_preferences_user_id ON email_preferences(user_id);

-- ============================================================================
-- Email Logs Table
-- ============================================================================
-- Tracks all sent emails for analytics, debugging, and duplicate prevention

CREATE TABLE IF NOT EXISTS email_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

    -- Email details
    email_type VARCHAR(50) NOT NULL,  -- welcome, approval, rejection, confirmation, admin_notification, review_notification, weekly_digest
    email_to VARCHAR(255) NOT NULL,
    email_subject TEXT,

    -- Sender.net tracking
    sender_email_id VARCHAR(100),  -- ID returned from Sender.net API

    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'sent',  -- sent, failed, bounced
    error_message TEXT,

    -- Related entities (optional, for context)
    related_directory_id UUID,
    related_review_id UUID,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_email_logs_user_id ON email_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_email_type ON email_logs(email_type);
CREATE INDEX IF NOT EXISTS idx_email_logs_created_at ON email_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_logs_user_type ON email_logs(user_id, email_type);

-- ============================================================================
-- Add notification columns to pending_directories
-- ============================================================================
-- Add columns for tracking different notification types

-- Rejection notification tracking
ALTER TABLE pending_directories
ADD COLUMN IF NOT EXISTS rejection_notification_sent BOOLEAN DEFAULT FALSE;

ALTER TABLE pending_directories
ADD COLUMN IF NOT EXISTS rejection_notification_sent_at TIMESTAMPTZ;

-- Submission confirmation tracking
ALTER TABLE pending_directories
ADD COLUMN IF NOT EXISTS confirmation_sent BOOLEAN DEFAULT FALSE;

ALTER TABLE pending_directories
ADD COLUMN IF NOT EXISTS confirmation_sent_at TIMESTAMPTZ;

-- ============================================================================
-- Row Level Security (RLS)
-- ============================================================================

-- Enable RLS on email_preferences
ALTER TABLE email_preferences ENABLE ROW LEVEL SECURITY;

-- Users can view their own preferences
CREATE POLICY "Users can view own email preferences"
    ON email_preferences FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own preferences
CREATE POLICY "Users can insert own email preferences"
    ON email_preferences FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own preferences
CREATE POLICY "Users can update own email preferences"
    ON email_preferences FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Enable RLS on email_logs (read-only for users, service role can insert)
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- Users can view their own email logs
CREATE POLICY "Users can view own email logs"
    ON email_logs FOR SELECT
    USING (auth.uid() = user_id);

-- Service role can insert (via Edge Functions)
-- Note: Edge Functions use service role key which bypasses RLS

-- ============================================================================
-- Triggers for updated_at
-- ============================================================================

CREATE OR REPLACE FUNCTION update_email_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_email_preferences_updated_at
    BEFORE UPDATE ON email_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_email_preferences_updated_at();

-- ============================================================================
-- Helper function to check email preferences
-- ============================================================================

CREATE OR REPLACE FUNCTION check_email_preference(
    p_user_id UUID,
    p_preference_type TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    v_allowed BOOLEAN;
BEGIN
    -- Get preference value, default to true if no preferences set
    EXECUTE format(
        'SELECT COALESCE(
            (SELECT %I FROM email_preferences WHERE user_id = $1),
            TRUE
        )',
        p_preference_type
    ) INTO v_allowed USING p_user_id;

    RETURN v_allowed;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- Comments for documentation
-- ============================================================================

COMMENT ON TABLE email_preferences IS 'User email preferences for opt-out management';
COMMENT ON TABLE email_logs IS 'Log of all sent emails for tracking and debugging';
COMMENT ON COLUMN email_preferences.submission_updates IS 'Receive emails about submission approvals/rejections';
COMMENT ON COLUMN email_preferences.welcome_emails IS 'Receive welcome email on signup';
COMMENT ON COLUMN email_preferences.review_notifications IS 'Receive notifications when someone reviews your directory';
COMMENT ON COLUMN email_preferences.weekly_digest IS 'Receive weekly summary emails';
COMMENT ON COLUMN email_preferences.marketing_emails IS 'Receive promotional/marketing content (opt-in only)';
COMMENT ON COLUMN email_logs.email_type IS 'Type: welcome, approval, rejection, confirmation, admin_notification, review_notification, weekly_digest';
COMMENT ON COLUMN email_logs.status IS 'Status: sent, failed, bounced';
