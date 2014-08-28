var parse = require('../lib/parse'),
    fs    = require('fs');
require('should');
require('mocha');


describe('Basics', function() {


    it('should extract meta information', function() {
        var parsed = parse.extractMeta(fs.readFileSync('test/fixtures/meta_test.md', 'utf8'));
        parsed.should.be.eql({classes: [ 'test' ], bgImg: 'test.png'});
    });

    it('split simple slides', function() {
        var out = parse.split(fs.readFileSync('test/fixtures/split_test.md', {encoding: 'utf8'}));
        out.should.be.eql([
            '',
            '# Slide Name',
            '{\n    classes:\n        - big-img\n}\n# Slide 2',
            '# Slide 3'
        ]);
    });

    it('creates vinyl file stream from slides', function(done) {
        var stream = parse.toStream(fs.readFileSync('test/fixtures/stream_test.md', {encoding: 'utf8'})),
            es     = require('event-stream'),
            i      = 0,
            objs   = [
                {
                    contents: '# Slide Name',
                    meta: { bgImg: 'test.png' }
                },
                {
                    contents: '# Slide 2',
                    meta: { transition: 'slide' }
                }
            ],
            test   = es.map(function(data, cb) {
                if (i < 2) {
                    var fixture = objs[i];
                    data.contents.toString().should.be.eql(fixture.contents);
                    data.meta.should.be.eql(fixture.meta);
                    i++;
                } 
                cb(null, data);
            });
       
        stream.pipe(test);

        stream.on('end', function() {
            done();
        });
    });
});
