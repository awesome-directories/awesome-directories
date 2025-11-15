CREATE EXTENSION IF NOT EXISTS pg_cron;

GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cron TO postgres;

CREATE OR REPLACE FUNCTION trigger_seo_update()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  function_url TEXT;
  function_secret TEXT;
  response TEXT;
BEGIN
  function_url := current_setting('app.settings.supabase_url', true) || '/functions/v1/update-seo-data';
  function_secret := current_setting('app.settings.function_secret', true);

  SELECT content::text INTO response
  FROM http((
    'POST',
    function_url,
    ARRAY[
      http_header('Authorization', 'Bearer ' || function_secret),
      http_header('Content-Type', 'application/json')
    ],
    'application/json',
    '{"limit": 50, "batchSize": 10}'
  )::http_request);

  RAISE NOTICE 'SEO update triggered: %', response;
END;
$$;

SELECT cron.schedule(
  'weekly-seo-update',
  '0 2 * * 0',
  $$SELECT trigger_seo_update();$$
);

COMMENT ON FUNCTION trigger_seo_update IS 'Triggers the update-seo-data edge function to refresh SEO metrics';
