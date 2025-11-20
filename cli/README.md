# awesome-directories CLI

> Command-line interface for [awesome-directories.com](https://awesome-directories.com) - Discover, filter, and track high-quality directories for your SaaS product launches.

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Go Version](https://img.shields.io/github/go-mod/go-version/awesome-directories/cli)](https://go.dev/)

## Features

- 🔍 **Search & Filter** - Find directories by name, category, DR, pricing, and more
- 📊 **Export** - Export filtered directories to CSV, JSON, or Markdown
- ⭐ **Favorites** - Save and manage your favorite directories
- 💾 **Smart Caching** - Fast offline access with automatic sync
- 🔐 **Authentication** - Sync your favorites and submissions across devices
- 📈 **Submissions Tracking** - Track where you've submitted (coming soon)
- 🚀 **Lightweight** - Minimal dependencies, fast performance

## Installation

### Homebrew (macOS/Linux)

```bash
brew tap awesome-directories/tap
brew install awesome-directories
```

### Go Install

```bash
go install github.com/awesome-directories/cli/cmd/awesome-directories@latest
```

### Pre-built Binaries

Download the latest binary for your platform from the [releases page](https://github.com/awesome-directories/cli/releases).

#### Linux/macOS

```bash
# Download and install (replace VERSION and PLATFORM)
curl -L https://github.com/awesome-directories/cli/releases/download/VERSION/awesome-directories_PLATFORM.tar.gz | tar xz
sudo mv awesome-directories /usr/local/bin/
```

#### Windows

Download the `.zip` file from the [releases page](https://github.com/awesome-directories/cli/releases) and extract it to your desired location.

## Quick Start

```bash
# Search for directories
awesome-directories search "saas"

# List all directories
awesome-directories list

# Filter by criteria
awesome-directories filter --category "AI Tools" --dr-min 70 --pricing free

# Show directory details
awesome-directories show producthunt

# Export to CSV
awesome-directories export --format csv --output directories.csv --dr-min 60

# Sync cache with latest data
awesome-directories sync
```

## Commands

### Search

Search directories by name or description:

```bash
awesome-directories search <query> [flags]

Flags:
  -l, --limit int   Limit number of results (default 50)
  -s, --sort        Sort by: helpful, dr, newest, alpha (default "helpful")

Examples:
  awesome-directories search "developer tools"
  awesome-directories search saas --limit 10 --sort dr
```

### List

List all directories with optional filtering:

```bash
awesome-directories list [flags]

Flags:
  -c, --category strings   Filter by category
  -l, --limit int          Limit number of results (default 50)
      --offset int         Offset for pagination (default 0)
  -s, --sort              Sort by: helpful, dr, newest, alpha (default "helpful")

Examples:
  awesome-directories list
  awesome-directories list --category "SaaS" --limit 20
  awesome-directories list --sort dr --limit 100
```

### Filter

Filter directories with advanced criteria:

```bash
awesome-directories filter [flags]

Flags:
  -c, --category strings    Filter by category (multiple allowed)
  -p, --pricing strings     Filter by pricing: free, paid, freemium
      --link-type strings   Filter by link type: dofollow, nofollow
      --dr-min int          Minimum domain rating
      --dr-max int          Maximum domain rating
      --query string        Search query
  -l, --limit int           Limit number of results (default 50)
  -s, --sort               Sort by: helpful, dr, newest, alpha (default "helpful")

Examples:
  awesome-directories filter --category "AI Tools" --dr-min 70
  awesome-directories filter --pricing free --link-type dofollow
  awesome-directories filter --query "startup" --dr-min 50 --dr-max 80
```

### Show

Show detailed information about a specific directory:

```bash
awesome-directories show <slug>

Examples:
  awesome-directories show producthunt
  awesome-directories show hacker-news
```

### Export

Export directories to a file:

```bash
awesome-directories export [flags]

Flags:
  -f, --format string    Export format: csv, json, markdown (required)
  -o, --output string    Output file path (required)
      --category strings Filter by category
      --pricing strings  Filter by pricing
      --dr-min int       Minimum domain rating

Examples:
  awesome-directories export --format csv --output directories.csv
  awesome-directories export --format json --output data.json --dr-min 70
  awesome-directories export --format markdown --output README.md --category "SaaS"
```

### Sync

Sync local cache with the latest data from the API:

```bash
awesome-directories sync

Examples:
  awesome-directories sync
```

### Authentication

Manage authentication for syncing favorites and submissions:

```bash
# Login with token (recommended)
awesome-directories auth token <your-token>

# Get token from: https://awesome-directories.com/settings/tokens

# Check authentication status
awesome-directories auth whoami

# Logout
awesome-directories auth logout

Examples:
  awesome-directories auth token eyJhbGc...
  awesome-directories auth whoami
```

### Favorites

Manage your favorite directories (requires authentication):

```bash
# List favorites
awesome-directories favorites list

# Add to favorites
awesome-directories favorites add <slug>

# Remove from favorites
awesome-directories favorites remove <slug>

Examples:
  awesome-directories favorites list
  awesome-directories fav add producthunt
  awesome-directories fav rm hacker-news
```

### Submissions

Track directory submissions (coming soon):

```bash
# List submissions
awesome-directories submissions list

# Track a submission
awesome-directories submissions track <slug> --status submitted

# Add notes
awesome-directories submissions notes <slug> "Submitted on 2024-01-15"

Examples:
  awesome-directories submissions list
  awesome-directories sub track producthunt --status approved
```

### Config

Manage configuration:

```bash
# Show configuration
awesome-directories config show

# Clear cache
awesome-directories config clear-cache

Examples:
  awesome-directories config show
  awesome-directories config clear-cache
```

## Configuration

The CLI stores configuration in `~/.config/awesome-directories/`:

- `config.yaml` - Configuration file
- `cache/` - Cached directories data

### Environment Variables

You can override configuration with environment variables:

```bash
export SUPABASE_URL="https://your-supabase-url.supabase.co"
export SUPABASE_ANON_KEY="your-anon-key"
export AUTH_TOKEN="your-auth-token"
export CACHE_TTL="24h"
export DEBUG="true"
export NO_COLOR="true"
```

## Cache Management

The CLI uses smart caching to provide fast offline access:

- **Default TTL**: 24 hours
- **Auto-refresh**: Downloads new data when cache expires
- **Offline fallback**: Uses stale cache if API is unavailable
- **Manual sync**: Use `awesome-directories sync` to force refresh

View cache information:

```bash
awesome-directories config show
```

Clear cache:

```bash
awesome-directories config clear-cache
```

## Examples

### Find high-DR free directories

```bash
awesome-directories filter --pricing free --dr-min 70 --sort dr
```

### Export AI tools to CSV

```bash
awesome-directories filter --category "AI Tools" | \
  awesome-directories export --format csv --output ai-tools.csv
```

### Search and save to favorites

```bash
# Search for directories
awesome-directories search "developer"

# Add your favorites
awesome-directories fav add dev-to
awesome-directories fav add github
```

### Create a launch checklist

```bash
# Export relevant directories to markdown
awesome-directories filter \
  --category "Startup" \
  --category "SaaS" \
  --pricing free \
  --dr-min 50 \
  --format markdown \
  --output launch-checklist.md
```

## Development

### Prerequisites

- Go 1.23+
- Make (optional)

### Build from Source

```bash
# Clone the repository
git clone https://github.com/awesome-directories/cli.git
cd cli

# Download dependencies
go mod download

# Build
go build -o awesome-directories ./cmd/awesome-directories

# Run
./awesome-directories version
```

### Testing

```bash
go test -v ./...
```

### Local Development

```bash
# Run without installing
go run ./cmd/awesome-directories search "saas"

# Build with debug flags
go build -ldflags="-X main.version=dev" -o awesome-directories ./cmd/awesome-directories
```

## Architecture

- **CLI Framework**: urfave/cli/v3
- **Logging**: zerolog (human-readable, not JSON)
- **Config**: caarlos0/env/v11 + YAML
- **Database**: Supabase PostgreSQL
- **Caching**: Local JSON files with TTL
- **Auth**: Supabase Auth + OAuth2

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## Links

- **Website**: https://awesome-directories.com
- **GitHub**: https://github.com/awesome-directories/cli
- **Issues**: https://github.com/awesome-directories/cli/issues
- **Releases**: https://github.com/awesome-directories/cli/releases

## Support

- 📧 **Email**: support@awesome-directories.com
- 💬 **Discussions**: [GitHub Discussions](https://github.com/awesome-directories/cli/discussions)
- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/awesome-directories/cli/issues)

---

Made with ❤️ by the Awesome Directories team
