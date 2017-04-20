(function() {
    'use strict';

    function Roles($http, $q,$window,$compile, Authentication, ArrayUtil) {
        return { 
            saveRole : function(data) {
                var deferred = $q.defer();
                $http.post('/api/settings/saverole',data,{headers : {'Authorization' : 'Bearer '+Authentication.getToken()}}).then(function(response) {
                    deferred.resolve(response);
                }, function(response) {
                    deferred.reject(response);
                });
                return deferred.promise;
            },
            getRoles : function() {
                var deferred = $q.defer();
                $http.get('/api/settings/getroles',{headers : {'Authorization' : 'Bearer '+Authentication.getToken()}}).then(function(response) {
                    deferred.resolve(response);
                }, function(response) {
                    deferred.reject(response);
                });
                return deferred.promise;
            }
        };
    }

    angular
        .module('mean.roles')
        .factory('Roles', Roles);

    
    Roles.$inject = ['$http', '$q','$window','$compile','Authentication','ArrayUtil'];


})();
