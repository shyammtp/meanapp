'use strict';

var backendpath = '../../../backend/server/';
var Mongoose = require('mongoose'), 
  notificationtemplate = Mongoose.model('NotificationTemplate'), 
  roles = Mongoose.model('Roles'),
  notification = require(backendpath+'helpers/notification'),
  config = require('meanio').getConfig(),
  nodemailer = require('nodemailer'),
  smtpTransport = require('nodemailer-smtp-transport'),
  path = require('path'),appsettings = require(backendpath+'helpers/util').appsettings,
  Nodecache = require( "node-cache" ),arrayutil = require(backendpath+'helpers/util').array;

  var transporter = nodemailer.createTransport(smtpTransport(config.mailer));

  module.exports = function (Backend, app) {
  	 return { 
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
        } 

  	 }
  }