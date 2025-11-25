import { ref } from "vue";
import { supabase } from "@/lib/supabase-client";
import { getUserId } from "@/utils/auth";
import log from "@/lib/logger";

/**
 * Composable for managing user projects and project submissions
 */
export function useProjects() {
  const isLoading = ref(false);
  const error = ref(null);
  const projects = ref([]);
  const currentProject = ref(null);
  const projectSubmissions = ref([]);

  /**
   * Load all projects for the current user
   * @param {Object} user - Current user object
   * @returns {Promise<Array>}
   */
  async function loadProjects(user) {
    isLoading.value = true;
    error.value = null;

    try {
      const userId = getUserId(user);
      if (!userId) {
        projects.value = [];
        return [];
      }

      const { data, error: fetchError } = await supabase
        .from("projects")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      projects.value = data || [];

      // Set first project as current if none selected
      if (!currentProject.value && projects.value.length > 0) {
        currentProject.value = projects.value[0];
      }

      log.info(`Loaded ${projects.value.length} projects`);
      return projects.value;
    } catch (err) {
      log.error("Failed to load projects:", err);
      error.value = err.message;
      return [];
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Create a new project
   * @param {Object} user - Current user object
   * @param {Object} projectData - Project data (name, url, description, logo_url)
   * @returns {Promise<{success: boolean, project?: Object, error?: string}>}
   */
  async function createProject(user, projectData) {
    isLoading.value = true;
    error.value = null;

    try {
      const userId = getUserId(user);
      if (!userId) {
        throw new Error("User must be authenticated");
      }

      const { data, error: insertError } = await supabase
        .from("projects")
        .insert({
          user_id: userId,
          name: projectData.name,
          url: projectData.url || null,
          description: projectData.description || null,
          logo_url: projectData.logo_url || null,
        })
        .select()
        .single();

      if (insertError) {
        if (insertError.code === "23505") {
          throw new Error("You already have a project with this name");
        }
        throw insertError;
      }

      projects.value = [data, ...projects.value];
      currentProject.value = data;

      log.info(`Created project: ${data.name}`);
      return { success: true, project: data };
    } catch (err) {
      log.error("Failed to create project:", err);
      error.value = err.message;
      return { success: false, error: err.message };
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Update an existing project
   * @param {string} projectId - Project UUID
   * @param {Object} updates - Fields to update
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async function updateProject(projectId, updates) {
    isLoading.value = true;
    error.value = null;

    try {
      const { data, error: updateError } = await supabase
        .from("projects")
        .update({
          name: updates.name,
          url: updates.url || null,
          description: updates.description || null,
          logo_url: updates.logo_url || null,
        })
        .eq("id", projectId)
        .select()
        .single();

      if (updateError) throw updateError;

      // Update local state
      const index = projects.value.findIndex((p) => p.id === projectId);
      if (index !== -1) {
        projects.value[index] = data;
      }
      if (currentProject.value?.id === projectId) {
        currentProject.value = data;
      }

      log.info(`Updated project: ${data.name}`);
      return { success: true };
    } catch (err) {
      log.error("Failed to update project:", err);
      error.value = err.message;
      return { success: false, error: err.message };
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Delete a project
   * @param {string} projectId - Project UUID
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async function deleteProject(projectId) {
    isLoading.value = true;
    error.value = null;

    try {
      const { error: deleteError } = await supabase
        .from("projects")
        .delete()
        .eq("id", projectId);

      if (deleteError) throw deleteError;

      // Update local state
      projects.value = projects.value.filter((p) => p.id !== projectId);
      if (currentProject.value?.id === projectId) {
        currentProject.value = projects.value[0] || null;
      }

      log.info(`Deleted project: ${projectId}`);
      return { success: true };
    } catch (err) {
      log.error("Failed to delete project:", err);
      error.value = err.message;
      return { success: false, error: err.message };
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Load submissions for a specific project
   * @param {string} projectId - Project UUID
   * @returns {Promise<Array>}
   */
  async function loadProjectSubmissions(projectId) {
    if (!projectId) {
      projectSubmissions.value = [];
      return [];
    }

    isLoading.value = true;
    error.value = null;

    try {
      const { data, error: fetchError } = await supabase
        .from("project_submissions")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      projectSubmissions.value = data || [];
      log.info(`Loaded ${projectSubmissions.value.length} submissions for project ${projectId}`);
      return projectSubmissions.value;
    } catch (err) {
      log.error("Failed to load project submissions:", err);
      error.value = err.message;
      return [];
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Add or update a submission tracking entry for a directory
   * @param {string} projectId - Project UUID
   * @param {string} directoryId - Directory UUID
   * @param {Object} submissionData - Submission data (status, submission_link, notes)
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async function upsertSubmission(projectId, directoryId, submissionData) {
    isLoading.value = true;
    error.value = null;

    try {
      const { data, error: upsertError } = await supabase
        .from("project_submissions")
        .upsert({
          project_id: projectId,
          directory_id: directoryId,
          status: submissionData.status || "not_started",
          submission_link: submissionData.submission_link || null,
          notes: submissionData.notes || null,
          submitted_at: submissionData.status === "submitted" ? new Date().toISOString() : null,
        }, {
          onConflict: "project_id,directory_id",
        })
        .select()
        .single();

      if (upsertError) throw upsertError;

      // Update local state
      const index = projectSubmissions.value.findIndex(
        (s) => s.project_id === projectId && s.directory_id === directoryId
      );
      if (index !== -1) {
        projectSubmissions.value[index] = data;
      } else {
        projectSubmissions.value = [data, ...projectSubmissions.value];
      }

      log.info(`Updated submission for directory ${directoryId} in project ${projectId}`);
      return { success: true, submission: data };
    } catch (err) {
      log.error("Failed to upsert submission:", err);
      error.value = err.message;
      return { success: false, error: err.message };
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Update submission status
   * @param {string} submissionId - Submission UUID
   * @param {string} status - New status
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async function updateSubmissionStatus(submissionId, status) {
    isLoading.value = true;
    error.value = null;

    try {
      const updates = {
        status,
        updated_at: new Date().toISOString(),
      };

      // Set submitted_at if status is "submitted"
      if (status === "submitted") {
        updates.submitted_at = new Date().toISOString();
      }

      const { data, error: updateError } = await supabase
        .from("project_submissions")
        .update(updates)
        .eq("id", submissionId)
        .select()
        .single();

      if (updateError) throw updateError;

      // Update local state
      const index = projectSubmissions.value.findIndex((s) => s.id === submissionId);
      if (index !== -1) {
        projectSubmissions.value[index] = data;
      }

      log.info(`Updated submission status to ${status}`);
      return { success: true };
    } catch (err) {
      log.error("Failed to update submission status:", err);
      error.value = err.message;
      return { success: false, error: err.message };
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Update submission link
   * @param {string} submissionId - Submission UUID
   * @param {string} link - Submission URL
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async function updateSubmissionLink(submissionId, link) {
    isLoading.value = true;
    error.value = null;

    try {
      const { data, error: updateError } = await supabase
        .from("project_submissions")
        .update({
          submission_link: link || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", submissionId)
        .select()
        .single();

      if (updateError) throw updateError;

      // Update local state
      const index = projectSubmissions.value.findIndex((s) => s.id === submissionId);
      if (index !== -1) {
        projectSubmissions.value[index] = data;
      }

      log.info(`Updated submission link`);
      return { success: true };
    } catch (err) {
      log.error("Failed to update submission link:", err);
      error.value = err.message;
      return { success: false, error: err.message };
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Delete a submission tracking entry
   * @param {string} submissionId - Submission UUID
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async function deleteSubmission(submissionId) {
    isLoading.value = true;
    error.value = null;

    try {
      const { error: deleteError } = await supabase
        .from("project_submissions")
        .delete()
        .eq("id", submissionId);

      if (deleteError) throw deleteError;

      // Update local state
      projectSubmissions.value = projectSubmissions.value.filter((s) => s.id !== submissionId);

      log.info(`Deleted submission: ${submissionId}`);
      return { success: true };
    } catch (err) {
      log.error("Failed to delete submission:", err);
      error.value = err.message;
      return { success: false, error: err.message };
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Get submission stats for a project
   * @param {string} projectId - Project UUID
   * @returns {Object} Stats object with counts by status
   */
  function getSubmissionStats(projectId) {
    const submissions = projectSubmissions.value.filter(
      (s) => s.project_id === projectId
    );

    return {
      total: submissions.length,
      not_started: submissions.filter((s) => s.status === "not_started").length,
      in_progress: submissions.filter((s) => s.status === "in_progress").length,
      submitted: submissions.filter((s) => s.status === "submitted").length,
      approved: submissions.filter((s) => s.status === "approved").length,
      rejected: submissions.filter((s) => s.status === "rejected").length,
      featured: submissions.filter((s) => s.status === "featured").length,
    };
  }

  return {
    isLoading,
    error,
    projects,
    currentProject,
    projectSubmissions,
    loadProjects,
    createProject,
    updateProject,
    deleteProject,
    loadProjectSubmissions,
    upsertSubmission,
    updateSubmissionStatus,
    updateSubmissionLink,
    deleteSubmission,
    getSubmissionStats,
  };
}
