<template>
  <div v-if="loading" class="text-center py-8 sm:py-12">
    <div
      class="inline-block animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-primary"
      role="status"
      aria-label="Loading"
    ></div>
    <p class="mt-4 text-gray-600 text-sm sm:text-base">Loading charts...</p>
  </div>

  <div v-else-if="error" class="card p-4 sm:p-8 bg-red-50 border-red-200" role="alert">
    <p class="text-red-700 text-sm sm:text-base">{{ error }}</p>
  </div>

  <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
    <!-- Category Distribution -->
    <div class="card p-4 sm:p-6">
      <h3 class="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
        Category Distribution
      </h3>
      <div class="relative h-64 sm:h-80">
        <canvas ref="categoryChart" aria-label="Category distribution pie chart"></canvas>
      </div>
    </div>

    <!-- Pricing Breakdown -->
    <div class="card p-4 sm:p-6">
      <h3 class="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
        Pricing Breakdown
      </h3>
      <div class="relative h-64 sm:h-80">
        <canvas ref="pricingChart" aria-label="Pricing breakdown doughnut chart"></canvas>
      </div>
    </div>

    <!-- Link Types -->
    <div class="card p-4 sm:p-6">
      <h3 class="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
        Link Type Distribution
      </h3>
      <div class="relative h-56 sm:h-80">
        <canvas ref="linkTypeChart" aria-label="Link type distribution bar chart"></canvas>
      </div>
    </div>

    <!-- Domain Rating Ranges -->
    <div class="card p-4 sm:p-6">
      <h3 class="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
        Domain Rating Distribution
      </h3>
      <div class="relative h-56 sm:h-80">
        <canvas ref="drRangeChart" aria-label="Domain rating distribution bar chart"></canvas>
      </div>
    </div>

    <!-- Recent Additions Timeline (Full Width) -->
    <div class="card p-4 sm:p-6 lg:col-span-2">
      <h3 class="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
        Recent Additions Timeline
      </h3>
      <div class="relative h-48 sm:h-64">
        <canvas ref="timelineChart" aria-label="Recent additions timeline bar chart"></canvas>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import {
  Chart,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title,
} from "chart.js";

// Register Chart.js components
Chart.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title,
);

const loading = ref(true);
const error = ref(null);
const stats = ref(null);
const isMobile = ref(false);

// Chart refs
const categoryChart = ref(null);
const pricingChart = ref(null);
const linkTypeChart = ref(null);
const drRangeChart = ref(null);
const timelineChart = ref(null);

// Chart instances
let categoryChartInstance = null;
let pricingChartInstance = null;
let linkTypeChartInstance = null;
let drRangeChartInstance = null;
let timelineChartInstance = null;

// Color palettes
const categoryColors = [
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#f59e0b",
  "#10b981",
  "#06b6d4",
  "#6366f1",
  "#f97316",
  "#14b8a6",
  "#a855f7",
  "#84cc16",
  "#f43f5e",
  "#0ea5e9",
  "#eab308",
  "#22c55e",
];

const pricingColors = {
  free: "#10b981",
  paid: "#f59e0b",
  freemium: "#3b82f6",
};

// Check if mobile
function checkMobile() {
  isMobile.value = window.innerWidth < 640;
}

// Responsive legend configuration
function getLegendConfig(position = "right") {
  const mobilePosition = position === "right" ? "bottom" : position;
  return {
    position: isMobile.value ? mobilePosition : position,
    labels: {
      font: {
        size: isMobile.value ? 10 : 11,
      },
      padding: isMobile.value ? 8 : 10,
      boxWidth: isMobile.value ? 12 : 40,
      usePointStyle: isMobile.value,
    },
  };
}

function createCategoryChart() {
  if (!categoryChart.value || !stats.value) return;

  // Show fewer categories on mobile
  const maxCategories = isMobile.value ? 6 : 10;
  const topCategories = stats.value.categories.slice(0, maxCategories);
  const labels = topCategories.map((cat) =>
    isMobile.value && cat.name.length > 12 ? cat.name.substring(0, 12) + "..." : cat.name
  );
  const data = topCategories.map((cat) => cat.count);

  categoryChartInstance = new Chart(categoryChart.value, {
    type: "pie",
    data: {
      labels,
      datasets: [
        {
          data,
          backgroundColor: categoryColors.slice(0, topCategories.length),
          borderWidth: 2,
          borderColor: "#fff",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: isMobile.value ? 5 : 10,
      },
      plugins: {
        legend: {
          ...getLegendConfig("right"),
          labels: {
            font: {
              size: isMobile.value ? 9 : 11,
            },
            padding: isMobile.value ? 6 : 10,
            boxWidth: isMobile.value ? 10 : 40,
            usePointStyle: isMobile.value,
            generateLabels: (chart) => {
              const chartData = chart.data;
              return chartData.labels.map((label, i) => ({
                text: `${label} (${chartData.datasets[0].data[i]})`,
                fillStyle: chartData.datasets[0].backgroundColor[i],
                hidden: false,
                index: i,
              }));
            },
          },
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const label = context.label || "";
              const value = context.parsed || 0;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = ((value / total) * 100).toFixed(1);
              return `${label}: ${value} (${percentage}%)`;
            },
          },
        },
      },
    },
  });
}

function createPricingChart() {
  if (!pricingChart.value || !stats.value) return;

  const labels = ["Free", "Paid", "Freemium"];
  const data = [
    stats.value.pricing.free,
    stats.value.pricing.paid,
    stats.value.pricing.freemium,
  ];

  pricingChartInstance = new Chart(pricingChart.value, {
    type: "doughnut",
    data: {
      labels,
      datasets: [
        {
          data,
          backgroundColor: [
            pricingColors.free,
            pricingColors.paid,
            pricingColors.freemium,
          ],
          borderWidth: 2,
          borderColor: "#fff",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: isMobile.value ? 5 : 10,
      },
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            padding: isMobile.value ? 10 : 15,
            font: {
              size: isMobile.value ? 11 : 12,
            },
            boxWidth: isMobile.value ? 12 : 40,
            usePointStyle: isMobile.value,
            generateLabels: (chart) => {
              const chartData = chart.data;
              return chartData.labels.map((label, i) => ({
                text: `${label}: ${chartData.datasets[0].data[i]}`,
                fillStyle: chartData.datasets[0].backgroundColor[i],
                hidden: false,
                index: i,
              }));
            },
          },
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const label = context.label || "";
              const value = context.parsed || 0;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = ((value / total) * 100).toFixed(1);
              return `${label}: ${value} (${percentage}%)`;
            },
          },
        },
      },
    },
  });
}

function createLinkTypeChart() {
  if (!linkTypeChart.value || !stats.value) return;

  linkTypeChartInstance = new Chart(linkTypeChart.value, {
    type: "bar",
    data: {
      labels: ["Dofollow", "Nofollow"],
      datasets: [
        {
          label: "Number of Directories",
          data: [
            stats.value.linkTypes.dofollow,
            stats.value.linkTypes.nofollow,
          ],
          backgroundColor: ["#10b981", "#f59e0b"],
          borderColor: ["#059669", "#d97706"],
          borderWidth: 1,
          borderRadius: isMobile.value ? 4 : 6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: isMobile.value ? 5 : 10,
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0,
            font: {
              size: isMobile.value ? 10 : 12,
            },
          },
          grid: {
            display: !isMobile.value,
          },
        },
        x: {
          ticks: {
            font: {
              size: isMobile.value ? 11 : 12,
            },
          },
        },
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const value = context.parsed.y;
              const total =
                stats.value.linkTypes.dofollow + stats.value.linkTypes.nofollow;
              const percentage = ((value / total) * 100).toFixed(1);
              return `${value} directories (${percentage}%)`;
            },
          },
        },
      },
    },
  });
}

function createDRRangeChart() {
  if (!drRangeChart.value || !stats.value) return;

  const labels = Object.keys(stats.value.drRanges);
  const data = Object.values(stats.value.drRanges);

  drRangeChartInstance = new Chart(drRangeChart.value, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Number of Directories",
          data,
          backgroundColor: [
            "#ef4444",
            "#f59e0b",
            "#eab308",
            "#84cc16",
            "#22c55e",
          ],
          borderColor: ["#dc2626", "#d97706", "#ca8a04", "#65a30d", "#16a34a"],
          borderWidth: 1,
          borderRadius: isMobile.value ? 4 : 6,
        },
      ],
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: isMobile.value ? 5 : 10,
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: {
            precision: 0,
            font: {
              size: isMobile.value ? 10 : 12,
            },
          },
          grid: {
            display: !isMobile.value,
          },
        },
        y: {
          ticks: {
            font: {
              size: isMobile.value ? 10 : 12,
            },
          },
        },
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              return `${context.parsed.x} directories`;
            },
          },
        },
      },
    },
  });
}

function createTimelineChart() {
  if (!timelineChart.value || !stats.value) return;

  // Shorter labels on mobile
  const labels = isMobile.value
    ? ["30 Days", "60 Days", "90 Days"]
    : ["Last 30 Days", "Last 60 Days", "Last 90 Days"];

  timelineChartInstance = new Chart(timelineChart.value, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Directories Added",
          data: [
            stats.value.recentAdditions.last30Days,
            stats.value.recentAdditions.last60Days,
            stats.value.recentAdditions.last90Days,
          ],
          backgroundColor: ["#3b82f6", "#8b5cf6", "#ec4899"],
          borderColor: ["#2563eb", "#7c3aed", "#db2777"],
          borderWidth: 1,
          borderRadius: isMobile.value ? 4 : 6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: isMobile.value ? 5 : 10,
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0,
            font: {
              size: isMobile.value ? 10 : 12,
            },
          },
          grid: {
            display: !isMobile.value,
          },
        },
        x: {
          ticks: {
            font: {
              size: isMobile.value ? 10 : 12,
            },
          },
        },
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              return `${context.parsed.y} new directories`;
            },
          },
        },
      },
    },
  });
}

// Destroy and recreate charts on resize
let resizeTimeout = null;
function handleResize() {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    const wasMobile = isMobile.value;
    checkMobile();

    // Only recreate charts if mobile status changed
    if (wasMobile !== isMobile.value) {
      destroyCharts();
      createAllCharts();
    }
  }, 250);
}

function destroyCharts() {
  if (categoryChartInstance) categoryChartInstance.destroy();
  if (pricingChartInstance) pricingChartInstance.destroy();
  if (linkTypeChartInstance) linkTypeChartInstance.destroy();
  if (drRangeChartInstance) drRangeChartInstance.destroy();
  if (timelineChartInstance) timelineChartInstance.destroy();

  categoryChartInstance = null;
  pricingChartInstance = null;
  linkTypeChartInstance = null;
  drRangeChartInstance = null;
  timelineChartInstance = null;
}

function createAllCharts() {
  createCategoryChart();
  createPricingChart();
  createLinkTypeChart();
  createDRRangeChart();
  createTimelineChart();
}

async function loadStats() {
  try {
    loading.value = true;
    error.value = null;

    const response = await fetch("/data/stats.json");
    if (!response.ok) {
      throw new Error(`Failed to load stats: ${response.statusText}`);
    }

    stats.value = await response.json();

    // Wait for next tick to ensure DOM is updated
    await new Promise((resolve) => setTimeout(resolve, 0));

    // Create all charts
    createAllCharts();
  } catch (err) {
    console.error("Error loading stats:", err);
    error.value = "Failed to load chart data. Please try again later.";
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  checkMobile();
  window.addEventListener("resize", handleResize);
  loadStats();
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", handleResize);
  clearTimeout(resizeTimeout);
  destroyCharts();
});
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

/* Ensure charts don't overflow on mobile */
canvas {
  max-width: 100%;
}
</style>
