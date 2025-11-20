package main

import (
	"context"
	"fmt"
	"strconv"
	"strings"

	"github.com/awesome-directories/cli/internal/api"
	"github.com/awesome-directories/cli/internal/cache"
	"github.com/awesome-directories/cli/internal/config"
	"github.com/awesome-directories/cli/internal/export"
	"github.com/awesome-directories/cli/internal/ui"
	"github.com/awesome-directories/cli/pkg/models"
	"github.com/urfave/cli/v3"
)

// searchCommand creates the search command
func searchCommand() *cli.Command {
	return &cli.Command{
		Name:      "search",
		Usage:     "Search directories by name or description",
		ArgsUsage: "<query>",
		Flags: []cli.Flag{
			&cli.IntFlag{
				Name:    "limit",
				Aliases: []string{"l"},
				Usage:   "Limit number of results",
				Value:   50,
			},
			&cli.StringFlag{
				Name:    "sort",
				Aliases: []string{"s"},
				Usage:   "Sort by: helpful, dr, newest, alpha",
				Value:   "helpful",
			},
		},
		Action: func(ctx context.Context, cmd *cli.Command) error {
			if cmd.Args().Len() == 0 {
				return fmt.Errorf("search query is required")
			}

			query := cmd.Args().First()

			cfg, err := config.Load()
			if err != nil {
				return fmt.Errorf("failed to load config: %w", err)
			}

			apiClient := api.NewClient(cfg)
			cacheClient := cache.NewCache(cfg, apiClient)

			directories, err := cacheClient.GetDirectories(ctx, false)
			if err != nil {
				return fmt.Errorf("failed to get directories: %w", err)
			}

			options := &models.FilterOptions{
				Query:  query,
				SortBy: cmd.String("sort"),
				Limit:  cmd.Int("limit"),
			}

			filtered := cacheClient.FilterDirectories(directories, options)

			if len(filtered) == 0 {
				ui.Warning("No directories found matching query: %s", query)
				return nil
			}

			displayDirectoriesTable(filtered)
			ui.Info("Found %d directories", len(filtered))

			return nil
		},
	}
}

// listCommand creates the list command
func listCommand() *cli.Command {
	return &cli.Command{
		Name:  "list",
		Usage: "List all directories",
		Flags: []cli.Flag{
			&cli.StringSliceFlag{
				Name:    "category",
				Aliases: []string{"c"},
				Usage:   "Filter by category",
			},
			&cli.IntFlag{
				Name:    "limit",
				Aliases: []string{"l"},
				Usage:   "Limit number of results",
				Value:   50,
			},
			&cli.IntFlag{
				Name:  "offset",
				Usage: "Offset for pagination",
				Value: 0,
			},
			&cli.StringFlag{
				Name:    "sort",
				Aliases: []string{"s"},
				Usage:   "Sort by: helpful, dr, newest, alpha",
				Value:   "helpful",
			},
		},
		Action: func(ctx context.Context, cmd *cli.Command) error {
			cfg, err := config.Load()
			if err != nil {
				return fmt.Errorf("failed to load config: %w", err)
			}

			apiClient := api.NewClient(cfg)
			cacheClient := cache.NewCache(cfg, apiClient)

			directories, err := cacheClient.GetDirectories(ctx, false)
			if err != nil {
				return fmt.Errorf("failed to get directories: %w", err)
			}

			options := &models.FilterOptions{
				Categories: cmd.StringSlice("category"),
				SortBy:     cmd.String("sort"),
				Limit:      cmd.Int("limit"),
				Offset:     cmd.Int("offset"),
			}

			filtered := cacheClient.FilterDirectories(directories, options)

			if len(filtered) == 0 {
				ui.Warning("No directories found")
				return nil
			}

			displayDirectoriesTable(filtered)
			ui.Info("Showing %d of %d directories", len(filtered), len(directories))

			return nil
		},
	}
}

// filterCommand creates the filter command
func filterCommand() *cli.Command {
	return &cli.Command{
		Name:  "filter",
		Usage: "Filter directories with advanced criteria",
		Flags: []cli.Flag{
			&cli.StringSliceFlag{
				Name:    "category",
				Aliases: []string{"c"},
				Usage:   "Filter by category (can be specified multiple times)",
			},
			&cli.StringSliceFlag{
				Name:    "pricing",
				Aliases: []string{"p"},
				Usage:   "Filter by pricing: free, paid, freemium",
			},
			&cli.StringSliceFlag{
				Name:  "link-type",
				Usage: "Filter by link type: dofollow, nofollow",
			},
			&cli.IntFlag{
				Name:  "dr-min",
				Usage: "Minimum domain rating",
			},
			&cli.IntFlag{
				Name:  "dr-max",
				Usage: "Maximum domain rating",
			},
			&cli.StringFlag{
				Name:  "query",
				Usage: "Search query",
			},
			&cli.IntFlag{
				Name:    "limit",
				Aliases: []string{"l"},
				Usage:   "Limit number of results",
				Value:   50,
			},
			&cli.StringFlag{
				Name:    "sort",
				Aliases: []string{"s"},
				Usage:   "Sort by: helpful, dr, newest, alpha",
				Value:   "helpful",
			},
		},
		Action: func(ctx context.Context, cmd *cli.Command) error {
			cfg, err := config.Load()
			if err != nil {
				return fmt.Errorf("failed to load config: %w", err)
			}

			apiClient := api.NewClient(cfg)
			cacheClient := cache.NewCache(cfg, apiClient)

			directories, err := cacheClient.GetDirectories(ctx, false)
			if err != nil {
				return fmt.Errorf("failed to get directories: %w", err)
			}

			options := &models.FilterOptions{
				Query:      cmd.String("query"),
				Categories: cmd.StringSlice("category"),
				Pricing:    cmd.StringSlice("pricing"),
				LinkType:   cmd.StringSlice("link-type"),
				SortBy:     cmd.String("sort"),
				Limit:      cmd.Int("limit"),
			}

			if cmd.IsSet("dr-min") {
				drMin := cmd.Int("dr-min")
				options.DRMin = &drMin
			}

			if cmd.IsSet("dr-max") {
				drMax := cmd.Int("dr-max")
				options.DRMax = &drMax
			}

			filtered := cacheClient.FilterDirectories(directories, options)

			if len(filtered) == 0 {
				ui.Warning("No directories found matching filters")
				return nil
			}

			displayDirectoriesTable(filtered)
			ui.Info("Found %d of %d directories", len(filtered), len(directories))

			return nil
		},
	}
}

// showCommand creates the show command
func showCommand() *cli.Command {
	return &cli.Command{
		Name:      "show",
		Usage:     "Show detailed information about a directory",
		ArgsUsage: "<slug>",
		Action: func(ctx context.Context, cmd *cli.Command) error {
			if cmd.Args().Len() == 0 {
				return fmt.Errorf("directory slug is required")
			}

			slug := cmd.Args().First()

			cfg, err := config.Load()
			if err != nil {
				return fmt.Errorf("failed to load config: %w", err)
			}

			apiClient := api.NewClient(cfg)

			directory, err := apiClient.GetDirectory(ctx, slug)
			if err != nil {
				return fmt.Errorf("failed to get directory: %w", err)
			}

			displayDirectoryDetails(directory)

			return nil
		},
	}
}

// exportCommand creates the export command
func exportCommand() *cli.Command {
	return &cli.Command{
		Name:  "export",
		Usage: "Export directories to file",
		Flags: []cli.Flag{
			&cli.StringFlag{
				Name:     "format",
				Aliases:  []string{"f"},
				Usage:    "Export format: csv, json, markdown",
				Required: true,
			},
			&cli.StringFlag{
				Name:     "output",
				Aliases:  []string{"o"},
				Usage:    "Output file path",
				Required: true,
			},
			&cli.StringSliceFlag{
				Name:  "category",
				Usage: "Filter by category",
			},
			&cli.StringSliceFlag{
				Name:  "pricing",
				Usage: "Filter by pricing",
			},
			&cli.IntFlag{
				Name:  "dr-min",
				Usage: "Minimum domain rating",
			},
		},
		Action: func(ctx context.Context, cmd *cli.Command) error {
			cfg, err := config.Load()
			if err != nil {
				return fmt.Errorf("failed to load config: %w", err)
			}

			apiClient := api.NewClient(cfg)
			cacheClient := cache.NewCache(cfg, apiClient)

			directories, err := cacheClient.GetDirectories(ctx, false)
			if err != nil {
				return fmt.Errorf("failed to get directories: %w", err)
			}

			// Apply filters
			options := &models.FilterOptions{
				Categories: cmd.StringSlice("category"),
				Pricing:    cmd.StringSlice("pricing"),
			}

			if cmd.IsSet("dr-min") {
				drMin := cmd.Int("dr-min")
				options.DRMin = &drMin
			}

			filtered := cacheClient.FilterDirectories(directories, options)

			// Export
			outputPath := cmd.String("output")
			format := cmd.String("format")

			switch format {
			case "csv":
				err = export.ExportToCSV(filtered, outputPath)
			case "json":
				err = export.ExportToJSON(filtered, outputPath)
			case "markdown", "md":
				err = export.ExportToMarkdown(filtered, outputPath)
			default:
				return fmt.Errorf("unsupported format: %s (use csv, json, or markdown)", format)
			}

			if err != nil {
				return fmt.Errorf("failed to export: %w", err)
			}

			ui.Success("Exported %d directories to %s", len(filtered), outputPath)

			return nil
		},
	}
}

// syncCommand creates the sync command
func syncCommand() *cli.Command {
	return &cli.Command{
		Name:  "sync",
		Usage: "Sync local cache with API",
		Action: func(ctx context.Context, cmd *cli.Command) error {
			cfg, err := config.Load()
			if err != nil {
				return fmt.Errorf("failed to load config: %w", err)
			}

			apiClient := api.NewClient(cfg)
			cacheClient := cache.NewCache(cfg, apiClient)

			if err := cacheClient.Sync(ctx); err != nil {
				return fmt.Errorf("failed to sync cache: %w", err)
			}

			ui.Success("Cache synced successfully")

			return nil
		},
	}
}

// configCommand creates the config command
func configCommand() *cli.Command {
	return &cli.Command{
		Name:  "config",
		Usage: "Manage configuration",
		Commands: []*cli.Command{
			{
				Name:  "show",
				Usage: "Show current configuration",
				Action: func(ctx context.Context, cmd *cli.Command) error {
					cfg, err := config.Load()
					if err != nil {
						return fmt.Errorf("failed to load config: %w", err)
					}

					ui.Bold("Configuration:")
					fmt.Printf("  Supabase URL: %s\n", cfg.SupabaseURL)
					fmt.Printf("  Cache Directory: %s\n", cfg.CacheDir)
					fmt.Printf("  Cache TTL: %s\n", cfg.CacheTTL)
					fmt.Printf("  Authenticated: %t\n", cfg.AuthToken != "")

					cacheClient := cache.NewCache(cfg, api.NewClient(cfg))
					info, err := cacheClient.GetCacheInfo()
					if err == nil {
						fmt.Printf("\nCache Info:\n")
						for k, v := range info {
							fmt.Printf("  %s: %v\n", strings.Title(strings.ReplaceAll(k, "_", " ")), v)
						}
					}

					return nil
				},
			},
			{
				Name:  "clear-cache",
				Usage: "Clear local cache",
				Action: func(ctx context.Context, cmd *cli.Command) error {
					cfg, err := config.Load()
					if err != nil {
						return fmt.Errorf("failed to load config: %w", err)
					}

					cacheClient := cache.NewCache(cfg, api.NewClient(cfg))

					if err := cacheClient.Clear(); err != nil {
						return fmt.Errorf("failed to clear cache: %w", err)
					}

					ui.Success("Cache cleared successfully")

					return nil
				},
			},
		},
	}
}

// displayDirectoriesTable displays directories in a table format
func displayDirectoriesTable(directories []models.Directory) {
	table := ui.CreateTable([]string{"Name", "DR", "Category", "Pricing", "Link", "Votes"})

	for _, dir := range directories {
		category := strings.Join(dir.Categories, ", ")
		if len(category) > 30 {
			category = ui.TruncateString(category, 30)
		}

		table.Row(
			ui.TruncateString(dir.Name, 40),
			ui.FormatDR(dir.DomainRating),
			category,
			ui.FormatPricing(dir.Pricing),
			ui.FormatLinkType(dir.LinkType),
			strconv.Itoa(dir.HelpfulCount),
		)
	}

	fmt.Println(table)
}

// displayDirectoryDetails displays detailed information about a directory
func displayDirectoryDetails(dir *models.Directory) {
	ui.Bold("=== %s ===\n", dir.Name)
	fmt.Printf("URL: %s\n", dir.URL)
	fmt.Printf("Slug: %s\n\n", dir.Slug)

	ui.Bold("Description:")
	fmt.Printf("%s\n\n", dir.Description)

	ui.Bold("Metrics:")
	fmt.Printf("  Domain Rating: %s\n", ui.FormatDR(dir.DomainRating))
	if dir.OrganicTraffic != nil {
		fmt.Printf("  Organic Traffic: %d\n", *dir.OrganicTraffic)
	}
	if dir.OrganicKeywords != nil {
		fmt.Printf("  Organic Keywords: %d\n", *dir.OrganicKeywords)
	}
	fmt.Printf("  Helpful Votes: %d\n", dir.HelpfulCount)
	fmt.Printf("  Views: %d\n\n", dir.ViewCount)

	ui.Bold("Details:")
	fmt.Printf("  Categories: %s\n", strings.Join(dir.Categories, ", "))
	fmt.Printf("  Pricing: %s\n", ui.FormatPricing(dir.Pricing))
	fmt.Printf("  Link Type: %s\n", ui.FormatLinkType(dir.LinkType))

	if dir.SubmissionURL != nil {
		fmt.Printf("  Submission URL: %s\n", *dir.SubmissionURL)
	}

	if dir.IsAffiliate && dir.AffiliateURL != nil {
		fmt.Printf("  Affiliate URL: %s\n", *dir.AffiliateURL)
	}

	fmt.Printf("\n")
	ui.Muted("Created: %s", dir.CreatedAt.Format("2006-01-02"))
	ui.Muted("Updated: %s", dir.UpdatedAt.Format("2006-01-02"))
}
