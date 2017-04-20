'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module;

var Roles = new Module('roles');


/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
Roles.register(function(app, auth, database, circles) {

 
  Roles.rolescontroller = require('./server/controllers/roles')(Roles, app);

  Roles.angularDependencies(['mean.backend']);
  
  //We enable routing. By default the Package Object is passed to the routes
  Roles.routes(app, auth, database, circles);


  /**
    //Uncomment to use. Requires meanio@0.3.7 or above
    // Save settings with callback
    // Use this for saving data from administration pages
    Roles.settings({
        'someSetting': 'some value'
    }, function(err, settings) {
        //you now have the settings object
    });

    // Another save settings example this time with no callback
    // This writes over the last settings.
    Roles.settings({
        'anotherSettings': 'some value'
    });

    // Get settings. Retrieves latest saved settigns
    Roles.settings(function(err, settings) {
        //you now have the settings object
    });
    */

  return Roles;
});
