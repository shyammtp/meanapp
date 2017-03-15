'use strict';

var mongoose = require('mongoose'),
Schema = mongoose.Schema,
 mongoosePaginate = require('mongoose-paginate'),
 CryptoJS = require('crypto-js'),
    secretKey = 'SHYAMPRADEEP';


var VariantsSchema = new Schema({
	set_name : {type : String,required: true,unique : true}, 
    option_set : {type: Schema.Types.Mixed},
    rules : {type: Schema.Types.Mixed},
    created_on : { type: Date, default: Date.now },
    updated_on: { type: Date, default: Date.now }
},{collection: 'variantset'});

VariantsSchema.plugin(mongoosePaginate);
 

VariantsSchema.methods.addData = function(data) {
	var _obj = this;   
	if(data.rules) {
		this.rules = data.rules;
		this.ruleindex = -1;	
		if(typeof data.index !== 'undefined') this.ruleindex = data.index;
	} else {		
		this.option_set = data.option_set;
		this.set_name = data.set_name; 
	}
}

VariantsSchema.methods.updateData = function(id,cb) {
	var _obj = this;
	this.model('Variantset').update({_id : id},{$set  : {set_name : this.set_name,  option_set : this.option_set}},{upsert: true},function(err,doc) {
		_obj.model('Variantset').findOne({_id : id},cb);
	});

}
VariantsSchema.methods.saveRule = function(id,cb) {
	var _obj = this;  
	_obj.model('Variantset').findOne({_id : id},function(err,d) {
		if(!d._id) {
			cb('Not a valid variant set');
			return;
		} 
		if(typeof d.rules == 'undefined') {
			d.rules = [];
		} 
		if(_obj.ruleindex >= 0) {
			d.rules[_obj.ruleindex] = _obj.rules;
		} else {
			d.rules.push(_obj.rules); 
		}
		_obj.model('Variantset').update({_id : d._id},{$set  : {rules : d.rules}},{upsert: true},function(err,doc) { 
			cb(null,d.rules); 
		});
	});
}

function updaterulesarray(rules) {
	var ons = {};
	for(var rule in rules.params) {
		var sh = {}
		for(var i in rules.params[rule]) {
			var dg = [];
			for(var s in rules.params[rule][i]) {
				if(rules.params[rule][i][s] !== false) {
					dg.push(rules.params[rule][i][s]);
				}
			}

			sh[i] = dg;
		}
		ons[rule] = sh;
	}
	rules.params = ons;
	return rules;
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

VariantsSchema.statics.getAllRules = function(params, cb) { 
	var filter = params.filter || false, fcollection = parseFilter(params.filter,this); 
	var sort = {};
	if( typeof params.sort != 'undefined') {
		sort[params['sort']] = (typeof params.sortDir != 'undefined' ?params.sortDir : -1);
	}
	return this.model('Variantset').findOne({"_id" : params.id},cb); 
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