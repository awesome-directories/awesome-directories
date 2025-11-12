<template>
  <div class="min-h-screen bg-gray-50 py-12">
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 class="text-4xl font-bold text-gray-900 mb-4">Submit a Directory</h1>
      <p class="text-xl text-gray-600 mb-8">
        Help the community by contributing high-quality directories
      </p>

      <!-- Auth Required Message -->
      <div v-if="!isAuthenticated" class="card p-8 text-center">
        <div class="text-6xl mb-4">🔐</div>
        <h2 class="text-2xl font-bold text-gray-900 mb-2">
          Authentication Required
        </h2>
        <p class="text-gray-600 mb-6">
          Please sign in to submit a directory for review
        </p>
        <button @click="showAuthModal = true" class="btn-primary">
          Sign In to Submit
        </button>
      </div>

      <!-- Submission Success Message -->
      <div
        v-else-if="submissionSuccess"
        class="card p-8 text-center bg-green-50 border-green-200"
      >
        <div class="text-6xl mb-4">✅</div>
        <h2 class="text-2xl font-bold text-gray-900 mb-2">
          Submission Received!
        </h2>
        <p class="text-gray-700 mb-4">
          Thank you for submitting
          <strong>{{ submittedDirectoryName }}</strong>
          to Awesome Directories.
        </p>
        <div class="bg-white rounded-lg p-6 mb-6 text-left">
          <h3 class="font-semibold text-gray-900 mb-3">What happens next:</h3>
          <ul class="space-y-2 text-gray-700">
            <li class="flex items-start">
              <svg
                class="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span
                >Your submission is now in our review queue and will be
                reviewed by our team</span
              >
            </li>
            <li class="flex items-start">
              <svg
                class="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span
                >Once approved, your directory will go live on Awesome
                Directories</span
              >
            </li>
            <li class="flex items-start">
              <svg
                class="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span
                >You'll receive an email notification about the status of your
                submission within 24 hours</span
              >
            </li>
          </ul>
        </div>
        <div class="flex gap-4 justify-center">
          <button @click="resetForm" class="btn-primary">
            Submit Another Directory
          </button>
          <router-link to="/" class="btn-secondary">
            Browse Directories
          </router-link>
        </div>
      </div>

      <!-- Submission Form -->
      <form
        v-else
        @submit.prevent="handleSubmit"
        class="space-y-6"
      >
        <!-- Guidelines Card -->
        <div class="card p-6 bg-blue-50 border-blue-200">
          <h3 class="font-semibold text-gray-900 mb-2">
            Submission Guidelines
          </h3>
          <ul class="text-sm text-gray-700 space-y-1">
            <li>✅ Domain Rating (DR) of 60 or higher preferred</li>
            <li>✅ Active directory with no dead links</li>
            <li>✅ Quality focus, not just link farms</li>
            <li>✅ Relevant to startups, SaaS, or developers</li>
            <li>✅ Free or freemium submission option available</li>
          </ul>
        </div>

        <!-- Basic Information -->
        <div class="card p-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">
            Basic Information
          </h2>

          <div class="space-y-6">
            <div>
              <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
                Directory Name <span class="text-red-500">*</span>
              </label>
              <input
                id="name"
                v-model="formData.name"
                type="text"
                required
                placeholder="e.g., Product Hunt"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label for="url" class="block text-sm font-medium text-gray-700 mb-2">
                Directory URL <span class="text-red-500">*</span>
              </label>
              <input
                id="url"
                v-model="formData.url"
                type="url"
                required
                placeholder="https://example.com"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <p class="text-sm text-gray-500 mt-1">
                The main homepage of the directory
              </p>
            </div>

            <div>
              <label
                for="description"
                class="block text-sm font-medium text-gray-700 mb-2"
              >
                Description <span class="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                v-model="formData.description"
                required
                rows="4"
                placeholder="Brief description of the directory (1-2 sentences)"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              ></textarea>
            </div>

            <div>
              <label
                for="submission_url"
                class="block text-sm font-medium text-gray-700 mb-2"
              >
                Submission Page URL
              </label>
              <input
                id="submission_url"
                v-model="formData.submission_url"
                type="url"
                placeholder="https://example.com/submit"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <p class="text-sm text-gray-500 mt-1">
                Direct link to where users can submit their products
              </p>
            </div>

            <div>
              <label
                for="logo_url"
                class="block text-sm font-medium text-gray-700 mb-2"
              >
                Logo URL
              </label>
              <input
                id="logo_url"
                v-model="formData.logo_url"
                type="url"
                placeholder="https://example.com/logo.png"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <!-- Categories & Pricing -->
        <div class="card p-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">
            Categories & Pricing
          </h2>

          <div class="space-y-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Categories <span class="text-red-500">*</span>
              </label>
              <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                <label
                  v-for="category in availableCategories"
                  :key="category"
                  class="flex items-center space-x-2 cursor-pointer"
                >
                  <input
                    v-model="formData.categories"
                    type="checkbox"
                    :value="category"
                    class="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span class="text-sm text-gray-700">{{ category }}</span>
                </label>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Pricing Type <span class="text-red-500">*</span>
              </label>
              <div class="space-y-2">
                <label
                  v-for="type in pricingTypes"
                  :key="type.value"
                  class="flex items-center space-x-3 cursor-pointer"
                >
                  <input
                    v-model="formData.pricing_type"
                    type="radio"
                    :value="type.value"
                    required
                    class="border-gray-300 text-primary focus:ring-primary"
                  />
                  <div>
                    <span class="text-sm font-medium text-gray-700">{{
                      type.label
                    }}</span>
                    <p class="text-xs text-gray-500">{{ type.description }}</p>
                  </div>
                </label>
              </div>
            </div>

            <div v-if="formData.pricing_type === 'paid'">
              <label
                for="pricing_amount"
                class="block text-sm font-medium text-gray-700 mb-2"
              >
                Pricing Amount (USD)
              </label>
              <input
                id="pricing_amount"
                v-model.number="formData.pricing_amount"
                type="number"
                min="0"
                placeholder="99"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                :required="formData.pricing_type === 'paid'"
              />
            </div>
          </div>
        </div>

        <!-- SEO Metrics (Optional) -->
        <div class="card p-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-2">
            SEO Metrics
            <span class="text-sm font-normal text-gray-500">(Optional)</span>
          </h2>
          <p class="text-sm text-gray-600 mb-6">
            Help us understand the SEO value of this directory
          </p>

          <div class="space-y-6">
            <div>
              <label
                for="domain_rating"
                class="block text-sm font-medium text-gray-700 mb-2"
              >
                Domain Rating (Ahrefs DR)
              </label>
              <input
                id="domain_rating"
                v-model.number="formData.domain_rating"
                type="number"
                min="0"
                max="100"
                placeholder="e.g., 75"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label class="flex items-center space-x-2 cursor-pointer">
                <input
                  v-model="formData.is_dofollow"
                  type="checkbox"
                  class="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span class="text-sm font-medium text-gray-700"
                  >Directory provides dofollow backlinks</span
                >
              </label>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Traffic Estimate
              </label>
              <select
                v-model="formData.traffic_estimate"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Select traffic level</option>
                <option value="high">High (100K+ monthly visitors)</option>
                <option value="medium">Medium (10K-100K monthly visitors)</option>
                <option value="low">Low (<10K monthly visitors)</option>
              </select>
            </div>

            <div>
              <label
                for="avg_approval_days"
                class="block text-sm font-medium text-gray-700 mb-2"
              >
                Average Approval Time (days)
              </label>
              <input
                id="avg_approval_days"
                v-model.number="formData.avg_approval_days"
                type="number"
                min="0"
                placeholder="e.g., 7"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <!-- Error Message -->
        <div
          v-if="errorMessage"
          class="card p-4 bg-red-50 border-red-200"
        >
          <p class="text-sm text-red-600">{{ errorMessage }}</p>
        </div>

        <!-- Submit Button -->
        <div class="flex gap-4">
          <button
            type="submit"
            :disabled="isSubmitting"
            class="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isSubmitting ? "Submitting..." : "Submit Directory for Review" }}
          </button>
          <router-link to="/" class="btn-secondary">
            Cancel
          </router-link>
        </div>
      </form>

      <!-- Auth Modal -->
      <AuthModal v-if="showAuthModal" @close="showAuthModal = false" />
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useAuth } from "@/composables/useAuth";
import { supabase } from "@/lib/supabase";
import AuthModal from "@/components/AuthModal.vue";

const { user, isAuthenticated } = useAuth();

const showAuthModal = ref(false);
const isSubmitting = ref(false);
const submissionSuccess = ref(false);
const submittedDirectoryName = ref("");
const errorMessage = ref("");

const availableCategories = [
  "SaaS",
  "Startups",
  "Developers",
  "AI/ML",
  "No-Code",
  "Mobile Apps",
  "Web Apps",
  "Design",
  "Marketing",
  "Productivity",
  "E-commerce",
  "Content",
];

const pricingTypes = [
  {
    value: "free",
    label: "Free",
    description: "Completely free to submit",
  },
  {
    value: "freemium",
    label: "Freemium",
    description: "Free option available with paid upgrades",
  },
  {
    value: "paid",
    label: "Paid",
    description: "Requires payment to submit",
  },
];

const formData = ref({
  name: "",
  description: "",
  url: "",
  logo_url: "",
  submission_url: "",
  categories: [],
  pricing_type: "",
  pricing_amount: null,
  domain_rating: null,
  is_dofollow: false,
  traffic_estimate: "",
  avg_approval_days: null,
});

const resetForm = () => {
  formData.value = {
    name: "",
    description: "",
    url: "",
    logo_url: "",
    submission_url: "",
    categories: [],
    pricing_type: "",
    pricing_amount: null,
    domain_rating: null,
    is_dofollow: false,
    traffic_estimate: "",
    avg_approval_days: null,
  };
  submissionSuccess.value = false;
  errorMessage.value = "";
};

const handleSubmit = async () => {
  if (!user.value) {
    showAuthModal.value = true;
    return;
  }

  if (formData.value.categories.length === 0) {
    errorMessage.value = "Please select at least one category";
    return;
  }

  isSubmitting.value = true;
  errorMessage.value = "";

  try {
    const { data, error } = await supabase.from("pending_directories").insert([
      {
        user_id: user.value.id,
        user_email: user.value.email,
        name: formData.value.name,
        description: formData.value.description,
        url: formData.value.url,
        logo_url: formData.value.logo_url || null,
        submission_url: formData.value.submission_url || null,
        categories: formData.value.categories,
        pricing_type: formData.value.pricing_type,
        pricing_amount: formData.value.pricing_amount || null,
        domain_rating: formData.value.domain_rating || null,
        is_dofollow: formData.value.is_dofollow || false,
        traffic_estimate: formData.value.traffic_estimate || null,
        avg_approval_days: formData.value.avg_approval_days || null,
        status: "pending",
      },
    ]);

    if (error) {
      if (error.code === "23505") {
        // Unique constraint violation
        errorMessage.value =
          "You've already submitted this directory. Please check your submissions page.";
      } else {
        throw error;
      }
      return;
    }

    submittedDirectoryName.value = formData.value.name;
    submissionSuccess.value = true;

    // Track submission in analytics
    if (window.pirsch) {
      window.pirsch("Directory Submitted", {
        meta: {
          directory_name: formData.value.name,
          pricing_type: formData.value.pricing_type,
        },
      });
    }
  } catch (err) {
    console.error("Error submitting directory:", err);
    errorMessage.value =
      "Failed to submit directory. Please try again or contact support if the problem persists.";
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
@import "tailwindcss" reference;
</style>
