import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

export function useReviews() {
  const reviews = ref([])
  const loading = ref(false)
  const error = ref(null)

  /**
   * Fetch all reviews for a directory with user profile data
   * Sorted by helpfulness score (most helpful first)
   */
  const fetchReviews = async (directoryId, sortBy = 'helpfulness') => {
    loading.value = true
    error.value = null

    try {
      let query = supabase
        .from('review_stats')
        .select('*')
        .eq('directory_id', directoryId)

      // Apply sorting
      if (sortBy === 'helpfulness') {
        query = query.order('helpfulness_score', { ascending: false })
      } else if (sortBy === 'recent') {
        query = query.order('created_at', { ascending: false })
      } else if (sortBy === 'rating') {
        query = query.order('rating', { ascending: false, nullsFirst: false })
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError

      // Organize reviews with nested replies
      const organized = organizeReviews(data)
      reviews.value = organized
      return organized
    } catch (err) {
      console.error('Error fetching reviews:', err)
      error.value = err.message
      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * Organize flat review list into nested structure
   */
  const organizeReviews = (flatReviews) => {
    const topLevel = []
    const repliesMap = {}

    // First pass: separate top-level reviews and replies
    flatReviews.forEach(review => {
      if (!review.parent_id) {
        topLevel.push({ ...review, replies: [] })
      } else {
        if (!repliesMap[review.parent_id]) {
          repliesMap[review.parent_id] = []
        }
        repliesMap[review.parent_id].push(review)
      }
    })

    // Second pass: attach replies to parent reviews
    topLevel.forEach(review => {
      if (repliesMap[review.id]) {
        review.replies = repliesMap[review.id].sort((a, b) =>
          b.helpfulness_score - a.helpfulness_score
        )
      }
    })

    return topLevel
  }

  /**
   * Create a new review (with rating) or reply (without rating)
   */
  const createReview = async (directoryId, userId, content, rating = null, parentId = null) => {
    loading.value = true
    error.value = null

    try {
      const reviewData = {
        directory_id: directoryId,
        user_id: userId,
        content: content.trim(),
        parent_id: parentId
      }

      // Only add rating if it's a top-level review
      if (!parentId && rating !== null) {
        reviewData.rating = rating
      }

      const { data, error: createError } = await supabase
        .from('reviews')
        .insert(reviewData)
        .select()
        .single()

      if (createError) throw createError

      return data
    } catch (err) {
      console.error('Error creating review:', err)
      error.value = err.message
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Update a review's content
   */
  const updateReview = async (reviewId, userId, newContent, newRating = null) => {
    loading.value = true
    error.value = null

    try {
      const updateData = {
        content: newContent.trim()
      }

      // Only update rating if provided and it's a top-level review
      if (newRating !== null) {
        updateData.rating = newRating
      }

      const { data, error: updateError } = await supabase
        .from('reviews')
        .update(updateData)
        .eq('id', reviewId)
        .eq('user_id', userId) // Ensure user owns this review
        .select()
        .single()

      if (updateError) throw updateError

      return data
    } catch (err) {
      console.error('Error updating review:', err)
      error.value = err.message
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Delete a review
   */
  const deleteReview = async (reviewId, userId) => {
    loading.value = true
    error.value = null

    try {
      const { error: deleteError } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId)
        .eq('user_id', userId) // Ensure user owns this review

      if (deleteError) throw deleteError

      return true
    } catch (err) {
      console.error('Error deleting review:', err)
      error.value = err.message
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Vote on a review (upvote or downvote)
   */
  const voteReview = async (reviewId, userId, voteType, ipHash = null) => {
    loading.value = true
    error.value = null

    try {
      const voteData = {
        review_id: reviewId,
        vote_type: voteType // 'upvote' or 'downvote'
      }

      if (userId) {
        voteData.user_id = userId
      } else {
        voteData.ip_hash = ipHash
      }

      // Try to insert vote
      const { data, error: voteError } = await supabase
        .from('review_votes')
        .upsert(voteData, {
          onConflict: userId ? 'review_id,user_id' : 'review_id,ip_hash'
        })
        .select()
        .single()

      if (voteError) throw voteError

      return data
    } catch (err) {
      console.error('Error voting on review:', err)
      error.value = err.message
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Remove vote from a review
   */
  const removeVote = async (reviewId, userId, ipHash = null) => {
    loading.value = true
    error.value = null

    try {
      let query = supabase
        .from('review_votes')
        .delete()
        .eq('review_id', reviewId)

      if (userId) {
        query = query.eq('user_id', userId)
      } else {
        query = query.eq('ip_hash', ipHash)
      }

      const { error: deleteError } = await query

      if (deleteError) throw deleteError

      return true
    } catch (err) {
      console.error('Error removing vote:', err)
      error.value = err.message
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Get user's vote on a specific review
   */
  const getUserVote = async (reviewId, userId, ipHash = null) => {
    try {
      let query = supabase
        .from('review_votes')
        .select('vote_type')
        .eq('review_id', reviewId)

      if (userId) {
        query = query.eq('user_id', userId)
      } else if (ipHash) {
        query = query.eq('ip_hash', ipHash)
      } else {
        return null
      }

      const { data, error: fetchError } = await query.maybeSingle()

      if (fetchError) throw fetchError

      return data?.vote_type || null
    } catch (err) {
      console.error('Error fetching user vote:', err)
      return null
    }
  }

  /**
   * Flag a review as inappropriate
   */
  const flagReview = async (reviewId, userId, reason, ipHash = null) => {
    loading.value = true
    error.value = null

    try {
      const flagData = {
        review_id: reviewId,
        reason: reason // 'spam', 'offensive', 'inappropriate', 'other'
      }

      if (userId) {
        flagData.user_id = userId
      } else {
        flagData.ip_hash = ipHash
      }

      const { data, error: flagError } = await supabase
        .from('review_flags')
        .insert(flagData)
        .select()
        .single()

      if (flagError) throw flagError

      return data
    } catch (err) {
      console.error('Error flagging review:', err)
      error.value = err.message
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Remove a flag from a review
   */
  const removeFlag = async (reviewId, userId, ipHash = null) => {
    loading.value = true
    error.value = null

    try {
      let query = supabase
        .from('review_flags')
        .delete()
        .eq('review_id', reviewId)

      if (userId) {
        query = query.eq('user_id', userId)
      } else {
        query = query.eq('ip_hash', ipHash)
      }

      const { error: deleteError } = await query

      if (deleteError) throw deleteError

      return true
    } catch (err) {
      console.error('Error removing flag:', err)
      error.value = err.message
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Check if user has flagged a review
   */
  const hasUserFlagged = async (reviewId, userId, ipHash = null) => {
    try {
      let query = supabase
        .from('review_flags')
        .select('id')
        .eq('review_id', reviewId)

      if (userId) {
        query = query.eq('user_id', userId)
      } else if (ipHash) {
        query = query.eq('ip_hash', ipHash)
      } else {
        return false
      }

      const { data, error: fetchError } = await query.maybeSingle()

      if (fetchError) throw fetchError

      return !!data
    } catch (err) {
      console.error('Error checking flag status:', err)
      return false
    }
  }

  /**
   * Get review statistics for a directory
   */
  const getReviewStats = async (directoryId) => {
    try {
      const { data, error: fetchError } = await supabase
        .from('directories')
        .select('average_rating, review_count')
        .eq('id', directoryId)
        .single()

      if (fetchError) throw fetchError

      return {
        averageRating: data.average_rating || 0,
        reviewCount: data.review_count || 0
      }
    } catch (err) {
      console.error('Error fetching review stats:', err)
      return {
        averageRating: 0,
        reviewCount: 0
      }
    }
  }

  /**
   * Generate a simple IP hash for anonymous users
   */
  const generateIpHash = async () => {
    try {
      // In a real app, you'd hash the IP on the backend
      // For now, use a simple browser fingerprint
      const fingerprint = [
        navigator.userAgent,
        navigator.language,
        new Date().getTimezoneOffset(),
        screen.width + 'x' + screen.height
      ].join('|')

      // Simple hash function
      let hash = 0
      for (let i = 0; i < fingerprint.length; i++) {
        const char = fingerprint.charCodeAt(i)
        hash = ((hash << 5) - hash) + char
        hash = hash & hash
      }

      return 'anon_' + Math.abs(hash).toString(36)
    } catch (err) {
      console.error('Error generating IP hash:', err)
      return 'anon_' + Math.random().toString(36).substring(2, 15)
    }
  }

  return {
    reviews,
    loading,
    error,
    fetchReviews,
    createReview,
    updateReview,
    deleteReview,
    voteReview,
    removeVote,
    getUserVote,
    flagReview,
    removeFlag,
    hasUserFlagged,
    getReviewStats,
    generateIpHash
  }
}
