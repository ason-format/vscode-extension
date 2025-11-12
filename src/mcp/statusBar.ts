import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import * as os from "os";

/**
 * Status bar item for displaying MCP server status
 */
let statusBarItem: vscode.StatusBarItem;

/**
 * Gets the MCP configuration file path based on platform
 * @returns {string} Absolute path to mcp.json
 */
function getMcpConfigPath(): string {
  const homeDir = os.homedir();

  if (process.platform === "darwin") {
    return path.join(
      homeDir,
      "Library",
      "Application Support",
      "Code",
      "User",
      "mcp.json",
    );
  } else if (process.platform === "win32") {
    return path.join(process.env.APPDATA || "", "Code", "User", "mcp.json");
  } else {
    const vscodeConfigDir = process.env.XDG_CONFIG_HOME
      ? path.join(process.env.XDG_CONFIG_HOME, "Code")
      : path.join(homeDir, ".config", "Code");
    return path.join(vscodeConfigDir, "User", "mcp.json");
  }
}

/**
 * Updates the status bar with current MCP server status
 * @param {string} status - Current server status
 * @param {number} [toolCount] - Number of available tools
 */
export function updateStatusBar(
  status: "operational" | "not-configured" | "error",
  toolCount?: number,
): void {
  if (!statusBarItem) {
    statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right,
      100,
    );
  }

  switch (status) {
    case "operational":
      // Green color for operational status - visible in all themes
      statusBarItem.text = `$(pass-filled) ASON`;
      statusBarItem.tooltip = `ASON MCP Server: Operational\n${toolCount ? `${toolCount} tools available` : ""}\nClick to view configuration`;
      statusBarItem.backgroundColor = undefined;
      statusBarItem.color = new vscode.ThemeColor("terminal.ansiGreen");
      break;
    case "not-configured":
      // Yellow/warning color - visible in all themes
      statusBarItem.text = "$(warning) ASON";
      statusBarItem.tooltip =
        "ASON MCP Server: Not configured\nClick to configure";
      statusBarItem.backgroundColor = undefined;
      statusBarItem.color = new vscode.ThemeColor("editorWarning.foreground");
      break;
    case "error":
      // Red color for errors - visible in all themes
      statusBarItem.text = "$(error) ASON";
      statusBarItem.tooltip = "ASON MCP Server: Error\nClick to view details";
      statusBarItem.backgroundColor = undefined;
      statusBarItem.color = new vscode.ThemeColor("errorForeground");
      break;
  }

  statusBarItem.command = "ason.showMcpStatus";
  statusBarItem.show();
}

/**
 * Checks current MCP server status and updates the status bar
 */
export async function checkMcpStatus(): Promise<void> {
  try {
    const userMcpPath = getMcpConfigPath();

    if (fs.existsSync(userMcpPath)) {
      const mcpConfig = JSON.parse(fs.readFileSync(userMcpPath, "utf8"));
      if (mcpConfig.servers && mcpConfig.servers.ason) {
        // Server is configured - 4 tools available
        updateStatusBar("operational", 4);
        return;
      }
    }

    // Not configured
    updateStatusBar("not-configured");
  } catch (error) {
    console.error("Failed to check MCP status:", error);
    updateStatusBar("error");
  }
}

/**
 * Shows MCP status details in a QuickPick menu
 */
export async function showMcpStatus(): Promise<void> {
  try {
    const userMcpPath = getMcpConfigPath();

    // Check if MCP is configured
    let isConfigured = false;
    let configDetails = "";

    if (fs.existsSync(userMcpPath)) {
      const mcpConfig = JSON.parse(fs.readFileSync(userMcpPath, "utf8"));
      if (mcpConfig.servers && mcpConfig.servers.ason) {
        isConfigured = true;
        const asonConfig = mcpConfig.servers.ason;
        configDetails =
          `**Configuration Path:** ${userMcpPath}\n\n` +
          `**Command:** ${asonConfig.command} ${asonConfig.args?.join(" ") || ""}\n\n` +
          `**Environment:**\n` +
          `- Indent: ${asonConfig.env?.ASON_INDENT || "1"}\n` +
          `- Delimiter: "${asonConfig.env?.ASON_DELIMITER || ","}"\n` +
          `- References: ${asonConfig.env?.ASON_USE_REFERENCES || "true"}\n` +
          `- Dictionary: ${asonConfig.env?.ASON_USE_DICTIONARY || "true"}\n\n` +
          `**Available Tools:**\n` +
          `1. compress_json - Compress JSON to ASON format\n` +
          `2. decompress_ason - Decompress ASON to JSON\n` +
          `3. get_compression_stats - Analyze compression statistics\n` +
          `4. configure_compressor - Update global settings`;
      }
    }

    // Create QuickPick menu
    const quickPick = vscode.window.createQuickPick();
    quickPick.title = "ASON MCP Server Status";

    if (isConfigured) {
      quickPick.items = [
        {
          label: "$(check) Server Status",
          description: "Operational",
          detail: "4 tools available",
        },
        {
          label: "$(tools) Available Tools",
          description:
            "compress_json, decompress_ason, get_compression_stats, configure_compressor",
        },
        {
          label: "$(gear) View Configuration",
          description: "Click to view details",
        },
        {
          label: "$(refresh) Reconfigure Server",
          description: "Update MCP server configuration",
        },
        {
          label: "$(trash) Remove Configuration",
          description: "Remove ASON from MCP config",
        },
      ];

      quickPick.onDidAccept(() => {
        const selected = quickPick.selectedItems[0];
        if (selected.label.includes("View Configuration")) {
          const outputChannel = vscode.window.createOutputChannel(
            "ASON MCP Configuration",
          );
          outputChannel.clear();
          outputChannel.appendLine("=== ASON MCP Server Configuration ===\n");
          outputChannel.appendLine(configDetails);
          outputChannel.show();
        } else if (selected.label.includes("Reconfigure")) {
          vscode.commands.executeCommand("workbench.action.reloadWindow");
        } else if (selected.label.includes("Remove")) {
          const mcpConfig = JSON.parse(fs.readFileSync(userMcpPath, "utf8"));
          delete mcpConfig.servers.ason;
          fs.writeFileSync(userMcpPath, JSON.stringify(mcpConfig, null, 2));
          vscode.window
            .showInformationMessage(
              "ASON MCP configuration removed. Reload window to apply.",
              "Reload Window",
            )
            .then((selection) => {
              if (selection === "Reload Window") {
                vscode.commands.executeCommand("workbench.action.reloadWindow");
              }
            });
        }
        quickPick.hide();
      });
    } else {
      quickPick.items = [
        {
          label: "$(warning) Server Status",
          description: "Not configured",
          detail: "Click to configure ASON MCP server",
        },
        {
          label: "$(gear) Configure Now",
          description: "Set up ASON MCP server globally",
        },
      ];

      quickPick.onDidAccept(() => {
        const selected = quickPick.selectedItems[0];
        if (selected.label.includes("Configure Now")) {
          vscode.commands.executeCommand("workbench.action.reloadWindow");
        }
        quickPick.hide();
      });
    }

    quickPick.show();
  } catch (error) {
    vscode.window.showErrorMessage(`Failed to check MCP status: ${error}`);
  }
}

/**
 * Gets the status bar item instance
 * @returns {vscode.StatusBarItem} Status bar item
 */
export function getStatusBarItem(): vscode.StatusBarItem {
  if (!statusBarItem) {
    statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right,
      100,
    );
  }
  return statusBarItem;
}
