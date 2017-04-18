'use strict';

var Mongoose = require('mongoose'),
  Settings = Mongoose.model('Settings'),
  notificationtemplate = Mongoose.model('NotificationTemplate'),
  users = Mongoose.model('Customer'),
  Directory = Mongoose.model('directory'),
  roles = Mongoose.model('Roles'),
  notification = require('../helpers/notification'),
  config = require('meanio').getConfig(),
  nodemailer = require('nodemailer'),
  smtpTransport = require('nodemailer-smtp-transport'),
  path = require('path'),appsettings = require('../helpers/util').appsettings,
  Nodecache = require( "node-cache" ),arrayutil = require('../helpers/util').array,
  myCache = new Nodecache(),

  formidable = require('formidable');

  var transporter = nodemailer.createTransport(smtpTransport(config.mailer));

  module.exports = function (Backend, app) {
  	 return {
      savesettings : function(req,res) { 
        var params = req.body;
        Settings.addSettings(params.name,params.value,params.place_id,function(cb) {
          res.send(cb);
        });
      }, 
  	 	saveAllsettings : function(req,res) { 
            var params = req.body;
            var s = 1;
            for(var jg in params) {
                Settings.addSettings(jg,params[jg],'1',function(err,cb) { 
                  if(Object.keys(params).length === s) { 
                        Settings.find({}).exec(function(err,doc) {
                          return res.status(200).json({data : doc});
                        });   
                  } 
                  s++;
                });
            }
  	 	}, 
      getSetting : function(req,res) {
        var params = req.body;
        Settings.getConfig(params.name,function(cb) {
          res.send(cb);
        });
      },
      getappsettings : function(req,res,next) {
        if(typeof req.app.locals.appsettings === 'undefined') { 
          Settings.find({}).exec(function(err,doc) {
            req.app.locals.appsettings = doc;
            console.log('coming');
            next();
          })
        } else {
          next();
        }
      },

      getallsettings : function(req,res) { 
   
        Settings.getAllConfig(arrayutil.get(req.query,'place_id'),function(err,cb) {
           res.send(cb);
        });
      },
       getpaginate : function(req,res) {  
        Settings.getAllConfigPaginate(arrayutil.get(req.query,'place_id'),arrayutil.get(req.query,'page'),function(err,cb) {
           res.send(cb);
        });
      },
      getcountry : function(req,res) {
        Directory.getAllPaginate(req.query,function(err,cb) {
               res.send(cb);
        });
      },  
      getAllCountries : function(req,res) {
        myCache.get("directories",function(err,value) {
            if(!err) {
                if(value != undefined) { 
                    res.send(value);
                } else {
                    Directory.find({ level : 1},null,{sort : {name : 1}},function(err,cb) { 
                        myCache.set('directories',JSON.parse(JSON.stringify(cb)),10000);
                       res.send(JSON.parse(JSON.stringify(cb)));
                    });
                }
            }
        }); 
      },

      saveuser : function(req,res,next){
                notification.sendNotification('WELCOME_USERS',{'to' : req.body.email,variables : {'name' : 'Pradeep shyam','assetsurl' : 'http://localhost:3000/'}});
                res.status(200).json({message: 'Updated Successfully',success : true});  
                return;
            if(arrayutil.get(req.body,'_id')) {
                users.findOne({_id : arrayutil.get(req.body,'_id')},function (err, vars) { 
                        var data = req.body;  
                        vars.update(data, function(error, catey) {
                                if(error) return res.status(200).json(error);
                                return res.status(200).json({message: 'Updated Successfully',success : true});  
                        });
                });

            } else {
                
                var us = new users(); 
                us.name =  req.body.name;
                if(arrayutil.get(req.body,'email')) {
                    us.email =  req.body.email;
                }
                if(arrayutil.get(req.body,'phone')) {
                    us.phone =  req.body.phone;
                }
                users.findOne({email : arrayutil.get(req.body,'email')},function (err, vars) {
                    if(vars._id) {
                        return res.status(500).json({message: 'Email already exists',success : false})
                    }
                    us.save(function(err,products) { 
                        if(err) {
                                res.status(500).json({message : err,success : false});
                        } else {
                                notification.sendNotification('WELCOME_USERS',{'to' : req.body.email});
                                res.status(200).json({message: 'Inserted Successfully',data : products,success : true});
                        }
                    });
                });
                //us.setPassword(req.body.password);
                
            }
             
        },

        saverole : function(req,res,next) {  
            var rol = new roles();
          rol.addData(req.body);
          if(arrayutil.get(req.body,'_id')) {
            rol.updateData(arrayutil.get(req.body,'_id'),function(err,doc) {
                res.status(200).json({message: 'Updated Successfully',data : doc,success : true}); 
            })
          } else {
              rol.save(function(err,doc) {
                if(err) {
                  res.status(500).json({message : err,success : false});
                } else { 
                  res.status(200).json({message: 'Inserted Successfully',data : doc,success : true});
                }
              })
          }
        },
        getroles : function(req,res,next) {

          roles.find({}).exec(function(err,doc) {
            res.send({message : 'loaded',data : doc});
          })
        },
        getrolebyid : function(req,res,next) {
            if(!arrayutil.get(req.params,'id')) {
                     return res.status(500).json({message: "Invalid Role ID",success : false});
            }
          roles.findOne({_id : arrayutil.get(req.params,'id')}).exec(function(err,doc) {
            res.send({message : 'loaded',data : doc});
          })
        },
      saveNotificationTemplate : function(req,res,next){
            if(!arrayutil.get(req.params,'id')) {
                     return res.status(500).json({message: "Invalid Template ID",success : false});
            }
            notificationtemplate.findOne({_id : arrayutil.get(req.params,'id')},function (err, vars) { 
                    var data = req.body;  
                    vars.update(data, function(error, catey) {
                            if(error) return res.status(200).json(error);
                            return res.status(200).json({message: 'Updated Successfully',success : true});  
                    });
            }); 
        },
        getusers : function(req,res,next) {
            
            users.getAllPaginate(req.query,function(err,cb) { 
                 res.send(cb);
            });
        },
        saveDirectory : function(req,res,next) {
            var cat = new Directory();
            if(arrayutil.get(req.query,'parent')) {            
                var query = Directory.where({_id : req.query['parent']});
                query.findOne(function(err,cate) {
                    if(cate) {
                        cat.parent_id = cate._id;
                        console.log(cate.tree_path);
                        cat.level = cate.level+1;
                        if(arrayutil.get(req.body,'zonebox')) {
                            cat.zonebox = arrayutil.get(req.body,'zonebox',{});
                        }
                        if(cate.tree_path.length > 0) {
                            cat.tree_path = cate.tree_path.concat([cate._id]);
                            if(cat.linkedpath == undefined) {
                                cat.linkedpath = {};
                            }
                            cat.linkedpath[cate.level] = cate._id; 
                            cat.address_value = cate.name+','+cate.address_value;
                        } else {
                            cat.tree_path.push(cate._id);
                            cat.linkedpath[cate.level] = cate._id;
                            cat.address_value = cate.name;
                        } 
                        cat.name = arrayutil.get(req.body,'directory_name'); 
                        cat.sorting = arrayutil.get(req.body,'sorting',1); 
                        console.log('DirectorySave',cat);
                        //cat.attributes = attrdefaults;               
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
                if(arrayutil.get(req.body,'directory_id')) {
                    Directory.findById(arrayutil.get(req.body,'directory_id'), function(error, catey) {
                        // Handle the error using the Express error middleware
                        if(error) return res.status(200).json(error);
                        
                        // Render not found error
                        if(!catey) {
                          return res.status(404).json({
                            message: 'Directory with id ' + id + ' can not be found.'
                          });
                        }
                        var data = {}; 
                        data.name = arrayutil.get(req.body,'directory_name');
                        data.sorting = arrayutil.get(req.body,'sorting',1);
                        data.zonebox = arrayutil.get(req.body,'zonebox',{});

                        // Update the course model
                        catey.update(data, function(error, catey) {
                          if(error) return res.status(200).json(error);
                            
                          return res.json(catey);
                           
                        });
                      });
                } else { 
                    cat.name = arrayutil.get(req.body,'directory_name');
                    cat.sorting = arrayutil.get(req.body,'sorting',1); 
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
        deleteDirectory : function(req,res,next) {
            if(!arrayutil.get(req.params,'id')) {
                 return res.status(500).json({message: "Invalid Directory ID"});
            }
            Directory.CheckChildren(arrayutil.get(req.params,'id'),function(err,count) {
                if(count <= 0) {
                    Directory.findByIdAndRemove(arrayutil.get(req.params,'id'),function(err,obj) {
                        if (err) {
                            return res.status(500).json(err);
                        };
                        res.status(200).json({message : "Directory has deleted"});
                    });
                } else {
                    res.status(500).json({message: "Directory has children"});
                }  
            })
        }, 
        getDirectories : function(req,res,next) {
          var filter = {};
          if(arrayutil.get(req.query,'level')) {
            filter.level = arrayutil.get(req.query,'level');
          }
          if(arrayutil.get(req.query,'treepath')) {
            filter.tree_path = { $in : arrayutil.get(req.query,'treepath')};
          }
          Directory.find(filter).exec(function(err,doc) {
            res.status(200).json({directory : doc, message : "got the result"});
          });
        },
      upload : function(req,res) {
        var form = new formidable.IncomingForm();
        // specify that we want to allow the user to upload multiple files in a single request
        form.multiples = true;

        // store all uploads in the /uploads directory
        form.uploadDir = path.join(__dirname, '/uploads');

        // every time a file has been uploaded successfully,
        // rename it to it's orignal name
        form.on('file', function(field, file) {
          fs.rename(file.path, path.join(form.uploadDir, file.name));
        });

        // log any errors that occur
        form.on('error', function(err) {
          console.log('An error has occured: \n' + err);
        });

        // once all the files have been uploaded, send a response to the client
        form.on('end', function() {
          res.end('success');
        });

        // parse the incoming request containing the form data
        form.parse(req);
        console.log(form);
      }

  	 }
  }