# Changelog - VS Code Extension

All notable changes to the ASON VS Code Extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.0.0-preview] - 2025-01-14

### Changed
- **BREAKING: ASON 2.0 Support** - Extension now uses ASON 2.0 format
- **Configuration Options Updated**:
  - ❌ Removed `ason.useDictionary` setting (no longer exists in ASON 2.0)
  - ✅ Added `ason.useSections` - Enable `@section` organization for objects (default: true)
  - ✅ Added `ason.useTabular` - Enable `key:[N]{fields}` tabular arrays (default: true)
  - Changed default `ason.delimiter` from `","` to `"|"` (pipe is more token-efficient)
- **Syntax Updates**:
  - Compressed output now uses `users:[2]{id,name}` instead of `users:[2]@id,name`
  - Tabular data uses pipe delimiter `|` by default: `1|Alice|25` instead of `1,Alice,25`
  - References use `$var` semantic names
  - Sections use `@section` for objects
- **TypeScript Interface Updates**:
  - `AsonConfig` interface updated with new options
  - `SmartCompressor` now called with correct ASON 2.0 options
- **MCP Server Integration**:
  - Environment variables updated: `ASON_USE_SECTIONS`, `ASON_USE_TABULAR` (replacing `ASON_USE_DICTIONARY`)
  - MCP provider passes correct options to latest `@ason-format/mcp-server`
- **Updated Documentation**:
  - README.md updated with ASON 2.0 syntax examples
  - Configuration table updated with new settings
  - All code examples show correct pipe-delimited output

### Dependencies
- Updated `@ason-format/ason` to `^2.0.0-preview` (from `^1.1.2`)

### Migration Notes
- **User Settings**: If you have custom ASON settings in VS Code:
  - Remove or rename `"ason.useDictionary"` → Not needed (enabled by default via sections/tabular)
  - Consider changing `"ason.delimiter": ","` → `"|"` for better token efficiency
- **MCP Configuration**: Auto-configured MCP servers will use new options automatically
- **Output Format**: Compressed ASON will look different but is 100% lossless and more token-efficient

## [1.0.0] - 2025-01-12

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
- **MCP Server Integration**:
  - Automatic configuration for GitHub Copilot (VS Code 1.99+)
  - MCP provider for Claude Code and other MCP clients
  - Uses `npx @ason-format/mcp-server@latest` in production
  - Development mode detection for local testing
- **Status Bar Indicator**:
  - Real-time MCP server status (operational/not-configured/error)
  - Rich tooltip with markdown showing tools and configuration
  - Clean positioning to avoid UI conflicts
- **Modular Architecture** - Clean separation of commands, MCP, and utilities
- **Built with tsup** - Optimized bundling with full dependency inclusion

### Features
- In-place text replacement (compresses/decompresses selected text)
- Error handling with user-friendly messages
- Preserves indentation when decompressing to JSON
- Works with any text selection (no file type restrictions)
- Keyboard shortcuts: Cmd+Alt+C (compress), Cmd+Alt+D (decompress), Cmd+Alt+S (stats)

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
