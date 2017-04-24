'use strict';


/*
 * Defining the Package
 */
var Module = require('meanio').Module;

var Tablebook = new Module('tablebook');


/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
Tablebook.register(function(app, auth, database, circles) {

  Tablebook.bookcontroller = require('./server/controllers/tablebook')(Tablebook, app);

  Tablebook.angularDependencies(['mean.backend']);
  //We enable routing. By default the Package Object is passed to the routes
  Tablebook.routes(app, auth, database, circles);

  
  
  /**
    //Uncomment to use. Requires meanio@0.3.7 or above
    // Save settings with callback
    // Use this for saving data from administration pages
    Tablebook.settings({
        'someSetting': 'some value'
    }, function(err, settings) {
        //you now have the settings object
    });

    // Another save settings example this time with no callback
    // This writes over the last settings.
    Tablebook.settings({
        'anotherSettings': 'some value'
    });

    // Get settings. Retrieves latest saved settigns
    Tablebook.settings(function(err, settings) {
        //you now have the settings object
    });
    */

  return Tablebook;
});
