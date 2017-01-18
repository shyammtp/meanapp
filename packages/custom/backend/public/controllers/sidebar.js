(function() {
    'use strict';

    /* jshint -W098 */

    function SidebarController($scope, Global, Backend, $stateParams) {
        $scope.global = Global;
        
        
        Backend.getMenus().then(function(response) { 
            $scope.datas = response.data;    
        }); 
        $scope.objectLength = function(obj) {
            return Object.keys(obj).length;
        } 
    }

    angular
        .module('mean.backend')
        .controller('SidebarController', SidebarController);

    SidebarController.$inject = ['$scope', 'Global', 'Backend', '$stateParams'];

})();
