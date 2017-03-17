'use strict';

var mongoose = require('mongoose'),
Schema = mongoose.Schema,
 mongoosePaginate = require('mongoose-paginate'),
 Nodecache = require( "node-cache" ),
 myCache = new Nodecache(),
	_ = require('lodash'),
	textutil = require('../helpers/util').text;

var subproductSchema = new Schema ({
	sku : {type: String, unique: true, required: true},
	price : {type : Number}
})

var ProductSchema = new Schema({ 
	product_url : {type: String, unique: true, required: true,lowercase : true},
	status : {type : Boolean,default : true}, 
	parent_id : {type : String,default: 0},
    created_on : { type: Date, default: Date.now },
    updated_on: { type: Date, default: Date.now },
    category_id : {type : String},
    category_collection :  [],
    data : { type: Schema.Types.Mixed},
    subproducts : [subproductSchema]

},{collection: "product"});
 
ProductSchema.pre('save',function(next) {	
	next();
})

 

ProductSchema.methods.addData = function(data) {
	var _obj = this;
	if(data.title) {
		this.product_url = textutil.url_title(data.title);
	} 
	this.status = 1;
	this.parent_id = 0;
	if(data.category_id) {
		this.category_id = data.category_id;
		delete data.category_id;
	}
	if(data.category_collection) {
		this.category_collection = data.category_collection;
		delete data.category_collection;
	}
	this.data = data;
}

ProductSchema.methods.updateData = function(id,cb) {
	var _obj = this;
	this.model('Product').update({_id : id},{$set  : {data : this.data}},{upsert: true},function(err,doc) {
		_obj.model('Product').findOne({_id : id},cb);
	});

}

ProductSchema.plugin(mongoosePaginate);
 

ProductSchema.statics.getAllPaginate = function(params, cb) { 
	var limit = parseInt(params.limit) || 1;
	var filter = params.filter || false, fcollection = parseFilter(params.filter,this); 
	var sort = {};
	if( typeof params.sort != 'undefined') {
		sort[params['sort']] = (typeof params.sortDir != 'undefined' ?params.sortDir : -1);
	}
	return this.model('Product').paginate(fcollection, { page: parseInt(params.page), sort : sort,limit: limit }, cb); 
}  

ProductSchema.statics.getAllsubproducts = function(params,cb) {
	this.model('Product').findOne({"_id" : params.id},function(err,res) {
		console.log(res);
	})
}

function parseFilter(filter,obj) {
	if(!filter) {
		return {};
	}

	var bytes  = CryptoJS.AES.decrypt(filter, secretKey);
	var decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8)),filtercollection = {}; 
	console.log(decryptedData);
	var schemaarray = Object.keys(obj.model('Category').schema.paths);
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

mongoose.model('Product',ProductSchema);