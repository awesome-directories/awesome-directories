package models

import (
	"time"
)

// Directory represents a single directory listing
type Directory struct {
	ID               int       `json:"id"`
	Slug             string    `json:"slug"`
	Name             string    `json:"name"`
	URL              string    `json:"url"`
	Description      string    `json:"description"`
	Categories       []string  `json:"categories"`
	Pricing          string    `json:"pricing"`
	LinkType         string    `json:"link_type"`
	DomainRating     *int      `json:"domain_rating"`
	OrganicTraffic   *int      `json:"organic_traffic"`
	OrganicKeywords  *int      `json:"organic_keywords"`
	HelpfulCount     int       `json:"helpful_count"`
	ViewCount        int       `json:"view_count"`
	SubmissionURL    *string   `json:"submission_url"`
	IsAffiliate      bool      `json:"is_affiliate"`
	AffiliateURL     *string   `json:"affiliate_url"`
	IsActive         bool      `json:"is_active"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
}

// DirectoriesResponse represents the response from the API
type DirectoriesResponse struct {
	Data  []Directory `json:"data"`
	Count int         `json:"count"`
	Error *string     `json:"error"`
}

// Favorite represents a user's favorite directory
type Favorite struct {
	ID          int       `json:"id"`
	UserID      string    `json:"user_id"`
	DirectoryID int       `json:"directory_id"`
	CreatedAt   time.Time `json:"created_at"`
}

// Submission represents a user's submission tracking
type Submission struct {
	ID          int       `json:"id"`
	UserID      string    `json:"user_id"`
	DirectoryID int       `json:"directory_id"`
	Status      string    `json:"status"` // pending, submitted, approved, rejected
	Notes       *string   `json:"notes"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// User represents an authenticated user
type User struct {
	ID        string    `json:"id"`
	Email     string    `json:"email"`
	CreatedAt time.Time `json:"created_at"`
}

// FilterOptions represents filtering criteria
type FilterOptions struct {
	Query       string
	Categories  []string
	Pricing     []string
	LinkType    []string
	DRMin       *int
	DRMax       *int
	SortBy      string
	Limit       int
	Offset      int
}

// ExportFormat represents an export file format
type ExportFormat string

const (
	FormatCSV      ExportFormat = "csv"
	FormatJSON     ExportFormat = "json"
	FormatMarkdown ExportFormat = "markdown"
)

// SortOption represents sorting options
type SortOption string

const (
	SortMostHelpful SortOption = "helpful"
	SortHighestDR   SortOption = "dr"
	SortNewest      SortOption = "newest"
	SortAlpha       SortOption = "alpha"
)
