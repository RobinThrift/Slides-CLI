var gutil = require('gulp-util');

module.exports.extractMeta = function(slide) {
    slide = '-- ' + slide;
    var pattern = /^-{2}\s+\{\s*([\s\S]*?)\s*\}\s*/gm,
        extract = pattern.exec(slide),
        parsed  = {};
    
    if (extract) {
        extract = extract[1].replace(/^(\t|\s{2,4})/gm, '');
        parsed  = require('js-yaml').safeLoad('---\n' + extract);
    }

    return parsed;
};

module.exports.stripMeta = function(slide) {
    slide = '-- ' + slide;
    var pattern = /^-{2}\s+\{\s*([\s\S]*?)\s*\}\s*/gm;
    return slide.replace(pattern, '');
};

module.exports.split = function(slides) {
    return slides.split(/^\-{2}/gm).map(function(val) {
        return val.trim(); 
    });
}; 


module.exports.exec = function(rawSlides) {
    var data = module.exports.split(rawSlides),
        meta = require('js-yaml').safeLoad('---\n' + data[0]),
        slides = data.slice(1).map(function(val) {
            return {
                meta: module.exports.extractMeta(val),
                content: module.exports.stripMeta(val)
            };
        });

    return {
        meta: meta,
        slides: slides
    };
};

