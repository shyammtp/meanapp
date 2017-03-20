'use strict';

var Mongoose = require('mongoose'),
  Settings = Mongoose.model('Settings'),
  Directory = Mongoose.model('directory'),
  path = require('path'),
  Nodecache = require( "node-cache" ),
  myCache = new Nodecache(),
  formidable = require('formidable');

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
            for(var jg in params) {
                Settings.addSettings(jg,params[jg],1,function(cb) {

                });
            }
            res.send({message: "Saved"});
  	 	}, 
      getSetting : function(req,res) {
        var params = req.body;
        Settings.getConfig(params.name,function(cb) {
          res.send(cb);
        });
      },

      getallsettings : function(req,res) {  
        Settings.getAllConfig(req.param('place_id'),function(err,cb) {
           res.send(cb);
        });
      },
       getpaginate : function(req,res) {  
        Settings.getAllConfigPaginate(req.param('place_id'),req.param('page'),function(err,cb) {
           res.send(cb);
        });
      },
      getAllCountries : function(req,res) {
        myCache.get("directories",function(err,value) {
            if(!err) {
                if(value != undefined) { 
                    res.send(value);
                } else {
                    Directory.find({},null,{sort : {country_name : 1}},function(err,cb) { 
                        myCache.set('directories',JSON.parse(JSON.stringify(cb)),10000);
                       res.send(JSON.parse(JSON.stringify(cb)));
                    });
                }
            }
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