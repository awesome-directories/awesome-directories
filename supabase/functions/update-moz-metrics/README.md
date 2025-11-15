# Update Moz Metrics Edge Function

This Supabase Edge Function automatically fetches and updates Moz Domain Authority metrics for all directories using the Apify Moz Domain Authority Checker actor.

## Features

- Fetches DA, spam score, linking domains, and ranking keywords
- Processes directories in batches (max 3 per Apify call due to cost optimization)
- Updates Supabase database with latest metrics
- Includes retry logic and error handling
- Can be triggered manually or via scheduled automation

## Environment Variables

Required environment variables (set in Supabase Dashboard → Edge Functions → Secrets):

```bash
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
APIFY_API_TOKEN=your-apify-api-token
FUNCTION_SECRET=your-secret-key  # Optional but recommended
```

## Setup

### 1. Deploy the Function

```bash
# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Deploy the function
supabase functions deploy update-moz-metrics
```

### 2. Set Environment Variables

```bash
# Set Apify token
supabase secrets set APIFY_API_TOKEN=your_apify_token

# Set function secret for authorization
supabase secrets set FUNCTION_SECRET=your_random_secret_key
```

### 3. Test the Function

```bash
# Get your function URL from Supabase dashboard
curl -X POST https://your-project-ref.supabase.co/functions/v1/update-moz-metrics \
  -H "Authorization: Bearer YOUR_FUNCTION_SECRET" \
  -H "Content-Type: application/json"
```

## Usage

### Manual Invocation

Invoke the function with optional parameters:

```bash
curl -X POST https://your-project-ref.supabase.co/functions/v1/update-moz-metrics \
  -H "Authorization: Bearer YOUR_FUNCTION_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "limit": 10,
    "batchSize": 3
  }'
```

**Parameters:**
- `limit` (optional): Number of directories to process (default: all)
- `batchSize` (optional): Domains per Apify call, max 3 (default: 3)

### Scheduled via GitHub Actions

Create `.github/workflows/update-moz-metrics.yml`:

```yaml
name: Update Moz Metrics

on:
  schedule:
    - cron: '0 2 * * 0'  # Every Sunday at 2 AM UTC
  workflow_dispatch:  # Allow manual trigger

jobs:
  update-metrics:
    runs-on: ubuntu-latest
    steps:
      - name: Call Edge Function
        run: |
          curl -X POST ${{ secrets.SUPABASE_FUNCTION_URL }}/update-moz-metrics \
            -H "Authorization: Bearer ${{ secrets.FUNCTION_SECRET }}" \
            -H "Content-Type: application/json"
```

Add these secrets to your GitHub repository:
- `SUPABASE_FUNCTION_URL`: `https://your-project-ref.supabase.co/functions/v1`
- `FUNCTION_SECRET`: Your function secret

### Scheduled via pg_cron (Alternative)

You can also use Supabase's pg_cron extension:

```sql
-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule weekly updates (Sundays at 2 AM UTC)
SELECT cron.schedule(
  'weekly-moz-update',
  '0 2 * * 0',
  $$
  SELECT
    net.http_post(
      url := 'https://your-project-ref.supabase.co/functions/v1/update-moz-metrics',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer YOUR_FUNCTION_SECRET'
      ),
      body := jsonb_build_object('limit', 30)
    );
  $$
);
```

## Response Format

Success response:

```json
{
  "success": true,
  "totalDirectories": 100,
  "totalUpdated": 95,
  "totalFailed": 5,
  "errors": [
    "example.com: Domain not found",
    "test.com: API timeout"
  ]
}
```

Error response:

```json
{
  "success": false,
  "error": "Missing APIFY_API_TOKEN environment variable"
}
```

## Database Schema

The function updates the following fields in the `directories` table:

- `domain_rating` (INTEGER): Moz Domain Authority (0-100)
- `spam_score` (INTEGER): Moz Spam Score (0-100)
- `linking_root_domains` (INTEGER): Number of unique linking domains
- `ranking_keywords` (INTEGER): Number of ranking keywords
- `moz_data` (JSONB): Full Apify response for reference
- `last_dr_check` (TIMESTAMP): Last update timestamp

## Cost Optimization

- The function processes directories with oldest `last_dr_check` first
- Uses `batchSize: 3` to stay within Apify's free/cheap tier
- Uses `useProxy: false` to minimize costs
- Uses `maxRetries: 3` instead of 10 to reduce compute time
- Uses `DATACENTER` proxy type (10x cheaper than RESIDENTIAL)

**Estimated costs:**
- Apify: ~$2.30 per 1,000 domains
- For 388 directories: ~$0.90 per run
- Weekly runs: ~$3.60/month

## Troubleshooting

### Function times out

If processing many directories, consider:
- Reducing the `limit` parameter
- Running multiple smaller batches
- Increasing the function timeout in Supabase dashboard

### Apify rate limiting

If you hit rate limits:
- Increase delay between batches (currently 2 seconds)
- Reduce `batchSize` to 1 or 2
- Spread updates across multiple days

### Database update fails

Check RLS policies:
- The function uses the service role key which bypasses RLS
- Ensure the service role key is correctly set

## Local Development

Test locally with Supabase CLI:

```bash
# Start local Supabase
supabase start

# Serve the function locally
supabase functions serve update-moz-metrics --env-file .env.local

# Test it
curl -X POST http://localhost:54321/functions/v1/update-moz-metrics \
  -H "Authorization: Bearer YOUR_FUNCTION_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"limit": 3}'
```

Create `.env.local`:

```
SUPABASE_URL=http://localhost:54321
SUPABASE_SERVICE_ROLE_KEY=your-local-service-role-key
APIFY_API_TOKEN=your-apify-token
FUNCTION_SECRET=test-secret
```

## Monitoring

Monitor function execution in:
- Supabase Dashboard → Edge Functions → Logs
- Check `last_dr_check` timestamp in database
- Review error messages in function response

## Related Files

- Migration: `supabase/migrations/003_add_moz_metrics.sql`
- Function: `supabase/functions/update-moz-metrics/index.ts`
- GitHub Action: `.github/workflows/update-moz-metrics.yml` (to be created)
