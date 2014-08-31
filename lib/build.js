//lib/build.js 

var Q    = require('q'),
    FS   = require('q-io/fs'),
    path = require('path'),
    copyRevealAssets, buildScss, _buildSlide, _getConfig,
    _renderMarkdown, _wrapHTML;

copyRevealAssets = function(config) {
    var assets = [
        [path.resolve(config.includesPath +
                                '/../node_modules/reveal.js/css/reveal.min.css'),
        path.resolve(config.includesPath + '/styles/_reveal.scss')],
        [path.resolve(config.includesPath +
                                '/../node_modules/reveal.js/css/print/pdf.css'),
        path.resolve(config.includesPath + '/styles/_pdf.scss')],
        [path.resolve(config.includesPath +
                                '/../node_modules/reveal.js/js/reveal.min.js'),
        path.resolve(config.includesPath + '/scripts/reveal.min.js')]
    ];

    // copy the base style sheet and rename it to _reveal.scss
    return Q.all(assets.map(function(asset) {
        return FS.copy(asset[0], asset[1]);
    }));
};
module.exports._copyRevealAssets = copyRevealAssets; // @TODO: add test

buildScss = function(config) {
    var sass    = require('node-sass'),
        bourbon = require('node-bourbon'),
        promise = Q.defer();
    
    copyRevealAssets(config).then(function() {
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
        srcDir: path.join(baseFile.cwd, '/src'),
        targetDir: path.join(baseFile.cwd, '/build'),
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


module.exports.run = function(baseFile) {
    var globby = require('globby'),
        fs     = require('fs'),
        rimraf = require('rimraf'),
        config = _getConfig(baseFile),
        slides = require('./parse').getSlides(baseFile).map(function(slide) {
                        slide.content = _renderMarkdown(config, slide);
                        return slide;
                    }),
        assets = globby.sync([
                     config.srcDir + '/*',
                     '!' + baseFile.path
                 ]),
        slidesHTML = slides.map(_buildSlide(config)),
        fullHTML   = _wrapHTML(config, slidesHTML),
        proms      = [];

    // make the build dir (and styles & js dirs)
    rimraf.sync(config.targetDir);
    fs.mkdirSync(config.targetDir);
    fs.mkdirSync(config.targetDir + '/styles');
    fs.mkdirSync(config.targetDir + '/scripts');

    // copy all the assets
    assets.forEach(function(file) {
        proms.push(FS.copyTree(file, config.targetDir));
    });

    // write the output html file
    proms.push(FS.write(config.targetDir + '/index.html', fullHTML));

    // write the CSS
    proms.push(FS.write(config.targetDir + '/styles/main.css', buildScss(config)));

    return Q.all(proms);
};
