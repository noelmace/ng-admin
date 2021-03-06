import * as bump from 'bump-version';
import { experimental } from '@angular-devkit/core';
import * as path from 'path';
import { ParsedArgs } from 'minimist';
import { logging } from '@angular-devkit/core';
import * as semver from 'semver';
import * as Git from 'nodegit';

const versionKeys = ['major', 'minor', 'patch'];

export default function(args: ParsedArgs, logger: logging.Logger) {
  const angularConfig: experimental.workspace.WorkspaceSchema = require(path.join(process.cwd(), 'angular.json'));
  const projectNames = Object.keys(angularConfig.projects);

  if (!(args._.length > 0 && ( versionKeys.includes(args._[0]) || semver.valid(args._[0])))) {
    logger.error('You must specify a version as the first argument.');
    logger.error(`Authorized versions are semver and ${versionKeys}.`);
    return;
  }

  const version = args._[0];

  logger.info(`bumping libraries versions to ${version} :`);
  projectNames.map(libName => {
    if (angularConfig.projects[libName].projectType === 'library') {
      logger.info(`\t${libName}`);
      const { root } = angularConfig.projects[libName];
      bump(path.resolve(process.cwd(), root), version, ['package.json']);
    }
  });

  logger.info('Done.');
}
