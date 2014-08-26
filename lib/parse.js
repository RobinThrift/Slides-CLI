module.exports.split = function(input) {
    return input.split(/^\-{3}\s/gm).map(function(val) {
        return val.trim(); 
    });
};
