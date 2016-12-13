#! /usr/bin/env node
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

console.log(process);
