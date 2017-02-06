'use strict';

var Mongoose = require('mongoose'),
  AdminUser = Mongoose.model('AdminUser'),category = Mongoose.model('Category'),
  arrayutil = require('../helpers/util').array,
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
                        cat.save(function(err,category,numAffected) {
                            if(err) {
                                res.status(500).json(err);
                            } else {
                                res.status(200).json({message: 'Inserted Successfully'});
                            }
                        }) 
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
                            message: 'Course with id ' + id + ' can not be found.'
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
          
        }

  	 }
  }