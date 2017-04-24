'use strict';

var backendpath = '../../../backend/server/';
var Mongoose = require('mongoose'), 
  //notificationtemplate = Mongoose.model('NotificationTemplate'), 
  tableplan = Mongoose.model('TablePlan'),
  //notification = require(backendpath+'helpers/notification'),
  config = require('meanio').getConfig(),
  nodemailer = require('nodemailer'),
  smtpTransport = require('nodemailer-smtp-transport'),
  path = require('path'),appsettings = require(backendpath+'helpers/util').appsettings,
  Nodecache = require( "node-cache" ),arrayutil = require(backendpath+'helpers/util').array;

  var transporter = nodemailer.createTransport(smtpTransport(config.mailer));

  module.exports = function (Tablebook, app) {
  	 return { 
        savedesign : function(req,res,next) {  
            var tabpl = new tableplan();
            var rid = arrayutil.get(req.headers,'_rid');
            if(!appsettings.validateResId(req)) {
                return res.status(500).json({message : 'Invalid Restaurant ID',success : false});
            }
            req.body.restaurant_id = rid;
          tabpl.addData(req.body);
          if(arrayutil.get(req.body,'_id')) {
            tabpl.updateData(arrayutil.get(req.body,'_id'),function(err,doc) {
                res.status(200).json({message: 'Updated Successfully',data : doc,success : true}); 
            })
          } else {
              tabpl.save(function(err,doc) {
                if(err) {
                  res.status(500).json({message : err,success : false});
                } else { 
                  res.status(200).json({message: 'Inserted Successfully',data : doc,success : true});
                }
              })
          }
        },savefloor : function(req,res,next) {  
            var tabpl = new tableplan();
            var rid = arrayutil.get(req.headers,'_rid');
            if(!appsettings.validateResId(req)) {
                return res.status(500).json({message : 'Invalid Restaurant ID',success : false});
            }
            req.body.restaurant_id = rid;
          tabpl.addData(req.body);
          if(arrayutil.get(req.body,'_id')) { 
            tabpl.updateData(arrayutil.get(req.body,'_id'),function(err,doc) {
                return res.status(200).json({message: 'Updated Successfully',data : doc,success : true}); 
            })
          } else {
              tabpl.save(function(err,doc) {
                if(err) {
                  res.status(500).json({message : err,success : false});
                } else { 
                  res.status(200).json({message: 'Inserted Successfully',data : doc,success : true});
                }
              })
          }
        },
        getplans : function(req,res,next) {
            var rid = arrayutil.get(req.headers,'_rid'); 
            if(!appsettings.validateResId(req)) {
                return res.status(500).json({message : 'Invalid Restaurant ID',success : false});
            }

          tableplan.find({restaurant_id : rid}).exec(function(err,doc) {
            res.send({message : 'loaded',data : doc});
          })
        },
        getplanbyid : function(req,res,next) {
            var rid = arrayutil.get(req.headers,'_rid'); 
            if(!appsettings.validateResId(req)) {
                return res.status(500).json({message : 'Invalid Restaurant ID',success : false});
            }
            if(!arrayutil.get(req.params,'id')) {
                     return res.status(500).json({message: "Invalid Plan ID",success : false});
            }
          tableplan.findOne({_id : arrayutil.get(req.params,'id'),restaurant_id : rid}).exec(function(err,doc) {
            res.send({message : 'loaded',data : doc});
          })
        } 

  	 }
  }