import { createRouter, createWebHistory } from "vue-router";
import HomeView from "@/views/HomeView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
      meta: { title: "Awesome Directories - Curated Launch Directories" },
    },
    {
      path: "/directory/:slug",
      name: "directory",
      component: () => import("../views/DirectoryDetailView.vue"),
      meta: { title: "Directory Details" },
    },
    {
      path: "/submit",
      name: "submit",
      component: () => import("../views/SubmitView.vue"),
      meta: { title: "Submit a Directory" },
    },
    {
      path: "/about",
      name: "about",
      component: () => import("../views/AboutView.vue"),
      meta: { title: "About" },
    },
    {
      path: "/stats",
      name: "stats",
      component: () => import("../views/StatsView.vue"),
      meta: { title: "Public Stats" },
    },
    {
      path: "/favorites",
      name: "favorites",
      component: () => import("../views/FavoritesView.vue"),
      meta: { title: "My Favorites", requiresAuth: true },
    },
    {
      path: "/submissions",
      name: "submissions",
      component: () => import("../views/SubmissionsView.vue"),
      meta: { title: "My Submissions", requiresAuth: true },
    },
    {
      path: "/settings",
      name: "settings",
      component: () => import("../views/SettingsView.vue"),
      meta: { title: "Settings", requiresAuth: true },
    },
    {
      path: "/terms",
      name: "terms",
      component: () => import("../views/TermsView.vue"),
      meta: { title: "Terms of Service" },
    },
    {
      path: "/privacy",
      name: "privacy",
      component: () => import("../views/PrivacyView.vue"),
      meta: { title: "Privacy Policy" },
    },
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  },
});

// Update page title
router.beforeEach((to, from, next) => {
  document.title = to.meta.title || "Awesome Directories";
  next();
});

export default router;
