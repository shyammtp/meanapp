'use strict';

var mongoose = require('mongoose'),
arrayutil = require('../helpers/util').array,
Schema = mongoose.Schema;


var MenuItemSchema = new Schema({
 	menu_name : { 
					en: {type: String}
				},
	menuurl : {type: String, required: true,lowercase : true},
	sorting : {type: Number,default: 1},
	restaurant_id : {type : mongoose.Schema.Types.ObjectId,ref : 'Restaurant'},
	status : {type : Boolean,default : false},
	created_on : { type: Date, default: Date.now },
    updated_on: { type: Date, default: Date.now }
},{collection: "itemmenu"});
  
 

mongoose.model('MenuItem',MenuItemSchema);