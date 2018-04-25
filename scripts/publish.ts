import { client } from 'npm-registry-client';
import { experimental } from '@angular-devkit/core';
import * as fs from 'fs';
import * as util from 'util';

const angularConfig: experimental.workspace.WorkspaceSchema = require('./angular.json');

const auth = {
  alwaysAuth: true
};

const libs = Object.keys(angularConfig.projects).filter(key => angularConfig.projects[key].projectType === 'library');

const promises = libs.forEach(async libName => {
  const metadata = require(`./dist/${libName}/package.json`);
  const body = fs.createReadStream(`./dist/${libName}.tgz`);
  return util.promisify(client.publish)('foobar/registry', {
    metadata,
    body,
    auth
  });
});
