package api

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/awesome-directories/cli/internal/config"
	"github.com/awesome-directories/cli/pkg/models"
	"github.com/rs/zerolog/log"
)

// Client represents a Supabase API client
type Client struct {
	baseURL    string
	anonKey    string
	authToken  string
	httpClient *http.Client
}

// NewClient creates a new Supabase API client
func NewClient(cfg *config.Config) *Client {
	return &Client{
		baseURL:   cfg.SupabaseURL,
		anonKey:   cfg.SupabaseAnonKey,
		authToken: cfg.AuthToken,
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

// SetAuthToken sets the authentication token
func (c *Client) SetAuthToken(token string) {
	c.authToken = token
}

// GetDirectories fetches all directories from Supabase
func (c *Client) GetDirectories(ctx context.Context, options *models.FilterOptions) ([]models.Directory, error) {
	log.Debug().Msg("Fetching directories from Supabase")

	endpoint := c.baseURL + "/rest/v1/directories"

	// Build query parameters
	params := url.Values{}
	params.Set("select", "*")
	params.Set("is_active", "eq.true")

	// Apply filters if provided
	if options != nil {
		if options.DRMin != nil {
			params.Set("domain_rating", fmt.Sprintf("gte.%d", *options.DRMin))
		}
		if options.DRMax != nil {
			params.Set("domain_rating", fmt.Sprintf("lte.%d", *options.DRMax))
		}
		if len(options.Pricing) > 0 {
			params.Set("pricing", fmt.Sprintf("in.(%s)", strings.Join(options.Pricing, ",")))
		}
		if len(options.LinkType) > 0 {
			params.Set("link_type", fmt.Sprintf("in.(%s)", strings.Join(options.LinkType, ",")))
		}

		// Sorting
		switch options.SortBy {
		case string(models.SortMostHelpful):
			params.Set("order", "helpful_count.desc.nullslast")
		case string(models.SortHighestDR):
			params.Set("order", "domain_rating.desc.nullslast")
		case string(models.SortNewest):
			params.Set("order", "created_at.desc")
		case string(models.SortAlpha):
			params.Set("order", "name.asc")
		default:
			params.Set("order", "helpful_count.desc.nullslast")
		}

		// Pagination
		if options.Limit > 0 {
			params.Set("limit", fmt.Sprintf("%d", options.Limit))
		}
		if options.Offset > 0 {
			params.Set("offset", fmt.Sprintf("%d", options.Offset))
		}
	} else {
		// Default sorting
		params.Set("order", "helpful_count.desc.nullslast")
	}

	reqURL := endpoint + "?" + params.Encode()

	req, err := http.NewRequestWithContext(ctx, "GET", reqURL, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	c.setHeaders(req)

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch directories: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("API error (status %d): %s", resp.StatusCode, string(body))
	}

	var directories []models.Directory
	if err := json.NewDecoder(resp.Body).Decode(&directories); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	log.Debug().Int("count", len(directories)).Msg("Fetched directories successfully")

	return directories, nil
}

// GetDirectory fetches a single directory by slug
func (c *Client) GetDirectory(ctx context.Context, slug string) (*models.Directory, error) {
	log.Debug().Str("slug", slug).Msg("Fetching directory")

	endpoint := fmt.Sprintf("%s/rest/v1/directories?slug=eq.%s&select=*", c.baseURL, slug)

	req, err := http.NewRequestWithContext(ctx, "GET", endpoint, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	c.setHeaders(req)

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch directory: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("API error (status %d): %s", resp.StatusCode, string(body))
	}

	var directories []models.Directory
	if err := json.NewDecoder(resp.Body).Decode(&directories); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	if len(directories) == 0 {
		return nil, fmt.Errorf("directory not found: %s", slug)
	}

	return &directories[0], nil
}

// GetFavorites fetches user's favorite directories
func (c *Client) GetFavorites(ctx context.Context) ([]models.Favorite, error) {
	if c.authToken == "" {
		return nil, fmt.Errorf("authentication required: please login first")
	}

	log.Debug().Msg("Fetching user favorites")

	endpoint := c.baseURL + "/rest/v1/user_favorites?select=*"

	req, err := http.NewRequestWithContext(ctx, "GET", endpoint, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	c.setHeaders(req)

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch favorites: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusUnauthorized {
		return nil, fmt.Errorf("unauthorized: please login again")
	}

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("API error (status %d): %s", resp.StatusCode, string(body))
	}

	var favorites []models.Favorite
	if err := json.NewDecoder(resp.Body).Decode(&favorites); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	return favorites, nil
}

// AddFavorite adds a directory to favorites
func (c *Client) AddFavorite(ctx context.Context, directoryID int) error {
	if c.authToken == "" {
		return fmt.Errorf("authentication required: please login first")
	}

	log.Debug().Int("directory_id", directoryID).Msg("Adding favorite")

	endpoint := c.baseURL + "/rest/v1/user_favorites"

	payload := map[string]interface{}{
		"directory_id": directoryID,
	}

	body, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("failed to marshal payload: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, "POST", endpoint, strings.NewReader(string(body)))
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	c.setHeaders(req)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Prefer", "return=minimal")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("failed to add favorite: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusUnauthorized {
		return fmt.Errorf("unauthorized: please login again")
	}

	if resp.StatusCode != http.StatusCreated && resp.StatusCode != http.StatusOK {
		respBody, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("API error (status %d): %s", resp.StatusCode, string(respBody))
	}

	return nil
}

// RemoveFavorite removes a directory from favorites
func (c *Client) RemoveFavorite(ctx context.Context, directoryID int) error {
	if c.authToken == "" {
		return fmt.Errorf("authentication required: please login first")
	}

	log.Debug().Int("directory_id", directoryID).Msg("Removing favorite")

	endpoint := fmt.Sprintf("%s/rest/v1/user_favorites?directory_id=eq.%d", c.baseURL, directoryID)

	req, err := http.NewRequestWithContext(ctx, "DELETE", endpoint, nil)
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	c.setHeaders(req)

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("failed to remove favorite: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusUnauthorized {
		return fmt.Errorf("unauthorized: please login again")
	}

	if resp.StatusCode != http.StatusNoContent && resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("API error (status %d): %s", resp.StatusCode, string(body))
	}

	return nil
}

// setHeaders sets common headers for API requests
func (c *Client) setHeaders(req *http.Request) {
	req.Header.Set("apikey", c.anonKey)

	if c.authToken != "" {
		req.Header.Set("Authorization", "Bearer "+c.authToken)
	} else {
		req.Header.Set("Authorization", "Bearer "+c.anonKey)
	}
}
