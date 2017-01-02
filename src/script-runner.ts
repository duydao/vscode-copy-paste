'use strict';

import * as vscode from 'vscode';
import * as utils from './utils';

import * as vm from 'vm';
import * as lodash from 'lodash';
import * as moment from 'moment';
import * as numeral from 'numeral';
import * as mathjs from 'mathjs';

export function generateValuesFromJavaScript(document: vscode.TextDocument): string[] {
  const script = createScriptFromDocument(document);
  const session = {};
  return utils.getSortedSelections().map((selection, index) =>
    runScript(script, {
      session,
      selection: {
        index0: index,
        index: index + 1,
        text: document.getText(selection)
      },
      // libs
      require,
      console,
      _: lodash,
      lodash,
      numeral,
      moment,
      mathjs,
    })
  );
}

function createScriptFromDocument(document: vscode.TextDocument) {
  const timeout = utils.getConfig().get('paste-from-file.js.timeout', 1);
  return new vm.Script(document.getText(), {
    filename: document.fileName,
    timeout: timeout * 1000,
    displayErrors: true
  });
}

function runScript(script: vm.Script, context: {}): string {
  return String(script.runInContext(vm.createContext(context)))
}