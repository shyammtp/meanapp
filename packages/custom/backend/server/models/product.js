'use strict';

var mongoose = require('mongoose'),
Schema = mongoose.Schema,
 mongoosePaginate = require('mongoose-paginate'),
 Nodecache = require( "node-cache" ),
 myCache = new Nodecache(),
	_ = require('lodash'),
	textutil = require('../helpers/util').text;


var ProductSchema = new Schema({ 
	product_url : {type: String, unique: true, required: true,lowercase : true},
	status : {type : Boolean,default : true}, 
	parent_id : {type : String,default: 0},
    created_on : { type: Date, default: Date.now },
    updated_on: { type: Date, default: Date.now },
    category_id : {type : String},
    category_collection :  [],
    data : { type: Schema.Types.Mixed}

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

mongoose.model('Product',ProductSchema);