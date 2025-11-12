import * as vscode from "vscode";

// Import commands
import { compressSelection } from "./commands/compress";
import { decompressSelection } from "./commands/decompress";
import { showStats } from "./commands/stats";

// Import MCP modules
import { autoConfigureMcpServer } from "./mcp/config";
import { registerMcpProvider } from "./mcp/provider";
import {
  checkMcpStatus,
  showMcpStatus,
  getStatusBarItem,
} from "./mcp/statusBar";

/**
 * Activates the ASON extension
 * Sets up commands, MCP server configuration, and status bar
 * @param {vscode.ExtensionContext} context - Extension context
 */
export function activate(context: vscode.ExtensionContext): void {
  console.log("ASON extension activated");

  // Register all commands
  context.subscriptions.push(
    vscode.commands.registerCommand("ason.compressSelection", compressSelection),
    vscode.commands.registerCommand(
      "ason.decompressSelection",
      decompressSelection,
    ),
    vscode.commands.registerCommand("ason.showStats", showStats),
    vscode.commands.registerCommand("ason.showMcpStatus", showMcpStatus),
  );

  // Initialize MCP status bar
  console.log("Initializing status bar...");
  checkMcpStatus();
  context.subscriptions.push(getStatusBarItem());

  // Auto-configure MCP server (async, non-blocking)
  autoConfigureMcpServer(context, __dirname).catch((err) => {
    console.error("Error in autoConfigureMcpServer:", err);
  });

  // Register MCP server provider for clients like Claude Code
  registerMcpProvider(context, __dirname);

  // Show welcome message on first activation
  const hasShownWelcome = context.globalState.get("hasShownWelcome", false);
  if (!hasShownWelcome) {
    vscode.window
      .showInformationMessage(
        "ASON extension activated! MCP server auto-configured for GitHub Copilot. " +
          "Use commands or ask Copilot to compress JSON.",
        "Learn More",
      )
      .then((selection) => {
        if (selection === "Learn More") {
          vscode.env.openExternal(
            vscode.Uri.parse("https://github.com/ason-format/ason"),
          );
        }
      });
    context.globalState.update("hasShownWelcome", true);
  }
}

/**
 * Deactivates the ASON extension
 * Cleanup is handled automatically by VS Code
 */
export function deactivate(): void {
  console.log("ASON extension deactivated");
}
