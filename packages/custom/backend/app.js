'use strict';

/*
 * Defining the Package
 */
var meanio = require('meanio'), Module = meanio.Module;
var path = require('path');
var Backend = new Module('backend'),  
passport = require('passport');
require('./server/config/passport'); 
var adminconfig = require('./server/config/adminconfig.json');
 

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
Backend.register(function(app, auth, database, circles) {
  
  Backend.sidebarcontroller = require('./server/controllers/sidebar')(Backend, app);
  Backend.productscontroller = require('./server/controllers/products')(Backend, app);
  Backend.settingscontroller = require('./server/controllers/settings')(Backend, app);
  Backend.authenticationcontroller = require('./server/controllers/authentication')(Backend, app);
  Backend.frontendcontroller = require('./server/controllers/frontend')(Backend, app);
  app.use(passport.initialize());

  //We enable routing. By default the Package Object is passed to the routes 
  Backend.routes(app, auth, database, circles);
  //app.use(session({ secret: config.secret, resave: false, saveUninitialized: true }));
  //app.use('/api', expressJwt({ secret: config.sessionSecret }).unless({ path: ['/api/users/authenticate', '/api/users/register'] }));
  Backend.angularDependencies(['ngSanitize','ui.router','ui.tinymce','angular-loading-bar','btford.socket-io','ngMap','angucomplete-alt']); 
  app.set('views', path.join(__dirname, '/server/views/black')); 
 
  //We are adding a link to the main menu for all authenticated users
  Backend.menus.add({
    title: 'backend example page',
    link: 'backend example page',
    roles: ['authenticated'],
    menu: 'main'
  }); 
  Backend.adminconfig = getConfig; 
  
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

function getConfig(index) {
  if(adminconfig.hasOwnProperty(index)) { 
    return adminconfig[index];
  }
  return  {};
}
