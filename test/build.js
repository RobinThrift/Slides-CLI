var build = require('../lib/build'),
    path  = require('path'),
    fs    = require('fs');
require('should');
require('mocha');


describe('Building', function() {
    it('take a scss file from config and render it', function(done) {
        build._buildScss({
            includesPath: path.resolve(__dirname + '/../includes/'),
            theme: {
                css: path.resolve(__dirname + '/fixtures/scss/input.scss'),
                baseCss: path.resolve(__dirname + '/../includes/styles')
            }
        }).then(function(css) {
            css.should.be.eql('body{background:\'red\';}');
            done();
        }, function(err) {
            console.log(err);
        });    
    });

    it('get config from input file', function() {
        var file   = fs.readFileSync(
                        path.resolve(__dirname + '/fixtures/build/config_test.md'), 
                        'utf8'
                     ),
            config = build._getConfig({contents: file});

        config.title.should.be.eql('Test');
        config.author.should.be.eql('The Author');
        config.twitter.should.be.eql('TestAccount');
    });

    it('build a slide', function() {
        var html = build._buildSlide({
                theme: {
                    templates: path.resolve(__dirname + '/../includes/templates')
                }            
            })({}, {
                meta: {
                    transition: 'slide',
                    background: {
                        img: '#ffffff'
                    }
                },
                content: '# Test'
            }),
            fixture = fs.readFileSync(
                    path.resolve(__dirname + '/fixtures/build/slide_build_test.html'),
                    'utf8'
            );

        html.should.be.eql(fixture);
    });

    it('render the markdown', function() {
        var html = build._renderMarkdown({}, {
                    meta: {},
                    content: '# Test\n - this\n - is\n - a\n - test'
                }),
            fixture = fs.readFileSync(
                    path.resolve(__dirname + '/fixtures/build/markdown.html'),
                    'utf8'
                );

        html.should.be.eql(fixture);
    });

    it('wrap the slides in html', function() {
        var html = build._wrapHTML({
                    title: 'Default',
                    theme: {
                        templates: path.resolve(__dirname + '/../includes/templates')
                    }            
                }, [
                    '<section><h1>Test</h1></section>'
                ]),
            fixture = fs.readFileSync(
                    path.resolve(__dirname + '/fixtures/build/wrap.html'),
                    'utf8'
                );
        html.should.be.eql(html);
    });
});
