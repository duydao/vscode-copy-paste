'use strict';

import * as vscode from 'vscode';
import * as utils from './utils';

export class OpenFileCommand {
  public openTextFile(): Thenable<string> {
    const config = utils.getConfig();
    const files = config.get('paste-from-file.txt.path', []);
    return utils.showFilePicker(files)
      .then(path => {
        const column = config.get('open.column', 1);
        const file = vscode.Uri.file(path);
        return vscode.commands.executeCommand('vscode.open', file, column);
      });
  }

  public openJavaScriptFile(): Thenable<string> {
    const config = utils.getConfig();
    const files = config.get('paste-from-file.js.path', []);
    return utils.showFilePicker(files)
      .then(path => {
        const column = config.get('open.column', 1);
        const file = vscode.Uri.file(path);
        return vscode.commands.executeCommand('vscode.open', file, column);
      });
  }
}