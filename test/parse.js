var parse = require('../lib/parse'),
    fs    = require('fs');
require('should');
require('mocha');


describe('Basics', function() {


    it('split simple slides', function() {
        var out = parse.split(fs.readFileSync('test/fixtures/split_test.md', {encoding: 'utf8'}));
        out.should.be.eql([
            '# Slide Name',
            '# Slide 2'
        ]);
    });
});
