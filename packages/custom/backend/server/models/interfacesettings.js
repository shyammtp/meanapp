'use strict';

var mongoose = require('mongoose'),
arrayutil = require('../helpers/util').array,
Schema = mongoose.Schema;


var InterfaceSchema = new Schema({
 	productviews : { type: Schema.Types.Mixed}
},{collection: "interfacesettings"});
 
InterfaceSchema.methods.saveinterface = function(postdata, title,userid, cb) {
	var d = {};
	var data = postdata;
	delete data['settingtype'];
	delete data['userid']; 
	d[userid] = {};
	d[userid][title] = data;
	var _obj = this; 

	this.model('InterfaceSettings').findOne({},function(err, dat){
		if(!dat) {
			console.log(dat);
			_obj.productviews = d;
			_obj.save(cb);
		} else {
			var fg = arrayutil.get(dat,'productviews',{}); 
			if(arrayutil.get(fg,userid)) {
				if(!arrayutil.get(fg[userid],title)) {
					fg[userid][title] = {};
				}
				fg[userid][title] = data;
				_obj.model('InterfaceSettings').update({},{$set  : {'productviews' : fg}},{upsert: true},function(err,doc) {
					_obj.model('InterfaceSettings').findOne({},cb);
				});
			} else {
				fg[userid] = {}; 
				fg[userid][title] = data;
				_obj.model('InterfaceSettings').update({},{$set  : {'productviews' : fg}},{upsert: true},function(err,doc) {
					_obj.model('InterfaceSettings').findOne({},cb);
				});
			}
		}
	});
}

InterfaceSchema.methods.getInterface = function(cb) {
	this.model('InterfaceSettings').findOne({},cb);
}

mongoose.model('InterfaceSettings',InterfaceSchema);