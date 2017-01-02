'use strict';

import * as vscode from 'vscode';
import * as ncp from 'copy-paste';
import * as utils from './utils';
import { generateValuesFromJavaScript } from './script-runner'
const WHITESPACE_REGEX = /\s/g;

export class PasteCommand {
  public pasteFromInputBox(): Promise<boolean> {
    // split input box input by whitespace
    return Promise.resolve(vscode.window.showInputBox())
      .then(text => text.split(WHITESPACE_REGEX))
      .then(values => utils.pasteValuesIntoSelection(values));
  }

  public pasteFromClipboard(): Promise<boolean> {
    // split clipboard by whitespace
    let values = ncp.paste().split(WHITESPACE_REGEX);
    return utils.pasteValuesIntoSelection(values);
  }

  private pasteFromFile(path: string): Promise<boolean> {
    return utils.openFile(path)
      .then(document => document.getText().split(WHITESPACE_REGEX))
      .then(values => utils.pasteValuesIntoSelection(values))
      .catch(() => utils.showErrorMessage(`copy-paste: unable to open ${path}`));
  }

  public pasteFromTextFile(): Promise<boolean> {
    const files = utils.getConfig().get('paste-from-file.txt.path', []);
    return utils.showFilePicker(files)
      .then(path => utils.validatePasteFromFile(path).then(message => {
        if (message) {
          return utils.showErrorMessage(message);
        }
        return this.pasteFromFile(path);
      }));
  }

  public pasteFromJavaScriptFile(): Promise<any> {
    const files = utils.getConfig().get('paste-from-file.js.path', []);
    return utils.showFilePicker(files)
      .then(path => utils.validatePasteFromFile(path).then(message => {
        if (message) {
          return utils.showErrorMessage(message);
        }
        return utils.openFile(path)
          .then(document => generateValuesFromJavaScript(document))
          .then(values => utils.pasteValuesIntoSelection(values))
          .catch(e => {
            console.error('error while running', path, e);
            utils.showErrorMessage(`Error while running ${path}: ${e.message}`)
          });
      }));
  }
}