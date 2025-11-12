import * as vscode from "vscode";

/**
 * ASON configuration interface
 */
export interface AsonConfig {
  indent: number;
  delimiter: string;
  useReferences: boolean;
  useDictionary: boolean;
  autoShowStats: boolean;
}

/**
 * Gets ASON configuration from workspace settings
 * @returns {AsonConfig} Current ASON configuration
 */
export function getConfig(): AsonConfig {
  const config = vscode.workspace.getConfiguration("ason");
  return {
    indent: config.get<number>("indent", 1),
    delimiter: config.get<string>("delimiter", ","),
    useReferences: config.get<boolean>("useReferences", true),
    useDictionary: config.get<boolean>("useDictionary", true),
    autoShowStats: config.get<boolean>("autoShowStats", true),
  };
}
