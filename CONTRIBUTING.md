# Contributing to ASON VS Code Extension

Thank you for your interest in contributing to the ASON VS Code Extension! This document provides guidelines and instructions for contributing to this project.

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

* **Use a clear and descriptive title**
* **Describe the exact steps to reproduce the problem**
* **Provide specific examples** including the JSON you tried to compress
* **Describe the behavior you observed** and explain what behavior you expected
* **Include screenshots** of the VS Code interface if relevant
* **Specify your environment**: VS Code version, extension version, OS, etc.

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

* **Use a clear and descriptive title**
* **Provide a detailed description** of the suggested enhancement
* **Explain why this enhancement would be useful** to VS Code users
* **List examples** of how the feature would be used
* **Mention if you're willing to implement** the enhancement yourself

### Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Make your changes** following our coding standards (see below)
3. **Add tests** if you're adding functionality
4. **Ensure the extension builds**: `npm run compile`
5. **Update documentation** if you're changing functionality
6. **Write a clear commit message** describing your changes
7. **Submit a pull request** with a comprehensive description

## Development Setup

```bash
# Clone the repository
git clone https://github.com/ason-format/vscode-extension.git
cd vscode-extension

# Install dependencies
npm install

# Compile the extension
npm run compile

# Open in VS Code for development
code .
```

### Running the Extension

1. Press `F5` in VS Code to open the Extension Development Host
2. Test compression/decompression commands
3. Check the output panel for errors

## Coding Standards

### TypeScript Style Guide

* Use **TypeScript** for type safety
* Follow **consistent indentation** (2 spaces)
* Use **meaningful variable names**
* Add **JSDoc comments** for public APIs
* Keep functions **small and focused**
* Prefer **const** over **let**, avoid **var**

### Example:

```typescript
/**
 * Compresses selected text to ASON format
 */
export async function compressSelection() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) return;

  // Implementation
}
```

### Testing

* **Write tests** for new features and bug fixes
* **Test with VS Code Extension Test Runner**
* **Use descriptive test names** that explain what is being tested

### Commit Messages

* Use the **present tense** ("Add feature" not "Added feature")
* Use the **imperative mood** ("Move cursor to..." not "Moves cursor to...")
* **Limit the first line** to 72 characters or less
* **Reference issues and pull requests** when relevant

Examples:
```
Add syntax highlighting for ASON
Fix compression of nested objects
Update extension icon
```

## Project Structure

```
vscode-ason/
├── src/
│   ├── extension.ts          # Main extension entry point
│   └── commands/             # Command implementations
├── tests/                    # Test suite
└── scripts/                  # Build and release scripts
```

## VS Code Extension API

When contributing:

* Follow [VS Code Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)
* Ensure commands are properly registered
* Handle errors gracefully with user-friendly messages
* Test with different editor states

## Documentation

* Update the **README.md** if you change functionality
* Update command descriptions in `package.json`
* Add examples for new features
* Update **CHANGELOG.md** with your changes

## Testing Guidelines

### Manual Testing

1. Test compression/decompression commands
2. Try with different JSON structures
3. Test with large files
4. Verify error messages are helpful
5. Check performance

## Release Process

(For maintainers)

1. Update version in `package.json`
2. Update CHANGELOG.md
3. Compile and test: `npm run compile`
4. Run release script: `./scripts/release.sh`
5. Follow prompts to create tag and push

## Questions?

* Check the [documentation](./README.md)
* Review [existing issues](https://github.com/ason-format/vscode-extension/issues)
* Open a new issue for discussion

## Recognition

Contributors will be:
* Listed in release notes
* Mentioned in significant feature announcements
* Credited in the project documentation

Thank you for contributing to ASON VS Code Extension!
