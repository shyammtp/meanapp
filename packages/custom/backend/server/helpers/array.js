'use strict';

exports.get = function(obj, key, deflt) {
	deflt || (deflt = ''); 
    if(typeof obj[key] != 'undefined') {
    	return obj[key];
    }
    return deflt;
}
 