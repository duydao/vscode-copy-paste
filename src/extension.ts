'use strict';

import * as vscode from 'vscode';
import { PasteCommand } from './paste-command';
import { OpenFileCommand } from './open-file-command';

const COMMAND_PREFIX = 'extension.duydao.copy-paste';

// shortcut for registering commands
function register(command: string, callback: (...args: any[]) => any) {
  return vscode.commands.registerCommand(`${COMMAND_PREFIX}.${command}`, callback);
}

// this method is called when your extension is activated
export function activate(context: vscode.ExtensionContext) {
  let pasteCommand = new PasteCommand();
  let openFileCommand = new OpenFileCommand();

  // register paste command
  const disposables = [
    register('pasteByInputBox', () => pasteCommand.pasteFromInputBox()),
    register('pasteByClipboard', () => pasteCommand.pasteFromClipboard()),
    register('pasteByTextFile', () => pasteCommand.pasteFromTextFile()),
    register('pasteByJavaScriptFile', () => pasteCommand.pasteFromJavaScriptFile()),

    register('openTextFile', () => openFileCommand.openTextFile()),
    register('openJavaScriptFile', () => openFileCommand.openJavaScriptFile()),
  ];  

  context.subscriptions.push(...disposables);
}

// this method is called when your extension is deactivated
export function deactivate() {
}