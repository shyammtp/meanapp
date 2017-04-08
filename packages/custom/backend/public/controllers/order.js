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
        $scope.$watch('cart.options',function() {
            console.log($scope.cart.options);
        })
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

        $scope.addToCart = function(item, menu) {
             $scope.showvariant[item._id] = false;
            if(item.variantsetid) {
                $scope.showvariant[item._id] = true;
            } 

            if(ArrayUtil.get($scope.showvariant,item._id) === true) {
                if(validateoptions(item)) {
                    //Add here to cart sending api
                }
            }

            console.log(item);
            console.log(menu);
        }

        var validateoptions = function(item) {
            return true;
        }

        $scope.getFinalPrice = function(item) {             
            return ArrayUtil.get(variationamoutsubtotal,item._id,item.data.standard_price);
        }

        $scope.updatePrice = function(setid, value, item) {
            var changedoptions = $scope.cart.options[item._id];
            //console.log(item);
            console.log(item);
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
            console.log(variationamount);
            console.log($scope.cart.options[item._id]);
        }

    }


    angular
        .module('mean.backend') 
        .controller('OrderNewController', OrderNewController);

    OrderNewController.$inject = ['$scope','$location', 'ItemMenus','ArrayUtil','$state','$timeout']; 

})();
