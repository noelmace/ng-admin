import * as client from 'npm-registry-client';
import { experimental, logging } from '@angular-devkit/core';
import * as fs from 'fs';
import * as util from 'util';
import * as path from 'path';
import { ParsedArgs } from 'minimist';

export default function(args: ParsedArgs, logger: logging.Logger) {

  const angularConfig: experimental.workspace.WorkspaceSchema = require(path.join(process.cwd(), 'angular.json'));
  
  let auth = {
    // TODO: other options
    token : args.token,
    alwaysAuth: true
  };

  const libs = Object.keys(angularConfig.projects).filter(key => angularConfig.projects[key].projectType === 'library');

  const promises = libs.forEach(async libName => {
    const { root } = angularConfig.projects[libName];
    const metadata = require(path.join(process.cwd(), `dist/${root}/package.json`));
    const body = fs.createReadStream(path.join(process.cwd(), `dist/${libName}.tgz`));
    return util.promisify(client.publish)(args.registry, {
      metadata,
      body,
      auth
    });
  });
}
