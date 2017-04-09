(function() {
    'use strict';
 
var Mongoose = require('mongoose'),   
  arrayutil = require('../helpers/util').array,
  textutil = require('../helpers/util').text, 
  path = require('path'),
  config = require('meanio').getConfig();
 

    /* jshint -W098 */
    // The Package is past automatically as first parameter
    module.exports = function(Backend, app, auth, database, circles) { 
        var frontend = Backend.frontendcontroller; 

        /* For Fronted V1 */
        /*app.get('/api/v1//:id',products.getCategory);
        app.delete('/api/category/delete/:id',products.deleteCategory);*/
        app.post('/api/v1/user/save',frontend.saveUser);
        app.post('/api/v1/cart/add',frontend.saveCart);
        app.put('/api/v1/cart/update/:id',frontend.updateCart);
        app.get('/api/v1/cart/get/:userid',frontend.getCart);
         
    };
 
})();