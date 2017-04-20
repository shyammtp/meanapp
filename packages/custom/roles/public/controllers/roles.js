(function() {
    'use strict';

    /* jshint -W098 */ 

    function PermissionRolesController($scope,$location,Roles) {
        var vm = this;
        $scope.permission = {};
        $scope.roles = [];
        $scope.editid = '';
        Roles.getRoles().then(function(res){
             $scope.roles = res.data.data;
        })
        $scope.saverole = function(permission) {
            var roleset = permission;
            Roles.saveRole(roleset).then(function(res){
                if(res.data.success) {
                    Materialize.toast('Stored successfully', 4000);
                    Roles.getRoles().then(function(res){
                         $scope.roles = res.data.data;
                    });
                    $scope.permission = {};
                    $scope.editid = '';
                }
            });
        }

        $scope.addcolor = function(color) {
            $scope.permission.role_color = color;
        }

        $scope.editrole = function(obj) {
             $scope.editid = obj._id;
            var permissionset = {};
            angular.forEach(obj.permissions, function(v,k){
                permissionset[k] = true;
            })
            $scope.permission = obj;
            $scope.permission.permissionset = permissionset;
        }
        $scope.canceleditrole = function() {
             $scope.permission = {};
            $scope.editid = '';
        }
    }

    angular
        .module('mean.roles')
        .controller('PermissionRolesController', PermissionRolesController);

    PermissionRolesController.$inject = ['$scope','$location','Roles'];

})();
