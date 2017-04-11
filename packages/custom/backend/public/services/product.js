(function() {
    'use strict';
    function removeempty(value) {
      return value != '';
    }


    Number.prototype.formatNumber = function(decPlaces, thouSeparator, decSeparator) {
        decPlaces = isNaN(decPlaces = Math.abs(decPlaces)) ? 2 : decPlaces;
        decSeparator = decSeparator == undefined ? "." : decSeparator;
        thouSeparator = thouSeparator == undefined ? "," : thouSeparator;

        var n = this.toFixed(decPlaces);
        if (decPlaces) {
            var i = n.substr(0, n.length - (decPlaces + 1));
            var j = decSeparator + n.substr(-decPlaces);
        } else {
            i = n;
            j = '';
        }

        function reverse(str) {
            var sr = '';
            for (var l = str.length - 1; l >= 0; l--) {
                sr += str.charAt(l);
            }
            return sr;
        }

        if (parseInt(i)) {
            i = reverse(reverse(i).replace(/(\d{3})(?=\d)/g, "$1" + thouSeparator));
        }
        return i+j;
    };

    function Product($http, $q,$window, Authentication,ArrayUtil,Backend) { 
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
        getCategoryPath = function(params) {
            var ids = params.filter(removeempty);
            var deferred = $q.defer();
            $http.get('/api/category/getpath?catpath='+ids.join(","),{cache : true,headers : {'Authorization' : 'Bearer '+Authentication.getToken()}}).then(function(response) {
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
        },getProductById = function(id) {
            var deferred = $q.defer();
            $http.get('/api/catalog/get/'+id,{headers : {'Authorization' : 'Bearer '+Authentication.getToken()}}).then(function(response) {
                deferred.resolve(response);
            }, function(response) {
                deferred.reject(response);
            });
            return deferred.promise; 
        },getCategoryById = function(id) {
            var deferred = $q.defer();
            $http.get('/api/category/get/'+id,{headers : {'Authorization' : 'Bearer '+Authentication.getToken()}}).then(function(response) {
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
        saveInterface = function(params) {
            var deferred = $q.defer();
            $http.post('/api/catalog/saveinterface',params,{ headers : {'Authorization' : 'Bearer '+Authentication.getToken()}}).then(function(response) {
                deferred.resolve(response);
            }, function(response) {
                deferred.reject(response);
            });
            return deferred.promise;
        },
        getProductViewInterface = function(params) {
            var deferred = $q.defer();
            $http.get('/api/catalog/getinterfaceviews?userid='+Authentication.getUser(),{ headers : {'Authorization' : 'Bearer '+Authentication.getToken()}}).then(function(response) {
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
        getAllVariantset = function() {
            var deferred = $q.defer();
            $http.get('/api/variantset/getall',{cache : true,headers : {'Authorization' : 'Bearer '+Authentication.getToken()}}).then(function(response) {
                deferred.resolve(response);
            }, function(response) {
                deferred.reject(response);
            });
            return deferred.promise;
        }, 
        formatPrice = function(value) { 
            if(!value) {
                value = 0;
            }
            var value = parseFloat(value);            
            var settings = $window.settings,currency = ArrayUtil.get($window.current_currency,ArrayUtil.get(settings,'currency'));
            var htmlcurrency = ArrayUtil.get(settings,'html_currency'); 
            return ArrayUtil.replaceStr(htmlcurrency,["%%currency%%","%%amount%%"],[currency.currency_symbol,value.formatNumber(2,',','.')]);               
        },
        getCurrency = function(index) { 
            var currency = ArrayUtil.get($window.current_currency,ArrayUtil.get($window.settings,'currency'));
            return ArrayUtil.get(currency,index,'');
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
        resetProductData = function() {
            this.productData = {};
            return this;
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
            formatPrice : formatPrice,
            getCurrency : getCurrency,
            saveInterface : saveInterface,
            getVariantTypes : getVariantTypes,
            getVariantById : getVariantById, 
            getVariantsetById : getVariantsetById, 
            getProductViewInterface : getProductViewInterface, 
            getProductById : getProductById,
            getCategories : getCategories,
            getCategoryPath : getCategoryPath,
            getAllVariants : getAllVariants,
            getAllVariantset : getAllVariantset,
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
            getProductData : getProductData,
            resetProductData : resetProductData
        }
    }
    

    function ItemMenus($http, $q,$window, Authentication,ArrayUtil,Backend) {
        return {
            getAllMenus : function() {
                var deferred = $q.defer();
                $http.get('/api/menus/getall',{cache : true,headers : {'Authorization' : 'Bearer '+Authentication.getToken()}}).then(function(response) {
                    deferred.resolve(response);
                }, function(response) {
                    deferred.reject(response);
                });
                return deferred.promise;
            }, 
            saveMenus : function(params) {
                var deferred = $q.defer();
                $http.post('/api/menus/save',params,{ headers : {'Authorization' : 'Bearer '+Authentication.getToken()}}).then(function(response) {
                    deferred.resolve(response);
                }, function(response) {
                    deferred.reject(response);
                });
                return deferred.promise;
            },
            deleteMenus : function(params) {
                var deferred = $q.defer(); 
                $http.delete('/api/menus/delete/'+ArrayUtil.get(params,'id'),{ headers : {'Authorization' : 'Bearer '+Authentication.getToken()}}).then(function(response) {
                    deferred.resolve(response);
                }, function(response) {
                    deferred.reject(response);
                });
                return deferred.promise;
            },
            deleteItem : function(params) {
                var deferred = $q.defer(); 
                $http.delete('/api/menus/items/delete/'+ArrayUtil.get(params,'id'),{ headers : {'Authorization' : 'Bearer '+Authentication.getToken()}}).then(function(response) {
                    deferred.resolve(response);
                }, function(response) {
                    deferred.reject(response);
                });
                return deferred.promise;
            },
            getItems : function(params) {
                var deferred = $q.defer(); 
                $http.get('/api/menus/items',{ headers : {'Authorization' : 'Bearer '+Authentication.getToken()}}).then(function(response) {
                    deferred.resolve(response);
                }, function(response) {
                    deferred.reject(response);
                });
                return deferred.promise;
            },
            setMenu : function(id, menus) {
                var deferred = $q.defer(); 
                $http.put('/api/menus/items/'+id,menus,{ headers : {'Authorization' : 'Bearer '+Authentication.getToken()}}).then(function(response) {
                    deferred.resolve(response);
                }, function(response) {
                    deferred.reject(response);
                });
                return deferred.promise; 
            },cartOrders : function() {
                var deferred = $q.defer(); 
                $http.get('/api/cart/orders',{ headers : {'Authorization' : 'Bearer '+Authentication.getToken()}}).then(function(response) {
                    deferred.resolve(response);
                }, function(response) {
                    deferred.reject(response);
                });
                return deferred.promise;
            },getOrder : function(id) {
                var deferred = $q.defer(); 
                $http.get('/api/cart/getorder/'+id,{ headers : {'Authorization' : 'Bearer '+Authentication.getToken()}}).then(function(response) {
                    deferred.resolve(response);
                }, function(response) {
                    deferred.reject(response);
                });
                return deferred.promise;
            },addHistory : function(post) {
                var deferred = $q.defer(); 
                $http.post('api/cart/employeehistory',post,{ headers : {'Authorization' : 'Bearer '+Authentication.getToken()}}).then(function(response) {
                    deferred.resolve(response);
                }, function(response) {
                    deferred.reject(response);
                });
                return deferred.promise;
            },getCartByUser : function(userid) {
                var deferred = $q.defer(); 
                $http.get('/api/v1/cart/get/'+userid,{ headers : {'Authorization' : 'Bearer '+Authentication.getToken()}}).then(function(response) {
                    deferred.resolve(response);
                }, function(response) {
                    deferred.reject(response);
                });
                return deferred.promise;
            },updateCart : function(id, post) {
                var deferred = $q.defer(); 
                $http.put('api/cart/update/'+id,post,{ headers : {'Authorization' : 'Bearer '+Authentication.getToken()}}).then(function(response) {
                    deferred.resolve(response);
                }, function(response) {
                    deferred.reject(response);
                });
                return deferred.promise;
            },removeItem : function(cartid,item_id) {
                var deferred = $q.defer(); 
                $http.delete('/api/cart/item/remove/'+cartid+'?itemid='+item_id,{ headers : {'Authorization' : 'Bearer '+Authentication.getToken()}}).then(function(response) {
                    deferred.resolve(response);
                }, function(response) {
                    deferred.reject(response);
                });
                return deferred.promise;
            },updateCartQuantity : function(id, post) {
                var deferred = $q.defer(); 
                $http.put('/api/v1/cart/update/'+id,post,{ headers : {'Authorization' : 'Bearer '+Authentication.getToken()}}).then(function(response) {
                    deferred.resolve(response);
                }, function(response) {
                    deferred.reject(response);
                });
                return deferred.promise;
            },addCart : function(post) {
                var deferred = $q.defer(); 
                $http.post('api/v1/cart/add',post,{ headers : {'Authorization' : 'Bearer '+Authentication.getToken()}}).then(function(response) {
                    deferred.resolve(response);
                }, function(response) {
                    deferred.reject(response);
                });
                return deferred.promise;
            }, calculatePrices : function(cart) {
                var prices = {};
                var grandtotal = 0;
                prices.individualitemsubtotal = {};
                prices.subtotal = 0; 
                var subtotal = 0; 
                angular.forEach(cart.items, function(s,g) {
                    var additions = 0;
                    if(!s.price) {
                        s.price = 0;
                    }
                    angular.forEach(s.additions,function(m,v){
                        angular.forEach(m.options, function(i,t){
                            if(!i.price) {
                                i.price = 0;
                            }
                            additions += parseFloat(i.price);
                        })
                    })
                    subtotal += prices.individualitemsubtotal[s._id] = ArrayUtil.get(s,'quantity',1) * (parseFloat(s.price)+additions);
                })
                prices.subtotal = subtotal;       
                return prices;
            }
        }
    }

    angular
        .module('mean.backend') 
        .factory('Product',Product)
        .factory('ItemMenus',ItemMenus);
 
    Product.$inject = ['$http', '$q','$window','Authentication','ArrayUtil','Backend'];
    ItemMenus.$inject = ['$http', '$q','$window','Authentication','ArrayUtil','Backend'];

})();
