<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Auth Required Message -->
    <div v-if="!user" class="bg-white rounded-lg shadow-sm p-8 text-center">
      <div class="text-5xl mb-4">🔒</div>
      <h2 class="text-2xl font-bold text-gray-900 mb-2">Sign in to Submit</h2>
      <p class="text-gray-600 mb-6">
        You need to be signed in to submit a directory for review.
      </p>
      <button @click="handleSignIn" class="btn-primary">Sign In</button>
    </div>

    <!-- Success Message -->
    <div
      v-else-if="submissionSuccess"
      class="bg-white rounded-lg shadow-sm p-8 text-center"
    >
      <div class="text-5xl mb-4">🎉</div>
      <h2 class="text-2xl font-bold text-gray-900 mb-2">
        Submission Received!
      </h2>
      <p class="text-gray-600 mb-6">
        Thank you for your submission. We'll review it and get back to you
        within 3-5 business days.
      </p>
      <div class="flex gap-4 justify-center">
        <button @click="resetForm" class="btn-secondary">Submit Another</button>
        <a href="/submissions" class="btn-primary inline-block">
          View My Submissions
        </a>
      </div>
    </div>

    <!-- Submission Form -->
    <div v-else class="bg-white rounded-lg shadow-sm p-6 sm:p-8">
      <form @submit.prevent="handleSubmit">
        <!-- Name -->
        <div class="mb-6">
          <label
            for="name"
            class="block text-sm font-semibold text-gray-700 mb-2"
          >
            Directory Name <span class="text-red-500">*</span>
          </label>
          <input
            id="name"
            v-model="form.name"
            type="text"
            required
            maxlength="100"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="e.g., Product Hunt"
          />
        </div>

        <!-- URL -->
        <div class="mb-6">
          <label
            for="url"
            class="block text-sm font-semibold text-gray-700 mb-2"
          >
            Directory URL <span class="text-red-500">*</span>
          </label>
          <input
            id="url"
            v-model="form.url"
            type="url"
            required
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="https://example.com"
          />
          <p class="mt-1 text-sm text-gray-500">
            The main URL of the directory
          </p>
        </div>

        <!-- Description -->
        <div class="mb-6">
          <label
            for="description"
            class="block text-sm font-semibold text-gray-700 mb-2"
          >
            Description <span class="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            v-model="form.description"
            required
            rows="4"
            maxlength="500"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Brief description of what this directory offers..."
          ></textarea>
          <p class="mt-1 text-sm text-gray-500">
            {{ form.description.length }}/500 characters
          </p>
        </div>

        <!-- Submission URL -->
        <div class="mb-6">
          <label
            for="submission_url"
            class="block text-sm font-semibold text-gray-700 mb-2"
          >
            Submission URL
          </label>
          <input
            id="submission_url"
            v-model="form.submission_url"
            type="url"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="https://example.com/submit"
          />
          <p class="mt-1 text-sm text-gray-500">
            Direct URL for submitting to this directory (optional)
          </p>
        </div>

        <!-- Logo URL -->
        <div class="mb-6">
          <label
            for="logo_url"
            class="block text-sm font-semibold text-gray-700 mb-2"
          >
            Logo URL
          </label>
          <input
            id="logo_url"
            v-model="form.logo_url"
            type="url"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="https://example.com/logo.png"
          />
        </div>

        <!-- Pricing Type -->
        <div class="mb-6">
          <label
            for="pricing_type"
            class="block text-sm font-semibold text-gray-700 mb-2"
          >
            Pricing Type <span class="text-red-500">*</span>
          </label>
          <select
            id="pricing_type"
            v-model="form.pricing_type"
            required
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">Select pricing type</option>
            <option value="free">Free</option>
            <option value="paid">Paid</option>
            <option value="freemium">Freemium</option>
          </select>
        </div>

        <!-- Pricing Amount -->
        <div v-if="form.pricing_type === 'paid'" class="mb-6">
          <label
            for="pricing_amount"
            class="block text-sm font-semibold text-gray-700 mb-2"
          >
            Pricing Amount (USD)
          </label>
          <input
            id="pricing_amount"
            v-model.number="form.pricing_amount"
            type="number"
            min="0"
            step="1"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="99"
          />
        </div>

        <!-- Is Dofollow -->
        <div class="mb-6">
          <label class="flex items-center">
            <input
              v-model="form.is_dofollow"
              type="checkbox"
              class="w-5 h-5 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <span class="ml-3 text-sm font-medium text-gray-700">
              This directory provides dofollow links
            </span>
          </label>
        </div>

        <!-- Categories -->
        <div class="mb-6">
          <label class="block text-sm font-semibold text-gray-700 mb-2">
            Categories
          </label>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <label
              v-for="category in availableCategories"
              :key="category"
              class="flex items-center"
            >
              <input
                v-model="form.categories"
                type="checkbox"
                :value="category"
                class="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <span class="ml-2 text-sm text-gray-700">{{ category }}</span>
            </label>
          </div>
        </div>

        <!-- Error Message -->
        <div
          v-if="errorMessage"
          class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
        >
          <p class="text-sm text-red-600">{{ errorMessage }}</p>
        </div>

        <!-- Submit Button -->
        <div class="flex gap-4">
          <button
            type="submit"
            :disabled="isSubmitting"
            class="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isSubmitting ? "Submitting..." : "Submit Directory" }}
          </button>
          <a href="/" class="btn-secondary flex-shrink-0"> Cancel </a>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import { useStore } from "@nanostores/vue";
import { $user } from "@/stores/auth";
import { supabase } from "@/lib/supabase-client";
import { showAuthModal } from "@/utils/auth";
import log from "@/lib/logger";

const user = useStore($user);

const availableCategories = [
  "All",
  "AI Tools",
  "Developer Tools",
  "SaaS",
  "Productivity",
  "Marketing",
  "Design",
  "E-commerce",
  "Education",
  "Finance",
  "Health",
  "Startups",
  "News",
  "Community",
];

const form = reactive({
  name: "",
  url: "",
  description: "",
  submission_url: "",
  logo_url: "",
  pricing_type: "",
  pricing_amount: null,
  is_dofollow: false,
  categories: [],
});

const isSubmitting = ref(false);
const submissionSuccess = ref(false);
const errorMessage = ref("");

function handleSignIn() {
  showAuthModal();
}

async function handleSubmit() {
  if (!user.value) {
    showAuthModal();
    return;
  }

  isSubmitting.value = true;
  errorMessage.value = "";

  try {
    // Validate URL
    const url = new URL(form.url);
    if (!url.protocol.startsWith("http")) {
      throw new Error("URL must start with http:// or https://");
    }

    // Prepare submission data
    const submissionData = {
      user_id: user.value.id,
      user_email: user.value.email,
      name: form.name.trim(),
      url: form.url.trim(),
      description: form.description.trim(),
      submission_url: form.submission_url?.trim() || null,
      logo_url: form.logo_url?.trim() || null,
      pricing_type: form.pricing_type,
      pricing_amount: form.pricing_type === "paid" ? form.pricing_amount : null,
      is_dofollow: form.is_dofollow,
      categories: form.categories.length > 0 ? form.categories : null,
      status: "pending",
    };

    const { error } = await supabase
      .from("pending_directories")
      .insert(submissionData);

    if (error) {
      // Check for duplicate submission
      if (error.code === "23505") {
        throw new Error(
          "You have already submitted this directory. Please check your submissions page.",
        );
      }
      throw error;
    }

    log.info("Directory submitted successfully");
    submissionSuccess.value = true;
  } catch (error) {
    log.error("Failed to submit directory:", error);
    errorMessage.value =
      error.message || "Failed to submit directory. Please try again.";
  } finally {
    isSubmitting.value = false;
  }
}

function resetForm() {
  Object.assign(form, {
    name: "",
    url: "",
    description: "",
    submission_url: "",
    logo_url: "",
    pricing_type: "",
    pricing_amount: null,
    is_dofollow: false,
    categories: [],
  });
  submissionSuccess.value = false;
  errorMessage.value = "";
}
</script>
