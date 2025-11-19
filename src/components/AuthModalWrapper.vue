<template>
  <AuthModal v-if="showModal" @close="closeModal" />
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import AuthModal from "./AuthModal.vue";
import { useAuth } from "@/composables/useAuth";

// Initialize auth (will be no-op if already initialized)
var { user, session, loading } = useAuth();

var showModal = ref(false);

function openModal() {
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
}

// Listen for global auth modal events
var handleShowModal;

onMounted(function setupModalListener() {
  handleShowModal = function showModalHandler() {
    openModal();
  };
  window.addEventListener("show-auth-modal", handleShowModal);
});

onUnmounted(function cleanupModalListener() {
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
