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
      .then(values => this.pasteValuesIntoSelection(values));
  }

  public pasteFromClipboard(): Promise<boolean> {
    // split clipboard by whitespace
    let values = ncp.paste().split(WHITESPACE_REGEX);
    return this.pasteValuesIntoSelection(values);
  }

  private pasteFromFile(path: string): Promise<boolean> {
    return this.openFile(path)
      .then(document => document.getText().split(WHITESPACE_REGEX))
      .then(values => this.pasteValuesIntoSelection(values))
      .catch(() => utils.showErrorMessage(`copy-paste: unable to open ${path}`));
  }

  public pasteFromTextFile(): Promise<boolean> {
    const path = utils.getConfiguration().get('paste-from-file.txt.path', '');
    return utils.validatePasteFromFile(path)
      .then(message => {
        if (message) {
          return utils.showErrorMessage(message);
        }
        return this.pasteFromFile(path);
      });
  }

  public pasteFromJavaScriptFile(): Promise<any> {
    const path = utils.getConfiguration().get('paste-from-file.js.path', '');
    return utils.validatePasteFromFile(path)
      .then(message => {
        if (message) {
          return utils.showErrorMessage(message);
        }
        return this.openFile(path)
          .then(document => generateValuesFromJavaScript(document))
          .then(values => this.pasteValuesIntoSelection(values))
          .catch(e => {
            console.error('error while running', path, e);
            utils.showErrorMessage(`Error while running ${path}: ${e.message}`)
          });
      });
  }

  private pasteValuesIntoSelection(values: string[] = []): Promise<boolean> {
    if (!values || values.length === 0) {
      return Promise.resolve(false);
    }
    return Promise.resolve(utils.pasteValuesIntoSelection(values));
  }

  private openFile(path: string): Promise<vscode.TextDocument> {
    let editor = utils.findEditorForTextFile(path);
    if (editor) {
      // use the content in the editor if available.
      return Promise.resolve(editor.document);
    }
    return utils.openFile(path);
  } 
}