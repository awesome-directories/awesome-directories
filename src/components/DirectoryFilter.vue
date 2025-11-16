<template>
  <div id="directory-app">
    <div class="bg-white border-b border-gray-200 sticky top-16 z-40 shadow-sm">
      <div class="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Category</label
            >
            <select
              v-model="currentFilters.category"
              @change="applyFilters"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            >
              <option v-for="cat in categories" :key="cat" :value="cat">
                {{ cat }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Domain Rating</label
            >
            <select
              v-model="currentFilters.drRange"
              @change="applyFilters"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            >
              <option value="All">All DR</option>
              <option value="80+">80+</option>
              <option value="70-79">70-79</option>
              <option value="60-69">60-69</option>
              <option value="<60">&lt;60</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Link Type</label
            >
            <select
              v-model="currentFilters.linkType"
              @change="applyFilters"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            >
              <option value="All">All</option>
              <option value="Dofollow Only">Dofollow Only</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Pricing</label
            >
            <select
              v-model="currentFilters.pricing"
              @change="applyFilters"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            >
              <option value="All">All</option>
              <option value="free">Free</option>
              <option value="paid">Paid</option>
              <option value="freemium">Freemium</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Sort By</label
            >
            <select
              v-model="currentFilters.sortBy"
              @change="applyFilters"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            >
              <option>Most Helpful</option>
              <option>Highest DR</option>
              <option>Newest</option>
              <option>Alphabetical</option>
            </select>
          </div>
        </div>

        <div
          v-if="hasActiveFilters"
          class="mt-4 flex items-center justify-between"
        >
          <div class="text-sm text-gray-600">
            Showing
            <span class="font-semibold">{{ filteredData.length }}</span>
            directories
          </div>

          <button
            @click="resetAllFilters"
            class="text-sm text-primary hover:text-primary-dark font-medium"
          >
            Clear all filters
          </button>
        </div>
      </div>
    </div>

    <div class="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div v-if="isLoading" class="text-center py-12">
        <div class="text-gray-600">Loading directories...</div>
      </div>

      <div v-else-if="filteredData.length === 0" class="text-center py-12">
        <div class="text-gray-600 mb-4">
          No directories found matching your filters.
        </div>
        <button @click="resetAllFilters" class="btn-primary">
          Reset Filters
        </button>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="dir in filteredData" :key="dir.slug" class="card p-6 flex flex-col">
          <div class="flex items-start justify-between mb-3">
            <h3 class="text-lg font-semibold text-gray-900">
              <a
                :href="`/directory/${dir.slug}`"
                class="hover:text-primary transition-colors"
              >
                {{ dir.name }}
              </a>
            </h3>
            <div class="flex items-center gap-2">
              <button
                @click="toggleFavorite(dir)"
                :data-directory-id="dir.id"
                :data-favorited="isFavorited(dir.id)"
                class="favorite-btn text-xl hover:scale-110 transition-transform"
                :title="isFavorited(dir.id) ? 'Remove from favorites' : 'Add to favorites'"
              >
                {{ isFavorited(dir.id) ? '❤️' : '🤍' }}
              </button>
              <span v-if="dir.domain_rating" class="badge badge-blue"
                >DR {{ dir.domain_rating }}</span
              >
            </div>
          </div>
          <p v-if="dir.description" class="text-sm text-gray-600 mb-4 flex-grow">
            {{
              dir.description.length > 150
                ? dir.description.substring(0, 150) + "..."
                : dir.description
            }}
          </p>
          <div class="flex flex-wrap gap-2 mb-4">
            <span
              v-for="cat in dir.categories"
              :key="cat"
              class="badge badge-gray text-xs"
              >{{ cat }}</span
            >
          </div>
          <div class="flex items-center justify-between text-sm border-t border-gray-100 pt-3">
            <div class="flex items-center gap-3">
              <span class="text-gray-600">{{ dir.pricing_type || "Free" }}</span>
              <span v-if="dir.is_dofollow" class="text-success">✓ Dofollow</span>
            </div>
            <button
              @click="toggleUpvote(dir)"
              :data-directory-id="dir.id"
              :data-upvoted="hasUpvoted(dir.id)"
              :disabled="hasUpvoted(dir.id)"
              class="upvote-btn flex items-center gap-1 text-gray-600 hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              :class="{ 'text-primary': hasUpvoted(dir.id) }"
            >
              <span>{{ hasUpvoted(dir.id) ? '✓' : '👍' }}</span>
              <span class="text-xs">{{ dir.helpful_count || 0 }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import httpClient from "@/lib/httpclient.js";
import { supabase, getUser } from "@/lib/supabase-client.js";
import { $user } from "@/stores/auth.js";

export default {
  name: "DirectoryFilter",
  props: {
    categories: {
      type: Array,
      default: function defaultCategories() {
        return [];
      },
    },
  },
  data: function data() {
    return {
      allData: [],
      filteredData: [],
      isLoading: true,
      user: null,
      userFavorites: [],
      userUpvotes: [],
      currentFilters: {
        search: "",
        category: "All",
        drRange: "All",
        linkType: "All",
        pricing: "All",
        sortBy: "Most Helpful",
      },
    };
  },
  computed: {
    hasActiveFilters: function hasActiveFilters() {
      return (
        this.currentFilters.search ||
        this.currentFilters.category !== "All" ||
        this.currentFilters.drRange !== "All" ||
        this.currentFilters.linkType !== "All" ||
        this.currentFilters.pricing !== "All"
      );
    },
  },
  mounted: function mounted() {
    this.loadDirectories();
    this.setupSearchListener();
    this.loadUserData();
    this.listenToAuthChanges();
  },
  methods: {
    loadDirectories: async function loadDirectories() {
      var self = this;
      try {
        var response = await httpClient.get("/data/directories.json");
        self.allData = await response.json();
        self.filteredData = [].concat(self.allData);
        self.isLoading = false;
        self.applyFilters();
      } catch (error) {
        console.error("Failed to load directories:", error);
        self.isLoading = false;
      }
    },
    setupSearchListener: function setupSearchListener() {
      var self = this;
      var searchInput = document.getElementById("search-input");
      if (searchInput) {
        searchInput.addEventListener("input", function handleSearchInput(e) {
          self.currentFilters.search = e.target.value;
          self.applyFilters();
        });
      }
    },
    applyFilters: function applyFilters() {
      var self = this;
      var filtered = [].concat(self.allData);

      if (self.currentFilters.search) {
        var searchLower = self.currentFilters.search.toLowerCase();
        filtered = filtered.filter(function filterBySearch(dir) {
          return (
            dir.name.toLowerCase().includes(searchLower) ||
            (dir.description &&
              dir.description.toLowerCase().includes(searchLower)) ||
            (dir.categories &&
              dir.categories.some(function checkCategory(cat) {
                return cat.toLowerCase().includes(searchLower);
              }))
          );
        });
      }

      if (self.currentFilters.category !== "All") {
        filtered = filtered.filter(function filterByCategory(dir) {
          return (
            dir.categories &&
            dir.categories.includes(self.currentFilters.category)
          );
        });
      }

      if (self.currentFilters.drRange !== "All") {
        filtered = filtered.filter(function filterByDR(dir) {
          if (!dir.domain_rating) return false;
          var dr = dir.domain_rating;
          switch (self.currentFilters.drRange) {
            case "80+":
              return dr >= 80;
            case "70-79":
              return dr >= 70 && dr < 80;
            case "60-69":
              return dr >= 60 && dr < 70;
            case "<60":
              return dr < 60;
            default:
              return true;
          }
        });
      }

      if (self.currentFilters.linkType === "Dofollow Only") {
        filtered = filtered.filter(function filterByLinkType(dir) {
          return dir.is_dofollow === true;
        });
      }

      if (self.currentFilters.pricing !== "All") {
        filtered = filtered.filter(function filterByPricing(dir) {
          return (
            dir.pricing_type &&
            dir.pricing_type.toLowerCase() === self.currentFilters.pricing
          );
        });
      }

      filtered = self.sortDirectories(filtered, self.currentFilters.sortBy);
      self.filteredData = filtered;
    },
    sortDirectories: function sortDirectories(dirs, sortBy) {
      var sorted = [].concat(dirs);
      switch (sortBy) {
        case "Most Helpful":
          return sorted.sort(function sortByHelpful(a, b) {
            return (b.helpful_count || 0) - (a.helpful_count || 0);
          });
        case "Highest DR":
          return sorted.sort(function sortByDR(a, b) {
            if (!a.domain_rating && !b.domain_rating) return 0;
            if (!a.domain_rating) return 1;
            if (!b.domain_rating) return -1;
            return b.domain_rating - a.domain_rating;
          });
        case "Newest":
          return sorted.sort(function sortByDate(a, b) {
            return (
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
            );
          });
        case "Alphabetical":
          return sorted.sort(function sortAlphabetically(a, b) {
            return a.name.localeCompare(b.name);
          });
        default:
          return sorted;
      }
    },
    resetAllFilters: function resetAllFilters() {
      var self = this;
      var searchInput = document.getElementById("search-input");
      if (searchInput) searchInput.value = "";

      self.currentFilters = {
        search: "",
        category: "All",
        drRange: "All",
        linkType: "All",
        pricing: "All",
        sortBy: "Most Helpful",
      };
      self.applyFilters();
    },
    loadUserData: async function loadUserData() {
      var self = this;
      try {
        var user = await getUser();
        self.user = user;

        if (user) {
          // Load user favorites
          var { data: favorites, error: favError } = await supabase
            .from("user_favorites")
            .select("directory_id")
            .eq("user_id", user.id);

          if (!favError && favorites) {
            self.userFavorites = favorites.map(function mapFavorite(f) {
              return f.directory_id;
            });
          }

          // Load user upvotes
          var { data: upvotes, error: upvoteError } = await supabase
            .from("directory_votes")
            .select("directory_id")
            .eq("user_id", user.id);

          if (!upvoteError && upvotes) {
            self.userUpvotes = upvotes.map(function mapUpvote(v) {
              return v.directory_id;
            });
          }
        }
      } catch (error) {
        console.error("Failed to load user data:", error);
      }
    },
    listenToAuthChanges: function listenToAuthChanges() {
      var self = this;
      supabase.auth.onAuthStateChange(async function handleAuthChange(event, session) {
        if (session?.user) {
          self.user = session.user;
          await self.loadUserData();
        } else {
          self.user = null;
          self.userFavorites = [];
          self.userUpvotes = [];
        }
      });
    },
    isFavorited: function isFavorited(directoryId) {
      return this.userFavorites.includes(directoryId);
    },
    hasUpvoted: function hasUpvoted(directoryId) {
      return this.userUpvotes.includes(directoryId);
    },
    toggleFavorite: async function toggleFavorite(directory) {
      var self = this;

      if (!self.user) {
        window.dispatchEvent(new CustomEvent("show-auth-modal"));
        return;
      }

      var isFavorited = self.isFavorited(directory.id);

      try {
        if (isFavorited) {
          // Remove favorite
          var { error } = await supabase
            .from("user_favorites")
            .delete()
            .eq("user_id", self.user.id)
            .eq("directory_id", directory.id);

          if (error) throw error;

          self.userFavorites = self.userFavorites.filter(function removeFavorite(id) {
            return id !== directory.id;
          });
        } else {
          // Add favorite
          var { error: insertError } = await supabase
            .from("user_favorites")
            .insert({
              user_id: self.user.id,
              directory_id: directory.id,
            });

          if (insertError) {
            if (insertError.code === "23505") {
              // Already favorited
              if (!self.userFavorites.includes(directory.id)) {
                self.userFavorites.push(directory.id);
              }
            } else {
              throw insertError;
            }
          } else {
            self.userFavorites.push(directory.id);
          }
        }
      } catch (error) {
        console.error("Failed to toggle favorite:", error);
        alert("Failed to update favorite. Please try again.");
      }
    },
    toggleUpvote: async function toggleUpvote(directory) {
      var self = this;

      if (!self.user) {
        window.dispatchEvent(new CustomEvent("show-auth-modal"));
        return;
      }

      if (self.hasUpvoted(directory.id)) {
        return; // Already voted
      }

      try {
        var { error } = await supabase
          .from("directory_votes")
          .insert({
            directory_id: directory.id,
            user_id: self.user.id,
          });

        if (error) {
          if (error.code === "23505") {
            // Already voted
            if (!self.userUpvotes.includes(directory.id)) {
              self.userUpvotes.push(directory.id);
            }
          } else {
            throw error;
          }
        } else {
          self.userUpvotes.push(directory.id);

          // Update count optimistically
          var dirIndex = self.filteredData.findIndex(function findDir(d) {
            return d.id === directory.id;
          });

          if (dirIndex !== -1) {
            self.filteredData[dirIndex].helpful_count = (self.filteredData[dirIndex].helpful_count || 0) + 1;
          }

          // Track in analytics
          if (window.pirsch) {
            window.pirsch("Directory Helpful Vote", {
              directory: directory.slug,
            });
          }
        }
      } catch (error) {
        console.error("Failed to upvote:", error);
        alert("Failed to submit vote. Please try again.");
      }
    },
  },
};
</script>
