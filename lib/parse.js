
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
    var pattern = /^-{2}(\s+\{\s*([\s\S]*?)\s*\}\s*)?/gm;
    return slide.replace(pattern, '').trim();
};

module.exports.split = function(slides) {
    return slides.split(/^\-{2}/gm).map(function(val) {
        return val.trim(); 
    });
}; 

var cache;
module.exports.getConfig = function(rawSlides) {
    var data = module.exports.split(rawSlides),
        meta = require('js-yaml').safeLoad('---\n' + data[0]),
        slides = data.slice(1).map(function(val) {
            return {
                meta: module.exports.extractMeta(val),
                content: module.exports.stripMeta(val)
            };
        });


    cache =  {
        meta: meta,
        slides: slides
    };

    return meta;
};

module.exports.getSlides = function(rawSlides) {
    if (cache) { return cache.slides; }

    module.exports.getConfig(rawSlides);
    return cache.slides;
};

