import * as vscode from "vscode";

/**
 * Shows an error message with ASON prefix
 * @param {string} message - Error message to display
 */
export function showError(message: string): void {
  vscode.window.showErrorMessage(`ASON: ${message}`);
}

/**
 * Shows an info message with ASON prefix
 * @param {string} message - Info message to display
 */
export function showInfo(message: string): void {
  vscode.window.showInformationMessage(`ASON: ${message}`);
}
