<template>
  <div class="min-h-screen bg-gray-50 py-12">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 class="text-4xl font-bold text-gray-900 mb-8">Public Stats</h1>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="card p-6">
          <div class="text-3xl font-bold text-primary mb-2">{{ stats.totalDirectories }}</div>
          <div class="text-gray-600">Total Directories</div>
        </div>

        <div class="card p-6">
          <div class="text-3xl font-bold text-primary mb-2">{{ stats.withDR }}</div>
          <div class="text-gray-600">With DR Ratings</div>
        </div>

        <div class="card p-6">
          <div class="text-3xl font-bold text-primary mb-2">{{ stats.dofollowCount }}</div>
          <div class="text-gray-600">Dofollow Links</div>
        </div>

        <div class="card p-6">
          <div class="text-3xl font-bold text-primary mb-2">{{ stats.freeCount }}</div>
          <div class="text-gray-600">Free to Submit</div>
        </div>
      </div>

      <div class="card p-8 mb-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Last Updated</h2>
        <p class="text-gray-700">
          <strong>{{ lastUpdated }}</strong>
        </p>
        <p class="text-sm text-gray-500 mt-2">
          Directory ratings are updated weekly via automated GitHub Actions
        </p>
      </div>

      <div class="card p-8 mb-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">Most Helpful Directories</h2>
        <div class="space-y-4">
          <div
            v-for="dir in topDirectories"
            :key="dir.id"
            class="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
          >
            <router-link
              :to="`/directory/${dir.slug}`"
              class="text-lg font-medium text-gray-900 hover:text-primary"
            >
              {{ dir.name }}
            </router-link>
            <div class="flex items-center space-x-4">
              <span v-if="dir.domain_rating" class="badge-green">
                DR: {{ dir.domain_rating }}
              </span>
              <span class="text-gray-600">
                👍 {{ dir.helpful_count || 0 }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="card p-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">GitHub Stats</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div class="text-2xl font-bold text-primary mb-1">{{ githubStats.stars || '...' }}</div>
            <div class="text-gray-600">⭐ Stars</div>
          </div>
          <div>
            <div class="text-2xl font-bold text-primary mb-1">{{ githubStats.forks || '...' }}</div>
            <div class="text-gray-600">🍴 Forks</div>
          </div>
          <div>
            <div class="text-2xl font-bold text-primary mb-1">{{ githubStats.contributors || '...' }}</div>
            <div class="text-gray-600">👥 Contributors</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useDirectories } from '../composables/useDirectories'

const { directories, fetchDirectories } = useDirectories()

const githubStats = ref({
  stars: null,
  forks: null,
  contributors: null
})

const stats = computed(() => {
  return {
    totalDirectories: directories.value.length,
    withDR: directories.value.filter(d => d.domain_rating).length,
    dofollowCount: directories.value.filter(d => d.is_dofollow).length,
    freeCount: directories.value.filter(d => d.pricing_type === 'free').length
  }
})

const topDirectories = computed(() => {
  return [...directories.value]
    .sort((a, b) => (b.helpful_count || 0) - (a.helpful_count || 0))
    .slice(0, 10)
})

const lastUpdated = computed(() => {
  if (directories.value.length === 0) return 'Loading...'

  const dates = directories.value
    .map(d => d.updated_at)
    .filter(Boolean)
    .map(d => new Date(d))

  if (dates.length === 0) return 'Unknown'

  const latest = new Date(Math.max(...dates))
  const daysAgo = Math.floor((Date.now() - latest.getTime()) / (1000 * 60 * 60 * 24))

  if (daysAgo === 0) return 'Today'
  if (daysAgo === 1) return 'Yesterday'
  return `${daysAgo} days ago`
})

const fetchGitHubStats = async () => {
  try {
    const response = await fetch('https://api.github.com/repos/awesome-directories/awesome-directories')
    if (response.ok) {
      const data = await response.json()
      githubStats.value = {
        stars: data.stargazers_count,
        forks: data.forks_count,
        contributors: null // Would need additional API call
      }
    }
  } catch (error) {
    console.error('Failed to fetch GitHub stats:', error)
  }
}

onMounted(async () => {
  await fetchDirectories()
  await fetchGitHubStats()

  if (window.pirsch) {
    window.pirsch('Stats Page View')
  }
})
</script>
