<template>
  <div class="settings-content">
    <!-- Loading State -->
    <div v-if="isInitialLoading" class="bg-white rounded-lg shadow-sm p-8 text-center">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      <p class="text-gray-500 mt-2">Loading your settings...</p>
    </div>

    <!-- Unauthenticated State -->
    <div v-else-if="!user" class="bg-white rounded-lg shadow-sm p-8 text-center">
      <p class="text-gray-600 mb-4">You must be signed in to access settings.</p>
      <button @click="showAuthModal" class="btn-primary px-6 py-2">
        Sign In
      </button>
    </div>

    <!-- Settings Content -->
    <div v-else class="space-y-6">
      <!-- Profile Section -->
      <section class="bg-white rounded-lg shadow-sm p-6">
        <h2 class="text-xl font-bold text-gray-900 mb-4">Profile Information</h2>

        <!-- Avatar -->
        <div class="flex items-center space-x-4 mb-6">
          <div
            v-if="profile?.avatar_url"
            class="w-20 h-20 rounded-full overflow-hidden bg-gray-200"
          >
            <img
              :src="profile.avatar_url"
              :alt="profile.display_name"
              class="w-full h-full object-cover"
            />
          </div>
          <div
            v-else
            class="w-20 h-20 rounded-full bg-primary text-white flex items-center justify-center text-3xl font-semibold"
          >
            {{ getInitials(profile?.display_name) }}
          </div>
          <div>
            <p class="text-sm text-gray-600">{{ user.email }}</p>
            <p class="text-xs text-gray-400 mt-1">Joined {{ formatDate(user.created_at) }}</p>
          </div>
        </div>

        <!-- Display Name -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Display Name
          </label>
          <div class="flex items-center space-x-2">
            <input
              v-model="displayName"
              type="text"
              :disabled="isSaving"
              class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Enter your display name"
            />
            <button
              @click="handleUpdateDisplayName"
              :disabled="isSaving || !displayNameChanged"
              class="btn-primary px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isSaving ? 'Saving...' : 'Save' }}
            </button>
          </div>
          <p class="text-xs text-gray-500 mt-1">
            This name will be displayed on your reviews and comments
          </p>
        </div>

        <!-- Success/Error Messages -->
        <div v-if="successMessage" class="p-3 bg-green-50 border border-green-200 rounded-lg">
          <p class="text-sm text-green-600">{{ successMessage }}</p>
        </div>
        <div v-if="errorMessage" class="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p class="text-sm text-red-600">{{ errorMessage }}</p>
        </div>
      </section>

      <!-- Account Section -->
      <section class="bg-white rounded-lg shadow-sm p-6">
        <h2 class="text-xl font-bold text-gray-900 mb-4">Account</h2>

        <div class="space-y-3">
          <button
            @click="handleSignOut"
            class="w-full inline-flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium rounded-lg transition-colors"
          >
            🚪 Sign Out
          </button>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useStore } from '@nanostores/vue'
import { $user } from '@/stores/auth'
import { $profile, $profileLoading, $profileError, fetchProfile, updateDisplayName, getDefaultDisplayName } from '@/stores/profile'
import { supabase } from '@/lib/supabase-client'

const user = useStore($user)
const profile = useStore($profile)
const profileLoading = useStore($profileLoading)
const profileError = useStore($profileError)

const displayName = ref('')
const isSaving = ref(false)
const isInitialLoading = ref(true)
const successMessage = ref('')
const errorMessage = ref('')

const displayNameChanged = computed(() => {
  return displayName.value !== (profile.value?.display_name || '')
})

const getInitials = (name) => {
  if (!name || typeof name !== 'string') return '?'
  const parts = name.split(' ').filter(part => part.length > 0)
  if (parts.length >= 2) {
    const first = parts[0][0] || ''
    const second = parts[1][0] || ''
    return (first + second).toUpperCase() || '?'
  }
  if (parts.length === 1 && parts[0].length > 0) {
    return parts[0].substring(0, 2).toUpperCase()
  }
  return '?'
}

const formatDate = (dateString) => {
  if (!dateString) return 'Unknown'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const showAuthModal = () => {
  window.dispatchEvent(new CustomEvent('show-auth-modal'))
}

const handleUpdateDisplayName = async () => {
  if (!user.value || !displayNameChanged.value) return

  isSaving.value = true
  errorMessage.value = ''
  successMessage.value = ''

  const success = await updateDisplayName(user.value.id, displayName.value)

  if (success) {
    successMessage.value = 'Display name updated successfully!'
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  } else {
    errorMessage.value = profileError.value || 'Failed to update display name. Please try again.'
    setTimeout(() => {
      errorMessage.value = ''
    }, 5000)
  }

  isSaving.value = false
}

const handleSignOut = async () => {
  try {
    await supabase.auth.signOut()
    window.location.href = '/'
  } catch (error) {
    console.error('Failed to sign out:', error)
    errorMessage.value = 'Failed to sign out. Please try again.'
  }
}

// Load profile when user is available
watch(user, async (newUser) => {
  if (newUser) {
    await fetchProfile(newUser.id)
    displayName.value = profile.value?.display_name || getDefaultDisplayName(newUser.email)
  }
  isInitialLoading.value = false
}, { immediate: true })

// Initialize
onMounted(async () => {
  if (user.value) {
    await fetchProfile(user.value.id)
    displayName.value = profile.value?.display_name || getDefaultDisplayName(user.value.email)
  }
  isInitialLoading.value = false
})
</script>

<style scoped>
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
