'use strict';

var mongoose = require('mongoose'),
Schema = mongoose.Schema,
 mongoosePaginate = require('mongoose-paginate'),
 CryptoJS = require('crypto-js'),
    secretKey = 'SHYAMPRADEEP';


var DeliveryChargesSchema = new Schema({
	name : {type : String},
	locationids : [],
	deliverycharge : {type : Number},
	restaurant_id : {type : mongoose.Schema.Types.ObjectId,ref : 'Restaurant'},
    created_on : { type: Date, default: Date.now },
    updated_on: { type: Date, default: Date.now }
},{collection: 'deliverycharges'});



DeliveryChargesSchema.plugin(mongoosePaginate);
 

DeliveryChargesSchema.statics.getAllPaginate = function(params, cb) { 
	var limit = parseInt(params.limit) || 1;
	var filter = params.filter || false, fcollection = parseFilter(params.filter,this); 
	var sort = {};
	if( typeof params.sort != 'undefined') {
		sort[params['sort']] = (typeof params.sortDir != 'undefined' ?params.sortDir : -1);
	}
	return this.model('DeliveryCharges').paginate(fcollection, { page: parseInt(params.page), sort : sort,limit: limit }, cb); 
} 

function parseFilter(filter,obj) {
	if(!filter) {
		return {};
	}

	var bytes  = CryptoJS.AES.decrypt(filter, secretKey);
	var decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8)),filtercollection = {}; 
	console.log(decryptedData);
	var schemaarray = Object.keys(obj.model('DeliveryCharges').schema.paths);
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

mongoose.model('DeliveryCharges',DeliveryChargesSchema);