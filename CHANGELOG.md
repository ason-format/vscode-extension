# Changelog - VS Code Extension

All notable changes to the ASON VS Code Extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2025-01-11

### Added
- **Initial Release** - Complete Visual Studio Code extension for ASON compression
- **Commands**:
  - `ASON: Compress Selection` - Convert selected JSON to ASON format
  - `ASON: Decompress Selection` - Convert selected ASON back to JSON
  - `ASON: Show Compression Stats` - Display detailed compression statistics in output panel
- **Context Menu Integration** - Right-click on selections to access ASON commands
- **Command Palette Integration** - All commands accessible via `Cmd+Shift+P` / `Ctrl+Shift+P`
- **Workspace Configuration**:
  - `ason.indent` - Indentation level (default: 1)
  - `ason.delimiter` - Field delimiter (default: ",")
  - `ason.useReferences` - Enable object references (default: true)
  - `ason.useDictionary` - Enable value dictionary (default: true)
  - `ason.autoShowStats` - Automatically show stats after compression (default: true)
- **Real-time Statistics** - Toast notifications with compression metrics
- **Output Panel** - Detailed statistics view with:
  - Token counts (original vs compressed)
  - Token reduction percentage
  - Byte counts and savings
  - Configuration used
  - ASON preview
- **Welcome Message** - First-activation guide with "Learn More" link
- **Built with tsup** - Optimized bundling for fast loading

### Features
- In-place text replacement (compresses/decompresses selected text)
- Error handling with user-friendly messages
- Preserves indentation when decompressing to JSON
- Works with any text selection (no file type restrictions)

### Dependencies
- `@ason-format/ason@^1.1.2` - Core ASON library

### Requirements
- Visual Studio Code >= 1.85.0

### Developer Tools
- TypeScript support
- ESLint configuration
- Source maps for debugging

[Unreleased]: https://github.com/ason-format/vscode-extension/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/ason-format/vscode-extension/releases/tag/v1.0.0
