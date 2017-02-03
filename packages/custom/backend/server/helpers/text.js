'use strict';

exports.url_title = function(text) {
	return text
        .toLowerCase()
        .replace(/ /g,'-')
        .replace(/[^\w-]+/g,''); 
}
 