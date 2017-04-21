'use strict';

var mongoose = require('mongoose'),
Schema = mongoose.Schema,
meanio = require('meanio'),
config = meanio.getConfig(),
 mongoosePaginate = require('mongoose-paginate'),
 CryptoJS = require('crypto-js'),
    secretKey = config.secret,
    jwt = require('jsonwebtoken'),
 Nodecache = require( "node-cache" ),
 myCache = new Nodecache(),
	_ = require('lodash'),
	textutil = require('../helpers/util').text;
 
 var deliverySchema = new Schema ({ 
	address : {type : String,required : true},
	delivery_area : {type : mongoose.Schema.Types.ObjectId,ref : 'directory'},
	delivery_instructions : {type : String},
	nickname : {type : String}, 
    updated_on: { type: Date, default: Date.now }   
})

var UsersSchema = new Schema({ 
	name : {type: String},
	email : {type : String,unique : true},  
	hash : String,
	salt : String,
	phone : String,
	deliveries : [deliverySchema],
    created_on : { type: Date, default: Date.now },
    updated_on: { type: Date, default: Date.now }   

},{collection: "customers"});
 
UsersSchema.pre('save',function(next) {		
	console.log('pre');
	next();
})

 
UsersSchema.methods.setPassword = function(password){
  	this.salt = CryptoJS.lib.WordArray.random(128/8).toString();
	var key256Bits = CryptoJS.PBKDF2(password, this.salt, { keySize: 256/32 }); 
	this.hash = key256Bits.toString(); 
};

UsersSchema.methods.validPassword = function(password){ 
	var key256Bits = CryptoJS.PBKDF2(password, this.salt, { keySize: 256/32 }).toString(); 
	return this.hash === key256Bits; 
};

UsersSchema.methods.generateJwt  = function(){ 
	var expiry = new Date();
  	expiry.setDate(expiry.getDate() + 7);
  	
  	return jwt.sign({
	    _id: this._id,
	    email: this.email,
	    name: this.name,
	    exp: parseInt(expiry.getTime() / 1000),
	  }, secretKey); 
};
UsersSchema.post('save',function() {	
	console.log('post'); 
})

UsersSchema.methods.addData = function(data) {
	var _obj = this;  
	this.name = data.name;
	this.email = data.email;
}
 

UsersSchema.methods.updateData = function(id,cb) {
	var _obj = this;
	this.model('Customer').update({_id : id},{$set  : {name : this.name, email : this.email}},{upsert: true},function(err,doc) {
		_obj.model('Customer').findOne({_id : id},cb);
	});

}
 

UsersSchema.plugin(mongoosePaginate);
 

UsersSchema.statics.getAllPaginate = function(params, cb) { 
	var limit = parseInt(params.limit) || 1;
	var filter = params.filter || false, fcollection = parseFilter(params.filter,this); 
	var sort = {};
	if( typeof params.sort != 'undefined') {
		sort[params['sort']] = (typeof params.sortDir != 'undefined' ?params.sortDir : -1);
	}
	return this.model('Customer').paginate(fcollection, { page: parseInt(params.page), sort : sort,limit: limit }, cb); 
} 

function parseFilter(filter,obj) {
	if(!filter) {
		return {};
	}

	var bytes  = CryptoJS.AES.decrypt(filter, secretKey);
	var decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8)),filtercollection = {}; 
	console.log(decryptedData);
	var schemaarray = Object.keys(obj.model('Customer').schema.paths);
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
  
mongoose.model('Customer',UsersSchema);