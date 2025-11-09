<template>
  <div id="app" class="min-h-screen flex flex-col">
    <AppHeader />

    <main class="flex-grow">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <AppFooter />

    <!-- Modals -->
    <AuthModal v-if="showAuthModal" @close="showAuthModal = false" />
    <ChecklistModal
      v-if="showChecklistModal"
      @close="showChecklistModal = false"
    />
  </div>
</template>

<script setup>
import { ref, provide, onMounted } from "vue";
import { useRouter } from "vue-router";
import AppHeader from "@/components/AppHeader.vue";
import AppFooter from "@/components/AppFooter.vue";
import AuthModal from "@/components/AuthModal.vue";
import ChecklistModal from "@/components/ChecklistModal.vue";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/composables/useAuth";

const router = useRouter();
const { user, session } = useAuth();

const showAuthModal = ref(false);
const showChecklistModal = ref(false);

// Provide global modal controls
provide("showAuthModal", () => {
  showAuthModal.value = true;
});
provide("hideAuthModal", () => {
  showAuthModal.value = false;
});
provide("showChecklistModal", () => {
  showChecklistModal.value = true;
});
provide("hideChecklistModal", () => {
  showChecklistModal.value = false;
});

// Handle auth state changes
onMounted(() => {
  supabase.auth.onAuthStateChange((event, _session) => {
    if (event === "SIGNED_IN") {
      showAuthModal.value = false;
    }
  });
});

// Protected route handling
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !session.value) {
    showAuthModal.value = true;
    next(false);
  } else {
    next();
  }
});
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
