<template>
  <header class="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
    <div class="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <!-- Logo -->
        <router-link
          to="/"
          class="flex items-center space-x-3 hover:opacity-80 transition-opacity"
        >
          <div class="text-2xl font-bold text-primary">📂</div>
          <span class="text-xl font-bold text-gray-900">
            Awesome Directories
          </span>
        </router-link>

        <!-- Desktop Navigation -->
        <nav class="hidden md:flex items-center space-x-6">
          <a
            href="https://github.com/awesome-directories/awesome-directories"
            target="_blank"
            rel="noopener"
            class="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path
                fill-rule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                clip-rule="evenodd"
              />
            </svg>
            <span class="font-medium" v-if="githubStars">
              ⭐ {{ githubStars }}
            </span>
            <span v-else>GitHub</span>
          </a>

          <router-link
            to="/submit"
            class="text-gray-600 hover:text-gray-900 font-medium transition-colors"
          >
            Submit Directory
          </router-link>

          <router-link
            to="/about"
            class="text-gray-600 hover:text-gray-900 font-medium transition-colors"
          >
            About
          </router-link>

          <router-link
            to="/stats"
            class="text-gray-600 hover:text-gray-900 font-medium transition-colors"
          >
            Stats
          </router-link>

          <!-- User Menu -->
          <div v-if="user" class="relative">
            <button
              @click="showUserMenu = !showUserMenu"
              class="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
              <div
                class="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-medium"
              >
                {{ userInitial }}
              </div>
            </button>

            <div
              v-if="showUserMenu"
              v-click-outside="() => { showUserMenu = false; }"
              class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 border border-gray-200"
            >
              <router-link
                to="/favorites"
                class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                @click="showUserMenu = false"
              >
                ❤️ My Favorites
              </router-link>
              <router-link
                to="/submissions"
                class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                @click="showUserMenu = false"
              >
                ✅ My Submissions
              </router-link>
              <button
                @click="handleSignOut"
                class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                🚪 Sign Out
              </button>
            </div>
          </div>

          <button
            v-else
            @click="$emit('show-auth')"
            class="btn-primary text-sm"
          >
            Sign In
          </button>
        </nav>

        <!-- Mobile Menu Button -->
        <button
          @click="showMobileMenu = !showMobileMenu"
          class="md:hidden p-2 text-gray-600 hover:text-gray-900"
        >
          <svg
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              v-if="!showMobileMenu"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
            <path
              v-else
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <!-- Mobile Menu -->
      <div
        v-if="showMobileMenu"
        class="md:hidden py-4 border-t border-gray-200"
      >
        <nav class="flex flex-col space-y-3">
          <router-link
            to="/submit"
            class="text-gray-700 hover:text-primary font-medium"
            @click="showMobileMenu = false"
          >
            Submit Directory
          </router-link>
          <router-link
            to="/about"
            class="text-gray-700 hover:text-primary font-medium"
            @click="showMobileMenu = false"
          >
            About
          </router-link>
          <router-link
            to="/stats"
            class="text-gray-700 hover:text-primary font-medium"
            @click="showMobileMenu = false"
          >
            Stats
          </router-link>

          <div v-if="user" class="pt-3 border-t border-gray-200 space-y-3">
            <router-link
              to="/favorites"
              class="block text-gray-700 hover:text-primary font-medium"
              @click="showMobileMenu = false"
            >
              ❤️ My Favorites
            </router-link>
            <router-link
              to="/submissions"
              class="block text-gray-700 hover:text-primary font-medium"
              @click="showMobileMenu = false"
            >
              ✅ My Submissions
            </router-link>
            <button
              @click="handleSignOut"
              class="text-gray-700 hover:text-primary font-medium"
            >
              🚪 Sign Out
            </button>
          </div>

          <button
            v-else
            @click="
              $emit('show-auth');
              showMobileMenu = false;
            "
            class="btn-primary text-sm w-full"
          >
            Sign In
          </button>
        </nav>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useAuth } from "@/composables/useAuth";

const { user, signOut } = useAuth();

var showUserMenu = ref(false);
var showMobileMenu = ref(false);
var githubStars = ref(null);

var userInitial = computed(function() {
  if (!user.value) return "";
  var email = user.value.email || "";
  return email.charAt(0).toUpperCase();
});

async function handleSignOut() {
  await signOut();
  showUserMenu.value = false;
  showMobileMenu.value = false;
}

onMounted(async function() {
  try {
    var response = await fetch(
      "https://api.github.com/repos/awesome-directories/awesome-directories",
    );
    if (response.ok) {
      var data = await response.json();
      githubStars.value = data.stargazers_count;
    }
  } catch (error) {
    console.error("Failed to fetch GitHub stars:", error);
  }
});

const vClickOutside = {
  mounted(el, binding) {
    el.clickOutsideEvent = (event) => {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value();
      }
    };
    document.addEventListener("click", el.clickOutsideEvent);
  },
  unmounted: function(el) {
    document.removeEventListener("click", el.clickOutsideEvent);
  },
};

defineEmits(["show-auth"]);
</script>
