'use strict';

var mongoose = require('mongoose'),
Schema = mongoose.Schema,
 mongoosePaginate = require('mongoose-paginate'),
 Nodecache = require( "node-cache" ),
 myCache = new Nodecache(),
	_ = require('lodash');


var CategorySchema = new Schema({ 
	category_name : { 
					en: {type: String}
				},
	category_url : {type: String, unique: true, required: true,lowercase : true},
	category_parent_id : {type: String},
	tree_path: {type: String},
	tree_url: {type: String},
	level : {type : Number, default: 1},
	sorting : {type: Number,default: 1},
	status : {type : Boolean,default : true},
	attributes : {
		info : { type: Schema.Types.Mixed},
		pricing : {type: Schema.Types.Mixed},
		description : {type: Schema.Types.Mixed},
		more_details : {type: Schema.Types.Mixed}
	},
    created_on : { type: Date, default: Date.now },
    updated_on: { type: Date, default: Date.now }
},{collection: "category"});

function getPromise(obj){
  	var _obj = obj;  
   	var promise = _obj.model('Category').find({}).exec();
  	 
   	return promise;
}

CategorySchema.pre('save',function(next) {
	console.log(this.attributes);
	next();
})


function getChildren(data, menukey) { 
	var childrens = [];
	data.forEach(function(o,r) {  
		if(typeof o.category_parent_id != 'undefined' && o.category_parent_id == menukey) {
			childrens.push(o);
		}
	});
	return childrens;
}

function buildCategory(data,parent_id,obj) { 
	var sets = {};
	var _obj = obj;
	data.forEach(function(o,r) {
		var parentid = typeof o.category_parent_id == 'undefined' ? '' : o.category_parent_id;
		if(parentid == parent_id) {
			var datas = o;  
			var children = getChildren(_obj.data,o._id);   
			if(children.length > 0) { 
				datas.children = buildCategory(children,o._id,_obj);
			} 
			sets[o._id] = datas;
		} 
	});
	return sets;
} 

CategorySchema.methods.insertAttribute = function(key, data,block) { 
	
	var childrens = {};
	if(data.previous_block != '' && data.previous_block !== data.block) {
		if(this.attributes.hasOwnProperty(data.previous_block )) {
			if(this.attributes[data.previous_block].hasOwnProperty(key)) {
				childrens = typeof this.attributes[data.previous_block][key].children != undefined ? 
						this.attributes[data.previous_block][key].children : {};
				delete this.attributes[data.previous_block][key];
			}
		} 
	}


	if(!this.attributes.hasOwnProperty(block)) {
		this.attributes[block] = {};
	}
	var attr = this.attributes[block];	 
	var newdata = {};
	if(Object.keys(childrens).length > 0) {
		data.children = childrens;
	}
	newdata[key] =  data;
	console.log(data.parent);
	if(data.parent != undefined && data.parent != '' && typeof this.attributes[block][data.parent] != undefined) {
		if(this.attributes[block].hasOwnProperty(key)) {
			delete this.attributes[block][key];
		}		 
		var pr = this.attributes[block][data.parent];
		if(!isParent(this.attributes[block],data.parent)) {
			throw new Error('Not a valid parent block');
		}
		if(typeof this.attributes[block][data.parent]['children'] == undefined) {
			this.attributes[block][data.parent]['children'] = {};
		}
		var newas = this.attributes[block][data.parent]['children'];
		this.attributes[block][data.parent]['children'] = _.extend({}, newas, newdata);
	} else {
		this.attributes[block] = _.extend({}, attr,newdata); 
	}
	console.log(this.attributes);

}

function isParent(attributes,key) {
	var c =false;
	console.log(attributes);
	for(var kv in attributes) { 
		if(kv == key) {
			c = true;
			break;
		}
	}; 
	return c;
}

CategorySchema.methods.deleteAttribute = function(key, block, parent) { 
	if(!this.attributes.hasOwnProperty(block)) {
		this.attributes[block] = {};
	}
	if(parent) {
		if(this.attributes[block].hasOwnProperty(parent)) {
			var prattr = this.attributes[block][parent];
			if(prattr.children.hasOwnProperty(key)) {
				var d = this.attributes[block][parent]['children'][key];
				if(d.is_system === true) {
					throw new Error('System Attribute');
				}
				delete this.attributes[block][parent]['children'][key];
			} else {
				return new Error('Invalid Attribute');
			}
		}
	} else {
		if(this.attributes[block].hasOwnProperty(key)) {

			var d = this.attributes[block][key];
			if(d.is_system === true) {
				throw new Error('System Attribute');
			}
			delete this.attributes[block][key]; 
			console.log(this.attributes[block]);
		} else {
			return new Error('Invalid Attribute');
		}
	}
}


CategorySchema.statics.getCategories = function(parent_id,cb) {
	var _obj = this;
	parent_id || (parent_id = '');
	var promise = getPromise(this); 
	promise.then(function(s) {
		myCache.get("category_tree",function(err,value) {
			if(!err) {
				if(value != undefined) {
					cb(value);
				} else { 
					var returns = sys(JSON.parse(JSON.stringify(s)),parent_id,_obj);
					myCache.set( "category_tree", returns, 10000 );
					cb(returns);
				}
			}
		});  
	});
};

CategorySchema.methods.saveAttributeUpdate = function(id,cb) {
	var _obj = this;
	this.model('Category').update({_id : id},{$set  : {attributes : this.attributes}},{upsert: true},function(err,doc) {
		_obj.model('Category').findOne({_id : id},cb);
	});
}


function sys(data,parent_id,obj) { 
	obj.data = data;
	return buildCategory(obj.data, parent_id,obj);
}


CategorySchema.statics.CheckChildren = function(parent_id,cb) {
	return this.model('Category').count({category_parent_id: parent_id},cb);
}; 


CategorySchema.statics.getAll = function(cb) {  
	return this.model('Category').find({}).exec(cb); 
} 


CategorySchema.plugin(mongoosePaginate);
 

CategorySchema.statics.getAllPaginate = function(params, cb) { 
	var limit = parseInt(params.limit) || 1;
	var filter = params.filter || false, fcollection = parseFilter(params.filter,this); 
	var sort = {};
	if( typeof params.sort != 'undefined') {
		sort[params['sort']] = (typeof params.sortDir != 'undefined' ?params.sortDir : -1);
	}
	return this.model('Category').paginate(fcollection, { page: parseInt(params.page), sort : sort,limit: limit }, cb); 
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

mongoose.model('Category',CategorySchema);