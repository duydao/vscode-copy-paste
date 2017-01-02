'use strict';

import * as vscode from 'vscode';
import * as utils from './utils';

export class OpenFileCommand {
  public openTextFile(): Thenable<vscode.TextDocument> {
    let config = utils.getConfiguration();
    const path = config.get('paste-from-file.txt.path', '');
    const column = config.get('open.column', 1);
    return vscode.commands.executeCommand('vscode.open', vscode.Uri.file(path), column);
  }

  public openJavaScriptFile(): Thenable<vscode.TextDocument> {
    let config = utils.getConfiguration();
    const path = config.get('paste-from-file.js.path', '');
    const column = config.get('open.column', 1);
    return vscode.commands.executeCommand('vscode.open', vscode.Uri.file(path), column);
  }
}