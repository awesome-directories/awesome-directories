<template>
  <div class="fixed inset-0 z-50 overflow-y-auto" @click.self="$emit('close')">
    <div
      class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0"
    >
      <!-- Background overlay -->
      <div
        class="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-75"
        @click="$emit('close')"
      ></div>

      <!-- Modal panel -->
      <div
        class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6"
      >
        <!-- Close button -->
        <button
          @click="$emit('close')"
          class="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <svg
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <!-- Modal content -->
        <div>
          <h2 class="text-2xl font-bold text-gray-900 mb-2">
            Your Launch Checklist ({{ selectedCount }} selected)
          </h2>
          <p class="text-gray-600 mb-6">
            Download or export your selected directories
          </p>

          <!-- Download Checklist Section -->
          <div class="mb-6 p-4 bg-blue-50 rounded-lg">
            <div class="flex items-start space-x-3 mb-4">
              <div class="text-2xl">📋</div>
              <div class="flex-1">
                <h3 class="font-semibold text-gray-900 mb-1">
                  Download My Launch Checklist
                </h3>
                <p class="text-sm text-gray-600">
                  Get a PDF checklist emailed to you with all
                  {{ selectedCount }} directories.
                </p>
              </div>
            </div>

            <form @submit.prevent="handleDownloadChecklist" class="space-y-3">
              <input
                v-model="email"
                type="email"
                required
                placeholder="Your email (required)"
                class="input"
                :disabled="isDownloading"
              />
              <input
                v-model="name"
                type="text"
                placeholder="Your name (optional)"
                class="input"
                :disabled="isDownloading"
              />
              <input
                v-model="productName"
                type="text"
                placeholder="Product name (optional)"
                class="input"
                :disabled="isDownloading"
              />

              <label class="flex items-start space-x-2 text-sm">
                <input
                  v-model="subscribeNewsletter"
                  type="checkbox"
                  class="mt-0.5"
                  :disabled="isDownloading"
                />
                <span class="text-gray-700">
                  Subscribe to newsletter (new directories, launch tips, founder
                  stories)
                </span>
              </label>

              <button
                type="submit"
                class="w-full btn-primary"
                :disabled="isDownloading"
              >
                {{ isDownloading ? "Generating..." : "Get My Checklist" }}
              </button>

              <p v-if="downloadSuccess" class="text-sm text-success">
                ✅ {{ downloadSuccess }}
              </p>
              <p v-if="downloadError" class="text-sm text-danger">
                {{ downloadError }}
              </p>

              <p class="text-xs text-gray-500">No spam. Unsubscribe anytime.</p>
            </form>
          </div>

          <!-- Divider -->
          <div class="relative my-6">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-white text-gray-500">or</span>
            </div>
          </div>

          <!-- Export Section -->
          <div class="p-4 bg-gray-50 rounded-lg">
            <div class="flex items-start space-x-3 mb-4">
              <div class="text-2xl">💾</div>
              <div class="flex-1">
                <h3 class="font-semibold text-gray-900 mb-1">
                  Export to Notion/Airtable
                </h3>
                <p class="text-sm text-gray-600">
                  Download CSV or JSON for import
                </p>
              </div>
            </div>

            <div class="flex space-x-3">
              <button
                @click="exportToCSV"
                class="flex-1 btn-secondary text-sm"
                :disabled="isExporting"
              >
                Export CSV
              </button>
              <button
                @click="exportToJSON"
                class="flex-1 btn-secondary text-sm"
                :disabled="isExporting"
              >
                Export JSON
              </button>
            </div>
          </div>

          <!-- Actions -->
          <div class="mt-6 flex justify-between">
            <button
              @click="$emit('clear-selection')"
              class="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Clear Selection
            </button>
            <button
              @click="$emit('close')"
              class="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, inject } from "vue";
import { jsPDF } from "jspdf";
import Papa from "papaparse";
import { useMauticNewsletter } from "../composables/useMauticNewsletter";

const props = defineProps({
  selectedDirectories: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(["close", "clear-selection"]);

const email = ref("");
const name = ref("");
const productName = ref("");
const subscribeNewsletter = ref(true);
const isDownloading = ref(false);
const isExporting = ref(false);
const downloadSuccess = ref("");
const downloadError = ref("");

const { subscribe } = useMauticNewsletter();

const selectedCount = ref(props.selectedDirectories.length);

const handleDownloadChecklist = async () => {
  if (!email.value) return;

  isDownloading.value = true;
  downloadSuccess.value = "";
  downloadError.value = "";

  try {
    // Subscribe to newsletter if opted in
    if (subscribeNewsletter.value) {
      await subscribe({
        email: email.value,
        name: name.value,
        product_name: productName.value,
        source: "checklist",
      });
    }

    // Generate PDF
    generatePDF();

    downloadSuccess.value =
      "✅ Checklist downloaded! Check your email for updates.";

    // Track with Pirsch
    if (window.pirsch) {
      window.pirsch("Checklist Downloaded", {
        email_captured: true,
        selected_count: selectedCount.value,
      });
    }
  } catch (error) {
    downloadError.value = "Failed to process request. Please try again.";
    console.error("Checklist download error:", error);
  } finally {
    isDownloading.value = false;
  }
};

const generatePDF = () => {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(20);
  doc.text("My Launch Checklist", 20, 20);

  doc.setFontSize(10);
  doc.text("Generated by awesome-directories.com", 20, 28);

  let yPos = 40;

  // Directory list
  doc.setFontSize(12);
  props.selectedDirectories.forEach((dir, index) => {
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }

    // Checkbox
    doc.rect(20, yPos - 4, 4, 4);

    // Directory name
    doc.text(`${index + 1}. ${dir.name}`, 28, yPos);

    // DR and pricing
    const details = [];
    if (dir.domain_rating) details.push(`DR: ${dir.domain_rating}`);
    if (dir.is_dofollow) details.push("Dofollow");
    if (dir.pricing_type) details.push(dir.pricing_type);

    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(details.join(" • "), 28, yPos + 5);

    // URL
    doc.text(dir.url, 28, yPos + 10);

    doc.setFontSize(12);
    doc.setTextColor(0);

    yPos += 20;
  });

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text("Made with awesome-directories.com by Meysam", 20, 285);

  doc.save("launch-checklist.pdf");
};

const exportToCSV = () => {
  isExporting.value = true;

  try {
    const data = props.selectedDirectories.map((dir) => ({
      Name: dir.name,
      URL: dir.url,
      "Domain Rating": dir.domain_rating || "",
      Dofollow: dir.is_dofollow ? "Yes" : "No",
      Pricing: dir.pricing_type || "",
      Categories: dir.categories ? dir.categories.join(", ") : "",
      Description: dir.description || "",
    }));

    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "directories-export.csv";
    link.click();

    // Track with Pirsch
    if (window.pirsch) {
      window.pirsch("Export", {
        format: "csv",
        selected_count: selectedCount.value,
      });
    }
  } catch (error) {
    console.error("CSV export error:", error);
  } finally {
    isExporting.value = false;
  }
};

const exportToJSON = () => {
  isExporting.value = true;

  try {
    const data = JSON.stringify(props.selectedDirectories, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "directories-export.json";
    link.click();

    // Track with Pirsch
    if (window.pirsch) {
      window.pirsch("Export", {
        format: "json",
        selected_count: selectedCount.value,
      });
    }
  } catch (error) {
    console.error("JSON export error:", error);
  } finally {
    isExporting.value = false;
  }
};
</script>
