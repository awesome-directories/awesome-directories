import { ref, computed } from "vue";
import { supabase } from "../lib/supabase";

const directories = ref([]);
const loading = ref(false);
const error = ref(null);

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
const cache = ref({
  data: null,
  timestamp: null,
  totalCount: 0,
});

// Pagination state
const currentPage = ref(0);
const pageSize = ref(50); // Load 50 directories at a time
const hasMore = ref(true);
const loadingMore = ref(false);

export function useDirectories() {
  // Check if cache is still valid
  const isCacheValid = () => {
    if (!cache.value.timestamp || !cache.value.data) return false;
    const now = Date.now();
    return now - cache.value.timestamp < CACHE_DURATION;
  };

  // Clear cache manually
  const clearCache = () => {
    cache.value = {
      data: null,
      timestamp: null,
      totalCount: 0,
    };
    currentPage.value = 0;
    hasMore.value = true;
    directories.value = [];
  };

  // Fetch total count of directories
  const fetchTotalCount = async () => {
    const { count, error: countError } = await supabase
      .from("directories")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true);

    if (countError) throw countError;
    return count || 0;
  };

  // Fetch directories with pagination and caching
  const fetchDirectories = async (resetPagination = false, loadAll = false) => {
    // If resetting, clear cache and pagination
    if (resetPagination) {
      clearCache();
    }

    // Check cache first (only if not loading all)
    if (
      !loadAll &&
      isCacheValid() &&
      cache.value.data &&
      !resetPagination
    ) {
      directories.value = cache.value.data;
      // Restore pagination state
      const totalPages = Math.ceil(cache.value.totalCount / pageSize.value);
      currentPage.value = Math.min(
        Math.floor(directories.value.length / pageSize.value),
        totalPages - 1,
      );
      hasMore.value = directories.value.length < cache.value.totalCount;
      return;
    }

    loading.value = true;
    error.value = null;

    try {
      // Fetch total count
      const totalCount = await fetchTotalCount();
      cache.value.totalCount = totalCount;

      let data;
      if (loadAll) {
        // Load all directories at once (for stats page)
        const { data: allData, error: fetchError } = await supabase
          .from("directories")
          .select("*")
          .eq("is_active", true)
          .order("domain_rating", { ascending: false, nullsFirst: false })
          .order("helpful_count", { ascending: false });

        if (fetchError) throw fetchError;
        data = allData;
        hasMore.value = false;
      } else {
        // Fetch initial page only
        const from = 0;
        const to = pageSize.value - 1;

        const { data: pageData, error: fetchError } = await supabase
          .from("directories")
          .select("*")
          .eq("is_active", true)
          .order("domain_rating", { ascending: false, nullsFirst: false })
          .order("helpful_count", { ascending: false })
          .range(from, to);

        if (fetchError) throw fetchError;
        data = pageData;
        hasMore.value = (data?.length || 0) < totalCount;
      }

      directories.value = data || [];

      // Update cache
      cache.value = {
        data: directories.value,
        timestamp: Date.now(),
        totalCount: totalCount,
      };

      currentPage.value = 0;
    } catch (err) {
      error.value = err.message;
      console.error("Error fetching directories:", err);
    } finally {
      loading.value = false;
    }
  };

  // Load more directories (for lazy loading)
  const loadMore = async () => {
    if (!hasMore.value || loadingMore.value) return;

    loadingMore.value = true;
    error.value = null;

    try {
      const nextPage = currentPage.value + 1;
      const from = nextPage * pageSize.value;
      const to = from + pageSize.value - 1;

      const { data, error: fetchError } = await supabase
        .from("directories")
        .select("*")
        .eq("is_active", true)
        .order("domain_rating", { ascending: false, nullsFirst: false })
        .order("helpful_count", { ascending: false })
        .range(from, to);

      if (fetchError) throw fetchError;

      if (data && data.length > 0) {
        directories.value = [...directories.value, ...data];
        currentPage.value = nextPage;

        // Update cache with new data
        cache.value = {
          data: directories.value,
          timestamp: Date.now(),
          totalCount: cache.value.totalCount,
        };

        // Check if there's more data
        hasMore.value = directories.value.length < cache.value.totalCount;
      } else {
        hasMore.value = false;
      }
    } catch (err) {
      error.value = err.message;
      console.error("Error loading more directories:", err);
    } finally {
      loadingMore.value = false;
    }
  };

  const getDirectoryBySlug = async (slug) => {
    try {
      const { data, error: fetchError } = await supabase
        .from("directories")
        .select("*")
        .eq("slug", slug)
        .eq("is_active", true)
        .single();

      if (fetchError) throw fetchError;

      // Increment view count
      await supabase
        .from("directories")
        .update({ view_count: (data.view_count || 0) + 1 })
        .eq("id", data.id);

      return data;
    } catch (err) {
      console.error("Error fetching directory:", err);
      throw err;
    }
  };

  const filterDirectories = (filters) => {
    let filtered = [...directories.value];

    // Category filter
    if (filters.category && filters.category !== "All") {
      filtered = filtered.filter(
        (dir) => dir.categories && dir.categories.includes(filters.category),
      );
    }

    // Domain Rating filter
    if (filters.drRange && filters.drRange !== "All") {
      filtered = filtered.filter((dir) => {
        if (!dir.domain_rating) return false;

        switch (filters.drRange) {
          case "80+":
            return dir.domain_rating >= 80;
          case "70-79":
            return dir.domain_rating >= 70 && dir.domain_rating < 80;
          case "60-69":
            return dir.domain_rating >= 60 && dir.domain_rating < 70;
          case "<60":
            return dir.domain_rating < 60;
          default:
            return true;
        }
      });
    }

    // Link Type filter
    if (filters.linkType && filters.linkType !== "All") {
      if (filters.linkType === "Dofollow Only") {
        filtered = filtered.filter((dir) => dir.is_dofollow === true);
      }
    }

    // Pricing filter
    if (filters.pricing && filters.pricing !== "All") {
      filtered = filtered.filter((dir) => {
        if (!dir.pricing_type) return false;
        return dir.pricing_type.toLowerCase() === filters.pricing.toLowerCase();
      });
    }

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (dir) =>
          dir.name.toLowerCase().includes(searchLower) ||
          (dir.description &&
            dir.description.toLowerCase().includes(searchLower)) ||
          (dir.categories &&
            dir.categories.some((cat) =>
              cat.toLowerCase().includes(searchLower),
            )),
      );
    }

    return filtered;
  };

  const sortDirectories = (dirs, sortBy) => {
    const sorted = [...dirs];

    switch (sortBy) {
      case "Most Helpful":
        return sorted.sort(
          (a, b) => (b.helpful_count || 0) - (a.helpful_count || 0),
        );
      case "Highest DR":
        return sorted.sort((a, b) => {
          if (!a.domain_rating && !b.domain_rating) return 0;
          if (!a.domain_rating) return 1;
          if (!b.domain_rating) return -1;
          return b.domain_rating - a.domain_rating;
        });
      case "Newest":
        return sorted.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at),
        );
      case "Alphabetical":
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      default:
        return sorted;
    }
  };

  const uniqueCategories = computed(() => {
    const cats = new Set();
    directories.value.forEach((dir) => {
      if (dir.categories) {
        dir.categories.forEach((cat) => cats.add(cat));
      }
    });
    return ["All", ...Array.from(cats).sort()];
  });

  return {
    directories,
    loading,
    error,
    loadingMore,
    hasMore,
    currentPage,
    pageSize,
    totalCount: computed(() => cache.value.totalCount),
    cacheTimestamp: computed(() => cache.value.timestamp),
    fetchDirectories,
    getDirectoryBySlug,
    filterDirectories,
    sortDirectories,
    uniqueCategories,
    loadMore,
    clearCache,
    isCacheValid,
  };
}
