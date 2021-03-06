'use strict';

var Mongoose = require('mongoose'),
  foodcart = Mongoose.model('FoodCart'),
  arrayutil = require('../helpers/util').array,
  textutil = require('../helpers/util').text, 
  user = Mongoose.model('Customer'),  
  product = Mongoose.model('Product'),  
  variantset = Mongoose.model('Variantset'),  
  cart = Mongoose.model('FoodCart');

  module.exports = function (Backend, app) {
    var getvariants =  function(post,cb) {
            product.findOne({_id : post.item_reference},function(err,pdoc){
                if(!pdoc._id) {
                    new Error('Invalid Item');
                }
                var optionsvar = [];
                if(pdoc.variantsetid) {
                    variantset.findOne({_id : pdoc.variantsetid},function(err,vdoc) {
                        var optionset = vdoc.option_set;
                        var postoptions = arrayutil.get(post,'options');
                        console.log(postoptions);
                        var optvarss = []; 
                        optionset.forEach(function(v,h){ 
                            if(v.required === true) {
                                if(!(v.id in postoptions)) {
                                    new Error('Some Item additions are required');
                                }
                            }
                            if(typeof postoptions[v.id] !== 'undefined') {
                                var sf = {};
                                sf.name =  v.display_name;
                                var values = postoptions[v.id];
                                 if(typeof values === 'object') {
                                    var ssd = [];
                                    for(var gh in values) {
                                        if(values[gh]) {
                                            ssd.push(gh);
                                        }
                                    }
                                    values = ssd;
                                }
                                console.log(values);
                                var variantitems = []; 
                                for(var k in v.typedata.listvalues) {
                                    var ll = v.typedata.listvalues[k];

                                    if(values.indexOf(k) > -1) {
                                        var getl = ll;
                                        variantitems.push({name : ll.name,price : arrayutil.get(ll,'price',0)});
                                    }
                                } 
                                sf.options = variantitems;
                                optvarss.push(sf);
                            }
                        });
                        return cb(optvarss);
                    })
                } else {
                    return cb(optionsvar)
                }
            });
        };
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
        getCart : function(req,res,next) {
            var u = new cart();
            var filter =  {};  

            cart.findOne({user: arrayutil.get(req.params,'userid'),orderplaced : false}).populate([{path : 'user',populate : {path : 'deliveries.delivery_area'}}]).exec(function(err,doc) {
                console.log(doc);
                if(!doc) {
                    return res.status(500).json({message : 'Invalid Cart',success : false});
                }
                res.status(200).json({message : 'Got the result', data  : doc});
            });
        },
        updateCart : function(req,res,next) {
            var u = new cart();
            cart.count({_id: arrayutil.get(req.params,'id'),orderplaced : false},function(err,count) {
                if(count <= 0) {
                    return res.status(500).json({message : 'Invalid Cart',success : false});
                } 
                cart.findOneAndUpdate(
                    { "_id": arrayutil.get(req.params,'id'), "items._id": arrayutil.get(req.body,'_id') },
                    { 
                        "$set": {
                            "items.$": req.body
                        }
                    },
                    {upsert: true},
                    function(err,doc) {
                        cart.findOne({_id :  arrayutil.get(req.params,'id')}).populate([{path: 'user',select : 'email name'},{path : 'reserved_for',select : 'email name'}]).exec(function(err,doc) {
                            if(err) return res.status(500).json(err);
                            res.status(200).json(doc);
                        });
                    }
                ); 
            });
        },
        saveCart : function(req,res,next) {
            var u = new cart();
            var socketio = req.app.get('socketio');  
            if(!arrayutil.get(req.body,'item_reference')) {
                return res.status(500).json({message : 'Invalid Item',success : false});
            } 
            var variants = {}; 
            try {
                getvariants(req.body,function(options) {
                    //return res.status(200).json(options);
                    req.body.additions = options;
                    if(arrayutil.get(req.body,'_id')) { 
                        cart.count({_id: arrayutil.get(req.body,'_id'),orderplaced : false},function(err,count) {
                            if(count > 0) { 
                                u.setId(arrayutil.get(req.body,'_id'));
                                u.addData(req.body);
                                u.updateData(arrayutil.get(req.body,'_id'),function(err,sd) {
                                    if(err) return res.status(500).json(err);
                                    socketio.sockets.emit('cart.orders', sd);
                                    res.status(200).json(sd);

                                });
                            } else {
                                u.setId(false);
                                u.addData(req.body);
                                u.save(function(err,docs) { 
                                    if(err) {
                                        res.status(500).json(err);
                                    } else { 
                                        cart.findOne({_id: docs._id}).populate('user').exec(function(err,doc) { 
                                            socketio.sockets.emit('cart.orders', doc);
                                            res.status(200).json({message: 'Inserted Successfully',data : doc});
                                        });
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
                                cart.findOne({_id: docs._id}).populate('user').exec(function(err,doc) { 
                                    socketio.sockets.emit('cart.orders', doc);
                                    res.status(200).json({message: 'Inserted Successfully',data : doc});
                                })
                            }
                        });
                    }
                });
            } catch(err) {
                console.log(err);
                res.status(500).json({message : "test",success : false});
            }
            
        }

    }
  }