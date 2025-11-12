# ASON VS Code Extension - Source Code Structure

This directory contains the modularized source code for the ASON VS Code extension.

## Directory Structure

```
src/
├── extension.ts           # Main extension entry point
├── commands/              # Command implementations
│   ├── compress.ts       # JSON → ASON compression command
│   ├── decompress.ts     # ASON → JSON decompression command
│   └── stats.ts          # Compression statistics command
├── mcp/                   # MCP server integration
│   ├── config.ts         # Auto-configuration logic
│   ├── provider.ts       # MCP server definition provider
│   └── statusBar.ts      # Status bar UI and controls
└── utils/                 # Shared utilities
    ├── config.ts         # Configuration management
    └── messages.ts       # User notifications
```

## Module Descriptions

### Main Entry (`extension.ts`)
- Activates the extension
- Registers all commands
- Initializes MCP configuration and status bar
- Shows welcome message on first use

### Commands (`commands/`)
**compress.ts**
- Compresses selected JSON text to ASON format
- Shows compression statistics if enabled
- Replaces selection with compressed output

**decompress.ts**
- Decompresses selected ASON text back to JSON
- Formats JSON with 2-space indentation
- Replaces selection with decompressed output

**stats.ts**
- Analyzes JSON compression without modifying text
- Displays detailed statistics in output channel
- Shows token count, byte savings, and configuration

### MCP Integration (`mcp/`)
**config.ts**
- Auto-configures MCP server in user's global mcp.json
- Detects development vs packaged server paths
- Handles first-time setup and updates

**provider.ts**
- Registers MCP server with VS Code's language model API
- Makes ASON tools available to MCP clients (e.g., Claude Code)
- Provides server definition with environment configuration

**statusBar.ts**
- Creates and manages status bar item
- Shows server status (operational/not-configured/error)
- Displays QuickPick menu for server management
- Updates status based on mcp.json configuration

### Utilities (`utils/`)
**config.ts**
- Reads ASON configuration from workspace settings
- Provides typed configuration interface
- Default values for all settings

**messages.ts**
- Standardized user notifications
- Error and info messages with ASON prefix

## Best Practices

1. **Separation of Concerns**: Each module has a single, clear responsibility
2. **Type Safety**: All functions are properly typed with TypeScript
3. **Documentation**: JSDoc comments explain purpose and parameters
4. **Error Handling**: Try-catch blocks with user-friendly error messages
5. **Platform Compatibility**: Cross-platform path handling (macOS, Windows, Linux)
6. **Async Operations**: Non-blocking operations for better UX

## Development

### Adding New Commands
1. Create new file in `commands/` directory
2. Export async function implementing the command
3. Import and register in `extension.ts`

### Modifying MCP Configuration
- Edit `mcp/config.ts` for auto-configuration logic
- Edit `mcp/provider.ts` for MCP client integration
- Edit `mcp/statusBar.ts` for UI changes

### Testing
Run the extension in debug mode (F5) to test changes in VS Code Extension Development Host.
