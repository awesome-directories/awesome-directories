package main

import (
	"context"
	"fmt"

	"github.com/awesome-directories/cli/internal/api"
	"github.com/awesome-directories/cli/internal/auth"
	"github.com/awesome-directories/cli/internal/cache"
	"github.com/awesome-directories/cli/internal/config"
	"github.com/awesome-directories/cli/internal/ui"
	"github.com/awesome-directories/cli/pkg/models"
	"github.com/urfave/cli/v3"
)

// authCommand creates the auth command
func authCommand() *cli.Command {
	return &cli.Command{
		Name:  "auth",
		Usage: "Manage authentication",
		Commands: []*cli.Command{
			{
				Name:  "login",
				Usage: "Login via browser OAuth",
				Flags: []cli.Flag{
					&cli.StringFlag{
						Name:  "provider",
						Usage: "OAuth provider: google or github",
						Value: "google",
					},
				},
				Action: func(ctx context.Context, cmd *cli.Command) error {
					provider := cmd.String("provider")
					if provider != "google" && provider != "github" {
						return fmt.Errorf("invalid provider: %s (use google or github)", provider)
					}

					ui.Warning("Browser-based OAuth is not fully implemented yet.")
					ui.Info("Please use 'auth token' command with a token from awesome-directories.com")

					return nil
				},
			},
			{
				Name:      "token",
				Usage:     "Login with an auth token",
				ArgsUsage: "<token>",
				Action: func(ctx context.Context, cmd *cli.Command) error {
					if cmd.Args().Len() == 0 {
						return fmt.Errorf("auth token is required")
					}

					token := cmd.Args().First()

					cfg, err := config.Load()
					if err != nil {
						return fmt.Errorf("failed to load config: %w", err)
					}

					if err := auth.LoginWithToken(cfg, token); err != nil {
						return fmt.Errorf("failed to login: %w", err)
					}

					return nil
				},
			},
			{
				Name:  "logout",
				Usage: "Logout and clear auth token",
				Action: func(ctx context.Context, cmd *cli.Command) error {
					cfg, err := config.Load()
					if err != nil {
						return fmt.Errorf("failed to load config: %w", err)
					}

					if err := auth.Logout(cfg); err != nil {
						return fmt.Errorf("failed to logout: %w", err)
					}

					return nil
				},
			},
			{
				Name:  "whoami",
				Usage: "Show current authenticated user",
				Action: func(ctx context.Context, cmd *cli.Command) error {
					cfg, err := config.Load()
					if err != nil {
						return fmt.Errorf("failed to load config: %w", err)
					}

					if cfg.AuthToken == "" {
						ui.Warning("Not authenticated. Use 'auth token' or 'auth login' to authenticate.")
						return nil
					}

					user, err := auth.GetUserInfo(cfg)
					if err != nil {
						return fmt.Errorf("failed to get user info: %w", err)
					}

					ui.Bold("Authenticated as:")
					fmt.Printf("  Email: %s\n", user.Email)
					fmt.Printf("  ID: %s\n", user.ID)

					return nil
				},
			},
		},
	}
}

// favoritesCommand creates the favorites command
func favoritesCommand() *cli.Command {
	return &cli.Command{
		Name:    "favorites",
		Aliases: []string{"fav"},
		Usage:   "Manage favorite directories",
		Commands: []*cli.Command{
			{
				Name:  "list",
				Usage: "List favorite directories",
				Action: func(ctx context.Context, cmd *cli.Command) error {
					cfg, err := config.Load()
					if err != nil {
						return fmt.Errorf("failed to load config: %w", err)
					}

					if cfg.AuthToken == "" {
						return fmt.Errorf("authentication required: use 'auth login' or 'auth token' first")
					}

					apiClient := api.NewClient(cfg)
					cacheClient := cache.NewCache(cfg, apiClient)

					// Get favorites
					favorites, err := apiClient.GetFavorites(ctx)
					if err != nil {
						return fmt.Errorf("failed to get favorites: %w", err)
					}

					if len(favorites) == 0 {
						ui.Warning("No favorites yet. Use 'favorites add <slug>' to add directories.")
						return nil
					}

					// Get all directories
					directories, err := cacheClient.GetDirectories(ctx, false)
					if err != nil {
						return fmt.Errorf("failed to get directories: %w", err)
					}

					// Filter to favorite directories
					favoriteMap := make(map[int]bool)
					for _, fav := range favorites {
						favoriteMap[fav.DirectoryID] = true
					}

					var favoriteDirectories []models.Directory
					for _, dir := range directories {
						if favoriteMap[dir.ID] {
							favoriteDirectories = append(favoriteDirectories, dir)
						}
					}

					displayDirectoriesTable(favoriteDirectories)
					ui.Info("You have %d favorite directories", len(favoriteDirectories))

					return nil
				},
			},
			{
				Name:      "add",
				Usage:     "Add a directory to favorites",
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

					if cfg.AuthToken == "" {
						return fmt.Errorf("authentication required: use 'auth login' or 'auth token' first")
					}

					apiClient := api.NewClient(cfg)

					// Get directory by slug
					directory, err := apiClient.GetDirectory(ctx, slug)
					if err != nil {
						return fmt.Errorf("failed to get directory: %w", err)
					}

					// Add to favorites
					if err := apiClient.AddFavorite(ctx, directory.ID); err != nil {
						return fmt.Errorf("failed to add favorite: %w", err)
					}

					ui.Success("Added '%s' to favorites", directory.Name)

					return nil
				},
			},
			{
				Name:      "remove",
				Aliases:   []string{"rm"},
				Usage:     "Remove a directory from favorites",
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

					if cfg.AuthToken == "" {
						return fmt.Errorf("authentication required: use 'auth login' or 'auth token' first")
					}

					apiClient := api.NewClient(cfg)

					// Get directory by slug
					directory, err := apiClient.GetDirectory(ctx, slug)
					if err != nil {
						return fmt.Errorf("failed to get directory: %w", err)
					}

					// Remove from favorites
					if err := apiClient.RemoveFavorite(ctx, directory.ID); err != nil {
						return fmt.Errorf("failed to remove favorite: %w", err)
					}

					ui.Success("Removed '%s' from favorites", directory.Name)

					return nil
				},
			},
		},
	}
}

// submissionsCommand creates the submissions command (stubbed for future)
func submissionsCommand() *cli.Command {
	return &cli.Command{
		Name:    "submissions",
		Aliases: []string{"sub"},
		Usage:   "Track directory submissions (coming soon)",
		Commands: []*cli.Command{
			{
				Name:  "list",
				Usage: "List your directory submissions",
				Action: func(ctx context.Context, cmd *cli.Command) error {
					ui.Warning("Submissions tracking is not yet implemented.")
					ui.Info("This feature will be available once the website implements it.")
					ui.Info("Stay tuned for updates!")
					return nil
				},
			},
			{
				Name:      "track",
				Usage:     "Track a directory submission",
				ArgsUsage: "<slug> --status <status>",
				Flags: []cli.Flag{
					&cli.StringFlag{
						Name:     "status",
						Usage:    "Submission status: pending, submitted, approved, rejected",
						Required: true,
					},
					&cli.StringFlag{
						Name:  "notes",
						Usage: "Add notes about this submission",
					},
				},
				Action: func(ctx context.Context, cmd *cli.Command) error {
					ui.Warning("Submissions tracking is not yet implemented.")
					ui.Info("This feature will be available once the website implements it.")
					return nil
				},
			},
			{
				Name:      "notes",
				Usage:     "Add notes to a submission",
				ArgsUsage: "<slug> <notes>",
				Action: func(ctx context.Context, cmd *cli.Command) error {
					ui.Warning("Submissions tracking is not yet implemented.")
					ui.Info("This feature will be available once the website implements it.")
					return nil
				},
			},
		},
	}
}
