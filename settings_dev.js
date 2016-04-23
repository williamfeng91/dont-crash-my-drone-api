var settings = {};

// server
settings.port = process.env.PORT || 10010;

// database
settings.db = 'mongodb://localhost/test';

// log
settings.logDirectory = __dirname + '/logs/dev';
settings.logLevel = 'debug';

module.exports = settings;