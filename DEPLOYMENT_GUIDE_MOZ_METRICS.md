# Deployment Guide: Moz Metrics Edge Function

This guide walks you through deploying the automated Moz metrics update system.

## Overview

The system consists of:
1. **Database Migration**: Adds new columns for Moz metrics
2. **Edge Function**: Fetches and updates metrics via Apify
3. **GitHub Action**: Schedules weekly automatic updates

## Prerequisites

- Supabase project with CLI installed
- Apify account with API token
- GitHub repository with Actions enabled

## Step 1: Apply Database Migration

### Option A: Via Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Open the file `supabase/migrations/003_add_moz_metrics.sql`
4. Copy and paste the SQL into the editor
5. Click **Run** to execute the migration

### Option B: Via Supabase CLI

```bash
# Make sure you're in the project directory
cd /path/to/awesome-directories

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Push the migration
supabase db push
```

### Verify Migration

Run this query in the SQL Editor to verify:

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'directories'
  AND column_name IN ('spam_score', 'linking_root_domains', 'ranking_keywords', 'moz_data');
```

You should see all four columns listed.

## Step 2: Get Apify API Token

1. Sign up or log in to [Apify](https://apify.com)
2. Go to **Settings** → **Integrations** → **API tokens**
3. Create a new token or copy your existing token
4. Save it securely (you'll need it in the next step)

**Note:** The Moz Domain Authority Checker actor costs ~$2.30 per 1,000 domains. With 388 directories, each run costs ~$0.90.

## Step 3: Deploy Edge Function

### Deploy via Supabase CLI

```bash
# Make sure you're logged in and linked (from Step 1)

# Deploy the function
supabase functions deploy update-moz-metrics

# Set the Apify API token as a secret
supabase secrets set APIFY_API_TOKEN=your_apify_token_here

# Set a function secret for authorization (generate a random string)
supabase secrets set FUNCTION_SECRET=$(openssl rand -hex 32)

# Save the FUNCTION_SECRET somewhere safe - you'll need it for GitHub Actions
```

### Get Your Function URL

Your function URL will be:
```
https://your-project-ref.supabase.co/functions/v1/update-moz-metrics
```

Replace `your-project-ref` with your actual Supabase project reference ID.

### Test the Function

```bash
# Test with a small limit
curl -X POST https://your-project-ref.supabase.co/functions/v1/update-moz-metrics \
  -H "Authorization: Bearer YOUR_FUNCTION_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"limit": 3}'
```

Expected response:
```json
{
  "success": true,
  "totalDirectories": 3,
  "totalUpdated": 3,
  "totalFailed": 0
}
```

## Step 4: Configure GitHub Actions

### Add GitHub Secrets

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** for each:

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `SUPABASE_URL` | `https://your-project-ref.supabase.co` | Your Supabase project URL |
| `FUNCTION_SECRET` | (from Step 3) | The secret you generated for function auth |

### Enable GitHub Actions

1. Go to **Actions** tab in your repository
2. If Actions are disabled, click **Enable Actions**
3. You should see the "Update Moz Metrics" workflow listed

### Test the Workflow

1. Go to **Actions** → **Update Moz Metrics**
2. Click **Run workflow** (on the right)
3. Optionally set parameters:
   - **limit**: Try `3` for testing
   - **batch_size**: Leave as `3`
4. Click **Run workflow**
5. Wait for the workflow to complete
6. Check the summary for results

## Step 5: Verify Everything Works

### Check Database Updates

Run this query in Supabase SQL Editor:

```sql
SELECT
  name,
  domain_rating,
  spam_score,
  linking_root_domains,
  ranking_keywords,
  last_dr_check
FROM directories
WHERE last_dr_check IS NOT NULL
ORDER BY last_dr_check DESC
LIMIT 10;
```

You should see recently updated records with populated metrics.

### Schedule Configuration

The workflow is configured to run:
- **Automatically**: Every Sunday at 2 AM UTC
- **Manually**: Via GitHub Actions "Run workflow" button

To change the schedule, edit `.github/workflows/update-moz-metrics.yml`:

```yaml
schedule:
  - cron: '0 2 * * 0'  # Change this cron expression
```

Common schedules:
- Daily: `0 2 * * *`
- Weekly (Monday): `0 2 * * 1`
- Monthly (1st): `0 2 1 * *`

## Cost Estimation

### Apify Costs

- **Price**: $2.30 per 1,000 domains
- **Your directories**: 388
- **Cost per run**: ~$0.90
- **Weekly runs**: ~$3.60/month
- **Monthly runs**: ~$46.80/year

### Supabase Costs

- Edge function invocations: Included in free tier (500K/month)
- Database storage: Minimal impact
- Likely **free** on Supabase free tier

## Monitoring

### View Logs

**Edge Function Logs:**
1. Go to Supabase Dashboard
2. Navigate to **Edge Functions** → **update-moz-metrics**
3. Click **Logs** tab

**GitHub Actions Logs:**
1. Go to **Actions** tab
2. Click on a workflow run
3. Expand the "Update Moz Metrics via Edge Function" step

### Monitor Metrics

Create a query to track update status:

```sql
SELECT
  COUNT(*) as total_directories,
  COUNT(last_dr_check) as directories_with_metrics,
  COUNT(*) - COUNT(last_dr_check) as pending_updates,
  MAX(last_dr_check) as most_recent_update,
  MIN(last_dr_check) as oldest_update
FROM directories
WHERE is_active = true;
```

## Troubleshooting

### Edge Function Returns 401 Unauthorized

- Check that `FUNCTION_SECRET` matches in both Supabase and GitHub secrets
- Verify the Authorization header format: `Bearer YOUR_SECRET`

### Apify Actor Fails

- Check your Apify account balance
- Verify `APIFY_API_TOKEN` is correct
- Check Apify dashboard for error details

### Database Updates Fail

- Verify migration was applied successfully
- Check that `SUPABASE_SERVICE_ROLE_KEY` secret is set
- Review RLS policies (service role should bypass them)

### GitHub Action Fails

- Check GitHub Actions logs for detailed error messages
- Verify all required secrets are set
- Try manually triggering with a small `limit` (e.g., 3)

### Function Times Out

If you have many directories:
- Reduce the `limit` parameter
- Split updates across multiple runs
- Increase function timeout in Supabase dashboard (Edge Functions → Settings)

## Advanced Configuration

### Process Only Outdated Directories

Modify the function query to skip recent updates:

Edit `supabase/functions/update-moz-metrics/index.ts`:

```typescript
// Add this filter
.or('last_dr_check.is.null,last_dr_check.lt.' +
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
```

This only updates directories older than 7 days.

### Batch Updates Across Multiple Days

Instead of updating all directories weekly, split them across the week:

```yaml
# Monday - First 100
- cron: '0 2 * * 1'
  limit: 100

# Wednesday - Next 100
- cron: '0 2 * * 3'
  limit: 100

# Friday - Remaining
- cron: '0 2 * * 5'
  limit: 200
```

### Use pg_cron Instead of GitHub Actions

```sql
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
      body := jsonb_build_object('batchSize', 3)
    );
  $$
);
```

## Maintenance

### Update Apify Token

```bash
supabase secrets set APIFY_API_TOKEN=new_token_here
```

### Disable Automatic Updates

Comment out the schedule in `.github/workflows/update-moz-metrics.yml`:

```yaml
# schedule:
#   - cron: '0 2 * * 0'
```

### Delete Old Moz Data

If you want to clean up old data:

```sql
UPDATE directories
SET moz_data = NULL
WHERE last_dr_check < NOW() - INTERVAL '90 days';
```

## Support

- Edge Function README: `supabase/functions/update-moz-metrics/README.md`
- Apify Actor: https://apify.com/jdtpnjtp/moz-domain-authority-checker
- Supabase Docs: https://supabase.com/docs/guides/functions

## Next Steps

After successful deployment:

1. ✅ Wait for first scheduled run (or trigger manually)
2. ✅ Monitor the first few runs for errors
3. ✅ Adjust schedule/limits based on your needs
4. ✅ Update your frontend to display the new metrics (spam_score, linking_root_domains, etc.)
5. ✅ Set up alerting for failed runs (optional)

---

**Deployment complete!** Your directories will now automatically receive weekly Moz metric updates. 🎉
