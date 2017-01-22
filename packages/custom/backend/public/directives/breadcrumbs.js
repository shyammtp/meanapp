(function() {
    'use strict';

    function breadcrumbs() { 
        return { 
            templateUrl : 'backend/views/page/breadcrumbs.html',
            link : function(scope,element,attrs) { 
                //angular.element('.sidebar .sub-menu').hide();
            }

        }
    }

    angular
        .module('mean.backend')
        .directive('breadcrumbs', breadcrumbs);
 

})();
