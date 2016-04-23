'use strict';

var SwaggerExpress = require('swagger-express-mw');
var SwaggerUi = require('swagger-tools/middleware/swagger-ui');
var mongoose = require('mongoose');
var boom = require('boom');
var FileStreamRotator = require('file-stream-rotator');
var fs = require('fs');
var log4js = require('log4js');
var logger = log4js.getLogger('app');

var app = require('express')();
module.exports = app; // for testing

var config = {
    appRoot: __dirname // required config
};

SwaggerExpress.create(config, function(err, swaggerExpress) {
    if (err) { throw err; }

    var settings = swaggerExpress.runner.config;
    var db = mongoose.connect(settings.db);

    // set up access log
    app.use(log4js.connectLogger(log4js.getLogger('http'), { level: 'auto' }));

    // set up error log
    log4js.configure('./config/log4js.json');

    // Add swagger-ui (This must be before swaggerExpress.register)
    app.use(SwaggerUi(swaggerExpress.runner.swagger));

    // install middleware
    swaggerExpress.register(app);

    // Error handling
    app.use(function(err, req, res, next) {
        logger.error('Handling error: ' + err);
        var error;
        if (typeof err !== 'object') {
            error = new boom.badImplementation();
        } else if (err.isBoom) {
            // pass on boom error
            error = err;
        } else if (err.failedValidation) {
            // schema validation error
            error = new boom.badRequest('Input validation failed');
            error.output.payload.details = err;
        } else {
            error = new boom.badImplementation();
        }
        res.setHeader('Content-Type', 'application/json');
        // res.json(err);
        res.status(error.output.statusCode).json(error.output.payload);
    });

    var port = process.env.PORT || settings.port;
    app.listen(port);
});