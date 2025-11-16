import { supabase, type Directory } from "./supabase";

/**
 * Fetch all directories at build time
 * This replaces the paginated approach from the Vue version
 */
export async function getAllDirectories(): Promise<Directory[]> {
  try {
    const { data, error } = await supabase
      .from("directories")
      .select("*")
      .eq("is_active", true)
      .order("domain_rating", { ascending: false, nullsFirst: false })
      .order("helpful_count", { ascending: false });

    if (error) {
      console.error("Error fetching directories:", error);
      throw error;
    }

    return data || [];
  } catch (err) {
    console.error("Failed to fetch directories:", err);
    return [];
  }
}

/**
 * Get a single directory by slug
 */
export async function getDirectoryBySlug(
  slug: string,
): Promise<Directory | null> {
  try {
    const { data, error } = await supabase
      .from("directories")
      .select("*")
      .eq("slug", slug)
      .eq("is_active", true)
      .single();

    if (error) {
      console.error("Error fetching directory:", error);
      return null;
    }

    return data;
  } catch (err) {
    console.error("Failed to fetch directory:", err);
    return null;
  }
}

/**
 * Get all unique categories from directories
 */
export function getUniqueCategories(directories: Directory[]): string[] {
  const categories = new Set<string>();
  directories.forEach((dir) => {
    if (dir.categories) {
      dir.categories.forEach((cat) => categories.add(cat));
    }
  });
  return ["All", ...Array.from(categories).sort()];
}

/**
 * Get total count of directories
 */
export async function getTotalDirectoriesCount(): Promise<number> {
  try {
    const { count, error } = await supabase
      .from("directories")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true);

    if (error) throw error;
    return count || 0;
  } catch (err) {
    console.error("Failed to fetch count:", err);
    return 0;
  }
}

/**
 * Get count of directories with DR ratings
 */
export function getDirectoriesWithDRCount(directories: Directory[]): number {
  return directories.filter((d) => d.domain_rating !== null).length;
}
