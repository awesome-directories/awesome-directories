# Contributing to awesome-directories CLI

Thank you for your interest in contributing to the awesome-directories CLI! This document provides guidelines and instructions for contributing.

## Development Setup

### Prerequisites

- Go 1.23 or later
- Git
- Make (optional, but recommended)

### Getting Started

1. Fork the repository on GitHub
2. Clone your fork locally:

```bash
git clone https://github.com/YOUR_USERNAME/cli.git
cd cli
```

3. Add the upstream repository:

```bash
git remote add upstream https://github.com/awesome-directories/cli.git
```

4. Install dependencies:

```bash
go mod download
```

5. Build the CLI:

```bash
make build
# or
go build -o awesome-directories ./cmd/awesome-directories
```

## Development Workflow

### Creating a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### Making Changes

1. Make your changes in your feature branch
2. Test your changes thoroughly
3. Ensure code quality:

```bash
# Format code
go fmt ./...

# Run tests
go test -v ./...

# Build to ensure no compilation errors
make build
```

### Committing Changes

We follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages:

```bash
git commit -m "feat: add new search filter option"
git commit -m "fix: resolve cache invalidation issue"
git commit -m "docs: update README with new examples"
```

**Commit types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Test additions or changes
- `chore`: Maintenance tasks

### Pushing and Creating a Pull Request

1. Push your changes to your fork:

```bash
git push origin feature/your-feature-name
```

2. Go to the GitHub repository and create a Pull Request
3. Fill in the PR template with:
   - Description of changes
   - Related issues (if any)
   - Testing performed
   - Screenshots (if applicable)

## Code Style Guidelines

### Go Code Style

- Follow standard Go formatting (`go fmt`)
- Use meaningful variable and function names
- Add comments for exported functions and types
- Keep functions focused and concise
- Handle errors appropriately

### Project Structure

```
cli/
├── cmd/awesome-directories/  # Main CLI entry point
├── internal/                 # Internal packages
│   ├── api/                  # Supabase API client
│   ├── auth/                 # Authentication logic
│   ├── cache/                # Caching mechanism
│   ├── config/               # Configuration management
│   ├── export/               # Export functionality
│   └── ui/                   # Terminal UI helpers
└── pkg/models/               # Public data models
```

## Testing

### Running Tests

```bash
# Run all tests
go test -v ./...

# Run tests with coverage
go test -v -cover ./...

# Run specific package tests
go test -v ./internal/cache
```

### Writing Tests

- Write unit tests for new functionality
- Aim for good test coverage
- Use table-driven tests where appropriate
- Mock external dependencies (API calls, file system, etc.)

Example test:

```go
func TestCacheValidation(t *testing.T) {
	tests := []struct {
		name     string
		age      time.Duration
		expected bool
	}{
		{"Fresh cache", 1 * time.Hour, true},
		{"Expired cache", 25 * time.Hour, false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Test implementation
		})
	}
}
```

## Documentation

- Update README.md for user-facing changes
- Add/update code comments for internal changes
- Include examples in documentation
- Update CHANGELOG.md (will be automated)

## Pull Request Process

1. Ensure your PR:
   - Has a clear description
   - Includes tests for new functionality
   - Updates documentation as needed
   - Passes all CI checks
   - Has no merge conflicts

2. Wait for code review
3. Address review feedback
4. Once approved, a maintainer will merge your PR

## Reporting Issues

### Bug Reports

When reporting bugs, please include:

- **Description**: Clear description of the issue
- **Steps to Reproduce**: Detailed steps to reproduce the bug
- **Expected Behavior**: What you expected to happen
- **Actual Behavior**: What actually happened
- **Environment**: OS, Go version, CLI version
- **Logs**: Relevant error messages or logs

### Feature Requests

When requesting features, please include:

- **Description**: Clear description of the feature
- **Use Case**: Why this feature would be useful
- **Proposed Solution**: Ideas for implementation (optional)
- **Alternatives**: Alternative solutions you've considered

## Code Review Guidelines

### For Reviewers

- Be respectful and constructive
- Focus on code quality and maintainability
- Suggest improvements, don't demand them
- Approve PRs that improve the codebase, even if not perfect

### For Contributors

- Be open to feedback
- Ask questions if feedback is unclear
- Make requested changes or discuss alternatives
- Be patient during the review process

## Release Process

Releases are automated using GoReleaser and GitHub Actions:

1. Version tags follow semantic versioning (v1.0.0)
2. Changelog is generated automatically from commits
3. Binaries are built for multiple platforms
4. Homebrew formula is updated automatically

## Community

- Be respectful and inclusive
- Help others in discussions
- Share knowledge and experiences
- Follow the [Code of Conduct](CODE_OF_CONDUCT.md) (if exists)

## Questions?

If you have questions about contributing:

- Open a Discussion on GitHub
- Ask in the issue comments
- Reach out to maintainers

## License

By contributing, you agree that your contributions will be licensed under the Apache License 2.0.

---

Thank you for contributing to awesome-directories CLI! 🚀
