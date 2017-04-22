(function() {
    'use strict';

    /* jshint -W098 */

    function TablebookController($scope, Global, Tablebook, $stateParams) {

        $scope.createelement = function(img) {
        	$scope.$broadcast('createelement',img);
        }
    }

    angular
        .module('mean.tablebook')
        .controller('TablebookController', TablebookController);

    TablebookController.$inject = ['$scope', 'Global', 'Tablebook', '$stateParams'];

})();
