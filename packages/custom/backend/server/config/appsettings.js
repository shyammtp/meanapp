'use strict';

exports.settings = function(settings,name) {
	var st = settings;
	for(var k in st) {
		var s = st[k];
		if(s.name === name) {
			return s.value;
		}
	}
	return '';
}

exports.validateResId = function(saveid) {
	if(typeof saveid.headers._rid === 'undefined') {
		return false;
	}
	var incomeid = saveid.headers._rid;
	if(typeof saveid.payload === 'undefined') {
		return false;
	}
	console.log('Payload',saveid.payload);
	if(typeof saveid.payload.restaurant_id === 'undefined' || !saveid.payload.restaurant_id) {
		return false;
	} 

	if(incomeid === saveid.payload.restaurant_id) { 
		return incomeid;
	}
	return false;
}