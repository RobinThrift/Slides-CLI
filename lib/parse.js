var gutil = require('gulp-util');

module.exports.extractMeta = function(input) {
    var pattern = /\-{1,2}\[\s([\s\S]*?)\s\]\-{1,2}/gm,
        extract = pattern.exec(input)[1],
        parsed  = require('js-yaml').safeLoad('---\n' + extract);

    return parsed;
};

module.exports.split = function(input) {
    return input.split(/^\-{3}\s/gm).map(function(val) {
        return val.trim(); 
    });
};
