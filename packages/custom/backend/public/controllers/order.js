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
        $scope.itemsquantity = {};
        $scope.mainitem = {};
        var urs= '58e38a461479f732f6ca585d';  
        var itemsset = {};
        ItemMenus.getCartByUser(urs).then(function(res){    
            angular.forEach(res.data.data.items, function(v,k) {
                $scope.hasitem[v.item_ref] = true;
                if(!ArrayUtil.get($scope.itemsquantity,v.item_ref)) {
                     $scope.itemsquantity[v.item_ref] = v.quantity;
                }
                itemsset[v.item_ref] = v; 
            });

            $scope.mainitem = angular.extend({},$scope.mainitem,itemsset);
 
            $scope.cartid = res.data.data._id;
            $scope.cartorder = res.data.data;
            $scope.cartorder.priceset = ItemMenus.calculatePrices(res.data.data);
        },function(err) {
            if(err.status == 500) {

            }
        })

        var getCartItem = function(item) {
            if(! $scope.cartorder ) {
                return {};                
            }
            var items = {};
            angular.forEach( $scope.cartorder.items, function(v,l) { 
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

        $scope.updateItemQuantity = function(pditem, ty) {
            var cartorder = $scope.cartorder;  
            angular.forEach(cartorder.items,function(l,gh){
                //update 
                if(pditem._id === l.item_ref) {  
                    $scope.updateQuantity(ArrayUtil.get($scope.mainitem,pditem._id),ty);
                }
            });
        }

        $scope.updateQuantity = function(item,ty) { 
            var cartorder = $scope.cartorder; 
            var newor = cartorder;
            if(ty === 'add') {
                var newtms = [],promise;
                angular.forEach(cartorder.items,function(l,gh){
                    var itms = l;
                    if(l._id === item._id) { 
                        itms.quantity = parseInt(l.quantity) + 1;  
                        $scope.itemsquantity[l.item_ref] = itms.quantity;
                        //console.log(angular.extend(itms,{item_id : item._id,_id : cartorder._id,user : cartorder.user}));
                        ItemMenus.updateCartQuantity(cartorder._id,itms); 
                    } 
                    newtms.push(itms);
                })
                newor.items = newtms;
            }

            if(ty === 'sub') {
                var newtms = [];
                var promise;
                angular.forEach(cartorder.items,function(l,gh){
                    var itms = l;
                    if(l._id === item._id) { 
                        itms.quantity = parseInt(l.quantity) - 1;
                        if(itms.quantity <= 0) {
                           // itms.quantity = 1;
                        } 
                        if(itms.quantity <= 0) { 
                            $scope.hasitem[l.item_ref] = false;
                            ItemMenus.removeItem(cartorder._id,l._id);
                        } else {
                            ItemMenus.updateCartQuantity(cartorder._id,itms);
                        } 
                        $scope.itemsquantity[l.item_ref] = itms.quantity;
                    }
                    if(itms.quantity > 0) {
                        newtms.push(itms);
                    }
                })

 
                newor.items = newtms;
            }  
            $scope.cartorder = newor;
            $scope.cartorder.priceset = ItemMenus.calculatePrices(newor); 
        }
        $scope.getItemPriceSubtotal = function(itemid) { 
            return ArrayUtil.get(ArrayUtil.get($scope.cartorder.priceset,'individualitemsubtotal',{}),itemid,0);
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
                         
                        //data.price = ArrayUtil.get(variationamoutsubtotal,item._id,0);
                       
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
                            if(!ArrayUtil.get($scope.itemsquantity,item._id)) {
                                 $scope.itemsquantity[item._id] = 1;
                            }
                            var itemsset = {};
                            angular.forEach(dt.items,function(v,k){
                                itemsset[v.item_ref] = v; 
                            });
                            $scope.mainitem = angular.extend({},$scope.mainitem,itemsset);
                            $scope.cartid = dt._id;
                            $scope.cartorder = dt;
                            $scope.cartorder.priceset = ItemMenus.calculatePrices(dt);
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
            if(!variationamount) {
                variationamount = 0;
            } 
            angular.forEach(changedoptions,function(v,k) {
                if(k in sets) { 
                    if(typeof v === 'object') {
                        angular.forEach(v,function(sd,vf) {
                            if(sd) {
                                var finald = sets[k][vf]; 
                                if(finald) { 
                                    variationamount += ArrayUtil.get(finald,'price',0); 
                                }
                            }
                        });
                    } else {
                        var finald = sets[k][v];
                        if(finald) { 
                            variationamount += ArrayUtil.get(finald,'price',0); 
                        }
                    }
                    
                }
            });
            variationamoutsubtotal[item._id] = variationamount; 
        }

        $scope.getChooseText = function(typedata) { 
            if(typeof typedata.ismultiple !== 'undefined') { 
                if(parseInt(typedata.mincount) > 0) {
                    return '(Choose upto '+typedata.mincount+' items)';
                } else if(parseInt(typedata.mincount) === 0) {
                    return '';
                } else {
                    return '(Choose 1)';
                }
            }
            return '';
        }

    }


    angular
        .module('mean.backend') 
        .controller('OrderNewController', OrderNewController);

    OrderNewController.$inject = ['$scope','$location', 'ItemMenus','ArrayUtil','$state','$timeout']; 

})();
