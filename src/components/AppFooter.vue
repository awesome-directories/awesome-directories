<template>
  <footer class="bg-gray-900 text-gray-300">
    <div class="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <!-- About Section -->
        <div>
          <h3 class="text-white font-bold text-lg mb-4">Awesome Directories</h3>
          <p class="text-sm text-gray-400 mb-4">
            Find the top 20 launch directories worth your time in under 3
            minutes—curated, verified, and updated weekly.
          </p>
          <p class="text-sm text-gray-400">
            Built by
            <a
              href="https://meysam.io"
              target="_blank"
              rel="noopener"
              class="text-primary hover:text-primary-light transition-colors"
              >Meysam</a
            >
          </p>
        </div>

        <!-- Links Section -->
        <div>
          <h3 class="text-white font-bold text-lg mb-4">Links</h3>
          <ul class="space-y-2">
            <li>
              <router-link
                to="/about"
                class="text-sm text-gray-400 hover:text-white transition-colors"
              >
                About
              </router-link>
            </li>
            <li>
              <router-link
                to="/submit"
                class="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Submit Directory
              </router-link>
            </li>
            <li>
              <router-link
                to="/stats"
                class="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Public Stats
              </router-link>
            </li>
            <li>
              <router-link
                to="/terms"
                class="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Terms of Service
              </router-link>
            </li>
            <li>
              <router-link
                to="/privacy"
                class="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Privacy Policy
              </router-link>
            </li>
            <li>
              <a
                href="https://github.com/awesome-directories/awesome-directories"
                target="_blank"
                rel="noopener"
                class="text-sm text-gray-400 hover:text-white transition-colors"
              >
                GitHub Repository
              </a>
            </li>
            <li>
              <a
                href="https://github.com/sponsors/meysam81"
                target="_blank"
                rel="noopener"
                class="text-sm text-gray-400 hover:text-white transition-colors"
              >
                💝 GitHub Sponsors
              </a>
            </li>
          </ul>
        </div>

        <!-- Newsletter Section -->
        <div>
          <h3 class="text-white font-bold text-lg mb-4">
            📬 Get launch strategies & new directories
          </h3>
          <form @submit.prevent="handleNewsletterSignup" class="space-y-3">
            <input
              v-model="email"
              type="email"
              required
              placeholder="Your email"
              class="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              :disabled="isSubmitting"
            />

            <button
              type="submit"
              class="w-full btn-primary"
              :disabled="isSubmitting"
            >
              {{ isSubmitting ? "Subscribing..." : "Subscribe" }}
            </button>

            <p v-if="successMessage" class="text-sm text-success">
              {{ successMessage }}
            </p>
            <p v-if="errorMessage" class="text-sm text-danger">
              {{ errorMessage }}
            </p>

            <p class="text-xs text-gray-500">
              We respect your inbox. Unsubscribe anytime.
            </p>
          </form>
        </div>
      </div>

      <!-- Bottom Section -->
      <div class="mt-12 pt-8 border-t border-gray-800">
        <div
          class="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0"
        >
          <p class="text-sm text-gray-500">
            © {{ currentYear }} Awesome Directories. Open source under
            <a
              href="https://github.com/awesome-directories/awesome-directories/blob/main/LICENSE"
              target="_blank"
              rel="noopener"
              class="text-gray-400 hover:text-white transition-colors"
            >
              Apache 2.0 License
            </a>
          </p>

          <div class="flex items-center space-x-6">
            <a
              href="https://github.com/awesome-directories/awesome-directories"
              target="_blank"
              rel="noopener"
              class="text-gray-500 hover:text-white transition-colors"
            >
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path
                  fill-rule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  clip-rule="evenodd"
                />
              </svg>
            </a>

            <a
              href="https://x.com/meysamazing"
              target="_blank"
              rel="noopener"
              class="text-gray-500 hover:text-white transition-colors"
            >
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path
                  d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"
                />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { ref, computed } from "vue";
import { useMauticNewsletter } from "@/composables/useMauticNewsletter";

const email = ref("");
const isSubmitting = ref(false);
const successMessage = ref("");
const errorMessage = ref("");

const currentYear = computed(() => new Date().getFullYear());

const { subscribe } = useMauticNewsletter();

const handleNewsletterSignup = async () => {
  if (!email.value) return;

  isSubmitting.value = true;
  successMessage.value = "";
  errorMessage.value = "";

  try {
    await subscribe({
      email: email.value,
      source: "footer",
    });

    successMessage.value = "✅ Subscribed! Check your email.";
    email.value = "";

    // Track with Pirsch
    if (window.pirsch) {
      window.pirsch("Newsletter Signup", { source: "footer" });
    }
  } catch (error) {
    errorMessage.value = "Failed to subscribe. Please try again.";
    console.error("Newsletter signup error:", error);
  } finally {
    isSubmitting.value = false;
  }
};
</script>
