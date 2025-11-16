/**
 * Client-side API helper functions
 * Simplifies making authenticated API calls from the frontend
 */

import { supabase } from "./supabase-client";
import type {
  VoteRequest,
  VoteResponse,
  VoteCheckResponse,
  TrackViewRequest,
  TrackViewResponse,
  FavoriteRequest,
  FavoriteAddResponse,
  FavoriteRemoveResponse,
  FavoritesGetResponse,
  SubmissionRequest,
  SubmissionResponse,
  SubmissionsGetResponse,
  DirectorySubmitRequest,
  DirectorySubmitResponse,
  PendingDirectoriesGetResponse,
  DeletePendingDirectoryRequest,
  PendingDirectoryDeleteResponse,
  ApiResponse,
} from "@/types/api";

/**
 * Get authorization header with JWT token
 */
async function getAuthHeader(): Promise<Record<string, string>> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.access_token) {
    return {
      Authorization: `Bearer ${session.access_token}`,
    };
  }

  return {};
}

/**
 * Make an API request
 */
async function apiRequest<T>(
  url: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const authHeaders = await getAuthHeader();

    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...authHeaders,
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return { data: null, error: data };
    }

    return { data, error: null };
  } catch (error) {
    console.error("API request error:", error);
    return {
      data: null,
      error: { error: "Network error", message: String(error) },
    };
  }
}

// ===== Vote API =====

/**
 * Vote (or unvote) on a directory
 */
export async function voteOnDirectory(
  directoryId: string
): Promise<ApiResponse<VoteResponse>> {
  return apiRequest<VoteResponse>("/api/vote", {
    method: "POST",
    body: JSON.stringify({ directoryId } as VoteRequest),
  });
}

/**
 * Check if user has voted on a directory
 */
export async function checkVoteStatus(
  directoryId: string
): Promise<ApiResponse<VoteCheckResponse>> {
  return apiRequest<VoteCheckResponse>(
    `/api/vote?directoryId=${directoryId}`,
    {
      method: "GET",
    }
  );
}

// ===== View Tracking API =====

/**
 * Track a directory view
 */
export async function trackDirectoryView(
  directoryId: string
): Promise<ApiResponse<TrackViewResponse>> {
  return apiRequest<TrackViewResponse>("/api/track-view", {
    method: "POST",
    body: JSON.stringify({ directoryId } as TrackViewRequest),
  });
}

// ===== Favorites API =====

/**
 * Add a directory to favorites
 */
export async function addFavorite(
  directoryId: string
): Promise<ApiResponse<FavoriteAddResponse>> {
  return apiRequest<FavoriteAddResponse>("/api/favorites", {
    method: "POST",
    body: JSON.stringify({ directoryId } as FavoriteRequest),
  });
}

/**
 * Remove a directory from favorites
 */
export async function removeFavorite(
  directoryId: string
): Promise<ApiResponse<FavoriteRemoveResponse>> {
  return apiRequest<FavoriteRemoveResponse>("/api/favorites", {
    method: "DELETE",
    body: JSON.stringify({ directoryId } as FavoriteRequest),
  });
}

/**
 * Get user's favorite directories
 */
export async function getFavorites(): Promise<
  ApiResponse<FavoritesGetResponse>
> {
  return apiRequest<FavoritesGetResponse>("/api/favorites", {
    method: "GET",
  });
}

// ===== Submissions Tracking API =====

/**
 * Track a submission to a directory
 */
export async function trackSubmission(
  data: SubmissionRequest
): Promise<ApiResponse<SubmissionResponse>> {
  return apiRequest<SubmissionResponse>("/api/submissions/submit", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Get user's submission tracking records
 */
export async function getSubmissions(): Promise<
  ApiResponse<SubmissionsGetResponse>
> {
  return apiRequest<SubmissionsGetResponse>("/api/submissions/submit", {
    method: "GET",
  });
}

/**
 * Delete a submission tracking record
 */
export async function deleteSubmission(
  directoryId: string
): Promise<ApiResponse<{ deleted: true }>> {
  return apiRequest<{ deleted: true }>("/api/submissions/submit", {
    method: "DELETE",
    body: JSON.stringify({ directoryId }),
  });
}

// ===== Directory Submission API =====

/**
 * Submit a new directory for review
 */
export async function submitDirectory(
  data: DirectorySubmitRequest
): Promise<ApiResponse<DirectorySubmitResponse>> {
  return apiRequest<DirectorySubmitResponse>("/api/directories/submit", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Get user's pending directory submissions
 */
export async function getPendingDirectories(): Promise<
  ApiResponse<PendingDirectoriesGetResponse>
> {
  return apiRequest<PendingDirectoriesGetResponse>("/api/directories/submit", {
    method: "GET",
  });
}

/**
 * Delete a pending directory submission
 */
export async function deletePendingDirectory(
  id: string
): Promise<ApiResponse<PendingDirectoryDeleteResponse>> {
  return apiRequest<PendingDirectoryDeleteResponse>("/api/directories/submit", {
    method: "DELETE",
    body: JSON.stringify({ id } as DeletePendingDirectoryRequest),
  });
}
