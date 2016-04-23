'use strict';
var http = require('http');
var path = require('path');
var config = require(path.resolve('./config/config'));

module.exports.index = function(req, res) {
    var urlPath = '/data/2.5/weather?lat=' + req.params.lan +
        '&lon=' + req.params.lon + '&APPID=' + config.openWeatherAPIKey;
    var get_options = {
        host: 'api.openweathermap.org',
        port: '80',
        path: urlPath,
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    };

    var request = http.request(get_options, function(response){
        response.setEncoding('utf8');
        response.on('data', function (chunk) {
            res.json(JSON.parse(chunk));
        });
    });
    request.end();
};
