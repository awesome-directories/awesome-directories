<template>
  <button
    @click="handleToggleFavorite"
    :disabled="isLoading || isDisabled"
    :class="buttonClass"
    :title="
      isDisabled
        ? disabledReason
        : isFavorited
          ? 'Remove from favorites'
          : 'Add to favorites'
    "
    :aria-label="isFavorited ? 'Remove from favorites' : 'Add to favorites'"
  >
    <span class="text-lg" :class="{ 'animate-pulse': isLoading }">
      {{ isFavorited ? "❤️" : "🤍" }}
    </span>
    <span v-if="showLabel" class="ml-2">
      {{ isFavorited ? "Favorited" : "Favorite" }}
    </span>
  </button>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useStore } from "@nanostores/vue";
import { $user } from "@/stores/auth";
import { useDirectory } from "@/composables/useDirectory";
import { requireAuth } from "@/utils/auth";

const props = defineProps({
  directoryId: {
    type: String,
    required: true,
  },
  variant: {
    type: String,
    default: "default", // 'default' | 'large' | 'icon-only'
    validator: (value) => ["default", "large", "icon-only"].includes(value),
  },
  showLabel: {
    type: Boolean,
    default: false,
  },
  isDisabled: {
    type: Boolean,
    default: false,
  },
  disabledReason: {
    type: String,
    default: "Cannot favorite this directory",
  },
  initialFavorited: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["favorited", "unfavorited"]);

const user = useStore($user);
const {
  addToFavorites,
  removeFromFavorites,
  isFavorite: checkFavorite,
} = useDirectory();

const isFavorited = ref(props.initialFavorited);
const isLoading = ref(false);

// Button classes based on variant
const buttonClass = computed(() => {
  const baseClass =
    "inline-flex items-center justify-center transition-all duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  if (props.variant === "large") {
    return `${baseClass} px-6 py-3 text-base font-semibold ${
      isFavorited.value
        ? "bg-red-50 text-red-700 hover:bg-red-100 border-2 border-red-200"
        : "bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-300"
    }`;
  }

  if (props.variant === "icon-only") {
    return `${baseClass} p-2 ${
      isFavorited.value
        ? "bg-red-50 text-red-700 hover:bg-red-100"
        : "bg-white text-gray-700 hover:bg-gray-50"
    }`;
  }

  // default variant
  return `${baseClass} px-4 py-2 text-sm font-medium ${
    isFavorited.value
      ? "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
      : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
  }`;
});

// Check favorite status on mount
onMounted(async () => {
  if (user.value && props.directoryId) {
    isFavorited.value = await checkFavorite(props.directoryId, user.value);
  }
});

// Watch for user changes (login/logout)
watch(
  user,
  async (newUser) => {
    if (newUser && props.directoryId) {
      isFavorited.value = await checkFavorite(props.directoryId, newUser);
    } else {
      isFavorited.value = false;
    }
  },
  { immediate: false },
);

const handleToggleFavorite = async () => {
  // Require authentication
  if (!requireAuth(user.value)) {
    return;
  }

  if (isLoading.value || props.isDisabled) return;

  try {
    isLoading.value = true;

    if (isFavorited.value) {
      // Remove from favorites
      const result = await removeFromFavorites(props.directoryId, user.value);

      if (result.success) {
        isFavorited.value = false;
        emit("unfavorited", props.directoryId);
      }
    } else {
      // Add to favorites
      const result = await addToFavorites(props.directoryId, user.value);

      if (result.success) {
        isFavorited.value = true;
        emit("favorited", props.directoryId);
      } else if (result.error === "Already in favorites") {
        // Already favorited, just update state
        isFavorited.value = true;
      }
    }
  } catch (error) {
    console.error("Failed to toggle favorite:", error);
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
