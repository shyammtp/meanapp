(function() {
    'use strict';

    /* jshint -W098 */

    function BackendController($scope, Global, Backend, $stateParams,$rootScope,$location,$state, Authentication) { 
        var bm = this;  
        bm.credentials = {
            email : '',
            password: ''
        }

        $scope.$on('child', function (event, data) {
            if(typeof data.externaljs!== 'undefined') {
                $scope.externaljs = data.externaljs;
            } 
        });
        $scope.global = Global;
        $scope.package = {
            name: 'backend'
        };    
        $scope.params =  $stateParams; 
        Backend.getAssetsData().then(function(res) { 
            $scope.assetspath = res.path;
            console.log(res.path);
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

        $scope.login = function() {
            Authentication.login(bm.credentials).then(function(res) { 
                Authentication.saveToken(res.data.token);
                $location.path('/admin/dashboard'); 
                Materialize.toast('Logged in Successfully', 4000);  
            },function(err) { 
                if(err.status == 401) {
                    Materialize.toast(err.data.message, 2000,'errortoast');
                }
            });
            
        }
        $scope.currenturl = $location.path();
        $scope.loadheader = function(params) {
            if($scope.currenturl !== '/admin/login')  {
                if(params.hasheader === 'false') {
                    return false;
                }
            } else {
                return false;
            }
            return true;
        }
        $scope.logout = function() {
            Authentication.logout();
            $state.go('login'); 
            Materialize.toast('Logged out Successfully', 4000);            
        }
        $rootScope.$on('$stateChangeStart', function(event, nextRoute, currentRoute) { 
              $scope.currenturl = nextRoute.url; 
        });
        $scope.loadScript = function(url, type, charset) {
            if (type===undefined) type = 'text/javascript';
            if (url) {
                var script = document.querySelector("script[src*='"+url+"']");
                if (!script) {
                    var heads = document.getElementsByTagName("head");
                    if (heads && heads.length) {
                        var head = heads[0];
                        if (head) {
                            script = document.createElement('script');
                            script.setAttribute('src', url);
                            script.setAttribute('type', type);
                            if (charset) script.setAttribute('charset', charset);
                            head.appendChild(script);
                        }
                    }
                }
                return script;
            }
        };

    }
 

     function SettingsController($scope,Backend) { 
        
        $scope.saveSettings = function(settings) {  
            console.log(settings);
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

    function WidgetController($scope,ListWidget,$location,Backend,$rootScope,$state) { 
         var vm = this;  
         vm.setPage = setPage; 
         ListWidget.init();
         ListWidget.defaultSortColumn = 'template_type';
         ListWidget.addColumn('name',{'type' : 'text','title' : 'Name',defaultValue : '--',width : '30%'});
         ListWidget.addColumn('from_name',{'type' : 'number','title' : 'Username',width : '30%'}); 
         ListWidget.addColumn('template_type',{'type' : 'select','title' : 'System / Custom',width : '20%','options' : [{label : "System",id:'system'},
            {label : "custom",id:'custom'}]});
         ListWidget.addColumn('nocolumn',{'type' : 'notype','title' : 'Actions',defaultValue : '--',width : '20%',sortable : false,filterable : false,'render' : 'backend/views/settings/template/renderer/actions.html'});
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

    BackendController.$inject = ['$scope', 'Global', 'Backend', '$stateParams','$rootScope','$location','$state','Authentication'];
    SettingsController.$inject = ['$scope','Backend'];
    WidgetController.$inject = ['$scope','ListWidget','$location','Backend','$rootScope','$state'];

})();
