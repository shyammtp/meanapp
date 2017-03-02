'use strict';

var mongoose = require('mongoose'),
Schema = mongoose.Schema,
 mongoosePaginate = require('mongoose-paginate'),
 Nodecache = require( "node-cache" ),
 myCache = new Nodecache(),
	_ = require('lodash');


var ProductSchema = new Schema({ 
	product_url : {type: String, unique: true, required: true,lowercase : true},
	status : {type : Boolean,default : true}, 
	parent_id : {type : String,default: 0},
    created_on : { type: Date, default: Date.now },
    updated_on: { type: Date, default: Date.now },
    category_id : {type : String},
    category_collection :  { type: Schema.Types.Mixed}

},{collection: "product"});
 
ProductSchema.pre('save',function(next) {	
	next();
})

 

ProductSchema.methods.saveData = function(data) {
	var _obj = this; 
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