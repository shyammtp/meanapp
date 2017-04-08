(function() {
    'use strict'; 

    function OrderNewController($scope,$location,ItemMenus,ArrayUtil,$state,$timeout) { 
         
        $scope.menuassign = {};
        $scope.menus = []; 
        $scope.items = []; 
        $scope.cart = {};
        var items = {};
        $scope.showvariant = {};
        function loopitems(its) {
            angular.forEach(its, function(v,l){
                angular.forEach(v.menus,function(a,r){ 
                    if(typeof $scope.menuassign[v._id] === 'undefined') {
                        $scope.menuassign[v._id] = {};
                    }
                    if(typeof $scope.menuitems[a] === 'undefined') {
                        $scope.menuitems[a] = [];
                    }
                    $scope.menuitems[a].push(v);
                    $scope.menuassign[v._id][a] = true; 
                })
                items[v._id] = v;
            });
        } 
        var variationamoutsubtotal = {};
        $scope.menuitems = {};
        ItemMenus.getAllMenus().then(function(res){
            $scope.menus = res.data.menus;
            ItemMenus.getItems().then(function(ress) {
                loopitems(ress.data); 
                $scope.items = ress.data;
            })
        });

        $scope.getMenuItems = function(menuid) {
            var itms = ArrayUtil.get($scope.menuitems,menuid); 
            return itms;
        }
        $scope.cartid = '';
        $scope.cartorder = {};
        $scope.hasitem = {};
        var urs= '58e2a03b504dc92a187621ab'; 

        var getCartItem = function(item) {
            if(! $scope.cartorder ) {
                return {};                
            }
            var items = {};
            console.log($scope.cartorder);
            angular.forEach( $scope.cartorder.items, function(v,l) {
                console.log(item);
                if(item._id === v._id) {
                    items = v;
                    return;
                }
            });
            return items;
        }

        var hasItemInCart = function(item) {
            console.log('shyam')
            var myitem = getCartItem(item);
            if(ArrayUtil.get(myitem,'_id')) {
                return true;
            }
            return false;
        }
        $scope.addToCart = function(item, menu) { 
             $scope.showvariant[item._id] = false;
            if(item.variantsetid) {
                $scope.showvariant[item._id] = true;
            } 
 
                var insert = true;
                if(item.variantsetid) {
                    insert = false;
                }
                if(validateoptions(item)) {
                    //Add here to cart sending api
                    var data = {};
                    data.user = urs;
                    data.item_name = item.data.item_name;
                    data.quantity = 1;
                    data.type = 'pickup'; 
                    data.item_reference = item._id;
                    data.price = item.data.standard_price;
                    if($scope.cartid) {
                        data._id = $scope.cartid;
                    }  
                    if(item.variantsetid && typeof $scope.cart.options !== 'undefined') { 
                        data.options = {};  
                        angular.forEach($scope.cart.options[item._id],function(g,hj) {
                            if(typeof g ==='string') { 
                                if(typeof data.options[hj] === 'undefined') {
                                    data.options[hj] = [];
                                }
                                data.options[hj].push(g); 
                            } else {
                                data.options[hj] = g; 
                            }

                        });
                        data.price = ArrayUtil.get(variationamoutsubtotal,item._id,0);
                       
                        insert = true; 
                    }  

                    if(insert) {
 
                        ItemMenus.addCart(data).then(function(res) {
                            var dt = {};
                            if(ArrayUtil.get(res.data,'data')) {
                                dt = res.data.data;
                                $scope.hasitem[item._id] = true;
                            } else {
                                dt = res.data;
                                $scope.hasitem[item._id] = true;
                            } 
                            console.log($scope.hasitem);
                            $scope.cartid = dt._id;
                            $scope.cartorder = dt;
                        },function(err) { 
                        }); 

                    } 

                }
        }

        var validateoptions = function(item) {
            return true;
        }

        $scope.getFinalPrice = function(item) {             
            return ArrayUtil.get(variationamoutsubtotal,item._id,item.data.standard_price);
        }

        $scope.updatePrice = function(setid, value, item) {
            var changedoptions = $scope.cart.options[item._id]; 
            var optionset = item.variantsetid.option_set;
            var sets = {};
            angular.forEach(optionset,function(val,key) {
                sets[val.id] = val.typedata.listvalues;
            });
            var variationamount = ArrayUtil.get(item.data,'standard_price',0);
            angular.forEach(changedoptions,function(v,k) {
                if(k in sets) { 
                    var finald = sets[k][v];
                    variationamount += ArrayUtil.get(finald,'price',0); 
                }
            });
            variationamoutsubtotal[item._id] = variationamount; 
        }

    }


    angular
        .module('mean.backend') 
        .controller('OrderNewController', OrderNewController);

    OrderNewController.$inject = ['$scope','$location', 'ItemMenus','ArrayUtil','$state','$timeout']; 

})();
