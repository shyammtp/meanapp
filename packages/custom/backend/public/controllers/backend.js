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

    angular
        .module('mean.backend')
        .controller('BackendController', BackendController)
        .controller('SettingsController', SettingsController);

    BackendController.$inject = ['$scope', 'Global', 'Backend', '$stateParams'];
    SettingsController.$inject = ['$scope','Backend'];

})();
