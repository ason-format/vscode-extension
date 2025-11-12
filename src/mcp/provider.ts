import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import { getConfig } from "../utils/config";

/**
 * Finds the MCP server executable path
 * @param {string} baseDir - Base directory (__dirname from extension)
 * @returns {string | undefined} Path to server or undefined
 */
function findServerPath(baseDir: string): string | undefined {
  const devPath = path.join(baseDir, "..", "..", "mcp-server", "dist", "index.js");
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
    return devPath;
  } else if (fs.existsSync(packagedPath)) {
    return packagedPath;
  }

  return undefined;
}

/**
 * Registers ASON MCP server definition provider with VS Code
 * This makes the server available to MCP clients like Claude Code
 * @param {vscode.ExtensionContext} context - Extension context
 * @param {string} baseDir - Base directory (__dirname from extension)
 */
export function registerMcpProvider(
  context: vscode.ExtensionContext,
  baseDir: string,
): void {
  console.log("Checking for MCP API...", {
    hasLm: !!vscode.lm,
    hasRegister: !!(vscode.lm && vscode.lm.registerMcpServerDefinitionProvider),
    lmKeys: vscode.lm ? Object.keys(vscode.lm) : "N/A",
  });

  if (!vscode.lm || !vscode.lm.registerMcpServerDefinitionProvider) {
    console.log("MCP API not available (requires VS Code 1.99+)");
    return;
  }

  console.log("MCP API found, registering provider...");
  const didChangeEmitter = new vscode.EventEmitter<void>();

  context.subscriptions.push(
    vscode.lm.registerMcpServerDefinitionProvider("ason-mcp", {
      onDidChangeMcpServerDefinitions: didChangeEmitter.event,

      provideMcpServerDefinitions: async () => {
        console.log("provideMcpServerDefinitions called!");
        const config = getConfig();
        const serverPath = findServerPath(baseDir);

        if (!serverPath) {
          console.error("MCP server not found at development or packaged paths");
          vscode.window.showErrorMessage(
            "ASON MCP server not found. Please ensure the server is built.",
          );
          return [];
        }

        const serverDef = new vscode.McpStdioServerDefinition(
          "ASON",
          "node",
          [serverPath],
          {
            ASON_INDENT: config.indent.toString(),
            ASON_DELIMITER: config.delimiter,
            ASON_USE_REFERENCES: config.useReferences.toString(),
            ASON_USE_DICTIONARY: config.useDictionary.toString(),
          },
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
        return server;
      },
    }),
  );

  console.log("ASON MCP server registered successfully");
}
