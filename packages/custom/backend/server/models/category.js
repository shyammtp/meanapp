'use strict';

var mongoose = require('mongoose'),
Schema = mongoose.Schema;

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
    created_on : { type: Date, default: Date.now },
    updated_on: { type: Date, default: Date.now }
},{collection: "category"});

function getPromise(parent_id,obj){
  	var _obj = obj;
   	var promise = _obj.model('Category').find({category_parent_id: parent_id}).exec();
   	return promise;
}

CategorySchema.pre('save',function(next) {
	console.log('test');
	next();
})

function buildCategory(data,parent_id,obj) { 
	var sets = {};
	var _obj = obj;
	data.forEach(function(o,r) {
		if(o.category_parent_id === parent_id) {
			var datas = o; 
			datas.children = [];
			var children = getChildren(data,o._id); 
			if(children.length > 0) {
				datas.children = buildCategory(children,o._id,_obj);
			}
			sets[o._id] = datas;
		} 
	});
	return sets;
}


CategorySchema.statics.getCategories = function(parent_id,cb) {
	var _obj = this;
	parent_id || (parent_id = '');
	var promise = getPromise(parent_id,this); 
	promise.then(function(s) { 
		var returns = sys(s,parent_id,_obj);
		cb(returns);
	})

};


function sys(data,parent_id,obj) { 
	return buildCategory(data, parent_id,obj);
}


CategorySchema.statics.CheckChildren = function(parent_id,cb) {
	return this.model('Category').count({category_parent_id: parent_id},cb);
}; 
mongoose.model('Category',CategorySchema);