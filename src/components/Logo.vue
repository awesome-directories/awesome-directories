<template>
  <div class="flex items-center" :class="containerClass">
    <img
      v-if="showIcon"
      :src="iconSrc"
      :alt="alt"
      :class="iconClass"
      :style="iconStyle"
    />
    <span v-if="showText" :class="textClass">
      {{ text }}
    </span>
  </div>
</template>

<script setup>
import { computed } from "vue";

var props = defineProps({
  variant: {
    type: String,
    default: "default",
    validator: function (value) {
      return ["default", "icon", "full", "white", "black", "blue"].includes(
        value,
      );
    },
  },
  size: {
    type: String,
    default: "md",
    validator: function (value) {
      return ["sm", "md", "lg", "xl"].includes(value);
    },
  },
  showText: {
    type: Boolean,
    default: true,
  },
  showIcon: {
    type: Boolean,
    default: true,
  },
  text: {
    type: String,
    default: "Awesome Directories",
  },
  alt: {
    type: String,
    default: "Awesome Directories Logo",
  },
  spacing: {
    type: String,
    default: "md",
  },
});

var iconSrc = computed(function () {
  var variantMap = {
    default: "/logo-icon.svg",
    icon: "/logo-icon.svg",
    full: "/logo-full.svg",
    white: "/logo-icon-white.svg",
    black: "/logo-icon-black.svg",
    blue: "/logo-icon.svg",
  };
  return variantMap[props.variant] || variantMap.default;
});

var containerClass = computed(function () {
  var spacingMap = {
    sm: "space-x-1",
    md: "space-x-2",
    lg: "space-x-3",
    xl: "space-x-4",
  };
  return spacingMap[props.spacing] || spacingMap.md;
});

var iconClass = computed(function () {
  var sizeMap = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10",
    xl: "w-12 h-12",
  };
  return sizeMap[props.size] || sizeMap.md;
});

var iconStyle = computed(function () {
  return {};
});

var textClass = computed(function () {
  var sizeMap = {
    sm: "text-base font-bold text-gray-900",
    md: "text-xl font-bold text-gray-900",
    lg: "text-2xl font-bold text-gray-900",
    xl: "text-3xl font-bold text-gray-900",
  };

  var colorMap = {
    white: "text-white",
    black: "text-black",
    blue: "text-primary",
    default: "text-gray-900",
  };

  var baseClass = sizeMap[props.size] || sizeMap.md;
  var colorClass = colorMap[props.variant] || colorMap.default;

  return baseClass.replace("text-gray-900", colorClass);
});
</script>
