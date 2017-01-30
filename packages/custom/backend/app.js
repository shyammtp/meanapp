'use strict';

/*
 * Defining the Package
 */
var meanio = require('meanio'), Module = meanio.Module;
var path = require('path');
var Backend = new Module('backend'),
session = require('express-session'),
expressJwt = require('express-jwt'),
config = meanio.getConfig(),
passport = require('passport');
require("./server/config/passport.js");

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
Backend.register(function(app, auth, database, circles) {

  Backend.sidebarcontroller = require('./server/controllers/sidebar')(Backend, app);
  Backend.settingscontroller = require('./server/controllers/settings')(Backend, app);
  app.use(passport.initialize());
  app.use(function (err, req, res, next) {
          console.log(app);
      if (err.name === 'UnauthorizedError') {
        res.status(401);
        res.json({"message" : err.name + ": " + err.message});
      }
    });
  //We enable routing. By default the Package Object is passed to the routes 
  Backend.routes(app, auth, database, circles);
  app.use(session({ secret: config.secret, resave: false, saveUninitialized: true }));
  app.use('/api', expressJwt({ secret: config.sessionSecret }).unless({ path: ['/api/users/authenticate', '/api/users/register'] }));
  Backend.angularDependencies(['ngSanitize']); 
  app.set('views', path.join(__dirname, '/server/views'));
  //We are adding a link to the main menu for all authenticated users
  Backend.menus.add({
    title: 'backend example page',
    link: 'backend example page',
    roles: ['authenticated'],
    menu: 'main'
  }); 
  
  /**
    //Uncomment to use. Requires meanio@0.3.7 or above
    // Save settings with callback
    // Use this for saving data from administration pages
    Backend.settings({
        'someSetting': 'some value'
    }, function(err, settings) {
        //you now have the settings object
    });

    // Another save settings example this time with no callback
    // This writes over the last settings.
    Backend.settings({
        'anotherSettings': 'some value'
    });

    // Get settings. Retrieves latest saved settigns
    Backend.settings(function(err, settings) {
        //you now have the settings object
    });
    */

  return Backend;
});
