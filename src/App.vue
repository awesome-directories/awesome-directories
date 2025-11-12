<template>
  <div id="app" class="min-h-screen flex flex-col">
    <AppHeader @show-auth="showAuthModal = true" />

    <main class="flex-grow">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <AppFooter />

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

var router = useRouter();
const { user, session } = useAuth();

var showAuthModal = ref(false);
var showChecklistModal = ref(false);

function handleShowAuthModal() {
  showAuthModal.value = true;
}

function handleHideAuthModal() {
  showAuthModal.value = false;
}

function handleShowChecklistModal() {
  showChecklistModal.value = true;
}

function handleHideChecklistModal() {
  showChecklistModal.value = false;
}

provide("showAuthModal", handleShowAuthModal);
provide("hideAuthModal", handleHideAuthModal);
provide("showChecklistModal", handleShowChecklistModal);
provide("hideChecklistModal", handleHideChecklistModal);

onMounted(function() {
  supabase.auth.onAuthStateChange(function(event, _session) {
    if (event === "SIGNED_IN") {
      showAuthModal.value = false;
    }
  });
});

router.beforeEach(function(to, from, next) {
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
