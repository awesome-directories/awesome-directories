<template>
  <Teleport to="body">
    <AuthModal v-if="showModal" @close="closeModal" />
  </Teleport>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import AuthModal from "./AuthModal.vue";

const showModal = ref(false);

const openModal = () => {
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

// Listen for global auth modal events
let handleShowModal;

onMounted(() => {
  handleShowModal = () => openModal();
  window.addEventListener("show-auth-modal", handleShowModal);
});

onUnmounted(() => {
  if (handleShowModal) {
    window.removeEventListener("show-auth-modal", handleShowModal);
  }
});

// Expose methods for programmatic access
if (typeof window !== "undefined") {
  window.__showAuthModal = openModal;
  window.__closeAuthModal = closeModal;
}
</script>
