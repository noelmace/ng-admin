// from https://github.com/angular/devkit/blob/d2775122eb64fcc618c0696c8b0d4c0db93dac5f/lib/bootstrap-local.js

/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/* eslint-disable no-console */
'use strict';

const fs = require('fs');
const path = require('path');
const ts = require('typescript');

if (process.argv.indexOf('--long-stack-trace') !== -1) {
  Error.stackTraceLimit = Infinity;
}

global._DevKitIsLocal = true;
global._DevKitRoot = path.resolve(__dirname, '../..');

const compilerOptions = ts.readConfigFile(path.join(__dirname, '../../tsconfig.json'), p => {
  return fs.readFileSync(p, 'utf-8');
}).config;

const oldRequireTs = require.extensions['.ts'];
require.extensions['.ts'] = function(m, filename) {
  // Node requires all require hooks to be sync.
  const source = fs.readFileSync(filename).toString();

  try {
    let result = ts.transpile(source, compilerOptions['compilerOptions'], filename);

    // Send it to node to execute.
    return m._compile(result, filename);
  } catch (err) {
    console.error('Error while running script "' + filename + '":');
    console.error(err.stack);
    throw err;
  }
};
