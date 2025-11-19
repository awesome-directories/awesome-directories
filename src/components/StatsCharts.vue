<template>
  <div v-if="loading" class="text-center py-12">
    <div
      class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"
    ></div>
    <p class="mt-4 text-gray-600">Loading charts...</p>
  </div>

  <div v-else-if="error" class="card p-8 bg-red-50 border-red-200">
    <p class="text-red-700">{{ error }}</p>
  </div>

  <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <!-- Category Distribution -->
    <div class="card p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">
        Category Distribution
      </h3>
      <div class="relative h-80">
        <canvas ref="categoryChart"></canvas>
      </div>
    </div>

    <!-- Pricing Breakdown -->
    <div class="card p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">
        Pricing Breakdown
      </h3>
      <div class="relative h-80">
        <canvas ref="pricingChart"></canvas>
      </div>
    </div>

    <!-- Link Types -->
    <div class="card p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">
        Link Type Distribution
      </h3>
      <div class="relative h-80">
        <canvas ref="linkTypeChart"></canvas>
      </div>
    </div>

    <!-- Domain Rating Ranges -->
    <div class="card p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">
        Domain Rating Distribution
      </h3>
      <div class="relative h-80">
        <canvas ref="drRangeChart"></canvas>
      </div>
    </div>

    <!-- Recent Additions Timeline (Full Width) -->
    <div class="card p-6 lg:col-span-2">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">
        Recent Additions Timeline
      </h3>
      <div class="relative h-64">
        <canvas ref="timelineChart"></canvas>
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

function createCategoryChart() {
  if (!categoryChart.value || !stats.value) return;

  const topCategories = stats.value.categories.slice(0, 10);
  const labels = topCategories.map((cat) => cat.name);
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
      plugins: {
        legend: {
          position: "right",
          labels: {
            font: {
              size: 11,
            },
            padding: 10,
            generateLabels: (chart) => {
              const data = chart.data;
              return data.labels.map((label, i) => ({
                text: `${label} (${data.datasets[0].data[i]})`,
                fillStyle: data.datasets[0].backgroundColor[i],
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
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            padding: 15,
            font: {
              size: 12,
            },
            generateLabels: (chart) => {
              const data = chart.data;
              return data.labels.map((label, i) => ({
                text: `${label}: ${data.datasets[0].data[i]}`,
                fillStyle: data.datasets[0].backgroundColor[i],
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
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0,
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
        },
      ],
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          beginAtZero: true,
          ticks: {
            precision: 0,
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

  timelineChartInstance = new Chart(timelineChart.value, {
    type: "bar",
    data: {
      labels: ["Last 30 Days", "Last 60 Days", "Last 90 Days"],
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
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0,
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
    createCategoryChart();
    createPricingChart();
    createLinkTypeChart();
    createDRRangeChart();
    createTimelineChart();
  } catch (err) {
    console.error("Error loading stats:", err);
    error.value = "Failed to load chart data. Please try again later.";
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadStats();
});

onBeforeUnmount(() => {
  // Cleanup chart instances
  if (categoryChartInstance) categoryChartInstance.destroy();
  if (pricingChartInstance) pricingChartInstance.destroy();
  if (linkTypeChartInstance) linkTypeChartInstance.destroy();
  if (drRangeChartInstance) drRangeChartInstance.destroy();
  if (timelineChartInstance) timelineChartInstance.destroy();
});
</script>
