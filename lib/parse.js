var gutil = require('gulp-util');

module.exports.extractMeta = function(input) {
    var pattern = /\-{1,2}\[\s([\s\S]*?)\s\]\-{1,2}/gm,
        extract = pattern.exec(input)[1],
        parsed  = require('js-yaml').safeLoad('---\n' + extract);

    return parsed;
};

module.exports.split = function(input) {
    return input.split(/^\-{2}/gm).map(function(val) {
        return val.trim(); 
    });
};


module.exports.toStream = function(input) {
    var File       = require('vinyl'),
        es         = require('event-stream'),
        slidesStrs = module.exports.split(input),
        slides     = slidesStrs.map(function(slide) {
            return {
                meta: module.exports.extractMeta(slide),
                content: slide.split(/\]\-{1,2}/)[1].trim()
            }; 
        }),
        // @TODO: Merge!
        files      = slides.map(function(slide) {
           var f = new File({
               contents: new Buffer(slide.content)
           });
           f.meta = slide.meta;
           return f;
        });
        
        return es.readArray(files);
};
