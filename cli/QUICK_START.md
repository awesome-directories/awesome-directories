# Quick Start Guide - Awesome Directories CLI

## 🚀 Get Started in 5 Minutes

### Step 1: Test the CLI Locally

```bash
cd cli/

# Build the CLI
make build
# or
go build -o awesome-directories ./cmd/awesome-directories

# Test it works
./awesome-directories --version
./awesome-directories search "saas"
```

### Step 2: Create Homebrew Tap Repository

```bash
# Create a new public GitHub repository
gh repo create awesome-directories/homebrew-tap --public --description "Homebrew tap for awesome-directories CLI"

# Initialize with README
cd /tmp
git clone https://github.com/awesome-directories/homebrew-tap.git
cd homebrew-tap
echo "# Homebrew Tap for Awesome Directories CLI" > README.md
echo "" >> README.md
echo "## Installation" >> README.md
echo "" >> README.md
echo "\`\`\`bash" >> README.md
echo "brew tap awesome-directories/tap" >> README.md
echo "brew install awesome-directories" >> README.md
echo "\`\`\`" >> README.md

git add README.md
git commit -m "chore: initialize homebrew tap"
git push origin main

# Go back to your CLI project
cd /path/to/awesome-directories/cli
```

### Step 3: Add GitHub Token as Secret

```bash
# Generate a GitHub personal access token with 'repo' scope
# Go to: https://github.com/settings/tokens/new
# Token name: HOMEBREW_TAP_GITHUB_TOKEN
# Scopes: repo (all)

# Add to repository secrets
gh secret set HOMEBREW_TAP_GITHUB_TOKEN
# Paste your token when prompted

# Verify it's set
gh secret list
```

### Step 4: Create First Release

```bash
# Make sure you're in the cli directory
cd cli/

# Tag the release
git tag -a v1.0.0 -m "feat: initial release of awesome-directories CLI"

# Push the tag (this triggers GitHub Actions)
git push origin v1.0.0

# Watch the release build
gh run watch
```

This will:
- ✅ Build binaries for macOS, Linux, Windows
- ✅ Create GitHub release with artifacts
- ✅ Update Homebrew tap with formula
- ✅ Generate changelog

### Step 5: Test Installation via Homebrew

```bash
# Add your tap
brew tap awesome-directories/tap

# Install the CLI
brew install awesome-directories

# Test it
awesome-directories --version
awesome-directories search "developer tools"
awesome-directories filter --dr-min 70 --pricing free
awesome-directories export --format csv --output top-dirs.csv --dr-min 60
```

### Step 6: Share with the Community

```bash
# Tweet about it
"🚀 Just shipped awesome-directories CLI!

Search 388+ curated directories for your SaaS launch from the terminal.

Install: brew install awesome-directories/tap/awesome-directories

#buildinpublic #indiedev #CLI"

# Post on Reddit
- r/SideProject
- r/golang
- r/commandline
- r/SaaS

# Share on Hacker News
# Post on Product Hunt (later, after some traction)
```

---

## 🎯 Quick Commands Reference

### Search & Discovery
```bash
# Search by keyword
awesome-directories search "ai tools"

# List all directories
awesome-directories list --limit 20

# Filter by criteria
awesome-directories filter --category "SaaS" --dr-min 70 --pricing free

# Show details
awesome-directories show producthunt
```

### Export
```bash
# Export to CSV
awesome-directories export --format csv --output directories.csv

# Export filtered results
awesome-directories filter --dr-min 60 | \
  awesome-directories export --format json --output high-dr.json
```

### Authentication
```bash
# Login with token (get from awesome-directories.com/settings)
awesome-directories auth token YOUR_TOKEN_HERE

# Check login status
awesome-directories auth whoami

# Logout
awesome-directories auth logout
```

### Favorites
```bash
# Add to favorites
awesome-directories favorites add producthunt

# List favorites
awesome-directories favorites list

# Remove favorite
awesome-directories favorites remove producthunt
```

### Cache
```bash
# View cache info
awesome-directories config show

# Force refresh
awesome-directories sync

# Clear cache
awesome-directories config clear-cache
```

---

## 🐛 Troubleshooting

### Build Fails

```bash
# Clean and rebuild
make clean
make build

# Or
rm -f awesome-directories
go mod tidy
go build -o awesome-directories ./cmd/awesome-directories
```

### GoReleaser Fails

```bash
# Test release locally
goreleaser release --snapshot --clean

# Check the built artifacts
ls -la dist/
```

### Homebrew Installation Fails

```bash
# Update Homebrew
brew update

# Check tap
brew tap | grep awesome-directories

# Untap and re-tap
brew untap awesome-directories/tap
brew tap awesome-directories/tap

# Try again
brew install awesome-directories
```

### API Connection Issues

```bash
# Test Supabase connection
curl -I https://yqqfvtpbijdqmchfxdgr.supabase.co/rest/v1/directories

# Check environment variables
awesome-directories config show

# Force sync
awesome-directories sync
```

---

## 📊 Monitor Success

### GitHub Stats
```bash
# Watch stars
gh repo view awesome-directories/cli --json stargazerCount

# Check releases
gh release list

# Monitor issues
gh issue list
```

### Homebrew Analytics (After ~30 days)
```bash
# Formula analytics (if accepted to Homebrew core)
brew info --json awesome-directories
```

---

## 🎓 Next Features to Add

Based on user feedback, consider:

1. **Interactive TUI Mode** (Bubble Tea)
   - Browse directories interactively
   - Multi-select for bulk operations
   - Real-time search

2. **Browser OAuth**
   - Complete the auth flow
   - Auto-open browser
   - Better UX

3. **Submissions Tracking**
   - Full CRUD for submissions
   - Export submission report
   - Reminder system

4. **Advanced Filtering**
   - Regex search
   - Exclude categories
   - Custom sorting

5. **Export Enhancements**
   - PDF export
   - Excel format
   - Custom templates

---

## 💬 Get Help

- **Issues**: https://github.com/awesome-directories/cli/issues
- **Discussions**: https://github.com/awesome-directories/cli/discussions
- **Email**: support@awesome-directories.com

---

**Happy launching! 🚀**

The awesome-directories CLI is ready to help developers discover the perfect directories for their SaaS launches.

Remember: The goal isn't just the backlink—it's building a genuinely useful tool that developers love.
