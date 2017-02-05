(function() {
    'use strict';
 
    function Product($http, $q,$window, Authentication,ArrayUtil) {        
        var getCategories = function() {
            var deferred = $q.defer();
            $http.get('/api/category/getall').then(function(response) {
                deferred.resolve(response);
            }, function(response) {
                deferred.reject(response);
            });
            return deferred.promise;
        },
        saveCategory = function(params) {
            var deferred = $q.defer();
            $http.post('/api/category/save?parent='+ArrayUtil.get(params,'parent'),params,{ headers : {'Authorization' : 'Bearer '+Authentication.getToken()}}).then(function(response) {
                deferred.resolve(response);
            }, function(response) {
                deferred.reject(response);
            });
            return deferred.promise;
        },
        deleteCategory = function(params) {
            var deferred = $q.defer(); 
            $http.delete('/api/category/delete/'+ArrayUtil.get(params,'id'),{ headers : {'Authorization' : 'Bearer '+Authentication.getToken()}}).then(function(response) {
                deferred.resolve(response);
            }, function(response) {
                deferred.reject(response);
            });
            return deferred.promise;
        }
        return {    
            getCategories : getCategories,
            saveCategory : saveCategory,
            deleteCategory : deleteCategory
        }
    }
 

    angular
        .module('mean.backend') 
        .factory('Product',Product);
 
    Product.$inject = ['$http', '$q','$window','Authentication','ArrayUtil'];

})();
