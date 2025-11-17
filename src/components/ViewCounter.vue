<template>
  <div class="text-2xl font-bold text-primary mb-1">
    {{ viewCount }}
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { trackDirectoryView } from "@/lib/api-client";

const props = defineProps({
  directoryId: {
    type: String,
    required: true,
  },
  initialCount: {
    type: Number,
    default: 0,
  },
});

const viewCount = ref(props.initialCount);
const hasTracked = ref(false);

// Track view when component mounts
onMounted(async () => {
  // Only track once per page load
  if (hasTracked.value) return;

  try {
    const { data, error } = await trackDirectoryView(props.directoryId);

    if (!error && data) {
      viewCount.value = data.viewCount;
      hasTracked.value = true;

      // Track analytics if Pirsch is available
      if (window.pirsch) {
        window.pirsch("Directory Page View", {
          directory: props.directoryId,
        });
      }
    }
  } catch (error) {
    console.error("Error tracking view:", error);
    // Silently fail - view tracking is not critical
  }
});
</script>
