'use strict';

var passport = require('passport'),Mongoose = require('mongoose'),
  AdminUser = Mongoose.model('AdminUser');

  module.exports = function (Backend, app) {
  	 return {
  	 	register : function(req,res) { 
        if(typeof req.body.restaurant_id == 'undefined' || req.body.restaurant_id == '') {
          return res.json({'message' : 'Invalid restaurant id'})
        }
        var user = new AdminUser();
        user.name = req.body.name;
        user.email = req.body.email;

        AdminUser.findOne({email : req.body.email,restaurant_id : req.body.restaurant_id})
          .exec(function(err,doc){
            console.log(doc);
            if(!doc) {
                user.restaurant_id = req.body.restaurant_id;
                user.roles = (typeof req.body.roles != 'undefined') ? req.body.roles : [];
                user.setPassword(req.body.password);
                user.save(function(err) {
                    if(err) return res.json({message : err});
                      var token;
                      token = user.generateJwt();
                      res.status(200);
                      res.json({
                        token : token
                      });
                });
            } else {
                return res.json({'message' : 'User already exists'});
            }
        })
        
  	 	},
      login : function(req,res,next) {  
      //res.status(200).json({});
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
              token : token,
              user : user
            });
          } else {
            // If user is not found
            res.status(401).json(info);
          }
        })(req,res);
      }


  	 }
  }