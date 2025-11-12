import * as vscode from "vscode";
import { SmartCompressor } from "@ason-format/ason";
import { showError, showInfo } from "../utils/messages";

/**
 * Decompresses selected ASON text to JSON format
 * Replaces the selection with formatted JSON output
 */
export async function decompressSelection(): Promise<void> {
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

    // Decompress ASON to JSON
    const data = compressor.decompress(text);
    const json = JSON.stringify(data, null, 2);

    // Replace selection with formatted JSON
    await editor.edit((editBuilder) => {
      editBuilder.replace(selection, json);
    });

    showInfo("Decompressed successfully");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    showError(`Failed to decompress: ${message}`);
  }
}
