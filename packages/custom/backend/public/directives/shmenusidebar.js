(function() {
    'use strict';

    function shMenuSidebar() { 
        return {
            restrict : 'E',
            templateUrl : 'backend/views/page/sidebar/menus.html',
            link : function(scope,element,attrs) { 
                scope.name = 'shyam';
            }

        }
    }

    angular
        .module('mean.backend')
        .directive('shmenuSidebar', shMenuSidebar);
 

})();
