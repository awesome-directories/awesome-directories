<template>
  <div>
    <!-- Submission Success Message -->
    <div
      v-if="submissionSuccess"
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
              >Your submission is now in our review queue and will be reviewed
              by our team</span
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
        <a href="/" class="btn-secondary"> Browse Directories </a>
      </div>
    </div>

    <!-- Submission Form -->
    <form v-else @submit.prevent="handleSubmit" class="space-y-6">
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
            <label
              for="name"
              class="block text-sm font-medium text-gray-700 mb-2"
            >
              Directory Name <span class="text-red-500">*</span>
            </label>
            <input
              id="name"
              v-model="formData.name"
              type="text"
              required
              placeholder="e.g., Product Hunt"
              class="input"
            />
          </div>

          <div>
            <label
              for="url"
              class="block text-sm font-medium text-gray-700 mb-2"
            >
              Directory URL <span class="text-red-500">*</span>
            </label>
            <input
              id="url"
              v-model="formData.url"
              type="url"
              required
              placeholder="https://example.com"
              class="input"
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
              class="input"
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
              v-model="formData.submissionUrl"
              type="url"
              placeholder="https://example.com/submit"
              class="input"
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
              v-model="formData.logoUrl"
              type="url"
              placeholder="https://example.com/logo.png"
              class="input"
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
            <p v-if="categoryError" class="text-sm text-red-600 mt-1">
              {{ categoryError }}
            </p>
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
                  v-model="formData.pricingType"
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

          <div v-if="formData.pricingType === 'paid'">
            <label
              for="pricing_amount"
              class="block text-sm font-medium text-gray-700 mb-2"
            >
              Pricing Amount (USD)
            </label>
            <input
              id="pricing_amount"
              v-model.number="formData.pricingAmount"
              type="number"
              min="0"
              placeholder="99"
              class="input"
              :required="formData.pricingType === 'paid'"
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
              v-model.number="formData.domainRating"
              type="number"
              min="0"
              max="100"
              placeholder="e.g., 75"
              class="input"
            />
          </div>

          <div>
            <label class="flex items-center space-x-2 cursor-pointer">
              <input
                v-model="formData.isDofollow"
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
            <select v-model="formData.trafficEstimate" class="input">
              <option value="">Select traffic level</option>
              <option value="high">High (100K+ monthly visitors)</option>
              <option value="medium">
                Medium (10K-100K monthly visitors)
              </option>
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
              v-model.number="formData.avgApprovalDays"
              type="number"
              min="0"
              placeholder="e.g., 7"
              class="input"
            />
          </div>
        </div>
      </div>

      <!-- Error Message -->
      <div v-if="errorMessage" class="card p-4 bg-red-50 border-red-200">
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
        <a href="/" class="btn-secondary"> Cancel </a>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { submitDirectory } from "@/lib/api-client";

const props = defineProps({
  userEmail: {
    type: String,
    required: true,
  },
});

const isSubmitting = ref(false);
const submissionSuccess = ref(false);
const submittedDirectoryName = ref("");
const errorMessage = ref("");
const categoryError = ref("");

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
  logoUrl: "",
  submissionUrl: "",
  categories: [],
  pricingType: "",
  pricingAmount: null,
  domainRating: null,
  isDofollow: false,
  trafficEstimate: "",
  avgApprovalDays: null,
});

const resetForm = () => {
  formData.value = {
    name: "",
    description: "",
    url: "",
    logoUrl: "",
    submissionUrl: "",
    categories: [],
    pricingType: "",
    pricingAmount: null,
    domainRating: null,
    isDofollow: false,
    trafficEstimate: "",
    avgApprovalDays: null,
  };
  submissionSuccess.value = false;
  errorMessage.value = "";
  categoryError.value = "";
};

const validateForm = () => {
  categoryError.value = "";
  errorMessage.value = "";

  // Validate categories
  if (formData.value.categories.length === 0) {
    categoryError.value = "Please select at least one category";
    return false;
  }

  // Validate URL format
  try {
    new URL(formData.value.url);
  } catch (e) {
    errorMessage.value = "Please enter a valid URL";
    return false;
  }

  return true;
};

const handleSubmit = async () => {
  if (!validateForm()) {
    return;
  }

  isSubmitting.value = true;
  errorMessage.value = "";

  try {
    const { data, error } = await submitDirectory({
      name: formData.value.name,
      description: formData.value.description,
      url: formData.value.url,
      logoUrl: formData.value.logoUrl || undefined,
      submissionUrl: formData.value.submissionUrl || undefined,
      categories: formData.value.categories,
      pricingType: formData.value.pricingType,
      pricingAmount: formData.value.pricingAmount || undefined,
      domainRating: formData.value.domainRating || undefined,
      isDofollow: formData.value.isDofollow,
      trafficEstimate: formData.value.trafficEstimate || undefined,
      avgApprovalDays: formData.value.avgApprovalDays || undefined,
    });

    if (error) {
      if (error.error && error.error.includes("already submitted")) {
        errorMessage.value =
          "You've already submitted this directory. Please check your submissions page.";
      } else {
        errorMessage.value =
          error.message || error.error ||
          "Failed to submit directory. Please try again or contact support if the problem persists.";
      }
      return;
    }

    if (data) {
      submittedDirectoryName.value = formData.value.name;
      submissionSuccess.value = true;

      // Track submission in analytics
      if (window.pirsch) {
        window.pirsch("Directory Submitted", {
          directory_name: formData.value.name,
          pricing_type: formData.value.pricingType,
        });
      }
    }
  } catch (err) {
    console.error("Error submitting directory:", err);
    errorMessage.value =
      "An unexpected error occurred. Please try again or contact support.";
  } finally {
    isSubmitting.value = false;
  }
};
</script>
