'use strict';

var flyCondition = require('../controllers/fly-condition.server.controller');
/**
 * Module dependencies
 */

module.exports = function (app) {
  app.route('/api/flyCondition/:lan/:long')
    .get(flyCondition.index);
};
