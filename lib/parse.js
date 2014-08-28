var gutil = require('gulp-util');

module.exports.extractMeta = function(slide) {
    var pattern = /^-{2}\s*\{\s*([\s\S]*?)\s*\}\s*/gm,
        extract = pattern.exec(slide)[1].replace(/^(\t|\s{2,4})/gm, ''),
        parsed  = require('js-yaml').safeLoad('---\n' + extract);

    return parsed;
};

module.exports.split = function(slides) {
    return slides.split(/^\-{2}/gm).map(function(val) {
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
