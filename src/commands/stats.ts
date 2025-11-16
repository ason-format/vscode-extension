import * as vscode from "vscode";
import { SmartCompressor, TokenCounter } from "@ason-format/ason";
import { getConfig } from "../utils/config";
import { showError } from "../utils/messages";

/**
 * Shows detailed compression statistics for selected JSON
 * Displays analysis in an output channel without modifying the text
 */
export async function showStats(): Promise<void> {
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

    // Parse JSON and compress to analyze
    const data = JSON.parse(text);
    const ason = compressor.compress(data);
    const stats = TokenCounter.compareFormats(data, ason);

    // Create and display statistics in output channel
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
    outputChannel.appendLine(`Use Sections:       ${config.useSections}`);
    outputChannel.appendLine(`Use Tabular:        ${config.useTabular}\n`);
    outputChannel.appendLine("=== ASON Preview ===\n");
    outputChannel.appendLine(ason);

    outputChannel.show(true);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    showError(`Failed to analyze: ${message}`);
  }
}
