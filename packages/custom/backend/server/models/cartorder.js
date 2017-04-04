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
	user : {type : mongoose.Schema.Types.ObjectId,ref : 'Customer'},
	cart_reference : {type : String,unique : true},
	type : ['pickup','delivery'],
	orderplaced: {type : Boolean,default: false},
    created_on : { type: Date, default: Date.now },
    updated_on: { type: Date, default: Date.now },   
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


FoodCartSchema.methods.addData = function(data) {
	var _obj = this,items = {};  	
	if(data.item_name) {
		items.item_name = data.item_name;
	}if(data.quantity) {
		items.quantity = data.quantity;
	}if(data.price) {
		items.price = data.price;
	} 

	if(edit &&  data._id) {
		this._id = data._id
	} else {
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
	    		_obj.model('FoodCart').find({_id : id}).populate('user').exec(cb);
		    }
		);
	} else { 
 
		this.model('FoodCart').update({_id : id},{"$push"  : {"items" : _obj.itemscollection}},{upsert: true},function(err,doc) {
			_obj.model('FoodCart').findOne({_id : id}).populate('user').exec(cb);
		});
	}

}
 
  
mongoose.model('FoodCart',FoodCartSchema);