package cache

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/awesome-directories/cli/internal/api"
	"github.com/awesome-directories/cli/internal/config"
	"github.com/awesome-directories/cli/pkg/models"
	"github.com/rs/zerolog/log"
)

// Cache manages directory data caching
type Cache struct {
	cfg       *config.Config
	apiClient *api.Client
	cacheFile string
	metaFile  string
}

// CacheMetadata holds cache metadata
type CacheMetadata struct {
	LastUpdated time.Time `json:"last_updated"`
	Version     string    `json:"version"`
	Count       int       `json:"count"`
}

// NewCache creates a new cache instance
func NewCache(cfg *config.Config, apiClient *api.Client) *Cache {
	return &Cache{
		cfg:       cfg,
		apiClient: apiClient,
		cacheFile: filepath.Join(cfg.CacheDir, "directories.json"),
		metaFile:  filepath.Join(cfg.CacheDir, "metadata.json"),
	}
}

// GetDirectories retrieves directories from cache or API
func (c *Cache) GetDirectories(ctx context.Context, forceRefresh bool) ([]models.Directory, error) {
	// Check if cache exists and is valid
	if !forceRefresh && c.isCacheValid() {
		log.Debug().Msg("Using cached directories")
		directories, err := c.loadFromCache()
		if err == nil {
			return directories, nil
		}
		log.Warn().Err(err).Msg("Failed to load from cache, fetching from API")
	}

	// Fetch from API
	log.Info().Msg("Fetching directories from API...")
	directories, err := c.apiClient.GetDirectories(ctx, nil)
	if err != nil {
		// If API fails, try to use stale cache as fallback
		if cachedDirs, cacheErr := c.loadFromCache(); cacheErr == nil {
			log.Warn().Msg("API failed, using stale cache")
			return cachedDirs, nil
		}
		return nil, fmt.Errorf("failed to fetch directories: %w", err)
	}

	// Save to cache
	if err := c.saveToCache(directories); err != nil {
		log.Warn().Err(err).Msg("Failed to save to cache")
	}

	return directories, nil
}

// Sync forces a cache refresh
func (c *Cache) Sync(ctx context.Context) error {
	log.Info().Msg("Syncing cache with API...")

	directories, err := c.apiClient.GetDirectories(ctx, nil)
	if err != nil {
		return fmt.Errorf("failed to fetch directories: %w", err)
	}

	if err := c.saveToCache(directories); err != nil {
		return fmt.Errorf("failed to save to cache: %w", err)
	}

	log.Info().Int("count", len(directories)).Msg("Cache synced successfully")
	return nil
}

// FilterDirectories filters directories based on criteria
func (c *Cache) FilterDirectories(directories []models.Directory, options *models.FilterOptions) []models.Directory {
	if options == nil {
		return directories
	}

	var filtered []models.Directory

	for _, dir := range directories {
		// Skip inactive directories
		if !dir.IsActive {
			continue
		}

		// Query filter (search in name and description)
		if options.Query != "" {
			query := strings.ToLower(options.Query)
			name := strings.ToLower(dir.Name)
			desc := strings.ToLower(dir.Description)

			if !strings.Contains(name, query) && !strings.Contains(desc, query) {
				continue
			}
		}

		// Category filter
		if len(options.Categories) > 0 {
			hasCategory := false
			for _, cat := range options.Categories {
				for _, dirCat := range dir.Categories {
					if strings.EqualFold(cat, dirCat) {
						hasCategory = true
						break
					}
				}
				if hasCategory {
					break
				}
			}
			if !hasCategory {
				continue
			}
		}

		// Pricing filter
		if len(options.Pricing) > 0 {
			hasPrice := false
			for _, price := range options.Pricing {
				if strings.EqualFold(price, dir.Pricing) {
					hasPrice = true
					break
				}
			}
			if !hasPrice {
				continue
			}
		}

		// Link type filter
		if len(options.LinkType) > 0 {
			hasLinkType := false
			for _, lt := range options.LinkType {
				if strings.EqualFold(lt, dir.LinkType) {
					hasLinkType = true
					break
				}
			}
			if !hasLinkType {
				continue
			}
		}

		// DR filter
		if options.DRMin != nil && dir.DomainRating != nil {
			if *dir.DomainRating < *options.DRMin {
				continue
			}
		}
		if options.DRMax != nil && dir.DomainRating != nil {
			if *dir.DomainRating > *options.DRMax {
				continue
			}
		}

		filtered = append(filtered, dir)
	}

	// Sort filtered results
	c.sortDirectories(filtered, options.SortBy)

	// Apply pagination
	if options.Limit > 0 {
		start := options.Offset
		end := start + options.Limit

		if start >= len(filtered) {
			return []models.Directory{}
		}
		if end > len(filtered) {
			end = len(filtered)
		}

		filtered = filtered[start:end]
	}

	return filtered
}

// sortDirectories sorts directories based on sort option
func (c *Cache) sortDirectories(directories []models.Directory, sortBy string) {
	// Implement sorting logic
	// For now, directories are already sorted by the API
	// We can add client-side sorting if needed
}

// isCacheValid checks if the cache is still valid
func (c *Cache) isCacheValid() bool {
	meta, err := c.loadMetadata()
	if err != nil {
		return false
	}

	// Check if cache is expired
	if time.Since(meta.LastUpdated) > c.cfg.CacheTTL {
		log.Debug().Dur("age", time.Since(meta.LastUpdated)).Msg("Cache expired")
		return false
	}

	// Check if cache file exists
	if _, err := os.Stat(c.cacheFile); os.IsNotExist(err) {
		return false
	}

	return true
}

// loadFromCache loads directories from cache file
func (c *Cache) loadFromCache() ([]models.Directory, error) {
	data, err := os.ReadFile(c.cacheFile)
	if err != nil {
		return nil, fmt.Errorf("failed to read cache file: %w", err)
	}

	var directories []models.Directory
	if err := json.Unmarshal(data, &directories); err != nil {
		return nil, fmt.Errorf("failed to unmarshal cache: %w", err)
	}

	return directories, nil
}

// saveToCache saves directories to cache file
func (c *Cache) saveToCache(directories []models.Directory) error {
	// Ensure cache directory exists
	if err := os.MkdirAll(c.cfg.CacheDir, 0755); err != nil {
		return fmt.Errorf("failed to create cache directory: %w", err)
	}

	// Marshal directories
	data, err := json.MarshalIndent(directories, "", "  ")
	if err != nil {
		return fmt.Errorf("failed to marshal directories: %w", err)
	}

	// Write cache file
	if err := os.WriteFile(c.cacheFile, data, 0644); err != nil {
		return fmt.Errorf("failed to write cache file: %w", err)
	}

	// Update metadata
	meta := CacheMetadata{
		LastUpdated: time.Now(),
		Version:     "1.0",
		Count:       len(directories),
	}

	if err := c.saveMetadata(meta); err != nil {
		return fmt.Errorf("failed to save metadata: %w", err)
	}

	log.Debug().Int("count", len(directories)).Msg("Cache saved successfully")
	return nil
}

// loadMetadata loads cache metadata
func (c *Cache) loadMetadata() (*CacheMetadata, error) {
	data, err := os.ReadFile(c.metaFile)
	if err != nil {
		return nil, fmt.Errorf("failed to read metadata file: %w", err)
	}

	var meta CacheMetadata
	if err := json.Unmarshal(data, &meta); err != nil {
		return nil, fmt.Errorf("failed to unmarshal metadata: %w", err)
	}

	return &meta, nil
}

// saveMetadata saves cache metadata
func (c *Cache) saveMetadata(meta CacheMetadata) error {
	data, err := json.MarshalIndent(meta, "", "  ")
	if err != nil {
		return fmt.Errorf("failed to marshal metadata: %w", err)
	}

	if err := os.WriteFile(c.metaFile, data, 0644); err != nil {
		return fmt.Errorf("failed to write metadata file: %w", err)
	}

	return nil
}

// GetCacheInfo returns cache information
func (c *Cache) GetCacheInfo() (map[string]interface{}, error) {
	info := make(map[string]interface{})

	meta, err := c.loadMetadata()
	if err != nil {
		info["cached"] = false
		info["error"] = err.Error()
		return info, nil
	}

	info["cached"] = true
	info["last_updated"] = meta.LastUpdated
	info["count"] = meta.Count
	info["age"] = time.Since(meta.LastUpdated).Round(time.Second).String()
	info["valid"] = c.isCacheValid()
	info["cache_file"] = c.cacheFile

	return info, nil
}

// Clear clears the cache
func (c *Cache) Clear() error {
	if err := os.Remove(c.cacheFile); err != nil && !os.IsNotExist(err) {
		return fmt.Errorf("failed to remove cache file: %w", err)
	}

	if err := os.Remove(c.metaFile); err != nil && !os.IsNotExist(err) {
		return fmt.Errorf("failed to remove metadata file: %w", err)
	}

	log.Info().Msg("Cache cleared successfully")
	return nil
}
