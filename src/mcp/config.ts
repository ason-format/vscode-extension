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
 * Auto-configures MCP server in user's global configuration
 * Creates or updates mcp.json with ASON server configuration using npx
 * @param {vscode.ExtensionContext} context - Extension context
 */
export async function autoConfigureMcpServer(
  context: vscode.ExtensionContext,
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

    const asonServerExists = !!mcpConfig.servers["ason-mcp"];
    const hasBeenNotified = context.globalState.get(
      "ason.mcpConfigNotified",
      false,
    );

    if (asonServerExists) {
      console.log("ASON MCP server already configured");

      // Only show notification once
      if (!hasBeenNotified) {
        context.globalState.update("ason.mcpConfigNotified", true);
        vscode.window
          .showInformationMessage(
            "ASON MCP server is already configured and operational. Click the ASON icon in the status bar to view details.",
            "OK",
          );
      }

      updateStatusBar("operational", 4);
      return;
    }

    // Configure new server with npx
    const config = getConfig();
    console.log("Configuring ASON MCP server with npx");

    mcpConfig.servers["ason-mcp"] = {
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

    // Write configuration
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
          checkMcpStatus();
        }
      });
  } catch (error) {
    console.error("Failed to auto-configure MCP server:", error);
    updateStatusBar("not-configured");
    vscode.window.showWarningMessage(
      'Could not auto-configure ASON MCP server. Please configure manually using "MCP: Open User Configuration"',
    );
  }
}
