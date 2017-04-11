'use strict';

var Mongoose = require('mongoose'),
	AdminUser = Mongoose.model('AdminUser'),category = Mongoose.model('Category'),product = Mongoose.model('Product'),
	user = Mongoose.model('Customer'),
	variants = Mongoose.model('Variants'),
	intf = Mongoose.model('InterfaceSettings'),
	variantset = Mongoose.model('Variantset'),
		_ = require('lodash'),
	foodcart = Mongoose.model('FoodCart'),
	MenuItem = Mongoose.model('MenuItem'),
	arrayutil = require('../helpers/util').array,
	attrdefaults = require('../includes/attributesdefaults.json'),
	multer  = require('multer'),
	textutil = require('../helpers/util').text,config = require('meanio').getConfig(); 
		
	module.exports = function (Backend, app) {
		 return { 
				saveCategory : function(req,res) {
						var cat = new category();
						if(arrayutil.get(req.query,'parent')) {            
								var query = category.where({category_url : req.query['parent']});
								query.findOne(function(err,cate) {
										if(cate) {
												cat.category_parent_id = cate._id;
												//console.log(cate.level);
												cat.level = cate.level+1;
												if(typeof cate.tree_path!= 'undefined') {
														cat.tree_path = cate.tree_path+'/'+cate._id;
														cat.tree_url = cate.tree_url+'/'+cate.category_url;
												} else {
														cat.tree_path = cate._id;
														cat.tree_url = cate.category_url;
												}
												cat.category_url = textutil.url_title(arrayutil.get(arrayutil.get(req.body,'category_name'),'en'));
												cat.category_name['en'] = arrayutil.get(arrayutil.get(req.body,'category_name'),'en');  
												cat.attributes = attrdefaults;               
												cat.save(function(err,category,numAffected) {
														if(err) {
																res.status(500).json(err);
														} else {
																res.status(200).json({message: 'Inserted Successfully'});
														}
												}); 
										}
								});
						} else {
								if(arrayutil.get(req.body,'category_id')) {
										category.findById(arrayutil.get(req.body,'category_id'), function(error, catey) {
												// Handle the error using the Express error middleware
												if(error) return res.status(200).json(error);
												
												// Render not found error
												if(!catey) {
													return res.status(404).json({
														message: 'category with id ' + id + ' can not be found.'
													});
												}
												var data = {};
												data.category_url = textutil.url_title(arrayutil.get(arrayutil.get(req.body,'category_name'),'en'));
												data.category_name = { 'en' : arrayutil.get(arrayutil.get(req.body,'category_name'),'en')};

												// Update the course model
												catey.update(data, function(error, catey) {
													if(error) return res.status(200).json(error);
														
													return res.json(catey);
													 
												});
											});
								} else {
										cat.category_url = textutil.url_title(arrayutil.get(arrayutil.get(req.body,'category_name'),'en'));
										cat.category_name['en'] = arrayutil.get(arrayutil.get(req.body,'category_name'),'en');
										cat.attributes = attrdefaults;                 
										cat.save(function(err,category,numAffected) {
												if(err) {
													 res.status(500).json(err);
												} else {
														res.status(200).json({message: 'Inserted Successfully'});
												}
										}) 
								}
						}
				},
				getCategory : function(req,res,next) {
					 if(!arrayutil.get(req.params,'id')) {
						 return res.status(500).json({message: "Invalid Category ID"});
					}
					category.findOne({_id : arrayutil.get(req.params,'id')},function (err, cate) {
						
							res.status(200).json(cate);
						

					}); 
				},
				getVariants : function(req,res,next) {
						if(!arrayutil.get(req.params,'id')) {
								 return res.status(500).json({message: "Invalid Variant ID"});
							}
						variants.findOne({_id : arrayutil.get(req.params,'id')},function (err, vars) { 
									res.status(200).json(vars); 
							}); 
				},
				getVariantset : function(req,res,next) {
						if(!arrayutil.get(req.params,'id')) {
								 return res.status(500).json({message: "Invalid Variant ID"});
							}
						variantset.findOne({_id : arrayutil.get(req.params,'id')},function (err, vars) { 
									res.status(200).json(vars); 
							}); 
				},
				getProduct : function(req,res,next) {
						if(!arrayutil.get(req.params,'id')) {
								 return res.status(500).json({message: "Invalid Product ID"});
							}
						product.findOne({_id : arrayutil.get(req.params,'id')},function (err, vars) { 
									res.status(200).json(vars); 
							}); 
				},
				getVariantRuleset : function(req,res,next) {
						if(!arrayutil.get(req.params,'id')) {
								 return res.status(500).json({message: "Invalid Variant ID"});
							}
								variantset.findOne({_id : arrayutil.get(req.params,'id')},function (err, vars) { 
										console.log(arrayutil.get(vars,'rules'));
										var rule = {};
										if(arrayutil.get(arrayutil.get(vars,'rules'),arrayutil.get(req.query,'index'))) {
												rule = arrayutil.get(arrayutil.get(vars,'rules'),arrayutil.get(req.query,'index'));
										}  
										res.status(200).json(rule);
								}); 
				},
				getVariantsAll : function(req,res,next) {
						variants.find({},function (err, vars) { 
									res.status(200).json(vars); 
							});
				},getVariantsetAll : function(req,res,next) {
						variantset.find({},function (err, vars) { 
									res.status(200).json(vars); 
							});
				},
				deleteCategory : function(req,res,next) {
					if(!arrayutil.get(req.params,'id')) {
						 return res.status(500).json({message: "Invalid Category ID"});
					}
					category.CheckChildren(arrayutil.get(req.params,'id'),function(err,count) {
						if(count <= 0) {
							category.findByIdAndRemove(arrayutil.get(req.params,'id'),function(err,obj) {
								if (err) {
									return res.status(500).json(err);
								};
								res.status(200).json({message : "Category has deleted"});
							});
						} else {
							res.status(500).json({message: "Category has children"});
						}  
					})
					
				},
				savecatalogattributes : function(req,res,next) {  
					if(!arrayutil.get(req.params,'id')) {
						 return res.status(500).json({message: "Invalid Category ID"});
					}
					category.findOne({_id : arrayutil.get(req.params,'id')},function (err, cate) {
						var ats = arrayutil.get(req.body,'attributes');
						for(var kv in ats) { 
							if(!ats.hasOwnProperty(kv)) continue; 
							cate.insertAttribute(kv,arrayutil.get(ats,kv),arrayutil.get(req.body,'block','info'));
						} 
						cate.saveAttributeUpdate(arrayutil.get(req.params,'id'),function(err,cat) {
							if(err) return res.status(500).json(err);
							res.status(200).json(cat);
						});

					}); 

				},
				saveProduct : function(req,res,next) {
					var pr = new product();
					pr.addData(req.body); 
					if(arrayutil.get(req.body,'_id')) { 
						pr.updateData(arrayutil.get(req.body,'_id'),function(err,sd) {
								if(err) return res.status(500).json(err);
								res.status(200).json(sd);
						});
					} else {
						pr.save(function(err,products) { 
								if(err) {
										res.status(500).json(err);
								} else {
										res.status(200).json({message: 'Inserted Successfully',data : products});
								}
						});
					}
				},
				getpath : function(req,res,next) {
						var ids = arrayutil.get(req.query,'catpath').split(","); 
						category.find().where('_id').in(ids).exec(function (err, records) {
								if(err) return res.status(500).json(err);
								res.status(200).json(records);              
					});
				},
				overwritecatalogattributes : function(req,res,next) {  
					if(!arrayutil.get(req.params,'id')) {
						 return res.status(500).json({message: "Invalid Category ID"});
					}
					category.findOne({_id : arrayutil.get(req.params,'id')},function (err, cate) {
						//var ats = arrayutil.get(req.body,'attributes');
						cate.overrideAttribute(req.body);
						 
						cate.saveAttributeUpdate(arrayutil.get(req.params,'id'),function(err,cat) {
							if(err) return res.status(500).json(err);
							res.status(200).json(cat);
						});

					}); 

				},
				deletecatalogattribute : function(req,res,next) { 
					if(!arrayutil.get(req.params,'id')) {
						 return res.status(500).json({message: "Invalid Category ID"});
					}
					category.findOne({_id : arrayutil.get(req.params,'id')},function (err, cate) {  
							try {
								cate.deleteAttribute(arrayutil.get(req.query,'key'),arrayutil.get(req.query,'block','info'),arrayutil.get(req.query,'parent',false));
							} catch (err) { 
								console.log(err);
							 return res.status(500).json({message:"Problem in Deleting"});
							}  
							var obj = "attributes."+arrayutil.get(req.query,'block','info')+"."+arrayutil.get(req.query,'key');              
							
						cate.saveAttributeUpdate(arrayutil.get(req.params,'id'),function(err,doc) {
							if(err)  return res.status(500).json({message:"Problem in Deleting"});
							res.status(200).json(doc);
						});
						
					}); 
					
				},
				cataloglistvariants : function(req,res,next) {
						variants.getAllPaginate(req.query,function(err,cb) {

							 res.send(cb);
						});
				},
				cataloglistvariantset : function(req,res,next) {
						variantset.getAllPaginate(req.query,function(err,cb) {
							 res.send(cb);
						});
				},
				cataloglist : function(req,res,next) {
						product.getAllPaginate(req.query,function(err,cb) {
							 res.send(cb);
						});
				},
				cataloglistvariantrulesset : function(req,res,next) {
						variantset.getAllRules(req.query,function(err,cb) { 
							 res.send({'docs' : arrayutil.get(cb,'rules',{}),'total' : 0 });
						});
				}, 
				subproductlist : function(req,res,next) {
						product.getAllsubproducts(req.query,function(err,cb) { 
							 res.send({'docs' : arrayutil.get(cb,'rules',{}),'total' : 0 });
						});
				},
				subproductlist : function(req,res,next) { 
						product.getAllPaginate(req.query,function(err,cb) {  
						});
				},
				saveVariant : function(req,res,next) {
					var vr = new variants();
					vr.addData(req.body);  
					//console.log(req.body);
					if(arrayutil.get(req.body,'_id')) {
						vr.updateData(arrayutil.get(req.body,'_id'),function(err,sd) {
								if(err) return res.status(500).json(err);
								res.status(200).json(sd);
						});
					} else {
						vr.save(function(err,products) { 
								if(err) {
										res.status(500).json(err);
								} else {
										res.status(200).json({message: 'Inserted Successfully',data : products});
								}
						});
					}
				},
				savevariantsetrule : function(req,res,next) {
						var vr = new variantset();
						vr.addData(req.body); 
						vr.saveRule(arrayutil.get(req.query,'id'),function(err,sr) {
								if(err) {
										res.status(500).json(err);
								} else {
										res.status(200).json({message: 'Inserted Successfully',data : sr});
								}
						})  
				},
				saveVariantSet : function(req,res,next) {
					var vr = new variantset();
					vr.addData(req.body);  
					//console.log(req.body);
					if(arrayutil.get(req.body,'_id')) {
						vr.updateData(arrayutil.get(req.body,'_id'),function(err,sd) {
								if(err) return res.status(500).json(err);
								res.status(200).json(sd);
						});
					} else {
						vr.save(function(err,products) { 
								if(err) {
										res.status(500).json(err);
								} else {
										res.status(200).json({message: 'Inserted Successfully',data : products});
								}
						});
					}
				},
				uploads : function(req,res,next) { 
						var temppath = arrayutil.get(req.query,'temppath','./uploads/variants/'); 

						var storage = multer.diskStorage({ 
								destination: function (req, file, cb) {
										cb(null, temppath)
								},
								filename: function (req, file, cb) {  
										var ext =  file.originalname.split('.').pop();
										cb(null, file.fieldname + '-' + Date.now()+'.'+ext)
								}
						});
						var upload = multer({storage : storage,fileFilter : function(req,file,cb) {
								var ext =  file.originalname.split('.').pop();
							 
								if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg' ) {
										cb(null,true);
										return;
								} 
								req.fileValidationError = 'Invalid file error';
								cb(null, false);
								return;
								
						} }).single('image'); 
						upload(req,res, function(err) { 
								if(err) { res.status(500).send(err); return; }
								if(req.fileValidationError) {
										res.send({ error: req.fileValidationError });
										return;
								} else {
										res.status(200).json({filedata : req.file});
								}
						});  
				},
				saveinterface : function(req,res,next) {
						
						var postdata = req.body;
						if(arrayutil.get(postdata,'settingtype') == 'productviews') {
								var title = textutil.url_title(arrayutil.get(postdata,'searchname'));
								var ints = new intf();
								ints.saveinterface(req.body,title,arrayutil.get(postdata,'userid'),function(err,sd){
										res.send(sd);
								}); 
						}
				},
				getinterfaceviews : function(req,res,next) { 
						var postdata = req.query; 
						var ints = new intf(); 

						ints.getInterface(function(err,sd) {
								if(!sd) {
										res.send({});
										return;
								}
								var d = arrayutil.get(arrayutil.get(sd,'productviews',{}),arrayutil.get(postdata,'userid'),{});
								res.send(d);
						}) 
				},
				getMenus : function(req,res,next) { 
						var menus = new MenuItem();  
						MenuItem.find({}).sort({'sorting':1}).exec(function(err,dat) { 
								res.send({menus : dat});
						})
				},

				deleteMenus : function(req,res,next) {
					if(!arrayutil.get(req.params,'id')) {
						 return res.status(500).json({message: "Invalid Menu ID"});
					} 

					MenuItem.findByIdAndRemove(arrayutil.get(req.params,'id'),function(err,obj) {
						if (err) {
							return res.status(500).json(err);
						};
						MenuItem.find({}).sort({'sorting':1}).exec(function(err,dat) { 
								res.status(200).json({message : "Menu has deleted",menus : dat});
						}) 
					});
					
				},
				deleteItem : function(req,res,next) {
					if(!arrayutil.get(req.params,'id')) {
						 return res.status(500).json({message: "Invalid Item ID"});
					}
					product.findByIdAndRemove(arrayutil.get(req.params,'id'),function(err,obj) {
						if (err) {
							return res.status(500).json(err);
						};
						MenuItem.find({is_foodie:true}).exec(function(err,dat) { 
								res.status(200).json({message : "Item has deleted",items : dat});
						}) 
					});
					
				},
				saveMenus : function(req,res) {  
						var menus = new MenuItem(); 
						if(arrayutil.get(req.body,'forsort')) {  
								var eless = 0;
										 arrayutil.get(req.body,'items').forEach(function(dg, g){
												MenuItem.findById(dg._id, function(error, catey) {
														var data = {};
														data.sorting = dg.sorting;
														catey.update(data, function(error, atey) { 
																eless++;
																if(eless >=  arrayutil.get(req.body,'items').length) {
																		 MenuItem.find({}).sort({'sorting':1}).exec(function(er,r) {
																				return res.status(200).json({message: 'Inserted Successfully',menus : r}); 
																		}) 
																}
														});

												});
												 
														 
												 
										 });
													 
										console.log(req.body);
								
						} else {
								if(arrayutil.get(req.body,'_id')) {
										MenuItem.findById(arrayutil.get(req.body,'_id'), function(error, catey) {
												// Handle the error using the Express error middleware
												if(error) return res.status(200).json(error);
												
												// Render not found error
												if(!catey) {
													return res.status(404).json({
														message: 'Menu with id ' + id + ' can not be found.'
													});
												} 
												var data = {};
												if(arrayutil.get(req.body,'status')) {
														data.status = arrayutil.get(req.body,'status') === 1 ? true : false;
														if(arrayutil.get(req.body,'sorting')) {
																data.sorting = arrayutil.get(req.body,'sorting')
														}

												} else {
														data.menuurl = textutil.url_title(arrayutil.get(arrayutil.get(req.body,'menu_name'),'en'));
														data.menu_name = { 'en' : arrayutil.get(arrayutil.get(req.body,'menu_name'),'en')};
												} 

												// Update the course model
												catey.update(data, function(error, catey) {
													if(error) return res.status(200).json(error);
														
														MenuItem.find({}).sort({'sorting':1}).exec(function(er,r) {
																return res.status(200).json({message: 'Inserted Successfully',menus : r}); 
														})
													 
												});
											});
								} else {
										menus.menuurl = textutil.url_title(arrayutil.get(arrayutil.get(req.body,'menu_name'),'en'));
										menus.menu_name['en'] = arrayutil.get(arrayutil.get(req.body,'menu_name'),'en'); 
										menus.save(function(err,category,numAffected) {
												if(err) {
													 res.status(500).json(err);
												} else {
														MenuItem.find({}).sort({'sorting':1}).exec(function(er,r) {
																res.status(200).json({message: 'Inserted Successfully',menus : r}); 
														})
												}
										}) 
								} 
						}
				},
				getItemsById : function() {
					 if(!arrayutil.get(req.params,'id')) {
								 return res.status(500).json({message: "Invalid Product ID"});
							}
						product.findOne({_id : arrayutil.get(req.params,'id'),is_foodie : true},function (err, vars) { 
									res.status(200).json(vars); 
						}); 
				},
				getItems : function(req,res,next) {  
						product.find({is_foodie : true}).populate('variantsetid').exec(function (err, vars) { 
								return res.status(200).json(vars); 
						}); 
				},
				setmenu : function(req,res,next){
						if(!arrayutil.get(req.params,'id')) {
								 return res.status(500).json({message: "Invalid Item ID"});
						}
						product.findOne({_id : arrayutil.get(req.params,'id'),is_foodie : true},function (err, vars) { 
								var menus = arrayutil.get(vars,'menus');
								var sf = menus.concat(req.body);
								var data = {};
								data.menus = req.body; 
								vars.update(data, function(error, catey) {
										if(error) return res.status(200).json(error);
										return res.status(200).json({message: 'Updated Successfully'});  
								});
						}); 
				},
				getCartOrders : function(req,res,next) {
					foodcart.find({orderplaced : false}).populate([{path: 'user',select : 'email name'},{path : 'reserved_for',select : 'email name'}]).exec(function (err, docs) { 
							return res.status(200).json(docs); 
					});
				},
				addHistory : function(req,res,next){ 
					var cart = new foodcart(); 
					cart.addHistory(arrayutil.get(req.body,'id'),arrayutil.get(req.body,'user'),arrayutil.get(req.body,'message'),function(err,doc) {
						 
						return res.status(200).json(doc); 
					})
				},
                getCartOrder : function(req,res,next) {
                    if(!arrayutil.get(req.params,'id')) {
                        return res.status(500).json({message: "Invalid Cart ID"});
                    }
                    foodcart.findOne({_id : arrayutil.get(req.params,'id'),orderplaced : false}).populate([{path: 'user',select : 'email name'},{path : 'reserved_for',select : 'email name'}]).exec(function (err, docs) { 
                            if(!docs._id) {
                                return res.status(500).json({message: "Invalid Cart ID"});
                            }
                            return res.status(200).json({message : "Loaded", cart: docs}); 
                    });
                },
                adduserdeliveryaddress : function(req,res,next) {
                	var u = new user();
                	if(!arrayutil.get(req.params,'id')) {
                        return res.status(500).json({message: "Invalid User ID"});
                    }
                    var data = {address  : arrayutil.get(req.body,'address'), delivery_area : arrayutil.get(req.body,'delivery_area'),delivery_instructions:arrayutil.get(req.body,'delivery_instructions'),nickname : arrayutil.get(req.body,'nickname')};
					user.findOneAndUpdate(
						    { "_id": arrayutil.get(req.params,'id')},
						    { 
						        "$push": {
						            "deliveries": data		            
						        }
						    },
						    {upsert: true},
						    function(err,doc) {
					    		user.findOne({_id : arrayutil.get(req.params,'id')}).exec(function(err,docs) {
					    			return res.status(200).json({message : "Loaded", user: docs,success : true});
					    		});
						    }
						);  
                },
				updatecart : function(req,res,next) {
					var socketio = req.app.get('socketio'); var cart = new foodcart();  
					if(!arrayutil.get(req.params,'id')) {
						return res.status(500).json({message: "Invalid Cart ID"});
					}
					/*if(!arrayutil.get(req.body,'user')) {
					 	return res.status(500).json({message: "Invalid User ID"});
					}*/
					foodcart.findOne({_id : arrayutil.get(req.params,'id')},function (err, vars) { 
						var data = {};
						if(!vars._id) {
							return res.status(500).json({message: "Invalid Cart ID"});
						}

						//Update for Reserved
						if(arrayutil.get(req.body,'reserved_for') && arrayutil.get(req.body,'change') == true) {
							data.reserved_for = arrayutil.get(req.body,'reserved_for');						
							if(!vars.reserved_for){
								foodcart.count({reserved_for : arrayutil.get(req.body,'reserved_for'),orderplaced : false}).exec(function(err,count) {
									if(count <= 0) { //Check if the user already assigned to any order

										vars.update(data, function(error, catey) {
											if(error) return res.status(200).json(error);
										foodcart.findOne({_id : arrayutil.get(req.params,'id')}).populate([{path: 'user',select : 'email name'},{path : 'reserved_for',select : 'email name'}]).exec(function (err, docs) {  

												//Update the history
												var historymsg = 'This orders is been handled by '+arrayutil.get(arrayutil.get(docs,'reserved_for'),'name');
												cart.addHistory(arrayutil.get(req.params,'id'),arrayutil.get(req.body,'reserved_for'),historymsg,function(err,historydoc) {
													socketio.sockets.emit('cart.orders', docs);
													return res.status(200).json({message: 'Modified Successfully',success : true, cart : docs});
												});
												 
											});
											
											 
										});
									} else {
										return res.status(200).json({message: 'Already this user taking an order',success : false});
									}
								})
								
							} else {
								return res.status(200).json({message: 'Already Reserved',success : false});
							}
						} else if(arrayutil.get(req.body,'cartadditionalsave') == true ) {
							data.additionalinfo = arrayutil.get(req.body,'additionalinfo');
							vars.update(data, function(error, catey) {
								if(error) return res.status(200).json(error);
								foodcart.findOne({_id : arrayutil.get(req.params,'id')}).populate([{path: 'user',select : 'email name'},{path : 'reserved_for',select : 'email name'}]).exec(function (err, docs) {
									socketio.sockets.emit('cart.orders', docs);
									return res.status(200).json({message: 'Modified Successfully',success : true, cart : docs});
								});
							});

						} else if(arrayutil.get(req.body,'cartpersonalsave') == true ) {
							data.personalinfo = arrayutil.get(req.body,'personalinfo');
							vars.update(data, function(error, catey) {
								if(error) return res.status(200).json(error);
								foodcart.findOne({_id : arrayutil.get(req.params,'id')}).populate([{path: 'user',select : 'email name'},{path : 'reserved_for',select : 'email name'}]).exec(function (err, docs) {
									socketio.sockets.emit('cart.orders', docs);
									return res.status(200).json({message: 'Modified Successfully',success : true, cart : docs});
								});
							});

						} else {
							return res.status(200).json({message: 'Nothing Updated',success : false});
						} 
					});  
					//return res.status(200).json({message: 'Not Updated'});
				},
				removecartitem : function(req,res,next) { 
					
					//res.status(200).json({message: "Invalid Cart ID"});
					if(!arrayutil.get(req.params,'cartid')) {
						return res.status(500).json({message: "Invalid Cart ID"});
					}
					if(!arrayutil.get(req.query,'itemid')) {
						return res.status(500).json({message: "Invalid Item ID"});
					}
					foodcart.findOne({_id : arrayutil.get(req.params,'cartid')},function (err, vars) {
						vars.items.pull(arrayutil.get(req.query,'itemid'));
						vars.save(function(err,doc) {
							if(err) {
								 res.status(500).json(err);
							} else {
								foodcart.findOne({_id : arrayutil.get(req.params,'cartid')}).sort({'sorting':1}).exec(function(err,r) {
										res.status(200).json({message: 'Deleted Successfully',cart : r}); 
								})
							}
						})
					});
				}

		 }
	}