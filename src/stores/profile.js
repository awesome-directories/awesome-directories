import { atom } from 'nanostores';
import { supabase } from '@/lib/supabase-client';
import { $user } from './auth';

export const $profile = atom(null);
export const $profileLoading = atom(false);
export const $profileError = atom(null);

/**
 * Fetch user profile by user ID
 */
export async function fetchProfile(userId) {
  if (!userId) {
    $profile.set(null);
    return null;
  }

  $profileLoading.set(true);
  $profileError.set(null);

  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;

    $profile.set(data);
    return data;
  } catch (err) {
    console.error('Error fetching profile:', err);
    $profileError.set(err.message);
    return null;
  } finally {
    $profileLoading.set(false);
  }
}

/**
 * Create a new user profile
 * Called automatically by trigger on signup, but can be called manually if needed
 */
export async function createProfile(userId, displayName, email, avatarUrl = null) {
  $profileLoading.set(true);
  $profileError.set(null);

  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert({
        id: userId,
        display_name: displayName,
        email: email,
        avatar_url: avatarUrl
      })
      .select()
      .single();

    if (error) throw error;

    $profile.set(data);
    return data;
  } catch (err) {
    console.error('Error creating profile:', err);
    $profileError.set(err.message);
    return null;
  } finally {
    $profileLoading.set(false);
  }
}

/**
 * Update user profile display name
 */
export async function updateDisplayName(userId, newDisplayName) {
  if (!newDisplayName || newDisplayName.trim().length === 0) {
    $profileError.set('Display name cannot be empty');
    return false;
  }

  $profileLoading.set(true);
  $profileError.set(null);

  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .update({ display_name: newDisplayName.trim() })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    $profile.set(data);
    return true;
  } catch (err) {
    console.error('Error updating display name:', err);
    $profileError.set(err.message);
    return false;
  } finally {
    $profileLoading.set(false);
  }
}

/**
 * Update avatar URL
 */
export async function updateAvatar(userId, avatarUrl) {
  $profileLoading.set(true);
  $profileError.set(null);

  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .update({ avatar_url: avatarUrl })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    $profile.set(data);
    return true;
  } catch (err) {
    console.error('Error updating avatar:', err);
    $profileError.set(err.message);
    return false;
  } finally {
    $profileLoading.set(false);
  }
}

/**
 * Get default display name from email
 */
export function getDefaultDisplayName(email) {
  if (!email) return 'Anonymous';
  return email.split('@')[0];
}
