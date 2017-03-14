'use strict';

var mongoose = require('mongoose'),
Schema = mongoose.Schema,
 mongoosePaginate = require('mongoose-paginate'),
 CryptoJS = require('crypto-js'),
    secretKey = 'SHYAMPRADEEP';


var VariantsSchema = new Schema({
	set_name : {type : String,required: true,unique : true}, 
    option_set : {type: Schema.Types.Mixed},
    created_on : { type: Date, default: Date.now },
    updated_on: { type: Date, default: Date.now }
},{collection: 'variantset'});

VariantsSchema.plugin(mongoosePaginate);
 

VariantsSchema.methods.addData = function(data) {
	var _obj = this;  
	this.type_datas = data.data;
	this.variant_name = data.variant_name;
	this.display_name = data.display_name;
	this.type = data.type;
}

VariantsSchema.methods.updateData = function(id,cb) {
	var _obj = this;
	this.model('Variantset').update({_id : id},{$set  : {variant_name : this.variant_name, display_name: this.display_name, type: this.type, type_datas : this.type_datas}},{upsert: true},function(err,doc) {
		_obj.model('Variantset').findOne({_id : id},cb);
	});

}

VariantsSchema.statics.getAllPaginate = function(params, cb) { 
	var limit = parseInt(params.limit) || 1;
	var filter = params.filter || false, fcollection = parseFilter(params.filter,this); 
	var sort = {};
	if( typeof params.sort != 'undefined') {
		sort[params['sort']] = (typeof params.sortDir != 'undefined' ?params.sortDir : -1);
	}
	return this.model('Variantset').paginate(fcollection, { page: parseInt(params.page), sort : sort,limit: limit }, cb); 
} 

function parseFilter(filter,obj) {
	if(!filter) {
		return {};
	}

	var bytes  = CryptoJS.AES.decrypt(filter, secretKey);
	var decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8)),filtercollection = {}; 
	var schemaarray = Object.keys(obj.model('Variantset').schema.paths);
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

mongoose.model('Variantset',VariantsSchema);