'use strict';

/**
 * Module dependencies
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Fly Condition Blacklist Schema
 */
var FlyConditionBlacklistSchema = new Schema({
  lat: {
    type: Number
  },
  lng: {
    type: Number
  },
  type: {
    type: Number
  }
});

mongoose.model('FlyConditionBlacklist', FlyConditionBlacklistSchema);
