import { atom } from 'nanostores';
import { supabase } from '@/lib/supabase-client';

export const $reviews = atom([]);
export const $reviewsLoading = atom(false);
export const $reviewsError = atom(null);

/**
 * Organize flat review list into nested structure
 */
function organizeReviews(flatReviews) {
  const topLevel = [];
  const repliesMap = {};

  // First pass: separate top-level reviews and replies
  flatReviews.forEach(review => {
    if (!review.parent_id) {
      topLevel.push({ ...review, replies: [] });
    } else {
      if (!repliesMap[review.parent_id]) {
        repliesMap[review.parent_id] = [];
      }
      repliesMap[review.parent_id].push(review);
    }
  });

  // Second pass: attach replies to parent reviews
  topLevel.forEach(review => {
    if (repliesMap[review.id]) {
      review.replies = repliesMap[review.id].sort((a, b) =>
        b.helpfulness_score - a.helpfulness_score
      );
    }
  });

  return topLevel;
}

/**
 * Fetch all reviews for a directory with user profile data
 * Sorted by helpfulness score (most helpful first)
 */
export async function fetchReviews(directoryId, sortBy = 'helpfulness') {
  $reviewsLoading.set(true);
  $reviewsError.set(null);

  try {
    let query = supabase
      .from('review_stats')
      .select('*')
      .eq('directory_id', directoryId);

    // Apply sorting
    if (sortBy === 'helpfulness') {
      query = query.order('helpfulness_score', { ascending: false });
    } else if (sortBy === 'recent') {
      query = query.order('created_at', { ascending: false });
    } else if (sortBy === 'rating') {
      query = query.order('rating', { ascending: false, nullsFirst: false });
    }

    const { data, error } = await query;

    if (error) throw error;

    // Organize reviews with nested replies
    const organized = organizeReviews(data || []);
    $reviews.set(organized);
    return organized;
  } catch (err) {
    console.error('Error fetching reviews:', err);
    $reviewsError.set(err.message);
    return [];
  } finally {
    $reviewsLoading.set(false);
  }
}

/**
 * Create a new review (with rating) or reply (without rating)
 */
export async function createReview(directoryId, userId, content, rating = null, parentId = null) {
  $reviewsLoading.set(true);
  $reviewsError.set(null);

  try {
    const reviewData = {
      directory_id: directoryId,
      user_id: userId,
      content: content.trim(),
      parent_id: parentId
    };

    // Only add rating if it's a top-level review
    if (!parentId && rating !== null) {
      reviewData.rating = rating;
    }

    const { data, error } = await supabase
      .from('reviews')
      .insert(reviewData)
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (err) {
    console.error('Error creating review:', err);
    $reviewsError.set(err.message);
    return null;
  } finally {
    $reviewsLoading.set(false);
  }
}

/**
 * Update a review's content
 */
export async function updateReview(reviewId, userId, newContent, newRating = null) {
  $reviewsLoading.set(true);
  $reviewsError.set(null);

  try {
    const updateData = {
      content: newContent.trim()
    };

    // Only update rating if provided and it's a top-level review
    if (newRating !== null) {
      updateData.rating = newRating;
    }

    const { data, error } = await supabase
      .from('reviews')
      .update(updateData)
      .eq('id', reviewId)
      .eq('user_id', userId) // Ensure user owns this review
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (err) {
    console.error('Error updating review:', err);
    $reviewsError.set(err.message);
    return null;
  } finally {
    $reviewsLoading.set(false);
  }
}

/**
 * Delete a review
 */
export async function deleteReview(reviewId, userId) {
  $reviewsLoading.set(true);
  $reviewsError.set(null);

  try {
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId)
      .eq('user_id', userId); // Ensure user owns this review

    if (error) throw error;

    return true;
  } catch (err) {
    console.error('Error deleting review:', err);
    $reviewsError.set(err.message);
    return false;
  } finally {
    $reviewsLoading.set(false);
  }
}

/**
 * Vote on a review (upvote or downvote)
 */
export async function voteReview(reviewId, userId, voteType, ipHash = null) {
  $reviewsLoading.set(true);
  $reviewsError.set(null);

  try {
    const voteData = {
      review_id: reviewId,
      vote_type: voteType // 'upvote' or 'downvote'
    };

    let onConflict = null;
    if (userId) {
      voteData.user_id = userId;
      onConflict = 'review_id,user_id';
    } else if (ipHash) {
      voteData.ip_hash = ipHash;
      onConflict = 'review_id,ip_hash';
    } else {
      throw new Error('Either userId or ipHash must be provided to vote on a review.');
    }

    // Try to insert vote
    const { data, error } = await supabase
      .from('review_votes')
      .upsert(voteData, {
        onConflict: onConflict
      })
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (err) {
    console.error('Error voting on review:', err);
    $reviewsError.set(err.message);
    return null;
  } finally {
    $reviewsLoading.set(false);
  }
}

/**
 * Remove vote from a review
 */
export async function removeVote(reviewId, userId, ipHash = null) {
  $reviewsLoading.set(true);
  $reviewsError.set(null);

  try {
    let query = supabase
      .from('review_votes')
      .delete()
      .eq('review_id', reviewId);

    if (userId) {
      query = query.eq('user_id', userId);
    } else {
      query = query.eq('ip_hash', ipHash);
    }

    const { error } = await query;

    if (error) throw error;

    return true;
  } catch (err) {
    console.error('Error removing vote:', err);
    $reviewsError.set(err.message);
    return false;
  } finally {
    $reviewsLoading.set(false);
  }
}

/**
 * Get user's vote on a specific review
 */
export async function getUserVote(reviewId, userId, ipHash = null) {
  try {
    let query = supabase
      .from('review_votes')
      .select('vote_type')
      .eq('review_id', reviewId);

    if (userId) {
      query = query.eq('user_id', userId);
    } else if (ipHash) {
      query = query.eq('ip_hash', ipHash);
    } else {
      return null;
    }

    const { data, error } = await query.maybeSingle();

    if (error) throw error;

    return data?.vote_type || null;
  } catch (err) {
    console.error('Error fetching user vote:', err);
    return null;
  }
}

/**
 * Flag a review as inappropriate
 */
export async function flagReview(reviewId, userId, reason, ipHash = null) {
  $reviewsLoading.set(true);
  $reviewsError.set(null);

  try {
    const flagData = {
      review_id: reviewId,
      reason: reason // 'spam', 'offensive', 'inappropriate', 'other'
    };

    if (userId) {
      flagData.user_id = userId;
    } else {
      flagData.ip_hash = ipHash;
    }

    const { data, error } = await supabase
      .from('review_flags')
      .insert(flagData)
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (err) {
    console.error('Error flagging review:', err);
    $reviewsError.set(err.message);
    return null;
  } finally {
    $reviewsLoading.set(false);
  }
}

/**
 * Check if user has flagged a review
 */
export async function hasUserFlagged(reviewId, userId, ipHash = null) {
  try {
    let query = supabase
      .from('review_flags')
      .select('id')
      .eq('review_id', reviewId);

    if (userId) {
      query = query.eq('user_id', userId);
    } else if (ipHash) {
      query = query.eq('ip_hash', ipHash);
    } else {
      return false;
    }

    const { data, error } = await query.maybeSingle();

    if (error) throw error;

    return !!data;
  } catch (err) {
    console.error('Error checking flag status:', err);
    return false;
  }
}

/**
 * Get review statistics for a directory
 */
export async function getReviewStats(directoryId) {
  try {
    const { data, error } = await supabase
      .from('directories')
      .select('average_rating, review_count')
      .eq('id', directoryId)
      .single();

    if (error) throw error;

    return {
      averageRating: data.average_rating || 0,
      reviewCount: data.review_count || 0
    };
  } catch (err) {
    console.error('Error fetching review stats:', err);
    return {
      averageRating: 0,
      reviewCount: 0
    };
  }
}

/**
 * Generate a simple IP hash for anonymous users
 */
export function generateIpHash() {
  try {
    // In a real app, you'd hash the IP on the backend
    // For now, use a simple browser fingerprint
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      new Date().getTimezoneOffset(),
      screen.width + 'x' + screen.height
    ].join('|');

    // Simple hash function
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }

    return 'anon_' + Math.abs(hash).toString(36);
  } catch (err) {
    console.error('Error generating IP hash:', err);
    return 'anon_' + Math.random().toString(36).substring(2, 15);
  }
}
