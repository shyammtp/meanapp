(function() {
    'use strict';

    function Backend($http, $q) {
        return {
            name: 'backend',
            checkCircle: function(circle) {
                var deferred = $q.defer();

                $http.get('/api/backend/example/' + circle).success(function(response) {
                    deferred.resolve(response);
                }).error(function(response) {
                    deferred.reject(response);
                });
                return deferred.promise;

            }
        };
    }

    angular
        .module('mean.backend')
        .factory('Backend', Backend);

    Backend.$inject = ['$http', '$q'];

})();
