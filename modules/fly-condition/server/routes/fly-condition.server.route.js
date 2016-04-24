'use strict';

var flyCondition = require('../controllers/fly-condition.server.controller');
/**
 * Module dependencies
 */

module.exports = function (app) {

    app.route('/api/flyCondition/cluster/:lan/:lon/:name')
      .post(flyCondition.range);
    app.route('/api/drone/:name')
      .get(flyCondition.isNameUnique);
    app.route('/api/flyCondition/blacklist')
        .get(flyCondition.getAllBlacklist);
    app.route('/api/flyCondition/allUsers')
        .get(flyCondition.getAllUsers);
    app.route('/api/flyCondition')
      .post(flyCondition.index);
    app.route('/api/flyCondition/name/:name')
      .post(flyCondition.index);
};
