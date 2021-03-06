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
                                '/../node_modules/reveal.js/css/theme/default.css'),
        path.resolve(config.includesPath + '/styles/default.scss')],
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
        path    = require('path'),
        promise = Q.defer();
    
    copyRevealAssets(config).done(function() {
        sass.render({
            file: path.resolve(config.theme.css),
            success: function(css) {
                promise.resolve(css);
            },
            error: function(err) {
                promise.reject(err);
            },
            includePaths: bourbon.with(
                            config.theme.baseCss,
                            path.dirname(config.theme.css) 
                          ),
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
        cwd: baseFile.cwd,
        srcDir: path.join(baseFile.cwd, '/src'),
        targetDir: path.join(baseFile.cwd, '/build'),
        includesPath: includesPath,
        ignore: [],
        theme: {
            css: includesPath + '/styles/theme.scss',
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
        },
        reveal: {
            controls: true,              
            progress: true,              
            slideNumber: true,           
            history: true,               
            keyboard: true,              
            overview: true,              
            transition: 'linear',        
            backgroundTransition: 'slide'
        } 
    });
};
module.exports._getConfig = _getConfig;

_wrapHTML = function(config, slides) {
    var Handlebars = require('handlebars'),
        fs         = require('fs'),
        tmplString = fs.readFileSync(config.theme.templates + '/wrap.hbt', 'utf8'),
        tmpl       = Handlebars.compile(tmplString);

    Handlebars.registerHelper('json', JSON.stringify);
        
    return tmpl({
        config: config,
        slides: slides
    });
};
module.exports._wrapHTML = _wrapHTML;


module.exports.run = function(baseFile) {
    var globby = require('globby'),
        fs     = require('fs'),
        path   = require('path'),
        rimraf = require('rimraf'),
        config = _getConfig(baseFile),
        slides = require('./parse').getSlides(baseFile).map(function(slide) {
                        slide.content = _renderMarkdown(config, slide);
                        return slide;
                    }),
        slidesHTML = slides.map(_buildSlide(config)),
        fullHTML   = _wrapHTML(config, slidesHTML),
        proms      = [],
        assets;

    // switch cwd so relative file paths work as expected
    process.chdir(config.srcDir);

    // collect the assets
    assets = globby.sync([
         '*',
         '!' + path.basename(baseFile.path),
         '!*.scss',
         '!**/*.scss'
     ].concat(config.ignore.map(function(i) {
         return '!' + i;
     })), {
         cwd: config.srcDir
     });

    // make the build dir (and styles & js dirs)
    rimraf.sync(config.targetDir);
    fs.mkdirSync(config.targetDir);
    fs.mkdirSync(config.targetDir + '/styles');
    fs.mkdirSync(config.targetDir + '/scripts');

    // copy all the assets
    assets.forEach(function(file) {
        proms.push((function() {
            var defer = Q.defer(),
                dir   = file.replace(config.srcDir, '');
            
            FS.makeTree(path.join(config.targetDir,  dir)).then(function() {
                FS.copyTree(file, path.join(config.targetDir, dir)).then(function() {
                    defer.resolve();
                }, function(err) {
                    defer.reject(err);
                });
            }, function(err) {
                defer.reject(err);
            });
            return defer.promise;
        })());
        proms.push();
    });

    // write the output html file
    proms.push(FS.write(config.targetDir + '/index.html', fullHTML));

    // write the CSS
    proms.push((function() {
        var defer = Q.defer();
        buildScss(config).then(function(css) {
            FS.write(config.targetDir + '/styles/main.css', css)
                .then(function() {
                    defer.resolve();
                }, function(err) {
                    defer.reject(err);
                });
            proms.push(FS.copy(config.includesPath + '/scripts/reveal.min.js',
                               config.targetDir + '/scripts/reveal.min.js'
                      ));
        }, function(err) {
            defer.reject(err); 
        });
        return defer.promise;
    })());
    proms.push(FS.write(config.targetDir + '/styles/main.css', buildScss(config)));

    return Q.all(proms);
};
