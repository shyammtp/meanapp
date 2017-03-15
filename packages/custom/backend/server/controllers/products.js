'use strict';

var Mongoose = require('mongoose'),
  AdminUser = Mongoose.model('AdminUser'),category = Mongoose.model('Category'),product = Mongoose.model('Product'),variants = Mongoose.model('Variants'),variantset = Mongoose.model('Variantset'),
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
        getVariantsAll : function(req,res,next) {
            variants.find({},function (err, vars) { 
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
          console.log(req.body);
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
        cataloglistvariantrulesset : function(req,res,next) {
            variantset.getAllRules(req.query,function(err,cb) { 
               res.send({'docs' : arrayutil.get(cb,'rules',{}),'total' : 0 });
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
        upload : function(req,res,next) { 
            var storage = multer.diskStorage({ 
                destination: function (req, file, cb) {
                    cb(null, './uploads/variants/')
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
                if(err) res.status(200).send(err);
                if(req.fileValidationError) {
                    res.send({ error: req.fileValidationError });
                    return;
                }
                res.status(200).json({filedata : req.file});
            });            
        }

  	 }
  }