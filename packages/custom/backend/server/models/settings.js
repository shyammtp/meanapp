'use strict';

var mongoose = require('mongoose'),
Schema = mongoose.Schema,
 mongoosePaginate = require('mongoose-paginate');


var SettingsSchema = new Schema({
	place_id : Number,
	name : {type: String, required: true},
	value : String
});

SettingsSchema.plugin(mongoosePaginate);


SettingsSchema.statics.getConfig = function(name, next,place_id) {
	this.getAllConfig(place_id,function(res) { 
		return next();
	}) 
}

SettingsSchema.statics.addSettings = function(key, value, place_id, cb) {
	var pid = place_id || 1;
	return this.model('Settings').findOneAndUpdate({name : key, place_id : pid},{$set : {name : key,value : value,place_id : pid}},{upsert : true},cb);
}


SettingsSchema.statics.getAllConfig = function(place_id, cb) {
	var pid = place_id || 1; 
	return this.model('Settings').find({place_id : pid}).exec(cb);
}


SettingsSchema.statics.getAllConfigPaginate = function(place_id, page, cb) {
	var pid = place_id || 1;
	var page = page || 1;
	return this.model('Settings').paginate({place_id : pid}, { page: page, limit: 1 }, cb); 
}

SettingsSchema.pre('save', function(next) {
  console.log('presave');
  next();
});

mongoose.model('Settings',SettingsSchema);