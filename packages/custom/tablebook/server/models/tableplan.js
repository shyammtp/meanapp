'use strict';

var backendpath = '../../../backend/server/';
var mongoose = require('mongoose'),
Schema = mongoose.Schema,
 mongoosePaginate = require('mongoose-paginate'),
 Nodecache = require( "node-cache" ),
 myCache = new Nodecache(),
 async = require('async'),
	_ = require('lodash'),
	textutil = require(backendpath +'helpers/util').text;
 
function makeid()
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 5; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

var tablesschema = new Schema ({ 
	table_name : {type : String},
	table_type : {type : String},
	table_id : {type : String,unique : true},
	deleted : {type : Boolean, default : false},
	position : {type: Schema.Types.Mixed},
	rotation : {type : Number, default : 0},
	attrs : {type: Schema.Types.Mixed}, 
 	updated_on: { type: Date, default: Date.now }
})

var TablePlanSchema = new Schema({ 
	floor_name :  {type : String,required : true},
	floor_index : {type : String,required : true}, 
	restaurant_id : {type : mongoose.Schema.Types.ObjectId,ref : 'Restaurant'}, 
    design : {type: Schema.Types.Mixed},
    status : {type : Boolean, default : false},
 	created_on: { type: Date, default: Date.now },
 	updated_on: { type: Date, default: Date.now },
    tables : [tablesschema]    

},{collection: "tableplan"});
  
TablePlanSchema.pre('save',function(next) {		
	 
	next();
})

 
TablePlanSchema.post('save',function() {	
	console.log('post'); 
})
 
 

TablePlanSchema.methods.addData = function(data) {
	var _obj = this; 
	if(data.design) {
		this.design = data.design;
	} if(data.index) {
		this.floor_index = data.index;
	} if(data.name) {
		this.floor_name = data.name;
	} 	  
	if(data.restaurant_id) {
		this.restaurant_id = data.restaurant_id;
	}
	if(data.design) {
		this.design = data.design;
		this.tablescollection = collectiontablecollection(data.design);
	}
}
 

function collectiontablecollection(design) {

	//Stage
	var collc = [];
	for(var h in design.children) {
		var layer = design.children[h];
		for(var c in layer.children) {
			var group = layer.children[c];
			var insc = {};
			insc.position = {x : group.attrs.x,y : group.attrs.y};
			insc.rotation = group.attrs.rotation;
			insc.attrs = group.children;
			for(var b in group.children) {
				var tables = group.children[b];
				var ats = tables.attrs; 
				if(tables.className === 'Image') {
					if(ats.name === 'deleteimg') {
						continue;
					}
					insc.table_type = ats.name;
				}
				if(tables.className === 'Text') {
					insc.table_name = ats.text;
					insc.table_id = ats.id;
				} 
			}
			collc.push(insc);
		}
	} 
	return collc; 
}

function asyncloop(i,callback) {
	//if(i)
}


TablePlanSchema.methods.updateData = function(id,cb) {
	var _obj = this;
	var totalir = this.tablescollection.length; // 2
	var s = 1,retu = false;
	async.each(this.tablescollection,function(item,callback){
		
		_obj.model('TablePlan').count({ "_id": id, "tables.table_id": item.table_id }).exec(function(err,count) {
			console.log(item);
			if(count <= 0) {
				_obj.model('TablePlan').update({_id : id},{"$push"  : {"tables" : item }, "$set" : {'design' : _obj.design}},{upsert: true},function(err,doc) { 
			    		if(err) {
				    		console.log(err);
				    	}
						callback(); 
				});
			} else {
				_obj.model('TablePlan').findOneAndUpdate({ "_id": id, "tables.table_id": item.table_id },
				    { 
				        "$set": {
				            "tables.$": item,
				            'design' : _obj.design
				        }
				    },
				    {upsert: true},
				    function(err,doc) {
				    	if(err) {
				    		console.log(err);
				    	}
			    	 	callback(); 
				    }
				);
			}
		});
	},function(err) {
		return _obj.model('TablePlan').findOne({_id : id}).populate([{path: 'restaurant_id'}]).exec(cb);
	})
	/*for(var b in this.tablescollection) {
		
		var el = this.tablescollection[b]; 
		console.log(el);
		this.model('TablePlan').count({ "_id": id, "tables.table_id": el.table_id }).exec(function(err,count) {
			console.log(el);
			console.log(b);
				if(count <= 0) {
					_obj.model('TablePlan').update({_id : id},{"$push"  : {"tables" : el }, "$set" : {'design' : _obj.design}},{upsert: true},function(err,doc) {

			    	if(err) {
				    		console.log(err);
				    	}
						if(s >= totalir) {
							retu = true;
							return _obj.model('TablePlan').findOne({_id : id}).populate([{path: 'restaurant_id'}]).exec(cb);
						}
					});
				} else {
					_obj.model('TablePlan').findOneAndUpdate({ "_id": id, "tables.table_id": el.table_id },
					    { 
					        "$set": {
					            "tables.$": el,
					            'design' : _obj.design
					        }
					    },
					    {upsert: true},
					    function(err,doc) {
					    	if(err) {
					    		console.log(err);
					    	}
					    	if(s >= totalir) {
					    		retu = true;
				    			return _obj.model('TablePlan').find({_id : id}).populate([{path: 'restaurant_id'}]).exec(cb);
				    		}
					    }
					);
				}
			});
		s++;
	} 
	if(!retu) {
		return _obj.model('TablePlan').find({_id : id}).populate([{path: 'restaurant_id'}]).exec(cb);
	}*/

}

TablePlanSchema.plugin(mongoosePaginate);

TablePlanSchema.statics.getAllPaginate = function(params, cb) {  

	var limit = parseInt(params.limit) || 1;
	var filter = params.filter || false, fcollection = {}; 
	var sort = {};
	if( typeof params.sort != 'undefined') {
		sort[params['sort']] = (typeof params.sortDir != 'undefined' ?params.sortDir : -1);
	}

	if(typeof params.orderplaced!== 'undefined') {
		fcollection['orderplaced'] = params.orderplaced;
	}
	//fcollection = fcollection;
	return this.model('TablePlan').paginate(fcollection, { page: parseInt(params.page), sort : sort,limit: limit }, cb); 
}  


function parseFilter(filter,obj) {
	if(!filter) {
		return {};
	} 
	var bytes  = CryptoJS.AES.decrypt(filter, secretKey);
	var decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8)),filtercollection = {};  
	var schemaarray = Object.keys(obj.model('TablePlan').schema.paths);
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

TablePlanSchema.methods.toJSON = function() {
  var obj = this.toObject();
  obj.id = obj._id; 
  delete obj.__v;
  return obj;
};
 
  
mongoose.model('TablePlan',TablePlanSchema);