'use strict';
var http = require('http');
var path = require('path');
var config = require(path.resolve('./config/config'));
var mongoose = require('mongoose');
var FlyConditionBlackList = mongoose.model("FlyConditionBlacklist");
var Q = require('q');

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
            result = JSON.parse(result);
            var asyncs = [];
            for(var i = 0; i < result.list.length; ++i){
                asyncs.push(calculateRisk(result.list[i], result.city.coord.lat, result.city.coord.lon));
            }

            Q.allSettled(asyncs)
                .then(function(datas){
                    for(var j = 0; j < datas.length; ++j){
                        var data = datas[j];
                        if(data.state === 'fulfilled'){
                            result.list[j].risk = data.value;
                        }
                    }

                    res.json(result);
                });
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
            result = JSON.parse(result);
            var asyncs = [];
            for(var i = 0; i < result.list.length; ++i){
                asyncs.push(calculateRisk(result.list[i], result.list[i].lat, result.list[i].lon));
            }

            Q.allSettled(asyncs)
                .then(function(datas){
                    for(var j = 0; j < datas.length; ++j){
                        var data = datas[j];
                        if(data.state === 'fulfilled'){
                            result.list[j].risk = data.value;
                        }
                    }

                    res.json(result);
                });

        });
    });
    request.end();
};

function calculateRisk(item, lat, lon){
    var defer = Q.defer();
    FlyConditionBlackList.find().exec(function(err, docs){
        if(err) return defer.reject(err);
        for(var i = 0; i < docs.length; ++i){
            var doc = docs[i];
            if(isWithin(lat, lon, doc.lat, doc.lng, 5000)){
                defer.resolve(1.0);
                return 1.0;
            }
        }
        if(item.rain){
            return defer.resolve(0.9);
        }
        if(item.wind && item.wind.speed){
            var risk = (item.wind.speed * 0.1).toFixed(5);
            return defer.resolve(Math.min(0.95, risk));
        }

        return defer.resolve(0.05);
    });

    return defer.promise;
}

function isWithin(lat, lon, latCenter, lonCenter, radius){
    return calculateDistance(lat, lon, latCenter, lonCenter) <= radius;
}

function calculateDistance(lat1, lon1, lat2, lon2){
    var R = 6371000;
    var latRad = toRadiance(lat1);
    var latCenterRad = toRadiance(lat2);

    var deltaLatRad = toRadiance(lat1 - lat2);
    var deltaLonRad = toRadiance(lon1 - lon2);

    var a = Math.sin(deltaLatRad / 2) * Math.sin(deltaLatRad / 2) +
            Math.cos(latRad) * Math.cos(latCenterRad) *
            Math.sin(deltaLonRad / 2) * Math.sin(deltaLonRad / 2);

    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

function toRadiance(degrees){
    return degrees * Math.PI / 180;
}
