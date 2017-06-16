/* eslint-disable strict */

'use strict';

/* eslint-enable strict */

const _ = require('lodash');
const fs = require('fs');
const hotCopy = require('gulp-hotcopy');
const path = require('path');
var Promise = require('bluebird');


const meta = require('./../../../meta.json');


const credentialsPath = path.join(
  process.env.HOME,
  '.dmn-interactives',
  'hot-copy-credentials.json'
);

const hotCopyDir = './src/assets/hot-copy';


module.exports = (cb) => {
  const documentID = '1qKawBUUEjkIp88fb5TsYiMcU2md6uvZB9kotsLzyYjk';
  if (_.has(meta, 'hotCopy')) {
    if (!fs.existsSync(hotCopyDir)){
      fs.mkdirSync(hotCopyDir);
    }

    const googleCredentials = require(credentialsPath);

    const copyFetchPromises = _.map(meta.hotCopy, (docConfig) => {
      return new Promise(function (resolve, reject) {
        let archieLines = [];

        const docFetch = hotCopy.fetch.parseDocument(
          googleCredentials,
          docConfig.googleID
        );
        docFetch.then((markup) => {
          archieLines = hotCopy.fetch.convertToArchieML(markup);

          const docFilePath = path.format({
            dir: hotCopyDir,
            name: docConfig.fileName,
            ext: '.aml'
          });

          fs.writeFile(
            docFilePath,
            archieLines.join('\n'),
            (error) => {
              if (error) {
                reject(error);
              }
              console.log('Wrote file.');
              resolve(docFilePath);
            }
          );
        });
      });
    });

    Promise.all(copyFetchPromises).then(function() {
      cb();
    });
  }
}
