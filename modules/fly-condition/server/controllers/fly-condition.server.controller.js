'use strict';
module.exports.index = function(req, res){
    res.send(req.params.lan);
};
