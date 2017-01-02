'use strict';

import * as vscode from 'vscode';

const CONFIG_SECTION = 'copy-paste';

export function getConfig(): vscode.WorkspaceConfiguration {
  return vscode.workspace.getConfiguration(CONFIG_SECTION);
}

export function openFile(path: string): Promise<vscode.TextDocument> {
  let editor = findEditorForTextFile(path);
  if (editor) {
    // use the content in the editor if available.
    return Promise.resolve(editor.document);
  }
  return Promise.resolve(vscode.workspace.openTextDocument(path));
}

export function showFilePicker(files: string[] = []): Promise<string> {
  if (!files || !Array.isArray(files) || files.length === 0) {
    return Promise.resolve(null);
  }

  if (Array.isArray(files) && files.length === 1) {
    return Promise.resolve(files[0]);
  }
  return Promise.resolve(vscode.window.showQuickPick(files));
}

export function showErrorMessage(message: string): Promise<boolean> {
  return Promise.resolve(vscode.window.showErrorMessage(message))
    .then(() => false);
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

export function pasteValuesIntoSelection(values: string[] = []): Promise<boolean> {
  if (!values || values.length === 0) {
    return Promise.resolve(false);
  }

  return Promise.resolve(vscode.window.activeTextEditor.edit(edit =>
    getSortedSelections().forEach((selection, index) =>
      pasteValue(edit, values[index % values.length], selection)
    )));
}

export function getSortedSelections(): vscode.Selection[] {
  return vscode.window.activeTextEditor.selections
    .sort((a, b) => sortPositions(a.start, b.start));
}

function sortPositions(a: vscode.Position, b: vscode.Position): number {
  // sort by lines, characters
  return (a.line === b.line) ? a.character - b.character : a.line - b.line;
}

function getPositionFromSelection(selection: vscode.Selection): vscode.Position {
  // make sure that start < end
  return [selection.start, selection.end].sort((a, b) => sortPositions(a, b))[0];
}

function pasteValue(edit: vscode.TextEditorEdit, value: string, selection: vscode.Selection): void {
  let position = getPositionFromSelection(selection);
  edit.insert(position, value);
  edit.delete(selection);
}

function findEditorForTextFile(path: string): vscode.TextEditor {
  return vscode.window.visibleTextEditors
    .find(editor => editor.document.fileName.endsWith(path));
}
