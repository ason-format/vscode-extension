# ASON MCP Server Setup for VS Code

This guide explains how to use ASON as an MCP (Model Context Protocol) server with GitHub Copilot in VS Code.

## What's the Difference?

### VS Code Extension (Current)
- Direct commands: `ASON: Compress Selection`, `ASON: Decompress Selection`
- Manual invocation via Command Palette or right-click menu
- Works standalone

### MCP Server Integration
- **Automatic integration** with GitHub Copilot Chat
- Copilot can use ASON tools automatically when needed
- Ask Copilot: "Compress this JSON using ASON" and it will use the tools
- No manual command invocation needed

## Requirements

- VS Code 1.99 or later
- GitHub Copilot subscription
- Node.js v18+ (for npx)

## Setup Instructions

### Method 1: Workspace Configuration (Recommended)

1. Create `.vscode/mcp.json` in your project:

```json
{
  "servers": {
    "ason": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@ason-format/mcp-server@latest"],
      "env": {
        "ASON_INDENT": "1",
        "ASON_DELIMITER": ",",
        "ASON_USE_REFERENCES": "true",
        "ASON_USE_DICTIONARY": "true"
      }
    }
  }
}
```

2. Reload VS Code window
3. Open GitHub Copilot Chat
4. The ASON tools are now available!

### Method 2: User Configuration (Global)

1. Open Command Palette (`Cmd+Shift+P`)
2. Run: `MCP: Open User Configuration`
3. Add the same configuration as above
4. Available in all workspaces

### Method 3: Command Palette

1. `Cmd+Shift+P` → `MCP: Add Server`
2. Select "stdio"
3. Enter server name: `ason`
4. Command: `npx`
5. Args: `-y @ason-format/mcp-server@latest`

## Configuration Options

Customize ASON behavior via environment variables:

```json
{
  "servers": {
    "ason": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@ason-format/mcp-server@latest"],
      "env": {
        "ASON_INDENT": "1",           // 0-4: Indentation level
        "ASON_DELIMITER": ",",         // Field delimiter character
        "ASON_USE_REFERENCES": "true", // Enable object references (&obj0)
        "ASON_USE_DICTIONARY": "true"  // Enable value dictionary (#0)
      }
    }
  }
}
```

### Configuration Values

#### ASON_INDENT
- `"0"` - No indentation (maximum compression)
- `"1"` - Compact format (recommended)
- `"2"` or higher - Pretty print

#### ASON_DELIMITER
- `","` - Comma (default)
- `"|"` - Pipe
- `";"` - Semicolon
- `"\t"` - Tab

#### ASON_USE_REFERENCES
- `"true"` - Enable object references (default)
- `"false"` - Disable

#### ASON_USE_DICTIONARY
- `"true"` - Enable value dictionary (default)
- `"false"` - Disable

## Usage Examples

### In GitHub Copilot Chat

Once configured, you can ask Copilot to use ASON:

**Compress JSON:**
```
@workspace Compress this JSON using ASON:
{
  "users": [
    {"id": 1, "name": "Alice", "age": 25},
    {"id": 2, "name": "Bob", "age": 30}
  ]
}
```

**Decompress ASON:**
```
@workspace Decompress this ASON to JSON:
users:[2]@id,name,age
1,Alice,25
2,Bob,30
```

**Get Statistics:**
```
@workspace Show me compression stats for this JSON:
{"data": [...]}
```

### Available Tools

Copilot has access to these ASON tools:

1. **compress_json** - Compress JSON to ASON format
2. **decompress_ason** - Decompress ASON back to JSON
3. **get_compression_stats** - Analyze compression metrics
4. **configure_compressor** - Update compression settings

## Verification

To verify the MCP server is running:

1. Open GitHub Copilot Chat
2. Type: `@workspace /tools`
3. You should see ASON tools listed

Or check the Output panel:
1. View → Output
2. Select "MCP Servers" from dropdown
3. Look for "ason" server initialization

## Troubleshooting

### Server not starting

**Check VS Code version:**
```bash
code --version
# Should be 1.99 or later
```

**Verify Node.js:**
```bash
node --version
# Should be v18 or later
```

**Check MCP logs:**
1. View → Output
2. Select "MCP Servers"
3. Look for errors related to "ason"

### Tools not available in Copilot

1. Reload VS Code window
2. Verify `mcp.json` syntax is valid
3. Check GitHub Copilot is active
4. Ensure you have Copilot subscription

### Permission errors

If using organization Copilot:
- Admin must enable "MCP servers in Copilot" policy
- Contact your GitHub organization admin

## Both Extension + MCP Server

You can use **both** simultaneously:

- **Extension commands**: For direct, manual compression
- **MCP server**: For Copilot integration

They work independently and complement each other.

## Learn More

- **MCP Server**: https://github.com/ason-format/mcp-server
- **ASON Format**: https://github.com/ason-format/ason
- **VS Code MCP Docs**: https://code.visualstudio.com/docs/copilot/customization/mcp-servers
- **GitHub MCP Docs**: https://docs.github.com/en/copilot/how-tos/context/model-context-protocol

## Support

For issues:
- MCP Server: https://github.com/ason-format/mcp-server/issues
- VS Code Extension: https://github.com/ason-format/vscode-extension/issues
- ASON Format: https://github.com/ason-format/ason/issues
