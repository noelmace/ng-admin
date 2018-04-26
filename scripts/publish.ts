import * as RegClient from 'npm-registry-client';
import { experimental, logging } from '@angular-devkit/core';
import * as fs from 'fs';
import * as util from 'util';
import * as path from 'path';
import { ParsedArgs } from 'minimist';
import * as pkg from '../lib/packages';

export default function(args: ParsedArgs, logger: logging.Logger) {

  const npmConfig: any = {};
  if (args.proxy) {
    npmConfig.proxy = {
      http: args.proxy
    }
  }
  const client = new RegClient(npmConfig);

  const angularConfig: experimental.workspace.WorkspaceSchema = require(path.join(process.cwd(), 'angular.json'));
  
  let auth = {
    // TODO: other options
    token : args.token,
    alwaysAuth: true
  };

  const libs = Object.keys(angularConfig.projects).filter(key => angularConfig.projects[key].projectType === 'library');

  const promises = libs.forEach(libName => {
    const pkgName = pkg.parseName(libName);
    const { root } = angularConfig.projects[libName];
    logger.debug(`on 'root' : ${root.split('/').splice(1)}`);
    const projectDistPath = path.join(process.cwd(), 'dist', ...root.split('/').splice(1));
    const metadata = require(path.join(projectDistPath, 'package.json'));
    const body = fs.createReadStream(path.join(
      projectDistPath,
      `${pkgName.scope}${pkgName && '-'}${pkgName.name}-${metadata.version}.tgz`)
    );
    client.publish(args.registry, {
      metadata,
      body,
      auth
    }, (err, data, raw, res) => {
      if (err) {
        throw err;
      }
      logger.debug(raw);
      logger.info(`${libName} published`);
    });
  });
}
