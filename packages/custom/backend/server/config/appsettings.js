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
 