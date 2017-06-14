// #! /usr/bin/env node
var _ = require('underscore');
var path = require('path');
var shell = require('shelljs/global');
var yargsParser = require('yargs-parser');

var cleanedArgs = _.chain(process.argv)
                        .map(function(i) { return i; })
                        .without('--')
                        .rest(2)
                    .value();

var argv = yargsParser(cleanedArgs);

var root_dir = argv['_'][0]

var templateCount = 0;
var folderCount = 0;

_.each(ls('-d', 'src/templates/*'), function(directory) {
    // console.log(directory);
    folderCount += 1;

    if (!test('-d', path.join(root_dir, path.basename(directory)))) {
        // Directory does not exist. Create it:
        mkdir('-p', path.join(root_dir, path.basename(directory)));
    }

    _.each(ls(directory), function(file) {
        console.log(file);
        var currentFilePath = path.join(
            path.dirname(directory),
            path.basename(directory),
            path.basename(file)
        );

        var newFilePath = path.join(
            root_dir,
            path.basename(directory),
            path.basename(file)
        );

        templateCount += 1;

        cp('-f', currentFilePath, newFilePath);
    });
});

echo(
    templateCount + ' templates in ' + folderCount + ' folders ' +
    'have been copied to ' + root_dir + '.'
);
