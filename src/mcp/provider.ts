import * as vscode from "vscode";
import { getConfig } from "../utils/config";

/**
 * Registers ASON MCP server definition provider with VS Code
 * This makes the server available to MCP clients like Claude Code
 * Uses npx to run the published @ason-format/mcp-server package
 * @param {vscode.ExtensionContext} context - Extension context
 */
export function registerMcpProvider(
  context: vscode.ExtensionContext,
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

        // Use npx to run published MCP server
        console.log("Using npx @ason-format/mcp-server");
        const serverDef = new vscode.McpStdioServerDefinition(
          "ASON Compression - JSON token optimizer for LLMs",
          "npx",
          ["-y", "@ason-format/mcp-server@latest"],
          {
            ASON_INDENT: config.indent.toString(),
            ASON_DELIMITER: config.delimiter,
            ASON_USE_REFERENCES: config.useReferences.toString(),
            ASON_USE_DICTIONARY: config.useDictionary.toString(),
          },
        );

        console.log("Providing MCP server definition:", {
          label: "ASON Compression",
          detail: "JSON token optimizer for LLMs",
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
