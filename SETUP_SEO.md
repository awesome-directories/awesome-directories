# SEO Data Update Setup Guide

This guide will help you set up automated weekly SEO data updates for your awesome-directories project.

## Quick Start

### 1. Get Your API Keys

You'll need three API services for the hybrid approach (estimated $40-70/month for 300+ domains):

#### Open PageRank (FREE)
1. Visit https://openpagerank.com
2. Sign up for a free account
3. Get your API key from the dashboard
4. Free tier: 100 requests/day (sufficient for weekly updates)

#### DataForSEO (Primary - ~$30-50/month)
1. Visit https://dataforseo.com
2. Create an account
3. Add $50 credit to start (pay-as-you-go)
4. Note your login email and password
5. Cost: ~$0.04 per domain check

#### SEO Review Tools (Selective - ~$10-20/month)
1. Visit https://www.seoreviewtools.com/api/
2. Choose the $75/month plan (or appropriate tier)
3. Get your API key
4. This is used selectively (only ~15% of domains per update)

### 2. Configure GitHub Secrets

Go to your repository → Settings → Secrets and variables → Actions → New repository secret

Add these four secrets:

| Secret Name | Value |
|-------------|-------|
| `OPENPAGERANK_API_KEY` | Your Open PageRank API key |
| `DATAFORSEO_LOGIN` | Your DataForSEO login email |
| `DATAFORSEO_PASSWORD` | Your DataForSEO password |
| `SEOREVIEWTOOLS_API_KEY` | Your SEO Review Tools API key |

### 3. Verify GitHub Actions Workflow

The workflow is already configured in `.github/workflows/ci.yml`:

- **Automatic**: Runs every Sunday at 2 AM UTC
- **Manual**: Can trigger via Actions tab → "ci" workflow → "Run workflow"

### 4. Test Locally (Optional)

Create a `.env` file in the project root:

```bash
OPENPAGERANK_API_KEY=your_key_here
DATAFORSEO_LOGIN=your_email@example.com
DATAFORSEO_PASSWORD=your_password
SEOREVIEWTOOLS_API_KEY=your_key_here
```

Run the script:

```bash
npm run update-seo
```

## How It Works

### Hybrid Strategy

The script uses a smart multi-tier approach to minimize costs:

1. **Open PageRank** - Checks all domains for baseline PageRank (free)
2. **DataForSEO** - Checks all domains for Domain Rank + backlink data (~$30-50/month)
3. **SEO Review Tools** - Only checks domains with significant changes >5 points (~$10-20/month)

This hybrid approach keeps total costs around **$40-70/month** instead of $200+ for checking Moz DA on all domains.

### Data Stored

For each directory, the following SEO metrics are added/updated:

```json
{
  "domain_rank": 45,           // 0-100 scale (from DataForSEO)
  "page_rank": 6.2,            // 0-10 scale (from Open PageRank)
  "domain_authority": 52,      // 0-100 scale (from Moz, selective)
  "backlinks": 12500,          // Total backlinks
  "referring_domains": 850,    // Unique referring domains
  "seo_updated_at": "2025-11-12T02:00:00.000Z"
}
```

### Caching

Results are cached in `data/seo-cache.json`:
- Tracks historical scores
- Determines when to use expensive Moz DA API
- Provides fallback if APIs fail
- Enables incremental updates

## Cost Optimization Tips

### Start with 2 APIs (Under $50/month)

If budget is tight, start with just:
1. **Open PageRank** (free) - baseline for all
2. **DataForSEO** ($30-50) - primary metric

Skip SEO Review Tools initially. You can add it later when you want official Moz DA.

### Reduce Update Frequency

- **Weekly** (recommended): ~$40-70/month
- **Bi-weekly**: ~$20-35/month
- **Monthly**: ~$10-20/month

Edit `.github/workflows/ci.yml` cron schedule:
```yaml
- cron: "0 2 1,15 * *"  # Bi-weekly (1st and 15th)
- cron: "0 2 1 * *"     # Monthly (1st of month)
```

### Batch Processing

The script already implements:
- 100 domains per batch
- 1 second delay between requests
- 2 second delay between batches
- 3 retry attempts with exponential backoff

This prevents rate limit issues and optimizes API usage.

## Troubleshooting

### "API Key Not Configured" Warnings

**Symptom**: Script runs but shows warnings about missing API keys

**Solution**:
- Verify secrets are added in GitHub
- Check secret names match exactly (case-sensitive)
- For local testing, ensure `.env` file exists

### No Changes Committed

**Symptom**: Workflow runs successfully but no commit is created

**Possible causes**:
1. No data actually changed (expected behavior)
2. APIs failed to return data
3. All domains already have current scores

**Check**: Review the workflow logs for API response details

### High API Costs

**Symptom**: Monthly bill higher than expected

**Solution**:
- Check DataForSEO usage dashboard
- Verify SEO Review Tools is only hitting ~15-20% of domains
- Consider reducing `SIGNIFICANT_CHANGE_THRESHOLD` in script (currently 5)
- Reduce update frequency

### Script Timeout

**Symptom**: GitHub Actions job times out

**Solution**:
- This shouldn't happen with 300 domains (estimated 15-20 min runtime)
- If you have 1000+ domains, consider splitting into multiple jobs
- Increase `BATCH_SIZE` in script (currently 100)

## Monitoring

### View Results

After each run, check:

1. **GitHub Actions Log**: Actions tab → Latest "ci" workflow
2. **Updated Files**:
   - `supabase/seeds/directories.json` - Updated directory data
   - `data/seo-cache.json` - Historical cache
3. **Commit Message**: "chore: update weekly SEO data [skip ci]"

### Key Metrics

Look for in the workflow log summary:
- Total directories processed
- Unique domains checked
- Updated entries
- Average domain rank
- API success rates

## Alternative Budget Options

If you need to go even cheaper (under $30/month):

### Free + Selective Paid
- **Open PageRank** (free) - all domains
- **DataForSEO** - only top 100 directories monthly (~$5)
- Total: ~$5-10/month

Edit the script to filter domains before API calls:
```javascript
// In main(), before processing
const topDomains = uniqueDomains
  .sort((a, b) => cache[b]?.domainRank - cache[a]?.domainRank)
  .slice(0, 100);
```

### Community Approach
- Use only **Open PageRank** (free)
- Ask directory owners to submit their Ahrefs/Moz scores
- Manual verification for top directories
- Total: $0/month

## Support

For issues or questions:
- Review `/scripts/README.md` for technical details
- Check DataForSEO docs: https://docs.dataforseo.com
- Open PageRank docs: https://www.domcop.com/openpagerank/documentation
- SEO Review Tools: https://www.seoreviewtools.com/api-documentation/

## Next Steps

1. ✅ Set up API keys as GitHub secrets
2. ✅ Run manual test via GitHub Actions
3. ✅ Verify data is committed correctly
4. ✅ Monitor first automated weekly run
5. 📊 Add SEO scores to your website UI (future enhancement)
