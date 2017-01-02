'use strict';

import * as vscode from 'vscode';
import { PasteCommand } from './paste-command';

const COMMAND_PREFIX = 'extension.duydao.copy-paste';

// shortcut for registering commands
function register(command: string, callback: (...args: any[]) => any) {
  return vscode.commands.registerCommand(`${COMMAND_PREFIX}.${command}`, callback);
}

// this method is called when your extension is activated
export function activate(context: vscode.ExtensionContext) {
  let pasteCommand = new PasteCommand();

  // register paste command
  const disposables = [
    register('pasteByInputBox', () => pasteCommand.pasteFromInputBox()),
    register('pasteByClipboard', () => pasteCommand.pasteFromClipboard()),
    register('pasteByTextFile', () => pasteCommand.pasteFromTextFile()),
    register('pasteByJavaScriptFile', () => pasteCommand.pasteFromJavaScriptFile()),
  ];  

  context.subscriptions.push(...disposables);
}

// this method is called when your extension is deactivated
export function deactivate() {
}