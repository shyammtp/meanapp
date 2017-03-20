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
	price : {type : Number},
	cost : {type : Number},
	upc : {type : String},
	bpn : {type : String},
	weight : {type : Number},
	image : {type : String},
	stock : {type : Number},
	lstock : {type : Number},
	status : {type : Boolean},
    options : { type: Schema.Types.Mixed}
})

var subproductscollection = [];

var ProductSchema = new Schema({ 
	product_url : {type: String, unique: true, required: true,lowercase : true},
	status : {type : Boolean,default : true}, 
	parent_id : {type : String,default: 0}, 
    created_on : { type: Date, default: Date.now },
    updated_on: { type: Date, default: Date.now },
    category_id : {type : String},
    variantsetid : {type : String},
    category_collection :  [],
    data : { type: Schema.Types.Mixed},
    mainimage : {type : String},
    gallery : { type: Schema.Types.Mixed},
    subproducts : [subproductSchema]

},{collection: "product"});
 
ProductSchema.pre('save',function(next) {		
	console.log('pre');
	next();
})

 
ProductSchema.post('save',function() {	
	console.log('post'); 
})

ProductSchema.methods.addData = function(data) {
	var _obj = this;
	if(data.title) {
		this.product_url = textutil.url_title(data.title);
	} else if(data.item_name) {
		this.product_url = textutil.url_title(data.item_name);
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
	if(data.variants) { 		
		this.subproducts = processsubproducts(data.variants); 
		delete data.variants;
	} if(data.variantsetid) { 		
		this.variantsetid = data.variantsetid;
		delete data.variantsetid;
	}
	if(data.mainimage) { 		
		this.mainimage = data.mainimage;
		delete data.mainimage;
	}
	if(data.gallery) { 		
		this.gallery = data.gallery;
		delete data.gallery;
	}
	this.data = data;
}

function processsubproducts(variants) {
	var v = [];
	for(var g in variants) {
		var hds = {},ghs = variants[g];
		for(var h in variants[g].options) { 
			for(var j in variants[g].options[h]) {
				var sd = {};
				sd.key = j;
				sd.value = variants[g].options[h][j];
				hds[h] = sd;
			}
			
		}
		ghs.options = hds;
		v.push(ghs);
	}
	return v;
}

ProductSchema.methods.updateData = function(id,cb) {
	var _obj = this;
	this.model('Product').update({_id : id},{$set  : {data : this.data, variantsetid : this.variantsetid, subproducts : this.subproducts,mainimage: this.mainimage, gallery : this.gallery}},{upsert: true},function(err,doc) {
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
	var schemaarray = Object.keys(obj.model('Product').schema.paths);
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