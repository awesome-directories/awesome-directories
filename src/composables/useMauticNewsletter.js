import { supabase } from "@/lib/supabase";

export function useMauticNewsletter() {
  const mauticBaseUrl = import.meta.env.VITE_MAUTIC_BASE_URL;
  const mauticFormId = import.meta.env.VITE_MAUTIC_FORM_ID;

  const subscribe = async ({
    email,
    name = "",
    product_name = "",
    source = "footer",
  }) => {
    try {
      // Store in our database
      const { error: dbError } = await supabase
        .from("newsletter_signups")
        .insert({
          email,
          name,
          product_name,
          source,
        });

      if (dbError && dbError.code !== "23505") {
        // Ignore unique constraint errors
        console.error("Database error:", dbError);
      }

      // Submit to Mautic if configured
      if (mauticBaseUrl && mauticFormId) {
        const formData = new FormData();
        formData.append("mauticform[email]", email);
        if (name) formData.append("mauticform[name]", name);
        if (product_name)
          formData.append("mauticform[product_name]", product_name);
        formData.append("mauticform[formId]", mauticFormId);

        await fetch(`${mauticBaseUrl}/form/submit?formId=${mauticFormId}`, {
          method: "POST",
          body: formData,
          mode: "no-cors", // Mautic may not support CORS
        });
      }

      return { success: true };
    } catch (error) {
      console.error("Newsletter subscription error:", error);
      throw error;
    }
  };

  return {
    subscribe,
  };
}
