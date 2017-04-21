'use strict';

var mongoose = require('mongoose'),
Schema = mongoose.Schema,
 mongoosePaginate = require('mongoose-paginate'),
 Nodecache = require( "node-cache" ),
 myCache = new Nodecache(),
	_ = require('lodash'),
	textutil = require('../helpers/util').text;

var ItemsSchema = new Schema ({ 
	item_name : {type : String,required : true},
	quantity : {type : Number,default : 1},
	item_ref : {type : mongoose.Schema.Types.ObjectId,ref : 'Product'},
	price : {type : Number},
	additions : {type: Schema.Types.Mixed}
})

var historySchema = new Schema ({ 
	user : {type : mongoose.Schema.Types.ObjectId,ref : 'AdminUser'},
	message : {type : String},
	image : {type : String, default : null},
	price : {type : Number,default : 0},
 	updated_on: { type: Date, default: Date.now }
})


 
function makeid()
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 5; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

var FoodCartSchema = new Schema({ 
	user : {type : mongoose.Schema.Types.ObjectId,ref : 'Customer'},
	cart_reference : {type : String,unique : true},
	type : ['pickup','delivery'],
	price : {type : Number,default : 0},
	discounts : {type : Array, default : []},
	additionalinfo : {type : String},
	delivery: {type: Schema.Types.Mixed},	
	deliverycharge : {type : Number},
	status : ['accepted','canceled','pending'],
	personalinfo : {type: Schema.Types.Mixed},
	restaurant_id : {type : mongoose.Schema.Types.ObjectId,ref : 'Restaurant'},
	priceset : {type: Schema.Types.Mixed},
	totalpaid : {type : Number,default : 0},
	order_reference : {type : String},
	paid : {type: Boolean, default: false},
	payment_mode: {type: String},
	orderplaced: {type : Boolean,default: false},
    created_on : { type: Date, default: Date.now },
    updated_on: { type: Date, default: Date.now },  
    reserved_for : {type : mongoose.Schema.Types.ObjectId,ref : 'AdminUser'}, 
    histories : [historySchema],
    items : [ItemsSchema]

},{collection: "foodcart"});
 
FoodCartSchema.pre('init', function(next, data) {
	var d = new Date(data.updated_on);
	var time = d.toLocaleString('en-US', { hour: 'numeric',minute : 'numeric', hour12: true });
	var cd = new Date();
	var yes = new Date(); yes.setDate(cd.getDate()-1);
	var monthShortNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
	  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
	];
	var string = '';
	if(d.toLocaleDateString() == cd.toLocaleDateString()) {
		string = 'Today at '+time
	} else if(d.toLocaleDateString() == yes.toLocaleDateString()) {
		string = 'Yesterday at '+time
	} else {
		string = monthShortNames[d.getMonth()]+", "+d.getDate()+" "+d.getYear();
	}
  	data.updateformatted = string;
  	data.totalitems = data.items.length;
  	next();
});
FoodCartSchema.pre('save',function(next) {		
	console.log(this);
	if(!this._id) {
		this.cart_reference = makeid();
		//this.items = this.itemscollection;
	} 
	if(!this.cart_reference) {
		this.cart_reference = makeid();
	}
	next();
})

 
FoodCartSchema.post('save',function() {	
	console.log('post'); 
})

var edit = true;
FoodCartSchema.methods.setId = function(id) {
	edit = id;
}

FoodCartSchema.methods.addHistory = function(id, user, message,cb) {
	var _obj = this;
	var data = {user  : user, message : message};
	this.model('FoodCart').findOneAndUpdate(
		    { "_id": id},
		    { 
		        "$push": {
		            "histories": data		            
		        }
		    },
		    {upsert: true},
		    function(err,doc) {
	    		_obj.model('FoodCart').find({_id : id}).populate([{path: 'user',select : 'email name'},{path : 'reserved_for',select : 'email name'}]).exec(cb);
		    }
		);
}

FoodCartSchema.methods.getReferenceNumber = function() {
	var _obj = this; 
	var date = new Date();
	return date.getDate()+date.getMonth()+date.getYear()+date.getHours()+date.getMinutes()+date.getSeconds();
}

FoodCartSchema.methods.addData = function(data) {
	var _obj = this,items = {};  	
	if(data.item_name) {
		items.item_name = data.item_name;
	}if(data.quantity) {
		items.quantity = data.quantity;
	}if(data.price) {
		items.price = data.price;
	} if(data.additions) {
		items.additions = data.additions;
	} if(data.item_reference) {
		items.item_ref = data.item_reference;
	}  

	if(edit &&  data._id) {
		this._id = data._id
	} else if(!edit) {
		this.items = items;
	}
	
	this.user = data.user;

	this.type = data.type;
	if(data.item_id) {
		this.item_id = data.item_id;
		items._id = data.item_id;
	} 
	
	this.itemscollection = items;
}
 

FoodCartSchema.methods.updateData = function(id,cb) {
	var _obj = this;
	if(this.item_id) {
		this.model('FoodCart').findOneAndUpdate(
		    { "_id": id, "items._id": _obj.item_id },
		    { 
		        "$set": {
		            "items.$": _obj.itemscollection
		        }
		    },
		    {upsert: true},
		    function(err,doc) {
	    		_obj.model('FoodCart').find({_id : id}).populate([{path: 'user',select : 'email name'},{path : 'reserved_for',select : 'email name'}]).exec(cb);
		    }
		);
	} else { 
 
		this.model('FoodCart').update({_id : id},{"$push"  : {"items" : _obj.itemscollection}},{upsert: true},function(err,doc) {
			_obj.model('FoodCart').findOne({_id : id}).populate([{path: 'user',select : 'email name'},{path : 'reserved_for',select : 'email name'}]).exec(cb);
		});
	}

}

FoodCartSchema.plugin(mongoosePaginate);

FoodCartSchema.statics.getAllPaginate = function(params, cb) { 
	/*var limit = parseInt(params.limit) || 1;
	var filter = params.filter || false, fcollection = {},posfilter = {}; 
	var sort = {};
	if( typeof params.sort != 'undefined') {
		sort[params['sort']] = (typeof params.sortDir != 'undefined' ?params.sortDir : -1);
	}
	if( typeof params.productkeywords !== 'undefined') {
		posfilter = {$or : [{'data.sku' : {$regex : params.productkeywords, $options : 'i'}},
								{'data.item_name' :{$regex : params.productkeywords, $options : 'i'}
						 }]
					}
	} 
	fcollection = _.assign({},fcollection,{is_foodie : false});
	console.log(fcollection);
	return this.model('FoodCart').paginate(fcollection, { page: parseInt(params.page), sort : sort,limit: limit }, cb);*/ 

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
	return this.model('FoodCart').paginate(fcollection, { page: parseInt(params.page), sort : sort,limit: limit }, cb); 
}  


function parseFilter(filter,obj) {
	if(!filter) {
		return {};
	} 
	var bytes  = CryptoJS.AES.decrypt(filter, secretKey);
	var decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8)),filtercollection = {};  
	var schemaarray = Object.keys(obj.model('FoodCart').schema.paths);
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

FoodCartSchema.methods.toJSON = function() {
  var obj = this.toObject();
  obj.id = obj._id;
  //delete obj._id;
  obj.status = obj.status[0] != undefined ? obj.status[0] : obj.status;
  obj.deliverytype = obj.type[0] != undefined ? obj.type[0] : obj.type;
  delete obj.__v;
  return obj;
};
 
  
mongoose.model('FoodCart',FoodCartSchema);