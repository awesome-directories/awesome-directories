/**
 * API Types for Awesome Directories
 * Type definitions for API requests and responses
 */

// ===== Database Types =====

export interface Directory {
  id: string;
  slug: string;
  name: string;
  description: string;
  url: string;
  logo_url: string | null;
  domain_rating: number | null;
  is_dofollow: boolean;
  categories: string[];
  pricing_type: "free" | "paid" | "freemium";
  pricing_amount: number | null;
  traffic_estimate: "high" | "medium" | "low" | null;
  avg_approval_days: number | null;
  submission_url: string | null;
  is_affiliate: boolean;
  affiliate_url: string | null;
  helpful_count: number;
  view_count: number;
  created_at: string;
  updated_at: string;
  last_dr_check: string | null;
  is_active: boolean;
  github_pr_number: number | null;
  added_by: string | null;
}

export interface DirectoryVote {
  id: string;
  directory_id: string;
  ip_hash: string;
  user_id: string | null;
  created_at: string;
}

export interface UserFavorite {
  id: string;
  user_id: string;
  directory_id: string;
  created_at: string;
  directory?: Directory;
}

export interface UserSubmission {
  id: string;
  user_id: string;
  directory_id: string;
  status: "pending" | "submitted" | "approved" | "rejected";
  submitted_at: string;
  notes: string | null;
  directory?: Directory;
}

export interface PendingDirectory {
  id: string;
  user_id: string;
  user_email: string;
  name: string;
  description: string;
  url: string;
  logo_url: string | null;
  domain_rating: number | null;
  is_dofollow: boolean;
  categories: string[];
  pricing_type: "free" | "paid" | "freemium";
  pricing_amount: number | null;
  submission_url: string | null;
  traffic_estimate: "high" | "medium" | "low" | null;
  avg_approval_days: number | null;
  status: "pending" | "approved" | "rejected";
  admin_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  submitted_at: string;
}

// ===== API Request Types =====

export interface VoteRequest {
  directoryId: string;
}

export interface TrackViewRequest {
  directoryId: string;
}

export interface FavoriteRequest {
  directoryId: string;
}

export interface SubmissionRequest {
  directoryId: string;
  status?: "pending" | "submitted" | "approved" | "rejected";
  notes?: string | null;
}

export interface DirectorySubmitRequest {
  name: string;
  description: string;
  url: string;
  logoUrl?: string;
  categories?: string[];
  pricingType: "free" | "paid" | "freemium";
  pricingAmount?: number;
  submissionUrl?: string;
  trafficEstimate?: "high" | "medium" | "low";
  avgApprovalDays?: number;
  domainRating?: number;
  isDofollow?: boolean;
}

export interface DeletePendingDirectoryRequest {
  id: string;
}

// ===== API Response Types =====

export interface VoteResponse {
  voted: boolean;
  helpfulCount: number | null;
}

export interface VoteCheckResponse {
  voted: boolean;
}

export interface TrackViewResponse {
  viewCount: number;
}

export interface FavoriteAddResponse {
  favorited: true;
}

export interface FavoriteRemoveResponse {
  favorited: false;
}

export interface FavoritesGetResponse {
  favorites: UserFavorite[];
}

export interface SubmissionResponse {
  submission: UserSubmission;
}

export interface SubmissionsGetResponse {
  submissions: UserSubmission[];
}

export interface SubmissionDeleteResponse {
  deleted: true;
}

export interface DirectorySubmitResponse {
  pendingDirectory: PendingDirectory;
}

export interface PendingDirectoriesGetResponse {
  pendingDirectories: PendingDirectory[];
}

export interface PendingDirectoryDeleteResponse {
  deleted: true;
}

export interface ErrorResponse {
  error: string;
  message?: string;
}

// ===== Client Helper Types =====

export type ApiResponse<T> =
  | { data: T; error: null }
  | { data: null; error: ErrorResponse };

export interface AuthUser {
  id: string;
  email: string;
  user_metadata?: Record<string, any>;
  app_metadata?: Record<string, any>;
}
