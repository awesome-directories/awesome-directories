import { ref, computed } from "vue";
import { supabase } from "../lib/supabase";

const directories = ref([]);
const loading = ref(false);
const error = ref(null);

export function useDirectories() {
  const fetchDirectories = async () => {
    loading.value = true;
    error.value = null;

    try {
      const { data, error: fetchError } = await supabase
        .from("directories")
        .select("*")
        .eq("is_active", true)
        .order("domain_rating", { ascending: false, nullsFirst: false })
        .order("helpful_count", { ascending: false });

      if (fetchError) throw fetchError;

      directories.value = data || [];
    } catch (err) {
      error.value = err.message;
      console.error("Error fetching directories:", err);
    } finally {
      loading.value = false;
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
    fetchDirectories,
    getDirectoryBySlug,
    filterDirectories,
    sortDirectories,
    uniqueCategories,
  };
}
