'use strict';

import * as vscode from 'vscode';
import * as fs from 'fs';

const CONFIG_SECTION = 'copy-paste';

export function openFile(path: string): Promise<vscode.TextDocument> {
  return Promise.resolve(vscode.workspace.openTextDocument(path));
}

export function fileExists(path: string): boolean {
  return fs.existsSync(path);
}

export function showErrorMessage(message: string): Promise<boolean> {
  return Promise.resolve(vscode.window.showErrorMessage(message))
    .then(() => false);
}

export function getConfiguration(): vscode.WorkspaceConfiguration {
  return vscode.workspace.getConfiguration(CONFIG_SECTION);
}

export function getSortedSelections(): vscode.Selection[] {
  return vscode.window.activeTextEditor.selections
    .sort((a, b) => sortPositions(a.start, b.start));
}

export function sortPositions(a: vscode.Position, b: vscode.Position) {
  return (a.line === b.line) ? a.character - b.character : a.line - b.line;
}

export function getPositionFromSelection(selection: vscode.Selection): vscode.Position {
  let [position] = [selection.start, selection.end].sort((a, b) => sortPositions(a, b));
  return position;
}

export function pasteValuesIntoSelection(items: string[]): Thenable<boolean> {
  const editor = vscode.window.activeTextEditor;
  return editor.edit(edit => getSortedSelections().forEach((selection, index) => 
    pasteValue(edit, items[index % items.length], selection)
  ));
}

export function pasteValue(edit: vscode.TextEditorEdit, value: string, selection: vscode.Selection) {
  edit.insert(selection.active, value);
  edit.delete(selection);
}

/**
 * Returns a message validation fails or null if validation was successfull.
 * @param {string} path the path to the file.
 * @returns {Promise<string>} a message or null.
 */
export function validatePasteFromFile(path: string): Promise<string> {
  // cancel if there is no path configured.
  if (!path) {
    return Promise.resolve('copy-paste: no path text file configured.');
  }

  // cancel command if it's the source file.
  let editor = findEditorForTextFile(path);
  if (editor === vscode.window.activeTextEditor) {
    return Promise.resolve('copy-paste: source file and target are the same.');
  }

  // no message means valid...
  return Promise.resolve(null);
}

export function findEditorForTextFile(path: string): vscode.TextEditor {
  let editors = vscode.window.visibleTextEditors;
  return editors.find(editor => editor.document.fileName.endsWith(path));
}
