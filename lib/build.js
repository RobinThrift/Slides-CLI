//lib/build.js 

var Q    = require('q'),
    FS   = require('q-io/fs'),
    path = require('path'),
    copyRevealCss, buildScss, _buildSlide, _getConfig,
    _renderMarkdown, _wrapHTML;

copyRevealCss = function(config) {
    //@TODO include print style sheet

    // copy the base style sheet and rename it to _reveal.scss
    return FS.copy(path.resolve(config.includesPath +
                                '/../node_modules/reveal.js/css/reveal.min.css'),
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


_buildSlide = function(config) {
    var Handlebars = require('handlebars'),
        fs         = require('fs'),
        tmplString = fs.readFileSync(config.theme.templates + '/slide.hbt', 'utf8'),
        slideTmp   = Handlebars.compile(tmplString);

    return function(slide) {
        slide.config = config;
        return slideTmp(slide);
    };
};
module.exports._buildSlide = _buildSlide;


_renderMarkdown = function(config, slide) {
    var marked = require('marked');

    return marked(slide.content, config.marked);
};
module.exports._renderMarkdown = _renderMarkdown;

_getConfig = function(baseFile) {
    var defaults     = require('merge-defaults'),
        includesPath = path.resolve(__dirname + '/../includes/'),
        data         = require('./parse').getConfig(baseFile.contents);

    return defaults(data, {
        title: 'Default Title',
        includesPath: includesPath,
        theme: {
            css: includesPath + '/styles',
            baseCss: includesPath + '/styles',
            templates: includesPath + '/templates'
        },
        marked: {
            highlight: function(code) {
                return require('highlight.js').highlightAuto(code).value;
            },
            gfm: true,
            tables: true,
            breaks: true,
            smartLists: true,
            smartypants: true
        }
    });
};
module.exports._getConfig = _getConfig;

_wrapHTML = function(config, slides) {
    var Handlebars = require('handlebars'),
        fs         = require('fs'),
        tmplString = fs.readFileSync(config.theme.templates + '/wrap.hbt', 'utf8'),
        tmpl       = Handlebars.compile(tmplString);

    return tmpl({
        config: config,
        slides: slides
    });
};
module.exports._wrapHTML = _wrapHTML;
