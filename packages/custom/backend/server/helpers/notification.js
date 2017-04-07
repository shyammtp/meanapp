'use strict';
var 
  config = require('meanio').getConfig(),
  nodemailer = require('nodemailer'),
  mongoose = require('mongoose'),
  template = mongoose.model('NotificationTemplate'),
  smtpTransport = require('nodemailer-smtp-transport');

function notification() {
	this.to = '';
	this.from = '';
	this.subject = '';
	this.variables = {};
	this.message = '';
	this.html = true;
	return {
		setTo : function(to) {
			this.to = to;
			return this;
		},
		setFrom : function(from) {
			this.from = from;
			return this;
		},
		setSubject : function(subject) {
			this.subject = subject;
			return this;
		},
		getTo : function() {
			return this.to;
		},
		getFrom : function() {
			return this.from;
		},
		setIsHtml : function(ishtm) {
			this.html = ishtm;
			return this;
		},
		isHtml : function() {
			return this.html;
		},
		getSubject : function() {
			return this.parseString(this.subject,this.getVariables());
		},
		setVariables : function(vari) {
			this.variables = vari;
			return this;
		},
		getVariables : function() {
			return this.variables;
		},setMessage : function(message) {
			this.message = message;
			return this;
		},
		getMessage : function() {
			return this.parseString(this.message,this.getVariables());
		},
		sendEmail : function() { 
  			var transporter = nodemailer.createTransport(smtpTransport(config.mailer));
  			var _obj = this;
			transporter.verify(function(error,success){
                if(error) {
                    console.log(error);
                } else {
                    //Success
                    var opts = {};
                    opts.from = _obj.getFrom();
                    opts.to = _obj.getTo();
                    opts.subject = _obj.getSubject();                    
                    if(_obj.isHtml()) {
                    	opts.html = _obj.getMessage();
                    } else {
                    	opts.text = _obj.getMessage();
                    }
                    transporter.sendMail(opts);
                }
            });
		},
		parseString : function(string, variables) {
			var str = string,
			re = /\{(.*?)\}/g; 		
			var matches = str.match(re); 
			if(!matches) {
				return string;
			}
			var datas = {};
			matches.forEach(function(value) {
				var g = value.slice(1, -1);
				if(g in variables) { 
					datas[value] = variables[g];
				}
			}); 
			var mapObj = datas; 
			var re = new RegExp(Object.keys(mapObj).join("|"),"gi");
			str = str.replace(re, function(matched){
			  return mapObj[matched];
			});
			console.log(str);
			return str;
		}
	}
}
exports.sendNotification = function(index,datas) {
	template.findOne({index : index},function(err,doc) {
		var notif = new notification();
		if(datas.to) { 
			notif.setTo(datas.to);
		}  
		notif.setFrom(doc.from_email);
		if(datas.from) {
			notif.setFrom(datas.from);
		}  

		
		if(datas.variables) {
			notif.setVariables(datas.variables);
		} 


		if(doc.sms === true) {
			//Send SMS
			//notif.sendSMS();
		}

		if(doc.email === true) {
			//Send Email
			notif.setIsHtml(true);
			notif.setSubject(doc.subject);
			if(datas.subject) {
				notif.setFrom(datas.subject);
			}

			notif.setMessage(doc.email_message);
			if(datas.email_message) {
				notif.setFrom(datas.email_message);
			}
			notif.sendEmail();
		}
	});	
}
 