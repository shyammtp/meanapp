'use strict';

var mongoose = require('mongoose'),
Schema = mongoose.Schema,
 mongoosePaginate = require('mongoose-paginate'),
 Nodecache = require( "node-cache" ),
 CryptoJS = require('crypto-js'),
    secretKey = 'SHYAMPRADEEP',
 myCache = new Nodecache(),
	_ = require('lodash'),
	textutil = require('../helpers/util').text;

var DirectorySchema = new Schema({ 
	code : {type: String, required: true},
	name : {type: String, required: true},
	parent_id : {type: String},
	tree_path: [], 
	level : {type : Number, default: 1},
	sorting : {type: Number,default: 1},
	status : {type : Boolean,default : true}, 
    created_on : { type: Date, default: Date.now },
    updated_on: { type: Date, default: Date.now }
},{collection: "directory"});
 
DirectorySchema.pre('save',function(next) {		
	console.log('pre');
	next();
})

 
DirectorySchema.post('save',function() {	
	console.log('post'); 
})
 


function getPromise(obj){
  	var _obj = obj;  
   	var promise = _obj.model('directory').find({}).exec();
  	 
   	return promise;
}

function getChildren(data, menukey) { 
	var childrens = [];
	data.forEach(function(o,r) {  
		if(typeof o.parent_id != 'undefined' && o.parent_id == menukey) {
			childrens.push(o);
		}
	});
	return childrens;
}


DirectorySchema.statics.getDirectories = function(parent_id,cb) {
	var _obj = this;
	parent_id || (parent_id = '');
	var promise = getPromise(this); 
	promise.then(function(s) {
		myCache.get("directory_tree",function(err,value) {
			if(!err) {
				if(value != undefined) {
					cb(value);
				} else { 
					var returns = sys(JSON.parse(JSON.stringify(s)),parent_id,_obj);
					myCache.set( "directory_tree", returns, 10000 );
					cb(returns);
				}
			}
		});  
	});
};


function sys(data,parent_id,obj) { 
	obj.data = data;
	return buildCategory(obj.data, parent_id,obj);
}


DirectorySchema.statics.CheckChildren = function(parent_id,cb) {
	return this.model('directory').count({parent_id: parent_id},cb);
}; 


DirectorySchema.statics.getAll = function(cb) {  
	return this.model('directory').find({}).exec(cb); 
} 


function buildDirectory(data,parent_id,obj) { 
	var sets = {};
	var _obj = obj;
	data.forEach(function(o,r) {
		var parentid = typeof o.parent_id == 'undefined' ? '' : o.parent_id;
		if(parentid == parent_id) {
			var datas = o;  
			var children = getChildren(_obj.data,o._id);   
			if(children.length > 0) { 
				datas.children = buildDirectory(children,o._id,_obj);
			} 
			sets[o._id] = datas;
		} 
	});
	return sets;
} 

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