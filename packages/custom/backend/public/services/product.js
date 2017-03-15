(function() {
    'use strict';
 
    function Product($http, $q,$window, Authentication,ArrayUtil) { 
        this.categoryset = {},this.categorytreeset = {},this.catalogattributedata = {},this.parentcategorycopy = {},this.productData = {};  
         
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
        saveProduct = function() {
            var deferred = $q.defer(), params = this.getProductData();
            $http.post('/api/product/save',params,{ headers : {'Authorization' : 'Bearer '+Authentication.getToken()}}).then(function(response) {
                deferred.resolve(response);
            }, function(response) {
                deferred.reject(response);
            });
            return deferred.promise;
        },
        saveVariant = function(data) { 
            var deferred = $q.defer(), params = data;
            $http.post('/api/variant/save',params,{ headers : {'Authorization' : 'Bearer '+Authentication.getToken()}}).then(function(response) {
                deferred.resolve(response);
            }, function(response) {
                deferred.reject(response);
            });
            return deferred.promise;
        }, saveVariantSet = function(data) {
            var deferred = $q.defer(), params = data;
            $http.post('/api/variantset/save',params,{ headers : {'Authorization' : 'Bearer '+Authentication.getToken()}}).then(function(response) {
                deferred.resolve(response);
            }, function(response) {
                deferred.reject(response);
            });
            return deferred.promise; 
        }, getVariantById = function(params) {
            var deferred = $q.defer();
            $http.get('/api/variant/get/'+ArrayUtil.get(params,'id'),{headers : {'Authorization' : 'Bearer '+Authentication.getToken()}}).then(function(response) {
                deferred.resolve(response);
            }, function(response) {
                deferred.reject(response);
            });
            return deferred.promise; 
        },getVariantsetById = function(params) {
            var deferred = $q.defer();
            $http.get('/api/variantset/get/'+ArrayUtil.get(params,'id'),{headers : {'Authorization' : 'Bearer '+Authentication.getToken()}}).then(function(response) {
                deferred.resolve(response);
            }, function(response) {
                deferred.reject(response);
            });
            return deferred.promise;
        },
        getVariantRuleByIndex = function(params) {
            var deferred = $q.defer();
            $http.get('/api/variantset/rule/get/'+ArrayUtil.get(params,'id')+'?index='+ArrayUtil.get(params,'index'),{headers : {'Authorization' : 'Bearer '+Authentication.getToken()}}).then(function(response) {
                deferred.resolve(response);
            }, function(response) {
                deferred.reject(response);
            });
            return deferred.promise;
        },
        saveVariantRule = function(id, params) {
            var deferred = $q.defer();
            $http.post('/api/catalog/savevariantsetrule?id='+id,params,{ headers : {'Authorization' : 'Bearer '+Authentication.getToken()}}).then(function(response) {
                deferred.resolve(response);
            }, function(response) {
                deferred.reject(response);
            });
            return deferred.promise;
        },
        getAllVariants = function() {
            var deferred = $q.defer();
            $http.get('/api/variants/getall',{cache : true,headers : {'Authorization' : 'Bearer '+Authentication.getToken()}}).then(function(response) {
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
        },
        addProductData = function(data) {
            this.productData = angular.extend({}, this.productData, data);
            return this;
        },
        getProductData = function() {
            return this.productData;
        },
        setCategory = function(cat) {
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
        setCopyCategoryAttribute = function(data) {
            this.parentcategorycopy  = data;
        },
        getCopyCategoryAttribute = function() {
            return this.parentcategorycopy;
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
        },
        overrideCategoryAttribute = function(id,params) {
            var deferred = $q.defer();  
            $http.put('/api/category/attributeoverride/'+id,params,{ headers : {'Authorization' : 'Bearer '+Authentication.getToken()}}).then(function(response) {
                deferred.resolve(response);
            }, function(response) {
                deferred.reject(response);
            });
            return deferred.promise;
        },
        deleteCategoryAttribute = function(id,key,block,parent) {
            var deferred = $q.defer();  
            parent || (parent = '');
            $http.delete('/api/category/attributedelete/'+id+'?key='+key+'&block='+block+'&parent='+parent,{ headers : {'Authorization' : 'Bearer '+Authentication.getToken()}}).then(function(response) {
                deferred.resolve(response);
            }, function(response) {
                deferred.reject(response);
            });
            return deferred.promise;
        },
        getCategoryAttribute = function(id,cache) {
            var deferred = $q.defer();  
            var ca = true;
            if(cache === false) {
                ca = false;
            }
            $http.get('/api/category/getcategory/'+id,{ cache : ca, headers : {'Authorization' : 'Bearer '+Authentication.getToken()}}).then(function(response) {
                deferred.resolve(response);
            }, function(response) {
                deferred.reject(response);
            });
            return deferred.promise;
        },
        getVariantTypes = function() {
            return {
                'checkbox': {title : 'Checkbox'},
                'date':  {title : 'Date'},
                'file_upload': {title : 'File Upload'},
                'textarea': {title : 'Multi Line'},
                'multichoice': {title : 'Multi Choice'},
                'number': {title : 'Number'},
                'subproducts': {title : 'Product List'},
                'swatch': {title : 'Swatch'},
                'text': {title : 'Text'}
            };
        }

        return {   
            getVariantTypes : getVariantTypes,
            getVariantById : getVariantById, 
            getVariantsetById : getVariantsetById, 
            getCategories : getCategories,
            getAllVariants : getAllVariants,
            getVariantRuleByIndex : getVariantRuleByIndex,
            saveVariant : saveVariant,
            saveVariantRule : saveVariantRule,
            saveVariantSet : saveVariantSet,
            saveCategory : saveCategory,
            deleteCategory : deleteCategory,
            getCategoryTree : getCategoryTree,
            setCategory : setCategory,
            getCategoryForAdd : getCategoryForAdd,
            setCategoryTreeSet : setCategoryTreeSet,
            getCategoryTreeSetForAdd : getCategoryTreeSetForAdd,
            setCatalogAttributeData : setCatalogAttributeData,
            getCatalogAttributeData : getCatalogAttributeData,
            saveCategoryAttribute : saveCategoryAttribute,
            getCategoryAttribute : getCategoryAttribute,
            deleteCategoryAttribute : deleteCategoryAttribute,
            overrideCategoryAttribute :overrideCategoryAttribute,
            setCopyCategoryAttribute : setCopyCategoryAttribute,
            getCopyCategoryAttribute : getCopyCategoryAttribute,
            saveProduct : saveProduct,
            addProductData : addProductData,
            getProductData : getProductData
        }
    }
 

    angular
        .module('mean.backend') 
        .factory('Product',Product);
 
    Product.$inject = ['$http', '$q','$window','Authentication','ArrayUtil'];

})();
