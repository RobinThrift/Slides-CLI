var parse = require('../lib/parse'),
    fs    = require('fs');
require('should');
require('mocha');


describe('Basics', function() {


    it('should extract meta information', function() {
        var parsed = parse.extractMeta(fs.readFileSync('test/fixtures/meta_test.md', 'utf8'));
        parsed.should.be.eql({classes: [ 'test' ], bgImg: 'test.png'});
    });

    it('strip meta information', function() {
        var parsed = parse.stripMeta(fs.readFileSync('test/fixtures/meta_test.md', 'utf8'));
        parsed.should.be.eql('');
    });

    it('split slides', function() {
        var out = parse.split(fs.readFileSync('test/fixtures/split_test.md', {encoding: 'utf8'}));
        out.should.be.eql([
            '',
            '# Slide Name',
            '{\n    classes:\n        - big-img\n}\n# Slide 2',
            '# Slide 3'
        ]);
    });

    it('split slides an fill with content & metadata', function() {
        var slides = parse.getConfig(fs.readFileSync('test/fixtures/exec_test.md', 'utf8'));
        slides.should.be.eql({title: 'Test', author: 'Robin Thrift', twitter: 'RobinThrift'});
    });

    it('should get the slides', function() {

        var slides = parse.getSlides(fs.readFileSync('test/fixtures/exec_test.md', 'utf8'));
        slides.should.be.eql([
            {meta: { classes: [ 'big-img' ], transition: 'slide' },
                content: '# Slide Name\n\n- these\n- are\n- bullet\n- points'},
            {meta: {}, content: '-- # Slide 2'}
        ]);
    });
});
