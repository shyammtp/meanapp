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
	sums : {type : Array, default : []},
	totalpaid : {type : Number,default : 0},
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
 
  
mongoose.model('FoodCart',FoodCartSchema);