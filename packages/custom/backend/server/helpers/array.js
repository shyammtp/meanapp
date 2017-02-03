'use strict';

exports.get = function(object, key, deflt) {
	deflt || (deflt = '');
    if(object.hasOwnProperty(key)) {
    	return typeof object[key]!= 'undefined' ? object[key] : deflt;
    }
    return deflt;
}
 