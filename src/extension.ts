import * as vscode from 'vscode';
import { SmartCompressor, TokenCounter } from '@ason-format/ason';

/**
 * Get ASON configuration from workspace settings
 */
function getConfig() {
  const config = vscode.workspace.getConfiguration('ason');
  return {
    indent: config.get<number>('indent', 1),
    delimiter: config.get<string>('delimiter', ','),
    useReferences: config.get<boolean>('useReferences', true),
    useDictionary: config.get<boolean>('useDictionary', true),
    autoShowStats: config.get<boolean>('autoShowStats', true)
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
    showError('No active editor');
    return;
  }

  const selection = editor.selection;
  const text = editor.document.getText(selection);

  if (!text) {
    showError('No text selected');
    return;
  }

  try {
    const config = getConfig();
    const compressor = new SmartCompressor({
      indent: config.indent,
      delimiter: config.delimiter,
      useReferences: config.useReferences,
      useDictionary: config.useDictionary
    });

    // Parse JSON
    const data = JSON.parse(text);

    // Compress to ASON
    const ason = compressor.compress(data);

    // Replace selection
    await editor.edit(editBuilder => {
      editBuilder.replace(selection, ason);
    });

    // Show stats if enabled
    if (config.autoShowStats) {
      const stats = TokenCounter.compareFormats(data, ason);
      showInfo(
        `Compressed! Tokens: ${stats.original_tokens} → ${stats.compressed_tokens} ` +
        `(${stats.reduction_percent.toFixed(1)}% reduction)`
      );
    } else {
      showInfo('Compressed successfully');
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
    showError('No active editor');
    return;
  }

  const selection = editor.selection;
  const text = editor.document.getText(selection);

  if (!text) {
    showError('No text selected');
    return;
  }

  try {
    const compressor = new SmartCompressor();

    // Decompress ASON
    const data = compressor.decompress(text);

    // Format as JSON
    const json = JSON.stringify(data, null, 2);

    // Replace selection
    await editor.edit(editBuilder => {
      editBuilder.replace(selection, json);
    });

    showInfo('Decompressed successfully');
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
    showError('No active editor');
    return;
  }

  const selection = editor.selection;
  const text = editor.document.getText(selection);

  if (!text) {
    showError('No text selected');
    return;
  }

  try {
    const config = getConfig();
    const compressor = new SmartCompressor({
      indent: config.indent,
      delimiter: config.delimiter,
      useReferences: config.useReferences,
      useDictionary: config.useDictionary
    });

    // Parse JSON
    const data = JSON.parse(text);

    // Compress to get stats
    const ason = compressor.compress(data);
    const stats = TokenCounter.compareFormats(data, ason);

    // Create output channel for stats
    const outputChannel = vscode.window.createOutputChannel('ASON Statistics');
    outputChannel.clear();
    outputChannel.appendLine('=== ASON Compression Statistics ===\n');
    outputChannel.appendLine(`Original Tokens:    ${stats.original_tokens}`);
    outputChannel.appendLine(`Compressed Tokens:  ${stats.compressed_tokens}`);
    outputChannel.appendLine(`Token Reduction:    ${stats.reduction_percent.toFixed(2)}%\n`);
    outputChannel.appendLine(`Original Size:      ${stats.original_size} bytes`);
    outputChannel.appendLine(`Compressed Size:    ${stats.compressed_size} bytes`);
    outputChannel.appendLine(`Bytes Saved:        ${stats.original_size - stats.compressed_size} bytes\n`);
    outputChannel.appendLine('=== Configuration ===\n');
    outputChannel.appendLine(`Indent:             ${config.indent}`);
    outputChannel.appendLine(`Delimiter:          "${config.delimiter}"`);
    outputChannel.appendLine(`Use References:     ${config.useReferences}`);
    outputChannel.appendLine(`Use Dictionary:     ${config.useDictionary}\n`);
    outputChannel.appendLine('=== ASON Preview ===\n');
    outputChannel.appendLine(ason);

    outputChannel.show(true);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    showError(`Failed to analyze: ${message}`);
  }
}

/**
 * Extension activation
 */
export function activate(context: vscode.ExtensionContext) {
  console.log('ASON extension activated');

  // Register commands
  context.subscriptions.push(
    vscode.commands.registerCommand('ason.compressSelection', compressSelection),
    vscode.commands.registerCommand('ason.decompressSelection', decompressSelection),
    vscode.commands.registerCommand('ason.showStats', showStats)
  );

  // Show welcome message on first activation
  const hasShownWelcome = context.globalState.get('hasShownWelcome', false);
  if (!hasShownWelcome) {
    vscode.window.showInformationMessage(
      'ASON extension activated! Select JSON text and use "ASON: Compress Selection" to get started.',
      'Learn More'
    ).then(selection => {
      if (selection === 'Learn More') {
        vscode.env.openExternal(vscode.Uri.parse('https://github.com/ason-format/ason'));
      }
    });
    context.globalState.update('hasShownWelcome', true);
  }
}

/**
 * Extension deactivation
 */
export function deactivate() {
  console.log('ASON extension deactivated');
}
