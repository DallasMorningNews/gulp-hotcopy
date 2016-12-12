var _ = require('underscore');
var Promise = require('bluebird');
var archieml = Promise.promisifyAll(require('archieml'));
var fs = Promise.promisifyAll(require('fs'));


var HOT_COPY_DIR = './build/static/assets/hot-copy/';


function parseArchieFile(fileName) {
    return new Promise(function (resolve, reject) {
        var fileRead =  fs.readFileAsync(HOT_COPY_DIR + fileName + '.aml', 'utf-8');

        fileRead.then(
          function(data) {
              resolve({ fileName: fileName, data: archieml.load(data) });
          },
          function(error) { reject(error); }
        );
    });
}

module.exports = function(meta) {
    var metaObj = meta;

    if (typeof meta.hotCopyDocument !== 'undefined') {
        if (meta.hotCopyDocument !== '') {
            var hotCopyItems = {};

            var archiePromises = _.map(
                fs.readdirSync(HOT_COPY_DIR),
                function(dirFile) {
                    if (dirFile.substring(dirFile.indexOf('.')) === '.aml') {
                        return parseArchieFile(
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
                            HOT_COPY_DIR + result.fileName + '.json',
                            JSON.stringify(result.data, null, 4),
                            function(err) { if (err) { return console.log(err); } }
                        );
                    });

                    metaObj = _.extend(meta, { hotCopy: hotCopyItems });
                },
                function(error) {
                    console.log('ArchieML conversion error:');
                    console.log(error);
                }
            );
        }
    }

    return metaObj;
};