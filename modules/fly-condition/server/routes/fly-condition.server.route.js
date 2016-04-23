'use strict';

var flyCondition = require('../controllers/fly-condition.server.controller');
/**
 * Module dependencies
 */

module.exports = function (app) {
  app.route('/api/flyCondition/cluster/:lan/:lon')
      .get(flyCondition.range);
  app.route('/api/flyCondition/:lan/:lon')
    app.route('/api/flyCondition/blacklist')
        .get(flyCondition.getAllBlacklist);
      .get(flyCondition.index);

};
