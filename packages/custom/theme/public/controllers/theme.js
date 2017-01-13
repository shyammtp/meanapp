(function() {
    'use strict';

    /* jshint -W098 */

    function ThemeController($scope, Global, Theme, $stateParams) {
        $scope.global = Global;
        $scope.package = {
            name: 'theme'
        };

        $scope.checkCircle = function() {
            Theme.checkCircle($stateParams.circle).then(function(response) {
                $scope.res = response;
                $scope.resStatus = 'info';
            }, function(error) {
                $scope.res = error;
                $scope.resStatus = 'danger';
            });
        };
    }

    angular
        .module('mean.theme')
        .controller('ThemeController', ThemeController);

    ThemeController.$inject = ['$scope', 'Global', 'Theme', '$stateParams'];

})();
