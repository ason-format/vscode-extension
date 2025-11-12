import * as vscode from "vscode";
import * as path from "path";
import { SmartCompressor, TokenCounter } from "@ason-format/ason";

/**
 * Get ASON configuration from workspace settings
 */
function getConfig() {
  const config = vscode.workspace.getConfiguration("ason");
  return {
    indent: config.get<number>("indent", 1),
    delimiter: config.get<string>("delimiter", ","),
    useReferences: config.get<boolean>("useReferences", true),
    useDictionary: config.get<boolean>("useDictionary", true),
    autoShowStats: config.get<boolean>("autoShowStats", true),
  };
}

/**
 * Show error message to user
 */
function showError(message: string) {
  vscode.window.showErrorMessage(`ASON: ${message}`);
}

/**
 * Show info message to user
 */
function showInfo(message: string) {
  vscode.window.showInformationMessage(`ASON: ${message}`);
}

/**
 * Compress selected JSON to ASON
 */
async function compressSelection() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    showError("No active editor");
    return;
  }

  const selection = editor.selection;
  const text = editor.document.getText(selection);

  if (!text) {
    showError("No text selected");
    return;
  }

  try {
    const config = getConfig();
    const compressor = new SmartCompressor({
      indent: config.indent,
      delimiter: config.delimiter,
      useReferences: config.useReferences,
      useDictionary: config.useDictionary,
    });

    // Parse JSON
    const data = JSON.parse(text);

    // Compress to ASON
    const ason = compressor.compress(data);

    // Replace selection
    await editor.edit((editBuilder) => {
      editBuilder.replace(selection, ason);
    });

    // Show stats if enabled
    if (config.autoShowStats) {
      const stats = TokenCounter.compareFormats(data, ason);
      showInfo(
        `Compressed! Tokens: ${stats.original_tokens} → ${stats.compressed_tokens} ` +
          `(${stats.reduction_percent.toFixed(1)}% reduction)`,
      );
    } else {
      showInfo("Compressed successfully");
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    showError(`Failed to compress: ${message}`);
  }
}

/**
 * Decompress selected ASON to JSON
 */
async function decompressSelection() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    showError("No active editor");
    return;
  }

  const selection = editor.selection;
  const text = editor.document.getText(selection);

  if (!text) {
    showError("No text selected");
    return;
  }

  try {
    const compressor = new SmartCompressor();

    // Decompress ASON
    const data = compressor.decompress(text);

    // Format as JSON
    const json = JSON.stringify(data, null, 2);

    // Replace selection
    await editor.edit((editBuilder) => {
      editBuilder.replace(selection, json);
    });

    showInfo("Decompressed successfully");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    showError(`Failed to decompress: ${message}`);
  }
}

/**
 * Show compression statistics for selected JSON
 */
async function showStats() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    showError("No active editor");
    return;
  }

  const selection = editor.selection;
  const text = editor.document.getText(selection);

  if (!text) {
    showError("No text selected");
    return;
  }

  try {
    const config = getConfig();
    const compressor = new SmartCompressor({
      indent: config.indent,
      delimiter: config.delimiter,
      useReferences: config.useReferences,
      useDictionary: config.useDictionary,
    });

    // Parse JSON
    const data = JSON.parse(text);

    // Compress to get stats
    const ason = compressor.compress(data);
    const stats = TokenCounter.compareFormats(data, ason);

    // Create output channel for stats
    const outputChannel = vscode.window.createOutputChannel("ASON Statistics");
    outputChannel.clear();
    outputChannel.appendLine("=== ASON Compression Statistics ===\n");
    outputChannel.appendLine(`Original Tokens:    ${stats.original_tokens}`);
    outputChannel.appendLine(`Compressed Tokens:  ${stats.compressed_tokens}`);
    outputChannel.appendLine(
      `Token Reduction:    ${stats.reduction_percent.toFixed(2)}%\n`,
    );
    outputChannel.appendLine(
      `Original Size:      ${stats.original_size} bytes`,
    );
    outputChannel.appendLine(
      `Compressed Size:    ${stats.compressed_size} bytes`,
    );
    outputChannel.appendLine(
      `Bytes Saved:        ${stats.original_size - stats.compressed_size} bytes\n`,
    );
    outputChannel.appendLine("=== Configuration ===\n");
    outputChannel.appendLine(`Indent:             ${config.indent}`);
    outputChannel.appendLine(`Delimiter:          "${config.delimiter}"`);
    outputChannel.appendLine(`Use References:     ${config.useReferences}`);
    outputChannel.appendLine(`Use Dictionary:     ${config.useDictionary}\n`);
    outputChannel.appendLine("=== ASON Preview ===\n");
    outputChannel.appendLine(ason);

    outputChannel.show(true);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    showError(`Failed to analyze: ${message}`);
  }
}

/**
 * Status bar item for ASON MCP server
 */
let statusBarItem: vscode.StatusBarItem;

/**
 * Update status bar with MCP server status
 */
function updateStatusBar(
  status: "operational" | "not-configured" | "error",
  toolCount?: number,
) {
  if (!statusBarItem) {
    statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right,
      100,
    );
  }

  switch (status) {
    case "operational":
      statusBarItem.text = `$(circle-filled) ASON`;
      statusBarItem.tooltip = `ASON MCP Server: Operational\n${toolCount ? `${toolCount} tools available` : ""}\nClick to view configuration`;
      // Green background with white text
      statusBarItem.backgroundColor = new vscode.ThemeColor(
        "statusBarItem.prominentBackground",
      );
      statusBarItem.color = new vscode.ThemeColor(
        "statusBarItem.prominentForeground",
      );
      break;
    case "not-configured":
      statusBarItem.text = "$(circle-outline) ASON";
      statusBarItem.tooltip =
        "ASON MCP Server: Not configured\nClick to configure";
      statusBarItem.backgroundColor = new vscode.ThemeColor(
        "statusBarItem.warningBackground",
      );
      statusBarItem.color = undefined;
      break;
    case "error":
      statusBarItem.text = "$(circle-slash) ASON";
      statusBarItem.tooltip = "ASON MCP Server: Error\nClick to view details";
      statusBarItem.backgroundColor = new vscode.ThemeColor(
        "statusBarItem.errorBackground",
      );
      statusBarItem.color = undefined;
      break;
  }

  statusBarItem.command = "ason.showMcpStatus";
  statusBarItem.show();
}

/**
 * Show MCP status and configuration details
 */
async function showMcpStatus() {
  const fs = require("fs");
  const os = require("os");

  try {
    // Get MCP config path
    const homeDir = os.homedir();
    let userMcpPath: string;
    if (process.platform === "darwin") {
      userMcpPath = path.join(
        homeDir,
        "Library",
        "Application Support",
        "Code",
        "User",
        "mcp.json",
      );
    } else if (process.platform === "win32") {
      userMcpPath = path.join(
        process.env.APPDATA || "",
        "Code",
        "User",
        "mcp.json",
      );
    } else {
      const vscodeConfigDir = process.env.XDG_CONFIG_HOME
        ? path.join(process.env.XDG_CONFIG_HOME, "Code")
        : path.join(homeDir, ".config", "Code");
      userMcpPath = path.join(vscodeConfigDir, "User", "mcp.json");
    }

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

    // Create QuickPick to show status
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
          // Show configuration in output channel
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
 * Check MCP server status and update status bar
 */
async function checkMcpStatus() {
  const fs = require("fs");
  const os = require("os");

  try {
    const homeDir = os.homedir();
    let userMcpPath: string;
    if (process.platform === "darwin") {
      userMcpPath = path.join(
        homeDir,
        "Library",
        "Application Support",
        "Code",
        "User",
        "mcp.json",
      );
    } else if (process.platform === "win32") {
      userMcpPath = path.join(
        process.env.APPDATA || "",
        "Code",
        "User",
        "mcp.json",
      );
    } else {
      const vscodeConfigDir = process.env.XDG_CONFIG_HOME
        ? path.join(process.env.XDG_CONFIG_HOME, "Code")
        : path.join(homeDir, ".config", "Code");
      userMcpPath = path.join(vscodeConfigDir, "User", "mcp.json");
    }

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
 * Extension activation
 */
/**
 * Auto-configure MCP server in user profile (global)
 */
async function autoConfigureMcpServer(context: vscode.ExtensionContext) {
  try {
    const fs = require("fs");
    const os = require("os");

    // Get user's VS Code config directory
    const homeDir = os.homedir();
    const vscodeConfigDir = process.env.XDG_CONFIG_HOME
      ? path.join(process.env.XDG_CONFIG_HOME, "Code")
      : path.join(homeDir, ".config", "Code");

    // For macOS/Windows, use different paths
    let userMcpPath: string;
    if (process.platform === "darwin") {
      userMcpPath = path.join(
        homeDir,
        "Library",
        "Application Support",
        "Code",
        "User",
        "mcp.json",
      );
    } else if (process.platform === "win32") {
      userMcpPath = path.join(
        process.env.APPDATA || "",
        "Code",
        "User",
        "mcp.json",
      );
    } else {
      userMcpPath = path.join(vscodeConfigDir, "User", "mcp.json");
    }

    console.log("MCP config path:", userMcpPath);

    let mcpConfig: any = { servers: {} };

    // Check if mcp.json already exists
    const mcpDir = path.dirname(userMcpPath);
    if (!fs.existsSync(mcpDir)) {
      fs.mkdirSync(mcpDir, { recursive: true });
    }

    if (fs.existsSync(userMcpPath)) {
      const existingConfig = fs.readFileSync(userMcpPath, "utf8");
      mcpConfig = JSON.parse(existingConfig);
      if (!mcpConfig.servers) {
        mcpConfig.servers = {};
      }
    }

    // Check if ASON server exists
    const asonServerExists = !!mcpConfig.servers.ason;

    // Check if user has been notified about MCP configuration
    const hasBeenNotified = context.globalState.get(
      "ason.mcpConfigNotified",
      false,
    );

    if (asonServerExists) {
      console.log("ASON MCP server already configured");

      // Check if the current configuration is using npx (needs update to local path)
      const currentConfig = mcpConfig.servers.ason;
      const isUsingNpx = currentConfig.command === "npx";

      // Only show prompt if user explicitly requested it (not on every activation)
      // The status bar will show the status and allow manual reconfiguration
      if (!hasBeenNotified) {
        context.globalState.update("ason.mcpConfigNotified", true);

        if (isUsingNpx) {
          // Show warning that npx won't work in development
          vscode.window
            .showWarningMessage(
              "ASON MCP is configured but using npx (package not published yet). Update to use local path?",
              "Update to Local Path",
              "Keep Current",
            )
            .then((selection) => {
              if (selection === "Update to Local Path") {
                // Force reconfiguration with local path
                delete mcpConfig.servers.ason;
                fs.writeFileSync(
                  userMcpPath,
                  JSON.stringify(mcpConfig, null, 2),
                );
                vscode.commands.executeCommand("workbench.action.reloadWindow");
              }
            });
        } else {
          vscode.window
            .showInformationMessage(
              "ASON MCP server is already configured and operational. Click the ASON icon in the status bar to manage it.",
              "Show Status",
            )
            .then((selection) => {
              if (selection === "Show Status") {
                vscode.commands.executeCommand("ason.showMcpStatus");
              }
            });
        }
      }

      // Update status bar to show operational
      updateStatusBar("operational", 4);
      return;
    } else {
      // Add ASON server for the first time
      const config = getConfig();

      // Determine the correct server path
      const fs = require("fs");

      // Try development path first (for debugging)
      const devPath = path.join(
        __dirname,
        "..",
        "..",
        "mcp-server",
        "dist",
        "index.js",
      );

      // Try packaged extension path
      const packagedPath = path.join(
        __dirname,
        "..",
        "node_modules",
        "@ason-format",
        "mcp-server",
        "dist",
        "index.js",
      );

      let serverPath: string | undefined;

      if (fs.existsSync(devPath)) {
        serverPath = devPath;
        console.log(
          "Using development MCP server path for mcp.json:",
          serverPath,
        );
      } else if (fs.existsSync(packagedPath)) {
        serverPath = packagedPath;
        console.log("Using packaged MCP server path for mcp.json:", serverPath);
      } else {
        // Fallback to npx (only works if published)
        console.log("No local server found, using npx");
      }

      if (serverPath) {
        // Use absolute path with node command
        mcpConfig.servers.ason = {
          type: "stdio",
          command: "node",
          args: [serverPath],
          env: {
            ASON_INDENT: config.indent.toString(),
            ASON_DELIMITER: config.delimiter,
            ASON_USE_REFERENCES: config.useReferences.toString(),
            ASON_USE_DICTIONARY: config.useDictionary.toString(),
          },
        };
      } else {
        // Use npx as fallback (for published version)
        mcpConfig.servers.ason = {
          type: "stdio",
          command: "npx",
          args: ["-y", "@ason-format/mcp-server@latest"],
          env: {
            ASON_INDENT: config.indent.toString(),
            ASON_DELIMITER: config.delimiter,
            ASON_USE_REFERENCES: config.useReferences.toString(),
            ASON_USE_DICTIONARY: config.useDictionary.toString(),
          },
        };
      }

      // Write updated config
      fs.writeFileSync(userMcpPath, JSON.stringify(mcpConfig, null, 2));
      console.log(
        "ASON MCP server auto-configured in user profile:",
        userMcpPath,
      );

      vscode.window
        .showInformationMessage(
          "ASON MCP server configured globally for GitHub Copilot! Reload window to activate.",
          "Reload Window",
        )
        .then((selection) => {
          if (selection === "Reload Window") {
            vscode.commands.executeCommand("workbench.action.reloadWindow");
          } else {
            // Update status bar immediately
            checkMcpStatus();
          }
        });
    }
  } catch (error) {
    console.error("Failed to auto-configure MCP server:", error);
    updateStatusBar("error");
    vscode.window.showWarningMessage(
      'Could not auto-configure ASON MCP server. Please configure manually using "MCP: Open User Configuration"',
    );
  }
}

export function activate(context: vscode.ExtensionContext) {
  console.log("ASON extension activated");

  // Register commands
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "ason.compressSelection",
      compressSelection,
    ),
    vscode.commands.registerCommand(
      "ason.decompressSelection",
      decompressSelection,
    ),
    vscode.commands.registerCommand("ason.showStats", showStats),
    vscode.commands.registerCommand("ason.showMcpStatus", showMcpStatus),
  );

  // Initialize status bar FIRST
  console.log("Initializing status bar...");
  checkMcpStatus();

  // Make sure statusBarItem is created before adding to subscriptions
  if (!statusBarItem) {
    statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right,
      100,
    );
  }
  context.subscriptions.push(statusBarItem);

  // Auto-configure MCP server in workspace (async, don't block)
  autoConfigureMcpServer(context).catch((err) => {
    console.error("Error in autoConfigureMcpServer:", err);
  });

  // Register MCP Server Definition Provider
  console.log("Checking for MCP API...", {
    hasLm: !!vscode.lm,
    hasRegister: !!(vscode.lm && vscode.lm.registerMcpServerDefinitionProvider),
    lmKeys: vscode.lm ? Object.keys(vscode.lm) : "N/A",
  });

  if (vscode.lm && vscode.lm.registerMcpServerDefinitionProvider) {
    console.log("MCP API found, registering provider...");
    const didChangeEmitter = new vscode.EventEmitter<void>();

    context.subscriptions.push(
      vscode.lm.registerMcpServerDefinitionProvider("ason-mcp", {
        onDidChangeMcpServerDefinitions: didChangeEmitter.event,

        provideMcpServerDefinitions: async () => {
          console.log("provideMcpServerDefinitions called!");
          const config = getConfig();

          // Determine the correct path to the MCP server
          // First check if we're in development mode (extension host)
          let serverPath: string;
          const fs = require("fs");

          // Try development path first (for debugging)
          const devPath = path.join(
            __dirname,
            "..",
            "..",
            "mcp-server",
            "dist",
            "index.js",
          );

          // Try packaged extension path
          const packagedPath = path.join(
            __dirname,
            "..",
            "node_modules",
            "@ason-format",
            "mcp-server",
            "dist",
            "index.js",
          );

          if (fs.existsSync(devPath)) {
            serverPath = devPath;
            console.log("Using development MCP server path:", serverPath);
          } else if (fs.existsSync(packagedPath)) {
            serverPath = packagedPath;
            console.log("Using packaged MCP server path:", serverPath);
          } else {
            console.error("MCP server not found at:", {
              devPath,
              packagedPath,
            });
            vscode.window.showErrorMessage(
              "ASON MCP server not found. Please ensure the server is built.",
            );
            return [];
          }

          const serverDef = new vscode.McpStdioServerDefinition(
            "ASON", // label
            "node", // command - use node directly
            [serverPath], // args - path to server
            {
              ASON_INDENT: config.indent.toString(),
              ASON_DELIMITER: config.delimiter,
              ASON_USE_REFERENCES: config.useReferences.toString(),
              ASON_USE_DICTIONARY: config.useDictionary.toString(),
            }, // env
          );

          console.log("Providing MCP server definition:", {
            label: "ASON",
            command: "node",
            serverPath,
            config,
          });

          return [serverDef];
        },

        resolveMcpServerDefinition: async (server) => {
          console.log("resolveMcpServerDefinition called for server:", server);
          // No additional resolution needed
          return server;
        },
      }),
    );

    console.log("ASON MCP server registered successfully");
  } else {
    console.log("MCP API not available (requires VS Code 1.99+)");
  }

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
 * Extension deactivation
 */
export function deactivate() {
  console.log("ASON extension deactivated");
}
