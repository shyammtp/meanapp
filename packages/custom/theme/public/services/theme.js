(function() {
    'use strict';

    function Theme($http, $q) {
        return {
            name: 'theme',
            checkCircle: function(circle) {
                var deferred = $q.defer();

                $http.get('/api/theme/example/' + circle).success(function(response) {
                    deferred.resolve(response);
                }).error(function(response) {
                    deferred.reject(response);
                });
                return deferred.promise;

            }
        };
    }

    angular
        .module('mean.theme')
        .factory('Theme', Theme);

    Theme.$inject = ['$http', '$q'];

})();
