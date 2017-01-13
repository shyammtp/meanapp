(function() {
    'use strict';

    function wDirective() { 
        return {
            restrict : 'A',
            templateUrl : 'backend/views/test.html'
        }
    }

    angular
        .module('mean.backend')
        .directive('wDirective', wDirective);
 

})();
