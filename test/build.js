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
});
