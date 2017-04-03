'use strict';

var Mongoose = require('mongoose'),
  foodcart = Mongoose.model('FoodCart'),
  arrayutil = require('../helpers/util').array,
  textutil = require('../helpers/util').text, 
  user = Mongoose.model('Customer'),  
  cart = Mongoose.model('FoodCart');

  module.exports = function (Backend, app) {
    return { 
        saveUser : function(req,res,next) {
            var u = new user();
            u.addData(req.body); 
            if(arrayutil.get(req.body,'_id')) { 
                u.updateData(arrayutil.get(req.body,'_id'),function(err,sd) {
                    if(err) return res.status(500).json(err);
                    res.status(200).json(sd);
                });
            } else {
                u.save(function(err,docs) { 
                    if(err) {
                        res.status(500).json(err);
                    } else {
                        res.status(200).json({message: 'Inserted Successfully',data : docs});
                    }
                });
            }
        },
        saveCart : function(req,res,next) {
            var u = new cart();
            var socketio = req.app.get('socketio');  
            if(arrayutil.get(req.body,'_id')) { 
                cart.count({_id: arrayutil.get(req.body,'_id'),orderplaced : false},function(err,count) {
                    if(count > 0) { 
                        u.setId(arrayutil.get(req.body,'_id'));
                        u.addData(req.body);
                        u.updateData(arrayutil.get(req.body,'_id'),function(err,sd) {
                            if(err) return res.status(500).json(err);
                            //socketio.sockets.emit('article.created', sd);
                            res.status(200).json(sd);

                        });
                    } else {
                        u.setId(false);
                        u.addData(req.body);
                        u.save(function(err,docs) { 
                            if(err) {
                                res.status(500).json(err);
                            } else { 
                                //socketio.sockets.emit('article.created', docs);
                                res.status(200).json({message: 'Inserted Successfully',data : docs});
                            }
                        });
                    }
                })
                
            } else { 
                u.setId(false);
                 u.addData(req.body);
                u.save(function(err,docs) { 
                    if(err) {
                        res.status(500).json(err);
                    } else { 
                        //socketio.sockets.emit('article.created', docs);
                        res.status(200).json({message: 'Inserted Successfully',data : docs});
                    }
                });
            }
        }

    }
  }