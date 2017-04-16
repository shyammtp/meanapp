(function() {
    'use strict';

    /* jshint -W098 */

    function ThemeController($scope, Global, Theme, $stateParams) {
        $scope.global = Global;
        $scope.package = {
            name: 'theme'
        };

        $scope.checkCircle = function() {
            Theme.checkCircle($stateParams.circle).then(function(response) {
                $scope.res = response;
                $scope.resStatus = 'info';
            }, function(error) {
                $scope.res = error;
                $scope.resStatus = 'danger';
            });
        };
    }

    function OrdersListController($scope,$location,ItemMenus,ArrayUtil,$state,$timeout,$stateParams,ListWidget) {
        console.log('second');
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
        .module('mean.theme')
        .controller('OrdersListController', OrdersListController)
        .controller('ThemeController', ThemeController); 

    OrdersListController.$inject = ['$scope','$location', 'ItemMenus','ArrayUtil','$state','$timeout','$stateParams','ListWidget']; 
    ThemeController.$inject = ['$scope', 'Global', 'Theme', '$stateParams'];

})();
