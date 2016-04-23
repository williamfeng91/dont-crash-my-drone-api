'use strict';

/**
 * Module dependencies
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var Drone = new Schema({
    name: {
        type: String,
        unique: true,
        default: "Undefined"
    },
    hight: {
        type: Number,
        required: "Hight cannot be empty"
    },
    lat: {
        type: Number,
        required: "Lat cannot be empty"
    },
    lon: {
        type: Number,
        required: "Lng cannot be empty"
    },
    updated: {
        type: Date,
        required: "Date cannot be mepty"
    }
});


mongoose.model('Drone', Drone);
