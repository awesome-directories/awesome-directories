package ui

import (
	"fmt"
	"os"
	"strconv"
	"strings"
	"text/tabwriter"

	"github.com/fatih/color"
)

var (
	colorsEnabled = true

	// Color schemes
	SuccessColor = color.New(color.FgGreen, color.Bold)
	ErrorColor   = color.New(color.FgRed, color.Bold)
	WarningColor = color.New(color.FgYellow, color.Bold)
	InfoColor    = color.New(color.FgCyan)
	MutedColor   = color.New(color.FgHiBlack)
	BoldColor    = color.New(color.Bold)

	// DR (Domain Rating) color thresholds
	HighDRColor    = color.New(color.FgGreen)
	MediumDRColor  = color.New(color.FgYellow)
	LowDRColor     = color.New(color.FgRed)
)

// DisableColors disables colored output
func DisableColors() {
	colorsEnabled = false
	color.NoColor = true
}

// EnableColors enables colored output
func EnableColors() {
	colorsEnabled = true
	color.NoColor = false
}

// Success prints a success message
func Success(format string, args ...interface{}) {
	if colorsEnabled {
		SuccessColor.Printf("✓ "+format+"\n", args...)
	} else {
		fmt.Printf(format+"\n", args...)
	}
}

// Error prints an error message
func Error(format string, args ...interface{}) {
	if colorsEnabled {
		ErrorColor.Fprintf(os.Stderr, "✗ "+format+"\n", args...)
	} else {
		fmt.Fprintf(os.Stderr, format+"\n", args...)
	}
}

// Warning prints a warning message
func Warning(format string, args ...interface{}) {
	if colorsEnabled {
		WarningColor.Printf("⚠ "+format+"\n", args...)
	} else {
		fmt.Printf(format+"\n", args...)
	}
}

// Info prints an info message
func Info(format string, args ...interface{}) {
	if colorsEnabled {
		InfoColor.Printf("ℹ "+format+"\n", args...)
	} else {
		fmt.Printf(format+"\n", args...)
	}
}

// Muted prints a muted message
func Muted(format string, args ...interface{}) {
	if colorsEnabled {
		MutedColor.Printf(format+"\n", args...)
	} else {
		fmt.Printf(format+"\n", args...)
	}
}

// Bold prints a bold message
func Bold(format string, args ...interface{}) {
	if colorsEnabled {
		BoldColor.Printf(format+"\n", args...)
	} else {
		fmt.Printf(format+"\n", args...)
	}
}

// FormatDR formats a domain rating with color
func FormatDR(dr *int) string {
	if dr == nil {
		return MutedColor.Sprint("N/A")
	}

	value := *dr
	var colorFunc *color.Color

	switch {
	case value >= 70:
		colorFunc = HighDRColor
	case value >= 40:
		colorFunc = MediumDRColor
	default:
		colorFunc = LowDRColor
	}

	if colorsEnabled {
		return colorFunc.Sprint(value)
	}
	return strconv.Itoa(value)
}

// FormatPricing formats pricing type with color
func FormatPricing(pricing string) string {
	if !colorsEnabled {
		return pricing
	}

	switch strings.ToLower(pricing) {
	case "free":
		return HighDRColor.Sprint(pricing)
	case "freemium":
		return MediumDRColor.Sprint(pricing)
	case "paid":
		return LowDRColor.Sprint(pricing)
	default:
		return pricing
	}
}

// FormatLinkType formats link type with color
func FormatLinkType(linkType string) string {
	if !colorsEnabled {
		return linkType
	}

	switch strings.ToLower(linkType) {
	case "dofollow":
		return HighDRColor.Sprint(linkType)
	case "nofollow":
		return MutedColor.Sprint(linkType)
	default:
		return linkType
	}
}

// Table represents a simple table
type Table struct {
	writer  *tabwriter.Writer
	headers []string
	rows    [][]string
}

// CreateTable creates a formatted table
func CreateTable(headers []string) *Table {
	w := tabwriter.NewWriter(os.Stdout, 0, 0, 2, ' ', 0)
	return &Table{
		writer:  w,
		headers: headers,
		rows:    [][]string{},
	}
}

// Row adds a row to the table
func (t *Table) Row(cols ...string) {
	t.rows = append(t.rows, cols)
}

// String renders the table
func (t *Table) String() string {
	// Print header
	if len(t.headers) > 0 {
		for i, h := range t.headers {
			if i > 0 {
				fmt.Fprint(t.writer, "\t")
			}
			fmt.Fprint(t.writer, BoldColor.Sprint(h))
		}
		fmt.Fprintln(t.writer)

		// Print separator
		for i := range t.headers {
			if i > 0 {
				fmt.Fprint(t.writer, "\t")
			}
			fmt.Fprint(t.writer, strings.Repeat("-", len(t.headers[i])+2))
		}
		fmt.Fprintln(t.writer)
	}

	// Print rows
	for _, row := range t.rows {
		for i, col := range row {
			if i > 0 {
				fmt.Fprint(t.writer, "\t")
			}
			fmt.Fprint(t.writer, col)
		}
		fmt.Fprintln(t.writer)
	}

	t.writer.Flush()
	return ""
}

// TruncateString truncates a string to maxLen
func TruncateString(s string, maxLen int) string {
	if len(s) <= maxLen {
		return s
	}
	if maxLen <= 3 {
		return s[:maxLen]
	}
	return s[:maxLen-3] + "..."
}
