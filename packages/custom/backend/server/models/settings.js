'use strict';

var mongoose = require('mongoose'),
Schema = mongoose.Schema;


var SettingsSchema = new Schema({
	place_id : Number,
	name : {type: String, required: true},
	value : String
});

SettingsSchema.methods.getConfig = function(name,callback) {
	return this.model('Settings').findOne({name : name},callback)
}

mongoose.model('Settings',SettingsSchema);