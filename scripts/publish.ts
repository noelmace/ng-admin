import { experimental, logging } from '@angular-devkit/core';
import * as fs from 'fs';
import * as util from 'util';
import * as path from 'path';
import { ParsedArgs } from 'minimist';
import * as pkg from '../lib/packages';
import { resolve } from '@angular-devkit/core/node';
import { promisify } from 'util';
import * as stream from 'stream';

const npm = require(resolve('npm', { basedir: '/', checkGlobal: true }))

class NullStream extends stream.Writable {
  _write() {}
}

export default function(args: ParsedArgs, logger: logging.Logger) {

  promisify(npm.load)({ progress: true, logstream: new NullStream() })
  .then(() => {
    const projectRoot = process.cwd();
    const angularConfig: experimental.workspace.WorkspaceSchema = require(path.join(process.cwd(), 'angular.json'));

    return Object.keys(angularConfig.projects)
      .filter(key => angularConfig.projects[key].projectType === 'library')
      .reduce((acc: Promise<void>, libName: string) => {
        const { root } = angularConfig.projects[libName];
        const projectDistPath = path.join(projectRoot, 'dist', ...root.split('/').splice(1));
        const metadata = require(path.join(projectDistPath, 'package.json'));

        if (metadata.private) {
          logger.debug(`${name} (private)`);

          return acc;
        }

        const pkgName = pkg.parseName(libName);

        const tarball = path.join(
          projectDistPath,
          `${pkgName.scope}${pkgName.scope && '-'}${pkgName.name}-${metadata.version}.tgz`
        );

        return acc.then(() => {
          logger.info(libName);
          process.chdir(projectDistPath);
          return promisify(npm.commands['publish'])([]);
        }).then(() => logger.info(`${libName} published`))
        .catch((err: Error) => {
          logger.error(`publish on ${libName} failed`);
          logger.debug(`from ${projectDistPath}`);
          logger.error(err.message);
        });
      }, Promise.resolve());
  }).then(() => {
    logger.info('Done.');
  }).catch(err => {
    logger.error(`their was an error during the publish process`);
    logger.fatal(err.stack);
  });
}
