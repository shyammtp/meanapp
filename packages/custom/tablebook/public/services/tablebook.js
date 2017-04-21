(function() {
    'use strict';

    function Tablebook($http, $q) {
        return {
            name: 'tablebook',
            checkCircle: function(circle) {
                var deferred = $q.defer();

                $http.get('/api/tablebook/example/' + circle).success(function(response) {
                    deferred.resolve(response);
                }).error(function(response) {
                    deferred.reject(response);
                });
                return deferred.promise;

            }
        };
    }

    angular
        .module('mean.tablebook')
        .factory('Tablebook', Tablebook);

    Tablebook.$inject = ['$http', '$q'];

})();
