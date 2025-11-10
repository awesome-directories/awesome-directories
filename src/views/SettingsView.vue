<template>
  <div class="min-h-screen bg-gray-50 py-12">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 class="text-4xl font-bold text-gray-900 mb-2">Settings</h1>
      <p class="text-gray-600 mb-8">Manage your profile and account preferences</p>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div
          class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"
        ></div>
      </div>

      <!-- Authenticated Content -->
      <div v-else-if="user" class="space-y-6">
        <!-- Profile Section -->
        <div class="card p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Profile Information</h2>

          <div class="space-y-4">
            <!-- Avatar -->
            <div class="flex items-center space-x-4">
              <div v-if="profile?.avatar_url" class="w-20 h-20 rounded-full overflow-hidden bg-gray-200">
                <img
                  :src="profile.avatar_url"
                  :alt="profile.display_name"
                  class="w-full h-full object-cover"
                />
              </div>
              <div v-else class="w-20 h-20 rounded-full bg-primary bg-opacity-20 flex items-center justify-center text-primary text-2xl font-bold">
                {{ getInitials(profile?.display_name || user.email) }}
              </div>
              <div>
                <h3 class="font-semibold text-gray-900">{{ profile?.display_name }}</h3>
                <p class="text-sm text-gray-500">{{ user.email }}</p>
              </div>
            </div>

            <!-- Display Name -->
            <div>
              <label for="displayName" class="block text-sm font-medium text-gray-700 mb-1">
                Display Name
              </label>
              <p class="text-xs text-gray-500 mb-2">
                This name will be displayed on your reviews and comments
              </p>
              <div class="flex items-center space-x-2">
                <input
                  id="displayName"
                  v-model="newDisplayName"
                  type="text"
                  class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Your display name"
                  :disabled="updatingProfile"
                />
                <button
                  @click="handleUpdateDisplayName"
                  :disabled="!displayNameChanged || updatingProfile"
                  class="btn-primary px-4 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {{ updatingProfile ? 'Saving...' : 'Save' }}
                </button>
              </div>
            </div>

            <!-- Success/Error Messages -->
            <div v-if="profileSuccess" class="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p class="text-sm text-green-600">{{ profileSuccess }}</p>
            </div>
            <div v-if="profileError" class="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p class="text-sm text-red-600">{{ profileError }}</p>
            </div>
          </div>
        </div>

        <!-- Account Section -->
        <div class="card p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Account</h2>

          <div class="space-y-4">
            <!-- Email -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                :value="user.email"
                disabled
                class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
              />
              <p class="text-xs text-gray-500 mt-1">Your email address cannot be changed</p>
            </div>

            <!-- Linked Providers -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Linked Accounts</label>
              <div class="space-y-2">
                <div
                  v-for="identity in linkedIdentities"
                  :key="identity.provider"
                  class="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                >
                  <div class="flex items-center space-x-3">
                    <svg v-if="identity.provider === 'google'" class="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <svg v-else-if="identity.provider === 'github'" class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd"/>
                    </svg>
                    <svg v-else class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                    </svg>
                    <span class="text-sm font-medium capitalize">{{ identity.provider }}</span>
                  </div>
                  <span class="text-xs text-green-600 font-medium">Connected</span>
                </div>

                <!-- Available Providers to Link -->
                <div
                  v-for="provider in availableProviders"
                  :key="provider"
                  class="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50"
                >
                  <div class="flex items-center space-x-3">
                    <svg v-if="provider === 'google'" class="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <svg v-else-if="provider === 'github'" class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd"/>
                    </svg>
                    <span class="text-sm font-medium capitalize text-gray-600">{{ provider }}</span>
                  </div>
                  <button
                    @click="handleLinkProvider(provider)"
                    class="text-xs text-primary hover:text-primary-dark font-medium"
                  >
                    Link Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Danger Zone -->
        <div class="card p-6 border-red-200">
          <h2 class="text-xl font-semibold text-red-600 mb-4">Danger Zone</h2>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-medium text-gray-900">Sign Out</h3>
                <p class="text-sm text-gray-500">Sign out of your account</p>
              </div>
              <button
                @click="handleSignOut"
                class="px-4 py-2 text-sm font-medium text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Not Authenticated -->
      <div v-else class="card p-12 text-center">
        <div class="text-6xl mb-4">🔒</div>
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Sign In Required</h2>
        <p class="text-gray-600 mb-6">
          You need to be signed in to access settings
        </p>
        <button
          @click="$router.push('/')"
          class="btn-primary"
        >
          Go to Homepage
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useProfile } from '@/composables/useProfile'

const router = useRouter()
const { user, loading: authLoading, signOut, linkProvider } = useAuth()
const { profile, loading: profileLoading, fetchProfile, updateDisplayName } = useProfile()

const newDisplayName = ref('')
const updatingProfile = ref(false)
const profileSuccess = ref('')
const profileError = ref('')

const loading = computed(() => authLoading.value || profileLoading.value)

const displayNameChanged = computed(() => {
  return newDisplayName.value.trim() !== '' && newDisplayName.value !== profile.value?.display_name
})

const linkedIdentities = computed(() => {
  if (!user.value?.identities) return []
  return user.value.identities.map(identity => ({
    provider: identity.provider,
    id: identity.id
  }))
})

const availableProviders = computed(() => {
  const linked = linkedIdentities.value.map(i => i.provider)
  const all = ['google', 'github']
  return all.filter(provider => !linked.includes(provider))
})

const getInitials = (name) => {
  if (!name) return '?'
  const parts = name.trim().split(' ').filter(Boolean)
  if (parts.length >= 2 && parts[0].length > 0 && parts[1].length > 0) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  // Fallback: use first two non-space characters
  return name.replace(/\s/g, '').substring(0, 2).toUpperCase()
}

const handleUpdateDisplayName = async () => {
  if (!displayNameChanged.value) return

  updatingProfile.value = true
  profileSuccess.value = ''
  profileError.value = ''

  const success = await updateDisplayName(user.value.id, newDisplayName.value)

  if (success) {
    profileSuccess.value = 'Display name updated successfully!'
    setTimeout(() => {
      profileSuccess.value = ''
    }, 3000)
  } else {
    profileError.value = 'Failed to update display name. Please try again.'
  }

  updatingProfile.value = false
}

const handleLinkProvider = async (provider) => {
  try {
    await linkProvider(provider)
  } catch (error) {
    console.error('Error linking provider:', error)
    profileError.value = `Failed to link ${provider}. Please try again.`
  }
}

const handleSignOut = async () => {
  try {
    await signOut()
    router.push('/')
  } catch (error) {
    console.error('Error signing out:', error)
  }
}

onMounted(async () => {
  if (user.value) {
    await fetchProfile(user.value.id)
    newDisplayName.value = profile.value?.display_name || ''
  }
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
