'use strict';
var http = require('http');
var path = require('path');
var config = require(path.resolve('./config/config'));

module.exports.index = function(req, res) {
    var urlPath = '/data/2.5/forecast?lat=' + req.params.lan +
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
        var result = "";
        response.on('data', function (chunk) {
            result += chunk;
        });
        response.on('end', function(){
            res.json(JSON.parse(result));
        });
    });
    request.end();
};

module.exports.range = function(req, res) {
    var centerLat = parseFloat(req.params.lan);
    var centerLon = parseFloat(req.params.lon);

    var leftTopLon = centerLon - 10;
    var leftTopLat = centerLat + 10;
    var rightBottomLon = centerLon + 10;
    var rightBottomLat = centerLat - 10;

    var boxStr = leftTopLon + "," + leftTopLat + "," + rightBottomLon + "," + rightBottomLat + "," + "20";
    var urlPath = '/data/2.5/box/station?cluster=no&cnt=200&format=json&bbox=' + boxStr + '&APPID=' + config.openWeatherAPIKey;
    console.log(urlPath);
    var get_options = {
        host: 'api.openweathermap.org',
        port: '80',
        path: urlPath,
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    };

    var request = http.request(get_options, function(response){
        response.setEncoding('utf8');
        var result = "";
        response.on('data', function (chunk) {
            result += chunk;
        });
        response.on('end', function(){
            res.json(JSON.parse(result));
        });
    });
    request.end();
};
