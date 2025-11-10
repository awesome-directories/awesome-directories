import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

export function useProfile() {
  const profile = ref(null)
  const loading = ref(false)
  const error = ref(null)

  /**
   * Fetch user profile by user ID
   */
  const fetchProfile = async (userId) => {
    if (!userId) {
      profile.value = null
      return
    }

    loading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (fetchError) throw fetchError

      profile.value = data
      return data
    } catch (err) {
      console.error('Error fetching profile:', err)
      error.value = err.message
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Create a new user profile
   * Called automatically by trigger on signup, but can be called manually if needed
   */
  const createProfile = async (userId, displayName, email, avatarUrl = null) => {
    loading.value = true
    error.value = null

    try {
      const { data, error: createError } = await supabase
        .from('user_profiles')
        .insert({
          id: userId,
          display_name: displayName,
          email: email,
          avatar_url: avatarUrl
        })
        .select()
        .single()

      if (createError) throw createError

      profile.value = data
      return data
    } catch (err) {
      console.error('Error creating profile:', err)
      error.value = err.message
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Update user profile display name
   */
  const updateDisplayName = async (userId, newDisplayName) => {
    if (!newDisplayName || newDisplayName.trim().length === 0) {
      error.value = 'Display name cannot be empty'
      return false
    }

    loading.value = true
    error.value = null

    try {
      const { data, error: updateError } = await supabase
        .from('user_profiles')
        .update({ display_name: newDisplayName.trim() })
        .eq('id', userId)
        .select()
        .single()

      if (updateError) throw updateError

      profile.value = data
      return true
    } catch (err) {
      console.error('Error updating display name:', err)
      error.value = err.message
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Update avatar URL
   */
  const updateAvatar = async (userId, avatarUrl) => {
    loading.value = true
    error.value = null

    try {
      const { data, error: updateError } = await supabase
        .from('user_profiles')
        .update({ avatar_url: avatarUrl })
        .eq('id', userId)
        .select()
        .single()

      if (updateError) throw updateError

      profile.value = data
      return true
    } catch (err) {
      console.error('Error updating avatar:', err)
      error.value = err.message
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Get default display name from email
   */
  const getDefaultDisplayName = (email) => {
    if (!email) return 'Anonymous'
    return email.split('@')[0]
  }

  return {
    profile,
    loading,
    error,
    fetchProfile,
    createProfile,
    updateDisplayName,
    updateAvatar,
    getDefaultDisplayName
  }
}
