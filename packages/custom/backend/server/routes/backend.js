(function() {
    'use strict';
 
var Mongoose = require('mongoose'),
  NotificationTemplate = Mongoose.model('NotificationTemplate'),
  adminuser = Mongoose.model('AdminUser'),
  path = require('path'),config = require('meanio').getConfig(),jwt = require('jsonwebtoken'),expressJwt = require('express-jwt');

  var authentic  = expressJwt({ 
        secret: config.sessionSecret,
        userProperty: 'payload'
    });
    /* jshint -W098 */
    // The Package is past automatically as first parameter
    module.exports = function(Backend, app, auth, database, circles) {
        var sidebar = Backend.sidebarcontroller; 
        var settings = Backend.settingscontroller;   
        var authentication = Backend.authenticationcontroller;
        app.use(sidebar.theme);
         
        var adminu = new adminuser();
        adminu.setPassword('shyammtp');
        
        app.get('/',function(req,res) { 
            Backend.render('index', {
                package: 'backend',
                currenturl : req.originalUrl,
                settings : app.locals
            }, function(err, html) {
                res.send(html);
            });
        });  
        app.post('/api/adminlogin', authentication.login);
        app.post('/api/adminregister', authentication.register);
        app.use(function (err, req, res, next) {
          if (err.name === 'UnauthorizedError') {
            res.status(401);
            res.json({"message" : err.name + ": " + err.message});
          }
        });


        app.get('/api/backend/menus',sidebar.menuslist);
        app.post('/api/settings/save',settings.savesettings);
        app.get('/api/settings/get',settings.getallsettings);

        app.get('/api/settings/getpaginate',settings.getpaginate);
        app.get('/api/notificationtemplate/getall',function(req,res) { 
             NotificationTemplate.getAllPaginate(req.query,function(err,cb) {
               res.send(cb);
            });
        });

        app.post('/api/settings/upload',settings.upload);

        app.get('/api/locals',function(req,res) {
            res.send(app.locals);
        });

        /*app.get('/api/backend/example/auth', requiresLogin, function(req, res) {
            res.send('Only authenticated users can access this');
        });

        app.get('/api/backend/example/admin', requiresAdmin, function(req, res) {
            res.send('Only users with Admin role can access this');
        });

        app.get('/api/backend/example/render', function(req, res) {
            Backend.render('index', {
                package: 'backend',
                shyam : 'test'
            }, function(err, html) {
                //Rendering a view from the Package server/views
                res.send(html);
            });
        });*/
    };
})();
