import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import * as os from "os";
import { getConfig } from "../utils/config";
import { updateStatusBar, checkMcpStatus } from "./statusBar";

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
 * Finds the MCP server executable path
 * Tries development path first, then packaged path
 * @param {string} baseDir - Base directory (__dirname from extension)
 * @returns {string | undefined} Path to server or undefined if not found
 */
function findServerPath(baseDir: string): string | undefined {
  // Try development path first (for debugging)
  const devPath = path.join(baseDir, "..", "..", "mcp-server", "dist", "index.js");

  // Try packaged extension path
  const packagedPath = path.join(
    baseDir,
    "..",
    "node_modules",
    "@ason-format",
    "mcp-server",
    "dist",
    "index.js",
  );

  if (fs.existsSync(devPath)) {
    console.log("Using development MCP server path:", devPath);
    return devPath;
  } else if (fs.existsSync(packagedPath)) {
    console.log("Using packaged MCP server path:", packagedPath);
    return packagedPath;
  }

  console.log("No local server found");
  return undefined;
}

/**
 * Auto-configures MCP server in user's global configuration
 * Creates or updates mcp.json with ASON server configuration
 * @param {vscode.ExtensionContext} context - Extension context
 * @param {string} baseDir - Base directory (__dirname from extension)
 */
export async function autoConfigureMcpServer(
  context: vscode.ExtensionContext,
  baseDir: string,
): Promise<void> {
  try {
    const userMcpPath = getMcpConfigPath();
    console.log("MCP config path:", userMcpPath);

    let mcpConfig: any = { servers: {} };

    // Create directory if it doesn't exist
    const mcpDir = path.dirname(userMcpPath);
    if (!fs.existsSync(mcpDir)) {
      fs.mkdirSync(mcpDir, { recursive: true });
    }

    // Read existing configuration
    if (fs.existsSync(userMcpPath)) {
      const existingConfig = fs.readFileSync(userMcpPath, "utf8");
      mcpConfig = JSON.parse(existingConfig);
      if (!mcpConfig.servers) {
        mcpConfig.servers = {};
      }
    }

    const asonServerExists = !!mcpConfig.servers.ason;
    const hasBeenNotified = context.globalState.get(
      "ason.mcpConfigNotified",
      false,
    );

    if (asonServerExists) {
      console.log("ASON MCP server already configured");

      // Check if using npx (needs update to local path)
      const currentConfig = mcpConfig.servers.ason;
      const isUsingNpx = currentConfig.command === "npx";

      // Only show prompt once
      if (!hasBeenNotified) {
        context.globalState.update("ason.mcpConfigNotified", true);

        if (isUsingNpx) {
          vscode.window
            .showWarningMessage(
              "ASON MCP is configured but using npx (package not published yet). Update to use local path?",
              "Update to Local Path",
              "Keep Current",
            )
            .then((selection) => {
              if (selection === "Update to Local Path") {
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

      updateStatusBar("operational", 4);
      return;
    }

    // Configure new server
    const config = getConfig();
    const serverPath = findServerPath(baseDir);

    if (serverPath) {
      // Use local path with node command
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
      // Fallback to npx (only works if published)
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

    // Write configuration
    fs.writeFileSync(userMcpPath, JSON.stringify(mcpConfig, null, 2));
    console.log("ASON MCP server auto-configured in user profile:", userMcpPath);

    vscode.window
      .showInformationMessage(
        "ASON MCP server configured globally for GitHub Copilot! Reload window to activate.",
        "Reload Window",
      )
      .then((selection) => {
        if (selection === "Reload Window") {
          vscode.commands.executeCommand("workbench.action.reloadWindow");
        } else {
          checkMcpStatus();
        }
      });
  } catch (error) {
    console.error("Failed to auto-configure MCP server:", error);
    updateStatusBar("error");
    vscode.window.showWarningMessage(
      'Could not auto-configure ASON MCP server. Please configure manually using "MCP: Open User Configuration"',
    );
  }
}
