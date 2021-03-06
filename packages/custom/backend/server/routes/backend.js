(function() {
    'use strict';
 var meanio = require('meanio'),
 config = meanio.getConfig();
var Mongoose = require('mongoose'),
  NotificationTemplate = Mongoose.model('NotificationTemplate'),
  adminuser = Mongoose.model('AdminUser'),
  category = Mongoose.model('Category'),
  directory = Mongoose.model('directory'),
    express = require('express'),
  arrayutil = require('../helpers/util').array,
  textutil = require('../helpers/util').text,
  currencies = require('../includes/currencies.json'),
  path = require('path'),config = require('meanio').getConfig(),jwt = require('jsonwebtoken'),expressJwt = require('express-jwt');

    var authentic  = expressJwt({ 
        secret: config.secret,
        userProperty: 'payload'
    });

    /* jshint -W098 */
    // The Package is past automatically as first parameter
    module.exports = function(Backend, app, auth, database, circles) { 
        var sidebar = Backend.sidebarcontroller; 
        var settings = Backend.settingscontroller;   
        var authentication = Backend.authenticationcontroller;
        var products = Backend.productscontroller; 
        //app.use(sidebar.theme);
        //app.use(expressJwt({ secret: config.sessionSecret}));
        //app.use(logErrors);  
        
        app.use(function (err, req, res, next) {
            console.log('Shyam',err);
          if (err.name === 'UnauthorizedError') {
            res.status(401);
            res.json({'message' : err.name + ': ' + err.message,'logout' : true});
          } if(!err) {
            next();
          }
        });   
        //app.use(settings.getappsettings);

        var theme = config.theme,
        assetspath = '/theme/assets/lib/'+theme+'/';
        
        app.get('/',function(req,res) {  
            Backend.render(theme+'/index', {
                package: 'backend',
               // currenturl : req.originalUrl,
                theme : theme,
                apath : assetspath
            }, function(err, html) {
                res.send(html);
            });
        }); 
 
        /* For Products */
        app.get('/api/category/getcategory/:id',authentic,products.getCategory);
        app.delete('/api/category/delete/:id',authentic,products.deleteCategory);
        app.post('/api/category/save',authentic,products.saveCategory);
        app.get('/api/category/getpath',authentic,products.getpath);
        app.get('/api/category/getall',authentic,function(req,res){ 
            category.getAll(function(err,cb) {  
                res.send(cb);  
            })
        }); 
        app.get('/api/category/getcattree',authentic,function(req,res){              
           category.getCategories('',function(cb) {  
                res.send(cb);  
            })
        });
        app.put('/api/category/attributesave/:id',authentic,products.savecatalogattributes);
        app.put('/api/category/attributeoverride/:id',authentic,products.overwritecatalogattributes);
        app.delete('/api/category/attributedelete/:id',authentic,products.deletecatalogattribute);
        app.post('/api/product/save',authentic,products.saveProduct);
        app.post('/api/variant/save',authentic,products.saveVariant);
        app.post('/api/variantset/save',authentic,products.saveVariantSet);
        app.get('/api/catalog/list',authentic,products.cataloglist);
        app.get('/api/catalog/listvariants',authentic,products.cataloglistvariants);
        app.get('/api/catalog/listvariantset',authentic,products.cataloglistvariantset);
        app.get('/api/catalog/listvariantrulesset',authentic,products.cataloglistvariantrulesset);
        app.post('/api/catalog/savevariantsetrule',authentic,products.savevariantsetrule);
        app.get('/api/variant/get/:id',authentic,products.getVariants);
        app.get('/api/variantset/get/:id',authentic,products.getVariantset);
        app.get('/api/catalog/get/:id',authentic,products.getProduct);
        app.get('/api/variantset/rule/get/:id',authentic,products.getVariantRuleset);
        app.get('/api/variants/getall',authentic,products.getVariantsAll);
        app.get('/api/variantset/getall',authentic,products.getVariantsetAll);
        app.get('/api/catalog/subproductlist',authentic,products.subproductlist);
        app.post('/api/catalog/saveinterface',authentic,products.saveinterface);
        app.get('/api/catalog/getinterfaceviews',authentic,products.getinterfaceviews);
        app.post('/api/delivery/chargesave',authentic,products.savecharge);
        app.get('/api/delivery/getcharges',authentic,products.getcharges);
        app.get('/api/delivery/getallcharges',authentic,products.getallcharges);
        app.get('/api/delivery/locationcharge',authentic,products.locationcharge);
        app.post('/api/fileupload',products.uploads);


        /*Menus*/  
        app.get('/api/menus/getall',authentic,products.getMenus);
        app.post('/api/menus/save',authentic,products.saveMenus);
        app.delete('/api/menus/delete/:id',authentic,products.deleteMenus);
        app.delete('/api/menus/items/delete/:id',authentic,products.deleteItem);
        app.get('/api/menus/items',authentic,products.getItems);
        app.put('/api/menus/items/:id',authentic,products.setmenu);

        /* Cart orders */
        app.get('/api/cart/orders',authentic,products.getCartOrders);
        app.get('/api/cart/getorders',authentic,products.getorderscond);
        app.get('/api/orders/list',authentic,products.getOrdersList);
        app.get('/api/cart/getorder/:id',authentic,products.getCartOrder);
        app.put('/api/cart/update/:id',authentic,products.updatecart);
        app.post('/api/cart/employeehistory',authentic,products.addHistory);
        app.delete('/api/cart/item/remove/:cartid',authentic,products.removecartitem);
        app.put('/api/cart/user/addaddress/:id',authentic,products.adduserdeliveryaddress);

        /* General */
        app.get('/api/adminconfig',function(req,res) {             
            res.status(200);             
            res.json(Backend.adminconfig(req.query.index));
        });
        app.get('/api/generaldatas',function(req,res) {             
            res.status(200);             
            res.json({"currencies" : currencies});
        });
        app.get('/api/cache/flush',function(req,res) {
            var Nodecache = require('node-cache'),
                myCache = new Nodecache();
                myCache.del('category_tree');
           // myCache.flushAll();   
            res.status(200).json({message : 'Cache Cleared'}); 
        });

         
        app.post('/api/adminlogin', authentication.login);
        app.post('/api/adminregister', authentication.register);
            
        app.post('/api/settings/save',authentic,settings.savesettings);
        app.post('/api/settings/saveall',authentic, settings.saveAllsettings);
        app.get('/api/settings/get',settings.getallsettings);
        app.get('/api/settings/getpaginate',settings.getpaginate);
        app.get('/api/directory/get/country',settings.getcountry);
        app.get('/api/settings/getcountries',settings.getAllCountries);
        app.delete('/api/directory/delete/:id',authentic,settings.deleteDirectory);
        app.get('/api/directory/getall',authentic,function(req,res){ 
            directory.getAll(function(err,cb) {  
                res.send(cb);  
            })
        });
        app.get('/api/directory/getallcache',authentic,function(req,res){ 
            directory.getAllCache(function(ress) {  
                res.send(ress);  
            })
        });
        app.post('/api/directory/save',authentic,settings.saveDirectory);
        app.post('/api/directory/get',authentic,settings.getDirectories);


        app.get('/api/users/get',authentic, settings.getusers);
        app.post('/api/users/save',authentic, settings.saveuser);


        app.get('/api/backend/menus',sidebar.menuslist);
        app.put('/api/notificationtemplate/save/:id',authentic, settings.saveNotificationTemplate);
        app.get('/api/notificationtemplate/getall',function(req,res) { 
             NotificationTemplate.getAllPaginate(req.query,function(err,cb) {
               res.send(cb);
            });
        });

        app.post('/api/settings/upload',settings.upload);
        //console.log(app.locals);
        app.get('/api/locals',function(req,res) {

            res.send({theme :theme,assetspath : assetspath});
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