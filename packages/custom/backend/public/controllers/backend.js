(function() {
    'use strict';

    /* jshint -W098 */

    function BackendController($scope, Global, Backend, $stateParams) { 
        $scope.global = Global;
        $scope.package = {
            name: 'backend'
        };     
        $scope.params =  $stateParams; 
        Backend.getAssetsData().then(function(res) { 
            $scope.assetspath = res.path;
            $scope.theme = res.theme; 
        }); 
        Backend.getMenus().then(function(response) { 
            $scope.datas = response.data;    
        }); 
        $scope.objectLength = function(obj) {
            return Object.keys(obj).length;
        } 
        if(!$scope.settings) {
            $scope.settings = {}; 
            Backend.getSettings(1).then(function(res) {
                if(res.data) {
                     angular.forEach(res.data,function(v,e){
                        $scope.settings[v.name] = v.value;
                     });
                 }
            });  
        }        
        $scope.onFileSelect = function($files) { 
            $scope.profile = $files[0];
            uploadFile();
        }
       

    }
 

     function SettingsController($scope,Backend) { 
        
        $scope.saveSettings = function(settings) {  
            var success = 0,error = 0;
            for(var key in settings)  { 
               Backend.saveSettings(key,settings[key],1).then(function(res) {
                    //return res;
                    success++;
                },function(err){
                    error++;
                });              
            } 
            if(error <=0) {
                Materialize.toast('Settings Saved Successfully', 4000);
            } 
        }


    }

    function WidgetController($scope,ListWidget,$location,Backend) { 

         var vm = this;
         vm.setPage = setPage;
         ListWidget.addColumn('name',{'type' : 'text','title' : 'Name',defaultValue : '--',width : '40%'});
         ListWidget.addColumn('from_name',{'type' : 'number','title' : 'Username',width : '40%'}); 
         ListWidget.addColumn('template_type',{'type' : 'select','title' : 'System / Custom',width : '20%','options' : [{label : "System",id:'system'},
            {label : "custom",id:'custom'}]});
         ListWidget.setDataRequestUrl('/api/notificationtemplate/getall'); 
         
        function setPage(page) { 
            if(page < 1) {
                page = 1;
            }
            ListWidget.request({page: page,limit : 20}).then(function(res){  
                ListWidget.setTotalItems(res.data.total)
                        .setPageSize(20).setPage(page)
                        .setDBResults(res.data.docs);   
                $scope.pager = ListWidget.getPager();  
                $scope.dbresult = ListWidget.getDbResults();
            });    
        }  
        $scope.widgetlimitchange = function(selected) {
            ListWidget.request({page: 1,limit : selected}).then(function(res){  
                ListWidget.setTotalItems(res.data.total)
                        .setPageSize(selected).setPage(1)
                        .setDBResults(res.data.docs);   
                $scope.pager = ListWidget.getPager();  
                $scope.dbresult = ListWidget.getDbResults();
            }); 
        }
        setPage(1);

    }


    angular
        .module('mean.backend')
        .controller('BackendController', BackendController)
        .controller('SettingsController', SettingsController)
        .controller('WidgetController', WidgetController);

    BackendController.$inject = ['$scope', 'Global', 'Backend', '$stateParams'];
    SettingsController.$inject = ['$scope','Backend'];
    WidgetController.$inject = ['$scope','ListWidget','$location','Backend'];

})();
