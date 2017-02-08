(function() {
    'use strict';
 
    function Product($http, $q,$window, Authentication,ArrayUtil) { 
        this.categoryset = {},this.categorytreeset = {},this.catalogattributedata = {};       
        var getCategories = function() {
            var deferred = $q.defer();
            $http.get('/api/category/getall',{headers : {'Authorization' : 'Bearer '+Authentication.getToken()}}).then(function(response) {
                deferred.resolve(response);
            }, function(response) {
                deferred.reject(response);
            });
            return deferred.promise;
        },
        getCategoryTree = function() {
            var deferred = $q.defer();
            $http.get('/api/category/getcattree',{cache : true,headers : {'Authorization' : 'Bearer '+Authentication.getToken()}}).then(function(response) {
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
        },setCategory = function(cat) {
            this.categoryset = cat; 
            return this;
        },
        setCategoryTreeSet = function(categorytreeset) {
            this.categorytreeset = categorytreeset; 
            return this;
        },
        setCatalogAttributeData = function(data) {
            this.catalogattributedata = data;
            return this;
        },
        getCategoryForAdd = function() {
            return this.categoryset;
        },
        getCatalogAttributeData = function() {
            return this.catalogattributedata;
        },
        getCategoryTreeSetForAdd = function() {
            return this.categorytreeset;
        },
        saveCategoryAttribute = function(params) {
            var deferred = $q.defer(); 
            params.attributes = this.getCatalogAttributeData();
            $http.put('/api/category/attributesave/'+ArrayUtil.get(params,'category_id'),params,{ headers : {'Authorization' : 'Bearer '+Authentication.getToken()}}).then(function(response) {
                deferred.resolve(response);
            }, function(response) {
                deferred.reject(response);
            });
            return deferred.promise;
        }
        return {    
            getCategories : getCategories,
            saveCategory : saveCategory,
            deleteCategory : deleteCategory,
            getCategoryTree : getCategoryTree,
            setCategory : setCategory,
            getCategoryForAdd : getCategoryForAdd,
            setCategoryTreeSet : setCategoryTreeSet,
            getCategoryTreeSetForAdd : getCategoryTreeSetForAdd,
            setCatalogAttributeData : setCatalogAttributeData,
            getCatalogAttributeData : getCatalogAttributeData,
            saveCategoryAttribute : saveCategoryAttribute
        }
    }
 

    angular
        .module('mean.backend') 
        .factory('Product',Product);
 
    Product.$inject = ['$http', '$q','$window','Authentication','ArrayUtil'];

})();
