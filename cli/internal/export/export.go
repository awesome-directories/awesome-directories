package export

import (
	"encoding/csv"
	"encoding/json"
	"fmt"
	"os"
	"strconv"
	"strings"

	"github.com/awesome-directories/cli/pkg/models"
)

// ExportToCSV exports directories to CSV format
func ExportToCSV(directories []models.Directory, outputPath string) error {
	file, err := os.Create(outputPath)
	if err != nil {
		return fmt.Errorf("failed to create CSV file: %w", err)
	}
	defer file.Close()

	writer := csv.NewWriter(file)
	defer writer.Flush()

	// Write header
	header := []string{
		"Name",
		"URL",
		"Description",
		"Categories",
		"Pricing",
		"Link Type",
		"Domain Rating",
		"Organic Traffic",
		"Organic Keywords",
		"Helpful Votes",
		"Submission URL",
	}
	if err := writer.Write(header); err != nil {
		return fmt.Errorf("failed to write CSV header: %w", err)
	}

	// Write rows
	for _, dir := range directories {
		row := []string{
			dir.Name,
			dir.URL,
			dir.Description,
			strings.Join(dir.Categories, ", "),
			dir.Pricing,
			dir.LinkType,
			formatIntPointer(dir.DomainRating),
			formatIntPointer(dir.OrganicTraffic),
			formatIntPointer(dir.OrganicKeywords),
			strconv.Itoa(dir.HelpfulCount),
			formatStringPointer(dir.SubmissionURL),
		}

		if err := writer.Write(row); err != nil {
			return fmt.Errorf("failed to write CSV row: %w", err)
		}
	}

	return nil
}

// ExportToJSON exports directories to JSON format
func ExportToJSON(directories []models.Directory, outputPath string) error {
	file, err := os.Create(outputPath)
	if err != nil {
		return fmt.Errorf("failed to create JSON file: %w", err)
	}
	defer file.Close()

	encoder := json.NewEncoder(file)
	encoder.SetIndent("", "  ")

	if err := encoder.Encode(directories); err != nil {
		return fmt.Errorf("failed to write JSON: %w", err)
	}

	return nil
}

// ExportToMarkdown exports directories to Markdown format
func ExportToMarkdown(directories []models.Directory, outputPath string) error {
	file, err := os.Create(outputPath)
	if err != nil {
		return fmt.Errorf("failed to create Markdown file: %w", err)
	}
	defer file.Close()

	// Write header
	fmt.Fprintf(file, "# Awesome Directories Export\n\n")
	fmt.Fprintf(file, "Total directories: %d\n\n", len(directories))
	fmt.Fprintf(file, "---\n\n")

	// Group by category
	categoryMap := make(map[string][]models.Directory)
	for _, dir := range directories {
		for _, cat := range dir.Categories {
			categoryMap[cat] = append(categoryMap[cat], dir)
		}
	}

	// Write by category
	for category, dirs := range categoryMap {
		fmt.Fprintf(file, "## %s\n\n", category)

		for _, dir := range dirs {
			fmt.Fprintf(file, "### [%s](%s)\n\n", dir.Name, dir.URL)
			fmt.Fprintf(file, "%s\n\n", dir.Description)

			fmt.Fprintf(file, "- **Pricing:** %s\n", dir.Pricing)
			fmt.Fprintf(file, "- **Link Type:** %s\n", dir.LinkType)

			if dir.DomainRating != nil {
				fmt.Fprintf(file, "- **Domain Rating:** %d\n", *dir.DomainRating)
			}

			if dir.HelpfulCount > 0 {
				fmt.Fprintf(file, "- **Helpful Votes:** %d\n", dir.HelpfulCount)
			}

			if dir.SubmissionURL != nil {
				fmt.Fprintf(file, "- **Submission URL:** %s\n", *dir.SubmissionURL)
			}

			fmt.Fprintf(file, "\n")
		}
	}

	return nil
}

// formatIntPointer formats an int pointer to string
func formatIntPointer(val *int) string {
	if val == nil {
		return "N/A"
	}
	return strconv.Itoa(*val)
}

// formatStringPointer formats a string pointer
func formatStringPointer(val *string) string {
	if val == nil {
		return "N/A"
	}
	return *val
}
