(function() {
    'use strict';
 
    /* jshint -W098 */
    // The Package is past automatically as first parameter
    module.exports = function(Backend, app, auth, database, circles) {
        var sidebar = Backend.sidebarcontroller; 
        var settings = Backend.settingscontroller;   
        app.use(sidebar.theme);

        app.get('/',function(req,res) {  
            Backend.render('index', {
                package: 'backend',
                currenturl : req.originalUrl,
                settings : app.locals
            }, function(err, html) {
                res.send(html);
            });
        }); 

        app.get('/api/backend/menus',sidebar.menuslist);
        app.post('/api/settings/save',settings.savesettings);
        app.get('/api/settings/get',settings.getallsettings);

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
