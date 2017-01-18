'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module;
var path = require('path');
var Backend = new Module('backend');

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
Backend.register(function(app, auth, database, circles) {

  Backend.sidebarcontroller = require('./server/controllers/sidebar')(Backend, app);
  //We enable routing. By default the Package Object is passed to the routes
  Backend.routes(app, auth, database, circles);



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
