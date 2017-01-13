(function() {
    'use strict';

    /* jshint -W098 */

    function BackendController($scope, Global, Backend, $stateParams) {
        $scope.global = Global;
        $scope.package = {
            name: 'backend'
        }; 
        Backend.getAssetsData().then(function(res) {
            console.log(res);
            $scope.assetspath = res.path;
            $scope.theme = res.theme; 
        }); 
        
        $scope.checkCircle = function() {
            Backend.checkCircle($stateParams.circle).then(function(response) {
                $scope.res = response;
                $scope.resStatus = 'info';
            }, function(error) {
                $scope.res = error;
                $scope.resStatus = 'danger';
            });
        };
    }

    angular
        .module('mean.backend')
        .controller('BackendController', BackendController);

    BackendController.$inject = ['$scope', 'Global', 'Backend', '$stateParams'];

})();
