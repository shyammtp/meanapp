(function() {
    'use strict'; 

    function OrderNewController($scope,$location,ItemMenus,ArrayUtil,$state,$timeout,$stateParams) { 
         
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
        console.log($stateParams);
        var urs = $stateParams.user;  
        if(urs) {
            ItemMenus.setCartUser(urs);
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
            });
        }

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
        console.log(item.variantsetid); 
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
                    if(item.variantsetid && typeof $scope.cart.options!== 'undefined' && typeof $scope.cart.options[item._id] !== 'undefined') { 
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
                            $scope.showvariant[item._id] = false;
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

        $scope.movetonext = function(additional) {
            ItemMenus.updateCart($scope.cartorder._id,{cartadditionalsave : true,additionalinfo : additional}).then(function(response) {
                var d = response.data;
                if(d.success === true) {
                    return $location.path('admin/orders/place/payment');
                } else {
                    Materialize.toast(ArrayUtil.get(d,'message','Problem in the cart'), 4000,'errortoast');
                }
            },function(err) {
                if(err.status == 500) {
                    Materialize.toast(ArrayUtil.get(ArrayUtil.get(err,'data'),'message','Category not saved'), 4000,'errortoast');
                } 
            })
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
                                    var amt = ArrayUtil.get(finald,'price',0);
                                    if(!amt) {
                                        amt = 0;
                                    }
                                    variationamount += amt; 
                                }
                            }
                        });
                    } else {
                        var finald = sets[k][v];
                        if(finald) { 
                            var amt = ArrayUtil.get(finald,'price',0);
                            if(!amt) {
                                amt = 0;
                            }
                            variationamount += amt; 
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

    function BackendOrderPaymentController($scope,$location,ItemMenus,ArrayUtil,$state,$timeout,Backend,$window) {

        $scope.cartorder = {}; 
        $scope.editpersonalinfo = false;  
        $scope.editdeliverydet = false;  
        $scope.addressselect = false; 
        $scope.settings = $window.settings;
        var itemsset = {};
        $scope.delivery = {};
        $scope.chooseddeliery = {};
        $scope.userdeliveries = [];
        if(!ItemMenus.getCartUser()) {
            return $location.path('admin/orders/place');
        }
        ItemMenus.getCartByUser(ItemMenus.getCartUser()).then(function(res){    
            angular.forEach(res.data.data.items, function(v,k) { 
                itemsset[v.item_ref] = v; 
            });   
            $scope.cartorder = res.data.data;
            ItemMenus.setCart(res.data.data);
            $scope.cartorder.priceset = ItemMenus.calculatePrices(res.data.data);
            if($scope.cartorder.user) {
                $scope.userdeliveries = $scope.cartorder.user.deliveries;
            }
            if($scope.cartorder.user && typeof $scope.cartorder.personalinfo === 'undefined') {
                $scope.cartorder.personalinfo = {};
                $scope.cartorder.personalinfo.name = $scope.cartorder.user.name;
                $scope.cartorder.personalinfo.phone = $scope.cartorder.user.phone;
                $scope.editpersonalinfo = true;
            }
            console.log($scope.cartorder);
        },function(err) {
            if(err.status == 500) {

            }
        });

        $scope.place_order = function() { 
            var postdata = {};
            postdata.placeorder = true;
            if($scope.chooseddeliery) {
                postdata.delivery = $scope.chooseddeliery;
            }
            postdata.priceset = $scope.cartorder.priceset;
            postdata.orderplaced = true; 
            postdata.totalpaid = $scope.cartorder.priceset.grandtotal;
            postdata.paid = true;
            console.log('PlaceOrderData',postdata); 
            ItemMenus.updateCart($scope.cartorder._id,postdata).then(function(response) {
                var d = response.data;
                if(d.success === true) { 
                    Materialize.toast('Order has been placed', 4000);
                    return $location.path('admin/orders/live');
                   
                } else {
                    Materialize.toast(ArrayUtil.get(d,'message','Problem in the cart'), 4000,'errortoast');
                }
            },function(err) {
                if(err.status == 500) {
                    Materialize.toast(ArrayUtil.get(ArrayUtil.get(err,'data'),'message','Cart not saved'), 4000,'errortoast');
                } 
            })
        }
        $scope.names = [];
        Backend.getDirectoryByType({'treepath' : ['58d01daed956947be15adc0b']},4).then(function(res) {   
             if(res.data) {
                 $scope.names = res.data.directory;
             }
        });
        $scope.willdeliver = false;
        $scope.selectedArea = function(d) { 
            $scope.willdeliver = false;
            if(d) {
                $scope.delivery.delivery_area = d.originalObject._id;
                ItemMenus.getLocationCharge({'locationid' : d.originalObject._id}).then(function(res){
                   updatedeliverypriceset(res.data.charges);                      
                })
            } 
        }
        $scope.inputChanged = function() {
            console.log('changed');
            $scope.delivery.delivery_area = '';
        }

        function updatedeliverypriceset(charge) {  
            var dcharge = 0;
            if(charge._id) {
                dcharge = charge.deliverycharge; 
                $scope.willdeliver = true;
            } else {
                 $scope.willdeliver = false;
            }
            ItemMenus.setDeliveryCharge(dcharge);
            $scope.cartorder.priceset = ItemMenus.calculatePrices();
        }

        $scope.updatedeliverymethod = function(method) {
            ItemMenus.updateCart($scope.cartorder._id,{cartdeliverymethodsave : true,type : method}).then(function(response) {
                var d = response.data;
                console.log('UpdateDeliveryMethod',d);
                if(d.success === true) { 
                    Materialize.toast('Information Updated', 4000);
                    $scope.editdeliverydet = false;
                    $scope.cartorder = d.cart; 
                    
                    ItemMenus.setCart(d.cart);
                    $scope.cartorder.priceset = ItemMenus.calculatePrices(d.cart);
                    if($scope.cartorder.user) {
                        $scope.userdeliveries = $scope.cartorder.user.deliveries;
                    }
                    if($scope.cartorder.user && typeof $scope.cartorder.personalinfo === 'undefined') {
                        $scope.cartorder.personalinfo = {};
                        $scope.cartorder.personalinfo.name = $scope.cartorder.user.name;
                        $scope.cartorder.personalinfo.phone = $scope.cartorder.user.phone;
                        $scope.editpersonalinfo = true;
                    }
                    if($scope.chooseddeliery.charge) {
                        updatedeliverypriceset($scope.chooseddeliery.charge); 
                    }
                    if(d.cart.type[0] === 'pickup') {
                         $scope.willdeliver = true;
                    } 
                } else {
                    Materialize.toast(ArrayUtil.get(d,'message','Problem in the cart'), 4000,'errortoast');
                }
            },function(err) {
                if(err.status == 500) {
                    Materialize.toast(ArrayUtil.get(ArrayUtil.get(err,'data'),'message','Cart not saved'), 4000,'errortoast');
                } 
            })
        }

        $scope.editpersonal = function() {
            $scope.editpersonalinfo = true;
        }
        $scope.editdeliverydetas = function() {
            $scope.editdeliverydet = true;
        }
        
        $scope.getItemPriceSubtotal = function(itemid) { 
            return ArrayUtil.get(ArrayUtil.get($scope.cartorder.priceset,'individualitemsubtotal',{}),itemid,0);
        }

        $scope.updatepersonalinfo = function() {
            ItemMenus.updateCart($scope.cartorder._id,{cartpersonalsave : true,personalinfo : $scope.cartorder.personalinfo}).then(function(response) {
                var d = response.data;
                if(d.success === true) { 
                    Materialize.toast('Information Updated', 4000);
                    $scope.editpersonalinfo = false;
                } else {
                    Materialize.toast(ArrayUtil.get(d,'message','Problem in the cart'), 4000,'errortoast');
                }
            },function(err) {
                if(err.status == 500) {
                    Materialize.toast(ArrayUtil.get(ArrayUtil.get(err,'data'),'message','Category not saved'), 4000,'errortoast');
                } 
            })
        }

        $scope.addDeliveryaddress = function() { 
            classie.toggle( document.getElementById( 'cbp-spmenu-s2' ), 'cbp-spmenu-open' );
            Backend.loadSider($scope,'cbp-spmenu-s2','backend/views/'+theme+'/orders/adddelivery.html'); 
            angular.element('.cd-overlay').addClass('is-visible');
            $scope.addressselect = true;
        }

        $scope.closethis = function() { 
            classie.toggle( document.getElementById( 'cbp-spmenu-s2' ), 'cbp-spmenu-open' );            
            angular.element('.cd-overlay').removeClass('is-visible');
        }  

        $scope.adddelivery = function() {
            $scope.addressselect = false;
        }

        $scope.canceladddelivery = function() {
            $scope.addressselect = true;
        }
        $scope.othernickname = false;
        $scope.setnickname = function(ty) {
            if(ty === 'other') {
                $scope.othernickname = true;
                $scope.delivery.nickname = '';
            } 
            if(ty !== 'other') {
                $scope.othernickname = false;
                $scope.delivery.nickname = ty;
            }
        }
        $scope.selectdelivery = function(delivery) {
            console.log('Choosed Delivery',delivery);
            $scope.chooseddeliery = delivery; 
            if(delivery.delivery_area._id) {
                $scope.willdeliver = false;
                 ItemMenus.getLocationCharge({'locationid' : delivery.delivery_area._id}).then(function(res){
                    var charge = res.data.charges;

                    $scope.chooseddeliery.charge = charge;
                    updatedeliverypriceset(charge); 
                })  
            }
            $scope.closethis();
        }
        $scope.savedelivery = function() { 
            ItemMenus.addDeliveries(ItemMenus.getCartUser(),$scope.delivery).then(function(res){
                var d = res.data; 
                if(d.success) {
                    var user = d.user;   
                    $scope.userdeliveries = user.deliveries;
                    $scope.addressselect = true;
                    $scope.delivery = {};
                    Materialize.toast('Address added', 4000);
                }
            })
        }
    }

    function OrdersListController($scope,$location,ItemMenus,ArrayUtil,$state,$timeout,$stateParams,ListWidget) {
        console.log('one');
        var vm = this;
        vm.setPage = setPage; 

         ListWidget.init();
         ListWidget.isFilter = false;
         ListWidget.defaultSortColumn = 'updated_on';
         ListWidget.defaultSortDirection = -1;
         ListWidget.addColumn('order_reference',{'type' : 'text','title' : 'ID', index : 'order_reference',defaultValue : '--',width : '10%'});
         ListWidget.addColumn('delivery.address',{'type' : 'text','title' : 'Location', index : 'delivery.address',defaultValue : '--',width : '20%','render' : 'backend/views/'+theme+'/orders/renderer/locations.html'});
         ListWidget.addColumn('updated_on',{'type' : 'text','title' : 'Order Date',index : 'updated_on',defaultValue : '--',width : '20%','render' : 'backend/views/'+theme+'/orders/renderer/date.html'}); 
         ListWidget.addColumn('personalinfo.name',{'type' : 'text','title' : 'Customer', index : 'personalinfo.name',defaultValue : '--',width : '30%','render' : 'backend/views/'+theme+'/orders/renderer/name.html'}); 
          ListWidget.addColumn('type',{'type' : 'text','title' : 'Type', index : 'type',defaultValue : '--',width : '10%','render' : 'backend/views/'+theme+'/orders/renderer/type.html'}); 
         ListWidget.addColumn('priceset.grandtotal',{'type' : 'text','title' : 'Total', index : 'priceset.grandtotal',defaultValue : '--',width : '20%','render' : 'backend/views/'+theme+'/orders/renderer/total.html'});
         ListWidget.addColumn('nocolumn',{'type' : 'notype','title' : 'Actions',defaultValue : '--',width : '20%',sortable : false,filterable : false,'render' : 'backend/views/'+theme+'/orders/renderer/actions.html'});
         ListWidget.setDataRequestUrl('/api/orders/list?orderplaced=true'); 
         
        function setPage(page) { 
            if(page < 1) {
                page = 1;
            }
            ListWidget.request({page: page,limit : 20,passtoken : true,nocache : true}).then(function(res){  
                ListWidget.setTotalItems(res.data.total)
                        .setPageSize(20).setPage(page)
                        .setDBResults(res.data.docs);   
                $scope.pager = ListWidget.getPager();  
                $scope.dbresult = ListWidget.getDbResults();
            });    
        }  
        $scope.widgetlimitchange = function(selected) {
            ListWidget.request({page: 1,limit : selected,passtoken : true}).then(function(res){  
                ListWidget.setTotalItems(res.data.total)
                        .setPageSize(selected).setPage(1)
                        .setDBResults(res.data.docs);   
                $scope.pager = ListWidget.getPager();  
                $scope.dbresult = ListWidget.getDbResults();
            }); 
        }
        setPage(1); 

        $scope.vieworder = function(obj) {
            $location.path('/admin/orders/items/live/'+obj.id);
        }
    }


    angular
        .module('mean.backend') 
        .controller('OrderNewController', OrderNewController)
        .controller('OrdersListController', OrdersListController)
        .controller('BackendOrderPaymentController', BackendOrderPaymentController);

    OrderNewController.$inject = ['$scope','$location', 'ItemMenus','ArrayUtil','$state','$timeout','$stateParams']; 
    OrdersListController.$inject = ['$scope','$location', 'ItemMenus','ArrayUtil','$state','$timeout','$stateParams','ListWidget']; 
    BackendOrderPaymentController.$inject = ['$scope','$location', 'ItemMenus','ArrayUtil','$state','$timeout','Backend','$window']; 

})();
