'use strict';

var Mongoose = require('mongoose'),
  Menus = Mongoose.model('Menus');

  module.exports = function (Backend, app) {
  	 return {
  	 	menuslist : function(req,res) { 
  	 		Menus.getMenus('admin',"",function(returns) {
		      res.send(returns);
		    });
  	 	},
      theme : function(req,res,next) { 
        app.locals.theme = 'black';
        return next();
      }

  	 }
  }