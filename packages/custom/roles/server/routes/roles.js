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
    module.exports = function(Roles, app, auth, database, circles) {
        
        var roles = Roles.rolescontroller; 

        app.post('/api/settings/saverole',authentic, roles.saverole);
        app.get('/api/settings/getroles',authentic, roles.getroles);
        app.get('/api/settings/getrole/:id',authentic, roles.getrolebyid);
    };
})();
