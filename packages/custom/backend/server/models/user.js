'use strict';

var mongoose = require('mongoose'),
Schema = mongoose.Schema,
 mongoosePaginate = require('mongoose-paginate'),
 Nodecache = require( "node-cache" ),
 myCache = new Nodecache(),
	_ = require('lodash'),
	textutil = require('../helpers/util').text;
 
var UsersSchema = new Schema({ 
	name : {type: String},
	email : {type : String,unique : true}, 
    created_on : { type: Date, default: Date.now },
    updated_on: { type: Date, default: Date.now }   

},{collection: "customers"});
 
UsersSchema.pre('save',function(next) {		
	console.log('pre');
	next();
})

 
UsersSchema.post('save',function() {	
	console.log('post'); 
})

UsersSchema.methods.addData = function(data) {
	var _obj = this;  
	this.name = data.name;
	this.email = data.email;
}
 

UsersSchema.methods.updateData = function(id,cb) {
	var _obj = this;
	this.model('Customer').update({_id : id},{$set  : {name : this.name, email : this.email}},{upsert: true},function(err,doc) {
		_obj.model('Customer').findOne({_id : id},cb);
	});

}
 
  
mongoose.model('Customer',UsersSchema);