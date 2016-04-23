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
                    var results = [];
                    for(var j = 0; j < datas.length; ++j){
                        var data = datas[j];
                        if(data.state === 'fulfilled'){
                            result.list[j].risk = data.value;
                            var resultItem = {
                                risk: data.value
                            };
                            if(result.list[j].wind){
                                resultItem["wind"] = {
                                    speed: result.list[j].wind.speed,
                                    direction: convertWindDirection(result.list[j].wind.deg)
                                }
                            }
                            if(result.list[j].rain && Object.keys(result.list[j].rain).length > 0){
                                resultItem["rain"] = result.list[j].rain;
                            }else{
                                resultItem["rain"] = null;
                            }
                            resultItem.description = result.list[j].weather[0].description;

                            results.push(resultItem);
                        }
                    }

                    res.json(results);
                });
        });
    });
    request.end();
};

module.exports.getAllBlacklist = function(req,res){
    FlyConditionBlackList.find().exec(function(err, docs){
        res.status(200).send(docs);
    });
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
                asyncs.push(calculateRisk(result.list[i], result.list[i].coord.lat, result.list[i].coord.lon));
            }

            Q.allSettled(asyncs)
                .then(function(datas){
                    var results = [];
                    for(var j = 0; j < datas.length; ++j){
                        var data = datas[j];
                        if(data.state === 'fulfilled'){
                            result.list[j].risk = data.value;
                            var resultItem = {
                                risk: data.value
                            };
                            if(result.list[j].wind){
                                resultItem["wind"] = {
                                    speed: result.list[j].wind.speed,
                                    direction: convertWindDirection(result.list[j].wind.deg)
                                }
                            }
                            if(result.list[j].rain && Object.keys(result.list[j].rain).length > 0){
                                resultItem["rain"] = result.list[j].rain;
                            }else{
                                resultItem["rain"] = null;
                            }

                            resultItem["coord"] = result.list[j].coord;

                            results.push(resultItem);
                        }
                    }

                    res.json(results);
                });

        });
    });
    request.end();
};

function calculateRisk(item, lat, lon){
    var defer = Q.defer();
    FlyConditionBlackList.find().exec(function(err, docs){
        if(err) return defer.reject(err);
        var locationRating = 0, windRating = 0, rainRating = 0;

        for(var i = 0; i < docs.length; ++i){
            var doc = docs[i];
            var dist = calculateDistance(lat, lon, doc.lat, doc.lng);
            if(dist < 5400){
                locationRating = Math.max(locationRating, 5);
                break;
            }
        }
        if(item.rain && Object.keys(item.rain).length > 0){
            rainRating = 5;
        }
        if(item.wind && item.wind.speed){
            if(item.wind.speed > 3 && item.wind.speed < 8){
                windRating = 1;
            }else if(item.wind.speed >= 8 && item.wind.speed < 11){
                windRating = 2;
            }else if(item.wind.speed >= 11 && item.wind.speed < 15){
                windRating = 3;
            }else if(item.wind.speed >= 15 && item.wind.speed < 18){
                windRating = 4;
            }else if(item.wind.speed >= 18){
                windRating = 5;
            }
        }
        return defer.resolve(Math.max(locationRating, windRating, rainRating));
    });

    return defer.promise;
}

function isWithin(lat, lon, latCenter, lonCenter, radius){
    var dist = calculateDistance(lat, lon, latCenter, lonCenter);
    console.log(dist);
    return  dist <= radius;
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

function convertWindDirection(degree){
    if(degree <= 11.24 || degree >= 348.75){
        return "N";
    }else if(degree <= 33.74 && degree >= 11.25){
        return "NNE";
    }else if(degree <= 56.24 && degree >= 33.75){
        return "NE";
    }else if(degree <= 78.74 && degree >= 56.25){
        return "ENE";
    }else if(degree <= 101.24 && degree >= 78.75){
        return "E";
    }else if(degree <= 123.74 && degree >= 101.25){
        return "ESE";
    }else if(degree <= 146.24 && degree >= 123.75){
        return "SE";
    }else if(degree >= 146.25 && degree <= 168.74){
        return "SSE";
    }else if(degree >= 168.75 && degree <= 191.24){
        return "S";
    }else if(degree >= 191.25 && degree <= 213.74){
        return "SSW";
    }else if(degree >= 213.75 && degree <= 236.24){
        return "SW";
    }else if(degree >= 236.25 && degree <= 258.74){
        return "WSW";
    }else if(degree >= 258.75 && degree <= 281.24){
        return "W";
    }else if(degree >= 281.25 && degree <= 303.74){
        return "WNW";
    }else if(degree >= 303.75 && degree <= 326.24){
        return "NW";
    }else{
        return "NNW"
    }
}
