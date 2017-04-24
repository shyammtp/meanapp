(function() {
    'use strict';

    function Tablebook($http, $q,$window,$compile, Authentication, ArrayUtil) {
        return {
            savePlan : function(data) {
                var deferred = $q.defer();
                $http.post('/api/tables/saveplan',data,{headers : {'Authorization' : 'Bearer '+Authentication.getToken(),'_rid' : Authentication.getRestaurantId()}}).then(function(response) {
                    deferred.resolve(response);
                }, function(response) {
                    deferred.reject(response);
                });
                return deferred.promise;
            },
            savefloor : function(data) {
                var deferred = $q.defer();
                $http.post('/api/tables/savefloor',data,{headers : {'Authorization' : 'Bearer '+Authentication.getToken(),'_rid' : Authentication.getRestaurantId()}}).then(function(response) {
                    deferred.resolve(response);
                }, function(response) {
                    deferred.reject(response);
                });
                return deferred.promise;
            },
            getPlans : function() {
                var deferred = $q.defer();
                $http.get('/api/tables/getplans',{headers : {'Authorization' : 'Bearer '+Authentication.getToken(),'_rid' : Authentication.getRestaurantId()}}).then(function(response) {
                    deferred.resolve(response);
                }, function(response) {
                    deferred.reject(response);
                });
                return deferred.promise;
            }
        };
    }

    angular
        .module('mean.tablebook')
        .factory('Tablebook', Tablebook);

    Tablebook.$inject = ['$http', '$q','$window','$compile','Authentication','ArrayUtil'];

})();
