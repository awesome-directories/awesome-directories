<template>
  <div
    class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
    role="dialog"
    aria-modal="true"
    aria-labelledby="checklist-modal-title"
    @keydown.escape="handleClose"
  >
    <div
      class="fixed inset-0 bg-gray-900/75 transition-opacity"
      @click="handleClose"
      aria-hidden="true"
    ></div>

    <div
      class="relative bg-white rounded-t-2xl sm:rounded-xl shadow-xl w-full sm:max-w-4xl max-h-[95vh] sm:max-h-[90vh] flex flex-col transform transition-all"
    >
      <!-- Mobile drag indicator -->
      <div class="sm:hidden flex justify-center pt-3 pb-1">
        <div class="w-10 h-1 bg-gray-300 rounded-full"></div>
      </div>

      <!-- Header -->
      <div
        class="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200"
      >
        <div class="flex items-center space-x-3 min-w-0">
          <div class="text-2xl sm:text-3xl flex-shrink-0" aria-hidden="true">✅</div>
          <div class="min-w-0">
            <h2
              id="checklist-modal-title"
              class="text-lg sm:text-2xl font-bold text-gray-900 truncate"
            >
              Your Submission Checklist
            </h2>
            <p class="text-xs sm:text-sm text-gray-600">
              {{ selectedDirectories.length }} director{{
                selectedDirectories.length !== 1 ? "ies" : "y"
              }}
              selected
            </p>
          </div>
        </div>
        <button
          @click="handleClose"
          class="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100 min-w-[48px] min-h-[48px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-primary flex-shrink-0 -mr-2 sm:mr-0"
          aria-label="Close modal"
        >
          <svg
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto p-4 sm:p-6 overscroll-contain">
        <div v-if="selectedDirectories.length === 0" class="text-center py-8 sm:py-12">
          <div class="text-5xl sm:text-6xl mb-4" aria-hidden="true">📋</div>
          <h3 class="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
            No directories selected
          </h3>
          <p class="text-sm sm:text-base text-gray-600 mb-4 px-4">
            Select directories from the list to create your submission checklist
          </p>
          <button
            @click="handleClose"
            class="btn-primary min-h-[48px] px-6 touch-manipulation"
          >
            Browse Directories
          </button>
        </div>

        <div v-else class="space-y-4">
          <!-- Pro Tips - Collapsible on mobile -->
          <details
            class="bg-blue-50 border border-blue-200 rounded-lg overflow-hidden"
            open
          >
            <summary
              class="flex items-center p-3 sm:p-4 cursor-pointer select-none touch-manipulation min-h-[48px] sm:min-h-0"
            >
              <svg
                class="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h4 class="font-semibold text-blue-900 ml-3 text-sm sm:text-base">
                Pro Tips
              </h4>
              <svg
                class="w-4 h-4 text-blue-600 ml-auto transform transition-transform details-chevron"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </summary>
            <ul class="text-xs sm:text-sm text-blue-800 space-y-1 px-3 sm:px-4 pb-3 sm:pb-4 ml-8 sm:ml-9">
              <li>• Check each directory as you complete the submission</li>
              <li>• Click directory names to open them in a new tab</li>
              <li>• Your progress is saved automatically</li>
              <li>• Focus on high DR directories first for best SEO impact</li>
            </ul>
          </details>

          <!-- Progress bar -->
          <div class="flex items-center justify-between mb-4 gap-4">
            <div class="text-xs sm:text-sm text-gray-600 whitespace-nowrap">
              <span class="font-semibold">{{ completedCount }}</span> of
              <span class="font-semibold">{{ selectedDirectories.length }}</span>
              completed
            </div>
            <div class="flex items-center space-x-2 flex-shrink-0">
              <div class="w-20 sm:w-32 bg-gray-200 rounded-full h-2">
                <div
                  class="bg-green-500 h-2 rounded-full transition-all duration-300"
                  :style="{ width: progressPercentage + '%' }"
                  role="progressbar"
                  :aria-valuenow="progressPercentage"
                  aria-valuemin="0"
                  aria-valuemax="100"
                ></div>
              </div>
              <span class="text-xs sm:text-sm font-semibold text-gray-700 w-10 text-right">
                {{ progressPercentage }}%
              </span>
            </div>
          </div>

          <!-- Directory list -->
          <div class="space-y-2 sm:space-y-3">
            <label
              v-for="directory in sortedDirectories"
              :key="directory.id"
              :for="'check-' + directory.id"
              class="flex items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 border rounded-xl sm:rounded-lg transition-all cursor-pointer touch-manipulation"
              :class="
                isCompleted(directory.id)
                  ? 'bg-green-50 border-green-200'
                  : 'bg-white border-gray-200 hover:border-gray-300 active:bg-gray-50'
              "
            >
              <input
                type="checkbox"
                :id="'check-' + directory.id"
                :checked="isCompleted(directory.id)"
                @change="toggleCompletion(directory.id)"
                class="w-6 h-6 sm:w-5 sm:h-5 text-primary rounded focus:ring-2 focus:ring-primary cursor-pointer flex-shrink-0 mt-0.5 sm:mt-0"
              />
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1 flex-wrap">
                  <a
                    :href="directory.url"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="font-semibold text-gray-900 hover:text-primary transition-colors text-sm sm:text-base touch-manipulation inline-flex items-center gap-1"
                    @click.stop
                  >
                    <span class="break-words">{{ directory.name }}</span>
                    <svg
                      class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                </div>
                <div class="flex flex-wrap gap-1.5 sm:gap-2 text-xs">
                  <span
                    v-if="directory.domain_rating"
                    class="px-2 py-0.5 sm:py-1 bg-blue-100 text-blue-700 rounded-full font-medium"
                  >
                    DR {{ directory.domain_rating }}
                  </span>
                  <span
                    v-if="directory.pricing"
                    class="px-2 py-0.5 sm:py-1 rounded-full font-medium"
                    :class="getPricingClass(directory.pricing)"
                  >
                    {{ directory.pricing }}
                  </span>
                  <span
                    v-if="directory.is_dofollow"
                    class="px-2 py-0.5 sm:py-1 bg-green-100 text-green-700 rounded-full font-medium"
                  >
                    Dofollow
                  </span>
                </div>
              </div>
            </label>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="border-t border-gray-200 p-4 sm:p-6 bg-gray-50 safe-area-inset-bottom">
        <div class="flex flex-col sm:flex-row gap-3 justify-between">
          <button
            @click="handleClearSelection"
            class="order-2 sm:order-1 px-4 py-3 sm:py-2 text-gray-700 bg-white border border-gray-300 rounded-xl sm:rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors font-medium min-h-[48px] sm:min-h-[44px] touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Clear Selection
          </button>
          <div class="order-1 sm:order-2 flex gap-3">
            <div class="relative flex-1 sm:flex-none" ref="exportDropdownRef">
              <button
                @click="showExportDropdown = !showExportDropdown"
                class="w-full sm:w-auto px-4 py-3 sm:py-2 text-primary bg-white border border-primary rounded-xl sm:rounded-lg hover:bg-blue-50 active:bg-blue-100 transition-colors font-medium flex items-center justify-center space-x-2 min-h-[48px] sm:min-h-[44px] touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                :aria-expanded="showExportDropdown"
                aria-haspopup="true"
              >
                <span>📥 Export</span>
                <svg
                  class="w-4 h-4 transition-transform"
                  :class="{ 'rotate-180': showExportDropdown }"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              <div
                v-if="showExportDropdown"
                class="absolute bottom-full mb-2 left-0 sm:left-auto sm:right-0 w-full sm:w-auto bg-white border border-gray-200 rounded-xl sm:rounded-lg shadow-lg py-1 min-w-[160px] z-10"
                role="menu"
              >
                <button
                  @click="handleExportCSV"
                  class="w-full px-4 py-3 sm:py-2 text-left text-gray-700 hover:bg-gray-50 active:bg-gray-100 flex items-center space-x-2 min-h-[48px] sm:min-h-[44px] touch-manipulation"
                  role="menuitem"
                >
                  <span aria-hidden="true">📄</span>
                  <span>Export as CSV</span>
                </button>
                <button
                  @click="handleExportPDF"
                  class="w-full px-4 py-3 sm:py-2 text-left text-gray-700 hover:bg-gray-50 active:bg-gray-100 flex items-center space-x-2 min-h-[48px] sm:min-h-[44px] touch-manipulation"
                  role="menuitem"
                >
                  <span aria-hidden="true">📑</span>
                  <span>Export as PDF</span>
                </button>
              </div>
            </div>
            <button
              @click="handleClose"
              class="flex-1 sm:flex-none btn-primary px-6 py-3 sm:py-2 min-h-[48px] sm:min-h-[44px] rounded-xl sm:rounded-lg touch-manipulation"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import Papa from "papaparse";
import { jsPDF } from "jspdf";

const props = defineProps({
  selectedDirectories: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(["close", "clear-selection"]);

const completedDirectories = ref(new Set());
const showExportDropdown = ref(false);
const exportDropdownRef = ref(null);

// Close dropdown when clicking outside
function handleClickOutside(event) {
  if (
    exportDropdownRef.value &&
    !exportDropdownRef.value.contains(event.target)
  ) {
    showExportDropdown.value = false;
  }
}

onMounted(function () {
  loadProgress();
  document.addEventListener("click", handleClickOutside);
  document.body.style.overflow = "hidden";
});

onUnmounted(function () {
  document.removeEventListener("click", handleClickOutside);
  document.body.style.overflow = "";
});

const completedCount = computed(function () {
  return completedDirectories.value.size;
});

var progressPercentage = computed(function () {
  if (props.selectedDirectories.length === 0) return 0;
  return Math.round(
    (completedCount.value / props.selectedDirectories.length) * 100,
  );
});

var sortedDirectories = computed(function () {
  return [...props.selectedDirectories].sort((a, b) => {
    var aCompleted = completedDirectories.value.has(a.id);
    var bCompleted = completedDirectories.value.has(b.id);

    if (aCompleted && !bCompleted) return 1;
    if (!aCompleted && bCompleted) return -1;

    var aDR = a.domain_rating || 0;
    var bDR = b.domain_rating || 0;
    return bDR - aDR;
  });
});

function handleClose() {
  emit("close");
}

function handleClearSelection() {
  if (
    confirm(
      "Are you sure you want to clear your selection? This will remove all selected directories.",
    )
  ) {
    completedDirectories.value.clear();
    saveProgress();
    emit("clear-selection");
    emit("close");
  }
}

function isCompleted(directoryId) {
  return completedDirectories.value.has(directoryId);
}

function toggleCompletion(directoryId) {
  if (completedDirectories.value.has(directoryId)) {
    completedDirectories.value.delete(directoryId);
  } else {
    completedDirectories.value.add(directoryId);
  }
  saveProgress();
}

function saveProgress() {
  var completed = Array.from(completedDirectories.value);
  localStorage.setItem("completedDirectories", JSON.stringify(completed));
}

function loadProgress() {
  var stored = localStorage.getItem("completedDirectories");
  if (stored) {
    try {
      var completed = JSON.parse(stored);
      completedDirectories.value = new Set(completed);
    } catch (e) {
      console.error("Error loading progress:", e);
    }
  }
}

function getPricingClass(pricing) {
  var lower = pricing.toLowerCase();
  if (lower === "free") return "bg-green-100 text-green-700";
  if (lower === "paid") return "bg-orange-100 text-orange-700";
  if (lower === "freemium") return "bg-purple-100 text-purple-700";
  return "bg-gray-100 text-gray-700";
}

// Prepare comprehensive export data
function prepareExportData() {
  return props.selectedDirectories.map(function (dir) {
    return {
      Name: dir.name || "",
      URL: dir.url || "",
      "Domain Rating": dir.domain_rating || "N/A",
      "Average Rating": dir.average_rating
        ? `${dir.average_rating}/5`
        : "No ratings",
      "Rating Count": dir.rating_count || 0,
      Pricing: dir.pricing || "N/A",
      "Link Type": dir.is_dofollow ? "Dofollow" : "Nofollow",
      Categories: Array.isArray(dir.categories)
        ? dir.categories.join(", ")
        : dir.category || "N/A",
      "Organic Traffic": dir.organic_search_traffic
        ? dir.organic_search_traffic.toLocaleString()
        : "N/A",
      "Avg Approval Days": dir.avg_approval_days || "N/A",
      "Traffic Level": dir.traffic_estimate || "N/A",
      Completed: isCompleted(dir.id) ? "Yes" : "No",
    };
  });
}

function handleExportCSV() {
  showExportDropdown.value = false;

  const data = prepareExportData();
  const csv = Papa.unparse(data);

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `directory-checklist-${new Date().toISOString().split("T")[0]}.csv`,
  );
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function handleExportPDF() {
  showExportDropdown.value = false;

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yPosition = margin;

  // Title
  doc.setFontSize(20);
  doc.setFont(undefined, "bold");
  doc.text("Directory Submission Checklist", margin, yPosition);
  yPosition += 10;

  // Subtitle with date and progress
  doc.setFontSize(10);
  doc.setFont(undefined, "normal");
  doc.setTextColor(100);
  doc.text(
    `Generated: ${new Date().toLocaleDateString()} | Progress: ${completedCount.value}/${props.selectedDirectories.length} (${progressPercentage.value}%)`,
    margin,
    yPosition,
  );
  yPosition += 15;

  // Reset text color
  doc.setTextColor(0);

  // Sorted by completion status then DR
  const sortedDirs = [...props.selectedDirectories].sort((a, b) => {
    const aCompleted = completedDirectories.value.has(a.id);
    const bCompleted = completedDirectories.value.has(b.id);
    if (aCompleted !== bCompleted) return aCompleted ? 1 : -1;
    return (b.domain_rating || 0) - (a.domain_rating || 0);
  });

  sortedDirs.forEach((dir, index) => {
    const completed = isCompleted(dir.id);

    // Check if we need a new page
    if (yPosition > pageHeight - 40) {
      doc.addPage();
      yPosition = margin;
    }

    // Checkbox indicator
    doc.setFontSize(11);
    doc.setFont(undefined, "bold");
    const checkbox = completed ? "☑" : "☐";
    doc.text(`${checkbox} ${dir.name || "Unknown"}`, margin, yPosition);

    // URL
    yPosition += 5;
    doc.setFontSize(9);
    doc.setFont(undefined, "normal");
    doc.setTextColor(66, 133, 244);
    doc.text(dir.url || "", margin + 5, yPosition);

    // Details row
    yPosition += 5;
    doc.setTextColor(100);
    const details = [];
    if (dir.domain_rating) details.push(`DR: ${dir.domain_rating}`);
    if (dir.pricing) details.push(dir.pricing);
    details.push(dir.is_dofollow ? "Dofollow" : "Nofollow");
    if (dir.average_rating) details.push(`★ ${dir.average_rating}`);
    if (dir.organic_search_traffic)
      details.push(`Traffic: ${dir.organic_search_traffic.toLocaleString()}`);

    doc.text(details.join(" • "), margin + 5, yPosition);

    // Reset color and add spacing
    doc.setTextColor(0);
    yPosition += 10;
  });

  // Footer on last page
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text(
    "Generated by Awesome Directories - awesome-directories.com",
    margin,
    pageHeight - 10,
  );

  // Save the PDF
  doc.save(`directory-checklist-${new Date().toISOString().split("T")[0]}.pdf`);
}

watch(
  function () {
    return props.selectedDirectories;
  },
  function (newDirs) {
    var validIds = new Set(
      newDirs.map(function (d) {
        return d.id;
      }),
    );
    var toRemove = [];

    completedDirectories.value.forEach(function (id) {
      if (!validIds.has(id)) {
        toRemove.push(id);
      }
    });

    toRemove.forEach(function (id) {
      completedDirectories.value.delete(id);
    });

    if (toRemove.length > 0) {
      saveProgress();
    }
  },
  { deep: true },
);
</script>

<style scoped>
.safe-area-inset-bottom {
  padding-bottom: max(1rem, env(safe-area-inset-bottom));
}

.touch-manipulation {
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

.overscroll-contain {
  overscroll-behavior: contain;
}

/* Details element chevron rotation */
details[open] .details-chevron {
  transform: rotate(180deg);
}

@media (max-width: 640px) {
  .safe-area-inset-bottom {
    padding-bottom: max(1rem, env(safe-area-inset-bottom));
  }
}
</style>
