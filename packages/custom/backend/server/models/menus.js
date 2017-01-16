'use strict';

var mongoose = require('mongoose'),
Schema = mongoose.Schema;


var MenusSchema = new Schema({
	menu_key : {type: String, required: true},
	title_en : {type : String, required: true},
	sort : {type : Number,default: 1},
	url : {type: String,default: null},
	before: {type: String,default: null},
	after : {type: String, default: null},
	parent_key : {type: String, default: null}
});

function buildSet(parent_key,domain,obj,data) {
	domain || (domain = 'admin');
	var sets = [],_obj = obj;
	_obj.model('Menus').find({domain: domain,parent_key: parent_key}).exec(function(err,res) {
		res.forEach(function(o,r) {
			var data = data || {};
			data['title_en'] = o.title_en;
			data['before'] = o.before;
			data['url'] = o.url;
			_obj.CheckChildren(o.menu_key,function(err, childre) {
				if(childre > 0) {
					console.log(childre);
					data['children'] = [];
					data['children'].push(buildSet(o.menu_key,domain,_obj,data));
				}  

			}); 
			
		});
		 
		 return data;
			console.log(sets);
	});
}
MenusSchema.statics.getMenus = function(domain) {
	var _obj = this,root = [];
	buildSet("",domain,this);
};


MenusSchema.statics.CheckChildren = function(parent_key,cb) {
	return this.model('Menus').count({parent_key: parent_key},cb);
};

mongoose.model('Menus',MenusSchema);