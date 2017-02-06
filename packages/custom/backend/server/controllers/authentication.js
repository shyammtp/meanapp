'use strict';

var passport = require('passport'),Mongoose = require('mongoose'),
  AdminUser = Mongoose.model('AdminUser');

  module.exports = function (Backend, app) {
  	 return {
  	 	register : function(req,res) { 
        var user = new AdminUser(); 
        user.name = req.body.name;
        user.email = req.body.email;

        user.setPassword(req.body.password);

        user.save(function(err) {
          var token;
          token = user.generateJwt();
          res.status(200);
          res.json({
            token : token
          });
        });
  	 	},
      login : function(req,res,next) {  

        passport.authenticate('local', function(err, user, info){
          var token; 
          // If Passport throws/catches an error  
          if (err) {
            res.status(404).json(err);
            return;
          }

          // If a user is found
          if(user){
            token = user.generateJwt();
            res.status(200);
            res.json({
              token : token
            });
          } else {
            // If user is not found
            res.status(401).json(info);
          }
        })(req,res);
      }


  	 }
  }