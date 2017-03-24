(function() {
    'use strict';

    function shMenuSidebar($timeout) { 
        return {
            restrict : 'E',
            templateUrl : 'backend/views/page/sidebar/menus.html',
            link : function(scope,element,attrs) { 
                //angular.element('.sidebar .sub-menu').hide();
                
            }

        }
    }

    angular
        .module('mean.backend')
        .directive('shmenuSidebar', shMenuSidebar);
    
        shMenuSidebar.$inject = ['$timeout'];
})();
