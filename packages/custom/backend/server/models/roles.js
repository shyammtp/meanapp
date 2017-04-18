'use strict';

var mongoose = require('mongoose'),
Schema = mongoose.Schema,
meanio = require('meanio'),
config = meanio.getConfig(),
 mongoosePaginate = require('mongoose-paginate'),
 CryptoJS = require('crypto-js'),
    secretKey = config.sessionSecret,
    jwt = require('jsonwebtoken'),
 Nodecache = require( "node-cache" ),
 myCache = new Nodecache(),
	_ = require('lodash'),
	textutil = require('../helpers/util').text;
  

var RolesSchema = new Schema({ 
	role_name : {type: String},
	role_color : {type : String},   
	permissions : {type: Schema.Types.Mixed},
    created_on : { type: Date, default: Date.now },
    updated_on: { type: Date, default: Date.now }   

},{collection: "roles"});
 
RolesSchema.pre('save',function(next) {		
	console.log('pre');
	next();
})
 

RolesSchema.methods.addData = function(data) {
	var _obj = this;  
	this.role_name = data.role_name;
	this.role_color = data.role_color;
	if(data.permissionset) {
		var dd = {};
		for(var v in data.permissionset) {
			var valus = data.permissionset[v];
			if(valus === true) {
				dd[v] = ['view','edit','add','delete'];
			}
		};
		this.permissions = dd;
	}
}
 

RolesSchema.methods.updateData = function(id,cb) {
	var _obj = this;
	var update = {};
	
	this.model('Roles').update({_id : id},{$set  : {role_name : this.role_name, role_color : this.role_color,permissions : this.permissions}},{upsert: true},function(err,doc) {
		_obj.model('Roles').findOne({_id : id},cb);
	});

}
 

RolesSchema.plugin(mongoosePaginate);
 

RolesSchema.statics.getAllPaginate = function(params, cb) { 
	var limit = parseInt(params.limit) || 1;
	var filter = params.filter || false, fcollection = parseFilter(params.filter,this); 
	var sort = {};
	if( typeof params.sort != 'undefined') {
		sort[params['sort']] = (typeof params.sortDir != 'undefined' ?params.sortDir : -1);
	}
	return this.model('Roles').paginate(fcollection, { page: parseInt(params.page), sort : sort,limit: limit }, cb); 
} 

function parseFilter(filter,obj) {
	if(!filter) {
		return {};
	}

	var bytes  = CryptoJS.AES.decrypt(filter, secretKey);
	var decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8)),filtercollection = {}; 
	console.log(decryptedData);
	var schemaarray = Object.keys(obj.model('Roles').schema.paths);
	for(var k in schemaarray) { 
		var d = decryptedData[schemaarray[k]];
		if(typeof d !== 'undefined') {
			switch(typeof d) {
				case 'string':
				    var re = new RegExp(d,'i');
					filtercollection[schemaarray[k]] = re;
				break;
				case 'object':
					if(d.hasOwnProperty('id')) {
						var value = d['id'];
						var re = new RegExp(value,'i');
						filtercollection[schemaarray[k]] = re;
					}
					if(d.hasOwnProperty('from') || d.hasOwnProperty('to')) { 
						var obj = {},c = 0;

						if(d.hasOwnProperty('from')) {
							obj.$gte = d.from;  
							d.from !== ''? c++ : '';
						}
						if(d.hasOwnProperty('to')) {
							obj.$lte = d.to;  							
							d.to != ''? c++ : '';
						}
						if(c <= 0) {
							continue;
						}
						filtercollection[schemaarray[k]] = obj;
					}
				break;
			}
			
		}
	} 
	return filtercollection;
}
  
mongoose.model('Roles',RolesSchema);