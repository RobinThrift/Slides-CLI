// index.js

var main;
main = function(argv) {
    var args     = require('minimist')(argv),
        defaults = require('merge-defaults'),
        path     = require('path'),
        fs       = require('fs'),
        filePath = path.resolve(process.cwd() + '/src/slides.md'),
        config;

    config = defaults(args, {
        cwd: process.cwd(),
        path: filePath,
        contents: fs.readFileSync(filePath, 'utf8')
    });

    return require('./lib/build').run(config);
};
module.exports.main = main;
