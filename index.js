var _ = require('underscore');
var Promise = require('bluebird');
var archieml = Promise.promisifyAll(require('archieml'));
var fs = Promise.promisifyAll(require('fs'));
var markdownFilter = require('nunjucks-markdown-filter');


var HOT_COPY_DIR = './build/static/assets/hot-copy/';


function parseArchieFile(hotCopyDir, fileName) {
    return new Promise(function (resolve, reject) {
        var fileRead =  fs.readFileAsync(hotCopyDir + fileName + '.aml', 'utf-8');

        fileRead.then(
          function(data) {
              resolve({ fileName: fileName, data: archieml.load(data) });
          },
          function(error) { reject(error); }
        );
    });
}

module.exports = {
    configure: function(config) {
        this.hotCopyDir = HOT_COPY_DIR;
        if (_.has(config, 'hotCopyDir')) {
            this.hotCopyDir = config.hotCopyDir;
        }
        console.log(this.hotCopyDir);
    },
    watchHotCopyFiles: function(gulp, tasks) {
        var reload = require('browser-sync').create().reload;

        return gulp.watch(
            this.hotCopyDir + '*.aml',
            tasks
        ).on("change", reload);
    },
    extendNunjucks: function(nunjucksEnv) {
        markdownFilter.install(nunjucksEnv, 'markdown');
        nunjucksEnv.addGlobal(
            'hotCopyHelper',
            function () {
                return {
                    'connect': function(copySlug) {
                        if (
                            typeof this.ctx.hotCopyItems !== 'undefined' &&
                            _.contains(_.keys(this.ctx.hotCopyItems), copySlug)
                        ) {
                            return this.ctx.hotCopyItems[copySlug];
                        }

                        return false;
                    }.bind(this)
                };
            }
        );
    },
    insertHotCopy: function(meta) {
        var metaObj = meta;
        var thisObj = this;

        if (typeof meta.hotCopyDocument !== 'undefined') {
            if (meta.hotCopyDocument !== '') {
                var hotCopyItems = {};

                var archiePromises = _.map(
                    fs.readdirSync(thisObj.hotCopyDir),
                    function(dirFile) {
                        if (dirFile.substring(dirFile.indexOf('.')) === '.aml') {
                            return parseArchieFile(
                                thisObj.hotCopyDir,
                                dirFile.substring(0, dirFile.indexOf('.'))
                            );
                        }

                        return null;
                    }
                );

                Promise.all(_.compact(archiePromises)).then(
                    function(results) {
                        _.each(results, function(result) {
                            // Namespace hot-copy data under the 'hotCopy' property
                            // on the meta object.
                            hotCopyItems[result.fileName] = result.data;

                            // Write the data to a JSON file.
                            fs.writeFile(
                                thisObj.hotCopyDir + result.fileName + '.json',
                                JSON.stringify(result.data, null, 4),
                                function(err) { if (err) { return console.log(err); } }
                            );
                        });

                        metaObj = _.extend(meta, { hotCopyItems: hotCopyItems });
                    },
                    function(error) {
                        console.log('ArchieML conversion error:');
                        console.log(error);
                    }
                );
            }
        }

        return metaObj;
    }
};