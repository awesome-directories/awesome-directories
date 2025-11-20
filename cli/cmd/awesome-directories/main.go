package main

import (
	"context"
	"fmt"
	"os"

	"github.com/awesome-directories/cli/internal/config"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
	"github.com/urfave/cli/v3"
)

// Version information (set by goreleaser)
var (
	version = "dev"
	commit  = "none"
	date    = "unknown"
	builtBy = "unknown"
)

func main() {
	// Initialize configuration
	cfg, err := config.Load()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Failed to load configuration: %v\n", err)
		os.Exit(1)
	}

	// Setup logging
	setupLogging(cfg)

	// Create CLI app
	app := &cli.Command{
		Name:    "awesome-directories",
		Usage:   "CLI tool for awesome-directories.com - Discover directories for your SaaS",
		Version: fmt.Sprintf("%s (commit: %s, built: %s by %s)", version, commit, date, builtBy),
		Flags: []cli.Flag{
			&cli.BoolFlag{
				Name:    "debug",
				Usage:   "Enable debug logging",
				Sources: cli.EnvVars("DEBUG"),
			},
			&cli.BoolFlag{
				Name:  "no-color",
				Usage: "Disable colored output",
			},
		},
		Commands: []*cli.Command{
			searchCommand(),
			listCommand(),
			filterCommand(),
			showCommand(),
			exportCommand(),
			syncCommand(),
			authCommand(),
			favoritesCommand(),
			submissionsCommand(),
			configCommand(),
		},
	}

	// Run the app
	if err := app.Run(context.Background(), os.Args); err != nil {
		log.Error().Err(err).Msg("Command failed")
		os.Exit(1)
	}
}

func setupLogging(cfg *config.Config) {
	// Configure zerolog for human-readable output (NOT JSON)
	output := zerolog.ConsoleWriter{
		Out:        os.Stderr,
		TimeFormat: "15:04:05",
		NoColor:    false,
		PartsOrder: []string{
			zerolog.LevelFieldName,
			zerolog.MessageFieldName,
		},
		FormatLevel: func(i interface{}) string {
			return fmt.Sprintf("%-5s", i)
		},
	}

	log.Logger = zerolog.New(output).With().Timestamp().Logger()

	// Set log level
	level := zerolog.InfoLevel
	if cfg.Debug {
		level = zerolog.DebugLevel
	}
	zerolog.SetGlobalLevel(level)
}
