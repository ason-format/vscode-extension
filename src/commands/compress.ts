import * as vscode from "vscode";
import { SmartCompressor, TokenCounter } from "@ason-format/ason";
import { getConfig } from "../utils/config";
import { showError, showInfo } from "../utils/messages";

/**
 * Compresses selected JSON text to ASON format
 * Replaces the selection with compressed output
 */
export async function compressSelection(): Promise<void> {
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
      useSections: config.useSections,
      useTabular: config.useTabular,
    });

    // Parse and compress JSON
    const data = JSON.parse(text);
    const ason = compressor.compress(data);

    // Replace selection with compressed output
    await editor.edit((editBuilder) => {
      editBuilder.replace(selection, ason);
    });

    // Show compression statistics if enabled
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
