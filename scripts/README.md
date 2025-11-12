# SEO Data Update Script

This directory contains scripts for maintaining SEO metrics for all directories in the awesome-directories project.

## Weekly SEO Update

The `update-seo-data.js` script automatically updates domain authority and ranking metrics for all directories using a cost-effective hybrid approach.

### Hybrid API Strategy

To keep costs under $100/month while checking 300+ domains weekly, we use:

1. **Open PageRank** (Primary baseline)
   - Free tier: 100 requests/day
   - Provides PageRank score (0-10 scale)
   - Used as fallback for all domains

2. **DataForSEO Backlinks API** (Primary metric)
   - Domain Rank (DR-like score similar to Ahrefs)
   - Backlink count and referring domains
   - Cost-effective bulk checking

3. **SEO Review Tools** (Selective Moz DA)
   - Only called for domains with significant changes (>5 point delta)
   - Provides official Moz Domain Authority
   - Keeps API costs minimal

### Metrics Tracked

For each directory, we store:

- `domain_rank` - Domain rating (0-100, from DataForSEO or Open PageRank)
- `page_rank` - Open PageRank score (0-10)
- `domain_authority` - Moz DA (0-100, selective updates only)
- `backlinks` - Total backlink count
- `referring_domains` - Number of unique referring domains
- `seo_updated_at` - ISO timestamp of last update

### Setup

1. **Get API Keys**

   - **Open PageRank**: Sign up at https://openpagerank.com (free tier)
   - **DataForSEO**: Register at https://dataforseo.com (pay-as-you-go)
   - **SEO Review Tools**: Get API key from https://www.seoreviewtools.com/api/

2. **Configure GitHub Secrets**

   Add these secrets to your repository (Settings → Secrets and variables → Actions):

   ```
   OPENPAGERANK_API_KEY=your_key_here
   DATAFORSEO_LOGIN=your_email@example.com
   DATAFORSEO_PASSWORD=your_password
   SEOREVIEWTOOLS_API_KEY=your_key_here
   ```

3. **Local Testing**

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

### GitHub Actions Workflow

The script runs automatically:

- **Schedule**: Every Sunday at 2 AM UTC
- **Manual**: Via workflow_dispatch in GitHub Actions UI
- **Commit**: Automatically commits changes with "[skip ci]" flag

### Cost Estimation (Monthly)

Based on 300 domains, weekly updates (4 runs/month):

| Service | Requests/Month | Est. Cost |
|---------|---------------|-----------|
| Open PageRank | 1,200 | $0 (free tier) |
| DataForSEO | 1,200 | $30-50 |
| SEO Review Tools | ~200 (selective) | $10-20 |
| **Total** | | **$40-70** |

### Caching Strategy

Results are cached in `data/seo-cache.json` to:

- Track historical changes
- Determine when to use expensive Moz DA API
- Provide fallback data if APIs fail
- Enable incremental updates

### Rate Limiting

Built-in protections:

- 1 second delay between API calls
- 2 second delay between batches
- Batch size: 100 domains
- Retry logic: 3 attempts with exponential backoff

### Troubleshooting

**Script fails with API errors**
- Check API key configuration
- Verify API quotas/limits not exceeded
- Check network connectivity

**No changes committed**
- Verify APIs returned valid data
- Check git diff output in Actions logs
- Ensure proper permissions for GitHub token

**Costs higher than expected**
- Review SEO Review Tools usage (should be selective)
- Check if significant change threshold needs adjustment
- Consider reducing update frequency

### Future Improvements

- [ ] Add email notifications for significant rank changes
- [ ] Implement trend tracking and analytics
- [ ] Add support for additional metrics (trust flow, citation flow)
- [ ] Create weekly summary reports
- [ ] Add A/B testing for different API combinations
