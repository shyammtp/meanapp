'use strict';
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
var AdminUser = mongoose.model('AdminUser'); 
passport.use(new LocalStrategy({
    usernameField: 'email'
  },
  function(username, password, done) { 
    AdminUser.findOne({ email: username }, function (err, user) {
  
        var restuarant = mongoose.model('Restaurant');
      if (err) { return done(err); }
      // Return if user not found in database
      if (!user) {
        return done(null, false, {
          message: 'User not found'
        });
      }
      // Return if password is wrong
      if (!user.validPassword(password)) {
        return done(null, false, {
          message: 'Password is wrong'
        });
      }
      user.restaurant_id = user.restaurant_id;
      return done(null, user); 
      
    });
  }
));