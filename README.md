# ASON for VS Code

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![VS Code](https://img.shields.io/badge/VS%20Code-1.99+-blue.svg)](https://code.visualstudio.com/)
[![MCP](https://img.shields.io/badge/MCP-Enabled-green.svg)](https://modelcontextprotocol.io)

Compress and decompress JSON using the ASON format directly in Visual Studio Code. Reduce token usage by 20-60% for LLM applications while maintaining 100% lossless round-trip fidelity.

## Two Ways to Use ASON in VS Code

### 1. Extension Commands
- Direct commands for manual compression/decompression
- Keyboard shortcuts: `Cmd+Alt+C` (compress), `Cmd+Alt+D` (decompress), `Cmd+Alt+S` (stats)
- Accessible via Command Palette or right-click menu
- Perfect for one-off conversions

### 2. MCP Server Integration (Automatic)
- **Automatically configured** when you install this extension!
- Works with GitHub Copilot Chat (requires VS Code 1.99+)
- Copilot can use ASON tools automatically
- Ask Copilot: "Compress this JSON using ASON" and it works!
- No manual configuration needed - it just works!

## Installation

### From VS Code Marketplace

1. Open VS Code
2. Go to Extensions (`Cmd+Shift+X` / `Ctrl+Shift+X`)
3. Search for "ASON"
4. Click **Install**
5. MCP server is automatically configured for Copilot!

### Requirements

- **VS Code 1.99+** (for MCP server integration)
- **Node.js 18+** (for MCP server via npx)
- **GitHub Copilot** (optional, for automatic tool access)

### What Happens on Install

When you install this extension:

1. ✅ Extension commands are registered (`ASON: Compress`, etc.)
2. ✅ MCP server is **automatically configured** for GitHub Copilot
3. ✅ ASON tools become available in Copilot Chat
4. ✅ No manual configuration needed!

The MCP server uses `npx @ason-format/mcp-server@latest`, so it always stays up-to-date.

## Features

- **Compress JSON to ASON**: Convert selected JSON to token-optimized ASON format
- **Decompress ASON to JSON**: Restore ASON back to original JSON (lossless)
- **Compression Statistics**: View detailed metrics on token and byte savings
- **Configurable Settings**: Customize compression behavior per workspace
- **MCP Server Support**: Use with GitHub Copilot Chat (VS Code 1.99+)

## Commands

Access commands via:
- Command Palette (`Cmd+Shift+P` / `Ctrl+Shift+P`)
- Right-click context menu (when text is selected)

### Available Commands

| Command | Description |
|---------|-------------|
| `ASON: Compress Selection` | Compress selected JSON to ASON format |
| `ASON: Decompress Selection` | Decompress selected ASON to JSON |
| `ASON: Show Compression Stats` | Display detailed compression statistics |

## Usage

### Compress JSON

1. Select JSON text in your editor
2. Open Command Palette (`Cmd+Shift+P`)
3. Run `ASON: Compress Selection`
4. Selected text is replaced with ASON format

**Before:**
```json
{
  "users": [
    {"id": 1, "name": "Alice", "age": 25},
    {"id": 2, "name": "Bob", "age": 30}
  ]
}
```

**After:**
```
users:[2]{id,name,age}
1|Alice|25
2|Bob|30
```

### Decompress ASON

1. Select ASON text in your editor
2. Run `ASON: Decompress Selection`
3. Selected text is replaced with formatted JSON

### View Statistics

1. Select JSON text
2. Run `ASON: Show Compression Stats`
3. View detailed metrics in the output panel:

```
=== ASON Compression Statistics ===

Original Tokens:    59
Compressed Tokens:  23
Token Reduction:    61.02%

Original Size:      151 bytes
Compressed Size:    43 bytes
Bytes Saved:        108 bytes

=== Configuration ===

Indent:             1
Delimiter:          "|"
Use References:     true
Use Sections:       true
Use Tabular:        true

=== ASON Preview ===

users:[2]{id,name,age}
1|Alice|25
2|Bob|30
```

## Configuration

Configure ASON behavior in your workspace settings (`Cmd+,` / `Ctrl+,`):

```json
{
  "ason.indent": 1,
  "ason.delimiter": "|",
  "ason.useReferences": true,
  "ason.useSections": true,
  "ason.useTabular": true,
  "ason.autoShowStats": true
}
```

### Settings Reference

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `ason.indent` | number | `1` | Indentation level for nested structures |
| `ason.delimiter` | string | `"|"` | Field delimiter for tabular arrays (pipe, comma, or tab) |
| `ason.useReferences` | boolean | `true` | Enable `$var` reference deduplication |
| `ason.useSections` | boolean | `true` | Enable `@section` organization for objects |
| `ason.useTabular` | boolean | `true` | Enable `key:[N]{fields}` tabular format for arrays |
| `ason.autoShowStats` | boolean | `true` | Show statistics after compression |

## Use Cases

### Reduce LLM API Costs

Compress data before sending to OpenAI, Claude, or other LLM APIs:

```javascript
// Instead of sending 150 tokens
const json = {"users": [{"id": 1, "name": "Alice"}, ...]};

// Send 60 tokens (60% reduction)
const ason = "users:[2]{id,name}\n1|Alice\n...";
```

### Optimize LocalStorage

Store more data in browser localStorage:

```javascript
// Before: 2KB JSON
localStorage.setItem('data', JSON.stringify(data));

// After: 800 bytes ASON
localStorage.setItem('data', compressor.compress(data));
```

### Compact API Responses

Reduce bandwidth for API responses:

```javascript
// Server compresses responses
app.get('/api/data', (req, res) => {
  const ason = compressor.compress(data);
  res.send(ason);
});
```

## Keyboard Shortcuts

You can add custom keyboard shortcuts in VS Code:

1. Open Keyboard Shortcuts (`Cmd+K Cmd+S` / `Ctrl+K Ctrl+S`)
2. Search for "ASON"
3. Assign shortcuts (e.g., `Cmd+Shift+A` for compress)

Example `keybindings.json`:

```json
[
  {
    "key": "cmd+shift+a",
    "command": "ason.compressSelection",
    "when": "editorHasSelection"
  },
  {
    "key": "cmd+shift+d",
    "command": "ason.decompressSelection",
    "when": "editorHasSelection"
  }
]
```

## Development

### Build from Source

```bash
cd vscode-ason
npm install
npm run build
```

### Test Extension

1. Open this folder in VS Code
2. Press F5 to launch Extension Development Host
3. Test commands in the new window

### Package Extension

```bash
npm install -g @vscode/vsce
vsce package
```

This creates a `.vsix` file you can install locally or publish to the marketplace.

## What is ASON?

ASON (Aliased Serialization Object Notation) is a token-optimized JSON compression format designed specifically for Large Language Models (LLMs).

**Key Features:**
- 20-60% token reduction on average
- 100% lossless round-trip fidelity
- Human-readable format
- Multiple compression techniques (uniform arrays, object references, value dictionary, path flattening)

**Learn More:**
- [ASON GitHub](https://github.com/ason-format/ason)
- [Interactive Demo](https://ason-format.github.io/ason/)
- [Documentation](https://ason-format.github.io/ason/docs.html)

## 🚀 Publishing

To release a new version:

```bash
# Run the release script
./scripts/release.sh

# 1. Select version bump (patch/minor/major)
# 2. Update CHANGELOG.md when prompted
# 3. Confirm push

# GitHub Actions will automatically:
# - Build the extension
# - Create .vsix file
# - Create GitHub Release with .vsix attached

# Then manually publish to VS Code Marketplace:
npm run publish
```

## 📝 License

MIT © ASON Project Contributors

## 🤝 Contributing

Contributions welcome! Please open an issue or pull request.

## 🔗 Links

- **GitHub**: https://github.com/ason-format/vscode-extension
- **Issues**: https://github.com/ason-format/vscode-extension/issues
- **ASON Core**: https://github.com/ason-format/ason
- **VS Code API**: https://code.visualstudio.com/api
