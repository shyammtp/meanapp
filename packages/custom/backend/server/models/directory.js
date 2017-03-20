'use strict';

var mongoose = require('mongoose'),
Schema = mongoose.Schema,
 mongoosePaginate = require('mongoose-paginate'),
 Nodecache = require( "node-cache" ),
 myCache = new Nodecache(),
	_ = require('lodash'),
	textutil = require('../helpers/util').text;

var citiesSchema = new Schema ({
	city_name : {type: String, unique: true, required: true}, 
})
 
var statesSchema = new Schema ({
	state_name : {type: String, unique: true, required: true},
	cities_list : [citiesSchema]
})


var DirectorySchema = new Schema({ 
	country_code : {type: String, unique: true, required: true},
	country_name : {type: String, unique: true, required: true},  
    states_list : [statesSchema]

},{collection: "directory"});
 
DirectorySchema.pre('save',function(next) {		
	console.log('pre');
	next();
})

 
DirectorySchema.post('save',function() {	
	console.log('post'); 
})
 

DirectorySchema.methods.updateData = function(id,cb) {
	var _obj = this;
	this.model('directory').update({_id : id},{$set  : {data : this.data, variantsetid : this.variantsetid, subproducts : this.subproducts,mainimage: this.mainimage, gallery : this.gallery}},{upsert: true},function(err,doc) {
		_obj.model('directory').findOne({_id : id},cb);
	});

}

DirectorySchema.plugin(mongoosePaginate);
 

DirectorySchema.statics.getAllPaginate = function(params, cb) { 
	var limit = parseInt(params.limit) || 1;
	var filter = params.filter || false, fcollection = parseFilter(params.filter,this); 
	var sort = {};
	if( typeof params.sort != 'undefined') {
		sort[params['sort']] = (typeof params.sortDir != 'undefined' ?params.sortDir : -1);
	}
	return this.model('directory').paginate(fcollection, { page: parseInt(params.page), sort : sort,limit: limit }, cb); 
}  
 

function parseFilter(filter,obj) {
	if(!filter) {
		return {};
	}

	var bytes  = CryptoJS.AES.decrypt(filter, secretKey);
	var decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8)),filtercollection = {}; 
	console.log(decryptedData);
	var schemaarray = Object.keys(obj.model('directory').schema.paths);
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

mongoose.model('directory',DirectorySchema);