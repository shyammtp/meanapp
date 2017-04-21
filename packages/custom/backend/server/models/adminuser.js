'use strict';

var mongoose = require('mongoose'),
meanio = require('meanio'),
config = meanio.getConfig(),
Schema = mongoose.Schema,
mongoosePaginate = require('mongoose-paginate'),
CryptoJS = require('crypto-js'),
secretKey = config.secret;
var jwt = require('jsonwebtoken');


var AdminUserSchema = new Schema({
	name : String,
	email : { type: String,unique: true,required: true}, 
	hash : String,
	salt : String,
	restaurant_id : {type : String},
    created_on : { type: Date, default: Date.now },
    updated_on: { type: Date, default: Date.now }
},{collection: "admin_user"});

AdminUserSchema.plugin(mongoosePaginate);
 
AdminUserSchema.methods.setPassword = function(password){
  	this.salt = CryptoJS.lib.WordArray.random(128/8).toString();
	var key256Bits = CryptoJS.PBKDF2(password, this.salt, { keySize: 256/32 }); 
	this.hash = key256Bits.toString(); 
};

AdminUserSchema.methods.validPassword = function(password){ 
	var key256Bits = CryptoJS.PBKDF2(password, this.salt, { keySize: 256/32 }).toString(); 
	return this.hash === key256Bits; 
};

AdminUserSchema.methods.generateJwt  = function(){ 
	var expiry = new Date();
  	expiry.setDate(expiry.getDate() + 7);

  	return jwt.sign({
	    _id: this._id,
	    email: this.email,
	    name: this.name,
	    restaurant_id : this.restaurant_id,
	    exp: parseInt(expiry.getTime() / 1000),
	  }, secretKey); 
};

AdminUserSchema.statics.getAllPaginate = function(params, cb) { 
	var limit = parseInt(params.limit) || 1;
	var filter = params.filter || false, fcollection = parseFilter(params.filter,this); 
	var sort = {};
	if( typeof params.sort != 'undefined') {
		sort[params['sort']] = (typeof params.sortDir != 'undefined' ?params.sortDir : -1);
	}
	return this.model('AdminUser').paginate(fcollection, { page: parseInt(params.page), sort : sort,limit: limit }, cb); 
} 

function parseFilter(filter,obj) {
	if(!filter) {
		return {};
	}

	var bytes  = CryptoJS.AES.decrypt(filter, secretKey);
	var decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8)),filtercollection = {}; 
	console.log(decryptedData);
	var schemaarray = Object.keys(obj.model('AdminUser').schema.paths);
	for(var k in schemaarray) { 
		var d = decryptedData[schemaarray[k]];
		if(typeof d != 'undefined') {
			switch(typeof d) {
				case "string":
				    var re = new RegExp(d,"i");
					filtercollection[schemaarray[k]] = re;
				break;
				case "object":
					if(d.hasOwnProperty('id')) {
						var value = d['id'];
						var re = new RegExp(value,"i");
						filtercollection[schemaarray[k]] = re;
					}
					if(d.hasOwnProperty('from') || d.hasOwnProperty('to')) { 
						var obj = {},c = 0;

						if(d.hasOwnProperty('from')) {
							obj.$gte = d.from;  
							d.from != ''? c++ : '';
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

mongoose.model('AdminUser',AdminUserSchema);