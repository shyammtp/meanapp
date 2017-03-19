(function() {
    'use strict';

    function shMenuSidebar() { 
        return {
            restrict : 'E',
            templateUrl : 'backend/views/page/sidebar/menus.html',
            link : function(scope,element,attrs) { 
                //angular.element('.sidebar .sub-menu').hide();
                 angular.element('.sidebar .accordion-menu > li.droplink > a',element).bind('click',function(){
                    alert('assad');
                 });
            }

        }
    }

    angular
        .module('mean.backend')
        .directive('shmenuSidebar', shMenuSidebar);
 

})();
