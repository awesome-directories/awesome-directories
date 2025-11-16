<template>
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

      <button type="submit" class="w-full btn-primary" :disabled="isSubmitting">
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
</template>

<script setup>
import { ref } from "vue";
import { useMauticNewsletter } from "@/composables/useMauticNewsletter";

const email = ref("");
const isSubmitting = ref(false);
const successMessage = ref("");
const errorMessage = ref("");

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
