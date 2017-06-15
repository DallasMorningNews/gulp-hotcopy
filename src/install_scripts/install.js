// #! /usr/bin/env node
const _ = require('lodash');
const path = require('path');
const shell = require('shelljs');

const hotCopyModulePath = process.cwd();

const modulePathParts = hotCopyModulePath.split(path.sep);

const parentPath = _.chain(modulePathParts)
                      .slice(
                        0,
                        _.findLastIndex(
                          modulePathParts,
                          // eslint-disable-next-line comma-dangle
                          o => (o === 'node_modules')
                        )  // eslint-disable-line comma-dangle
                      )
                      .join(path.sep)
                      .value();

const placeGulpTask = (srcPath, destPath) => {
  const srcTasksDir = path.join(srcPath, 'src', 'gulp_scripts');
  const destTasksDir = path.join(destPath, 'gulp', 'tasks');

  const srcTaskPath = path.join(srcTasksDir, 'templates.js');
  const destTaskPath = path.join(destTasksDir, 'templates.js');
  const destDupeTaskPath = path.join(destTasksDir, 'templates.archived.js');

  if (shell.test('-f', destTaskPath)) {
    if (shell.test('-f', destDupeTaskPath)) {
      shell.cp('-f', srcTaskPath, destTaskPath);
    } else {
      shell.mv('-f', destTaskPath, destDupeTaskPath);
      shell.cp('-f', srcTaskPath, destTaskPath);
    }
  } else {
    shell.cp('-f', srcTaskPath, destTaskPath);
  }
};

const placeTemplates = (srcPath, destPath) => {
  const srcTemplateDir = path.join(srcPath, 'src', 'templates');

  _.forEach(shell.ls(srcTemplateDir), (directory) => {
    const srcDirPath = path.join(
      srcTemplateDir,
      path.basename(directory)  // eslint-disable-line comma-dangle
    );

    const destDirPath = path.join(
      destPath,
      'src',
      'templates',
      path.basename(directory)  // eslint-disable-line comma-dangle
    );

    if (!shell.test('-d', destDirPath)) {
      // Directory does not exist. Create it:
      shell.mkdir('-p', destDirPath);
    }

    _.forEach(shell.ls(srcDirPath), (file) => {
      const srcFilePath = path.join(
        srcDirPath,
        path.basename(file)  // eslint-disable-line comma-dangle
      );

      const destFilePath = path.join(
        destDirPath,
        path.basename(file)  // eslint-disable-line comma-dangle
      );

      shell.cp('-f', srcFilePath, destFilePath);
    });
  });
};

placeGulpTask(hotCopyModulePath, parentPath);
placeTemplates(hotCopyModulePath, parentPath);
