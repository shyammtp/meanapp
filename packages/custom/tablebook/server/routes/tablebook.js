(function() {
    'use strict';
    var config = require('meanio').getConfig(),
        jwt = require('jsonwebtoken'),
        expressJwt = require('express-jwt');

    var authentic  = expressJwt({ 
        secret: config.secret,
        userProperty: 'payload'
    });


    /* jshint -W098 */
    // The Package is past automatically as first parameter
    module.exports = function(Tablebook, app, auth, database, circles) {

        var tablebook = Tablebook.bookcontroller; 

        app.post('/api/tables/saveplan',authentic, tablebook.savedesign);
        app.post('/api/tables/savefloor',authentic, tablebook.savefloor);
        app.get('/api/tables/getplans',authentic, tablebook.getplans);
        app.get('/api/tables/getplan/:id',authentic, tablebook.getplanbyid);
    };
})();
