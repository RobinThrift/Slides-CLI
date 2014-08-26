var parse = require('../lib/parse'),
    fs    = require('fs');
require('should');
require('mocha');


describe('Basics', function() {


    it('should extract meta information', function() {
        var parsed = parse.extractMeta(fs.readFileSync('test/fixtures/meta_test.md', {encoding: 'utf8'}));
        parsed.should.be.eql({ name: 'Slides Name', author: 'Slides Author' });
    });

    it('split simple slides', function() {
        var out = parse.split(fs.readFileSync('test/fixtures/split_test.md', {encoding: 'utf8'}));
        out.should.be.eql([
            '# Slide Name',
            '# Slide 2'
        ]);
    });
});
