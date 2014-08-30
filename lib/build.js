//lib/build.js 

var Q    = require('q'),
    FS   = require('q-io/fs'),
    path = require('path'),
    copyRevealCss, buildScss, _buildSlide, _getConfig;

copyRevealCss = function(config) {
    //@TODO include print style sheet

    // copy the base style sheet and rename it to _reveal.scss
    return FS.copy(path.resolve(config.includesPath + '/../node_modules/reveal.js/css/reveal.min.css'),
                   path.resolve(config.includesPath + '/styles/_reveal.scss'));
};
module.exports._copyRevealCss = copyRevealCss;

buildScss = function(config) {
    var sass    = require('node-sass'),
        bourbon = require('node-bourbon'),
        promise = Q.defer();
    
    copyRevealCss(config).then(function() {
        sass.render({
            file: config.theme.css,
            success: function(css) {
                promise.resolve(css);
            },
            error: function(err) {
                promise.reject(err);
            },
            includePaths: bourbon.with(config.theme.baseCss),
            outputStyle: 'compressed'
        });
    });

    return promise.promise;
};
module.exports._buildScss = buildScss;
_getConfig = function(baseFile) {
    var defaults     = require('merge-defaults'),
        includesPath = path.resolve(__dirname + '/../includes/'),
        data         = require('./parse').exec(baseFile.contents);

    return defaults(data.meta, {
        title: 'Default Title',
        includesPath: includesPath,
        theme: {
            css: includesPath + '/styles',
            baseCss: includesPath + '/styles',
            templates: includesPath + '/templates'
        }
    });
};
module.exports._getConfig = _getConfig;
