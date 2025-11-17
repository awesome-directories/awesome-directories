<template>
  <div ref="giscusContainer" class="giscus-comments"></div>
</template>

<script setup>
import { ref, onMounted } from "vue";

const props = defineProps({
  directorySlug: {
    type: String,
    required: true,
  },
});

const giscusContainer = ref(null);

onMounted(() => {
  if (!giscusContainer.value) return;

  // Create Giscus script
  const script = document.createElement("script");
  script.src = "https://giscus.app/client.js";
  script.setAttribute(
    "data-repo",
    import.meta.env.VITE_GITHUB_REPO ||
      import.meta.env.PUBLIC_GITHUB_REPO ||
      "awesome-directories/awesome-directories"
  );
  script.setAttribute(
    "data-repo-id",
    import.meta.env.VITE_GITHUB_REPO_ID || import.meta.env.PUBLIC_GITHUB_REPO_ID || ""
  );
  script.setAttribute(
    "data-category",
    import.meta.env.VITE_GITHUB_CATEGORY || import.meta.env.PUBLIC_GITHUB_CATEGORY || "Announcements"
  );
  script.setAttribute(
    "data-category-id",
    import.meta.env.VITE_GITHUB_CATEGORY_ID || import.meta.env.PUBLIC_GITHUB_CATEGORY_ID || ""
  );
  script.setAttribute("data-mapping", "pathname");
  script.setAttribute("data-strict", "0");
  script.setAttribute("data-reactions-enabled", "1");
  script.setAttribute("data-emit-metadata", "0");
  script.setAttribute("data-input-position", "bottom");
  script.setAttribute("data-theme", "light");
  script.setAttribute("data-lang", "en");
  script.setAttribute("data-loading", "lazy");
  script.crossOrigin = "anonymous";
  script.async = true;

  // Append script to container
  giscusContainer.value.appendChild(script);
});
</script>

<style scoped>
.giscus-comments {
  min-height: 200px;
}
</style>
