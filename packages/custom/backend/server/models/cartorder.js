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
	price : {type : Number}
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
	user : {type : mongoose.Schema.Types.ObjectId,ref : 'user'},
	cart_reference : {type : String,unique : true},
	type : ['pickup','delivery'],
	orderplaced: {type : Boolean,default: false},
    created_on : { type: Date, default: Date.now },
    updated_on: { type: Date, default: Date.now },   
    items : [ItemsSchema]

},{collection: "foodcart"});
 
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

FoodCartSchema.methods.setId = function(id) {
	if(!id) {
		this._id = null;
	} else {			
		this._id = id;
	}
}


FoodCartSchema.methods.addData = function(data) {
	var _obj = this,items = {};  	
	if(data.item_name) {
		items.item_name = data.item_name;
	}if(data.quantity) {
		items.quantity = data.quantity;
	}if(data.price) {
		items.price = data.price;
	} 
	
	this.user = data.user;
	this.type = data.type;
	if(data.item_id) {
		this.item_id = data.item_id;
		items._id = data.item_id;
	} 
	if(!this._id) {
		this.items = items;
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
	    		_obj.model('FoodCart').findOne({_id : id},cb);
		    }
		);
	} else { 
 
		this.model('FoodCart').update({_id : id},{"$push"  : {"items" : _obj.itemscollection}},{upsert: true},function(err,doc) {
			_obj.model('FoodCart').findOne({_id : id},cb);
		});
	}

}
 
  
mongoose.model('FoodCart',FoodCartSchema);