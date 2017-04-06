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
	parent_key : {type: String, default: null},
	status : {type: Boolean, default: true}
});

function getPromise(parent_key,domain,obj){
  	var _obj = obj;
   	var promise = _obj.model('Menus').find({domain: domain}).exec();
   	return promise;
}
 

function getChildren(data, menukey) { 
	var childrens = [];
	data.forEach(function(o,r) {
		if(o.parent_key === menukey) {
			childrens.push(o);
		}
	});
	return childrens;
}


function buildSet(data,parent_key,domain,obj) {
	domain || (domain = 'admin');
	var sets = {};
	var _obj = obj;
	data.forEach(function(o,r) {
		if(o.parent_key === parent_key) {
			var datas = {};
			datas.title_en = o.title_en;
			datas.before = o.before;
			datas.url = o.url;
			datas.status = o.status;
			datas.children = [];
			var children = getChildren(data,o.menu_key); 
			if(children.length > 0) {
				datas.children = buildSet(children,o.menu_key,domain,_obj);
			}
			sets[o.menu_key] = datas;
		} 
	});
	return sets;
}

MenusSchema.statics.getMenus = function(domain,parent_key,cb) {
	var _obj = this;
	parent_key || (parent_key = '');
	var promise = getPromise('',domain,this); 
	promise.then(function(s) { 
		var returns = sys(s,domain,parent_key,_obj);
		cb(returns);
	})

};

function sys(data,domain,parent_key,obj) { 
	return buildSet(data, parent_key,domain,obj);
}


MenusSchema.statics.CheckChildren = function(parent_key,cb) {
	return this.model('Menus').count({parent_key: parent_key},cb);
};

mongoose.model('Menus',MenusSchema);