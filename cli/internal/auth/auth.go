package auth

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"time"

	"github.com/awesome-directories/cli/internal/config"
	"github.com/awesome-directories/cli/internal/ui"
	"github.com/rs/zerolog/log"
)

const (
	callbackPort = "54321"
	callbackPath = "/callback"
)

// AuthResponse represents the auth callback response
type AuthResponse struct {
	AccessToken  string `json:"access_token"`
	TokenType    string `json:"token_type"`
	ExpiresIn    int    `json:"expires_in"`
	RefreshToken string `json:"refresh_token"`
	User         User   `json:"user"`
}

// User represents a Supabase user
type User struct {
	ID    string `json:"id"`
	Email string `json:"email"`
}

// LoginWithBrowser initiates browser-based OAuth flow
func LoginWithBrowser(cfg *config.Config, provider string) error {
	// Start local server to receive callback
	callbackChan := make(chan *AuthResponse, 1)
	errChan := make(chan error, 1)

	server := &http.Server{
		Addr:         ":" + callbackPort,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 10 * time.Second,
	}

	http.HandleFunc(callbackPath, func(w http.ResponseWriter, r *http.Request) {
		handleCallback(w, r, callbackChan, errChan)
	})

	// Start server in background
	go func() {
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			errChan <- fmt.Errorf("failed to start callback server: %w", err)
		}
	}()

	// Give server time to start
	time.Sleep(500 * time.Millisecond)

	// Build OAuth URL
	redirectURL := fmt.Sprintf("http://localhost:%s%s", callbackPort, callbackPath)
	authURL := fmt.Sprintf("%s/auth/v1/authorize?provider=%s&redirect_to=%s",
		cfg.SupabaseURL,
		provider,
		url.QueryEscape(redirectURL),
	)

	ui.Info("Opening browser for authentication...")
	ui.Muted("If the browser doesn't open, visit: %s", authURL)

	// Open browser
	if err := openBrowser(authURL); err != nil {
		log.Warn().Err(err).Msg("Failed to open browser")
		fmt.Printf("\nPlease visit this URL to authenticate:\n%s\n\n", authURL)
	}

	ui.Info("Waiting for authentication...")

	// Wait for callback or timeout
	select {
	case authResp := <-callbackChan:
		// Shutdown server
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		server.Shutdown(ctx)

		// Save token to config
		cfg.AuthToken = authResp.AccessToken
		if err := cfg.Save(); err != nil {
			return fmt.Errorf("failed to save auth token: %w", err)
		}

		ui.Success("Successfully authenticated as %s", authResp.User.Email)
		return nil

	case err := <-errChan:
		// Shutdown server
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		server.Shutdown(ctx)

		return err

	case <-time.After(5 * time.Minute):
		// Timeout
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		server.Shutdown(ctx)

		return fmt.Errorf("authentication timeout")
	}
}

// LoginWithToken sets an auth token manually
func LoginWithToken(cfg *config.Config, token string) error {
	// Validate token by making a test request
	req, err := http.NewRequest("GET", cfg.SupabaseURL+"/auth/v1/user", nil)
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("apikey", cfg.SupabaseAnonKey)

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("failed to validate token: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusUnauthorized {
		return fmt.Errorf("invalid token")
	}

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("token validation failed (status %d): %s", resp.StatusCode, string(body))
	}

	// Parse user info
	var user User
	if err := json.NewDecoder(resp.Body).Decode(&user); err != nil {
		log.Warn().Err(err).Msg("Failed to parse user info")
	}

	// Save token to config
	cfg.AuthToken = token
	if err := cfg.Save(); err != nil {
		return fmt.Errorf("failed to save auth token: %w", err)
	}

	if user.Email != "" {
		ui.Success("Successfully authenticated as %s", user.Email)
	} else {
		ui.Success("Successfully authenticated")
	}

	return nil
}

// Logout clears the auth token
func Logout(cfg *config.Config) error {
	cfg.AuthToken = ""
	if err := cfg.Save(); err != nil {
		return fmt.Errorf("failed to save config: %w", err)
	}

	ui.Success("Logged out successfully")
	return nil
}

// GetUserInfo gets information about the authenticated user
func GetUserInfo(cfg *config.Config) (*User, error) {
	if cfg.AuthToken == "" {
		return nil, fmt.Errorf("not authenticated")
	}

	req, err := http.NewRequest("GET", cfg.SupabaseURL+"/auth/v1/user", nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Authorization", "Bearer "+cfg.AuthToken)
	req.Header.Set("apikey", cfg.SupabaseAnonKey)

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to get user info: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusUnauthorized {
		return nil, fmt.Errorf("unauthorized: please login again")
	}

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("failed to get user info (status %d): %s", resp.StatusCode, string(body))
	}

	var user User
	if err := json.NewDecoder(resp.Body).Decode(&user); err != nil {
		return nil, fmt.Errorf("failed to decode user info: %w", err)
	}

	return &user, nil
}

// handleCallback handles the OAuth callback
func handleCallback(w http.ResponseWriter, r *http.Request, callbackChan chan *AuthResponse, errChan chan error) {
	// Get access token from fragment (handled by redirect page)
	// For simplicity, we'll use query parameters here
	// In production, you'd want a proper redirect page that extracts from fragment

	accessToken := r.URL.Query().Get("access_token")
	if accessToken == "" {
		// Check for error
		errMsg := r.URL.Query().Get("error_description")
		if errMsg == "" {
			errMsg = "No access token received"
		}

		w.WriteHeader(http.StatusBadRequest)
		fmt.Fprintf(w, "<html><body><h1>Authentication Failed</h1><p>%s</p></body></html>", errMsg)
		errChan <- fmt.Errorf("authentication failed: %s", errMsg)
		return
	}

	// Success response
	w.WriteHeader(http.StatusOK)
	fmt.Fprintf(w, `
		<html>
		<body>
			<h1>Authentication Successful!</h1>
			<p>You can close this window and return to the terminal.</p>
			<script>window.close();</script>
		</body>
		</html>
	`)

	authResp := &AuthResponse{
		AccessToken: accessToken,
		User: User{
			Email: r.URL.Query().Get("email"),
		},
	}

	callbackChan <- authResp
}

// openBrowser opens the default browser with the given URL
func openBrowser(url string) error {
	// This is a simple implementation
	// For production, you'd want a more robust cross-platform solution
	return fmt.Errorf("please open browser manually")
}
