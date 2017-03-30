(function() {
    'use strict';

    /* jshint -W098 */
    function TitleController($scope,Page) {
         $scope.Page = Page; 
    }

    function BackendCoreController($scope,getsettings,$location,$window,Authentication,$state,Backend,$stateParams,getmenus,getcurrency,getassetsdata) { 
        $window.settings = {};
        angular.forEach(getsettings.data,function(v,e){
            $window.settings[v.name] = v.value;
        });
        $window.menus = getmenus.data; 
        $window.current_currency = getcurrency; 
        $window.assetsdata = getassetsdata;  
    }



    function BackendController($scope, Global, Backend, $stateParams,$rootScope,$location,$state, Authentication,$window,Product) {
        console.log('in1');  
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
        $scope.headtitle = 'test';
        $scope.global = Global;
        $scope.package = {
            name: 'backend'
        };     
        $scope.params =  $stateParams; 
        Backend.getAssetsData().then(function(res) { 
            $scope.assetspath = res.path; 
            $scope.theme = res.theme; 
        }); 
        $scope.loadsubmenu = function() {

        }
        Backend.getMenus().then(function(response) { 
                $scope.datas = response.data;
                jQuery('.sidebar .accordion-menu li .sub-menu').slideUp(0);
                jQuery('.sidebar .accordion-menu li.open .sub-menu').slideDown(0);
                jQuery('.small-sidebar .sidebar .accordion-menu li.open .sub-menu').hide(0);
            },function(reason) {
                console.log("getMenus:Failed: "+ reason);
            },function(update){
                 console.log('in1');
                 
            }); 
        $scope.directories = [];
        Backend.getAllDirectories().then(function(response){
            $scope.directories = response.data;
        })
        $scope.objectLength = function(obj) {
            return Object.keys(obj).length;
        }  
        $scope.onFileSelect = function($files) { 
            $scope.profile = $files[0];
            uploadFile();
        }

        $scope.login = function() {
            Authentication.login(bm.credentials).then(function(res) {                 
                Authentication.saveToken(res.data.token);
                Authentication.saveUser(res.data.user);
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
 

     function SettingsController($scope,Backend,ArrayUtil,Page) { 
        $scope.settings = {};
        Page.setTitle('My new title');
        $scope.directories = $scope.$parent.$parent.directories;
        console.log($scope);
        $scope.toggleformatcurrency = function() {
            if($scope.formatcurrency === undefined || !$scope.formatcurrency) {
                $scope.formatcurrency = true;
            } else {
                 $scope.formatcurrency = false;
            }
        }
        $scope.currencylist = {};
        Backend.getGeneralData('currencies').then(function(res) {
            console.log(res);
            $scope.currencylist = res;
        })
        $scope.savesettings = function(settings) {   
            var success = 0,error = 0;
            Backend.saveAllSettings(settings).then(function(res){
                Materialize.toast('Settings Saved Successfully', 4000);
            });
        }
        $scope.paymentmethods = [];         
        $scope.settings.cashondelivery_dname = 'Cash on delivery';
        $scope.settings.check_dname = 'Pay by check';
        $scope.settings.storepayment_dname = 'Pay in store';
        $scope.settings.moneyorder_dname = 'Pay by Money Order';
        $scope.settings.bankdeposit_countries = 'all';
        $scope.settings.bankdeposit_information = 'Bank Name: ACME Bank\r\nBank Branch: New York\r\nAccount Name: John Smith\r\nAccount Number: XXXXXXXXXXXX\r\nType any special instructions in here.';
        $scope.settings.bankdeposit_dname = 'Bank Deposit';


        $scope.settings = $window.settings;
        $scope.activatepayment = function(index) {
            $scope.paymentmethods.push(index);
            $scope.paymentmethods = ArrayUtil.arrayunique($scope.paymentmethods);
            console.log($scope.paymentmethods);
        } 
        $scope.deactivatepayment = function(index) {            
            $scope.paymentmethods = ArrayUtil.remove($scope.paymentmethods,index);
            console.log($scope.paymentmethods);
        }

        $scope.checkpaymentenabled = function(index) {
            var ud = $scope.paymentmethods;
            if(ud.indexOf(index) > -1) {
                return true;
            }
            return false;
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
        .controller('BackendCoreController', BackendCoreController)
        .controller('BackendController', BackendController)
        .controller('TitleController', TitleController)
        .controller('SettingController', SettingsController)
        .controller('WidgetController', WidgetController);

    BackendController.$inject = ['$scope','Global', 'Backend', '$stateParams','$rootScope','$location','$state','Authentication','$window','Product'];
    TitleController.$inject = ['$scope','Page'];
    BackendCoreController.$inject = ['$scope','getsettings','$location','$window','Authentication','$state','Backend','$stateParams','getmenus','getcurrency','getassetsdata'];
    SettingsController.$inject = ['$scope','Backend','ArrayUtil','Page'];
    WidgetController.$inject = ['$scope','ListWidget','$location','Backend','$rootScope','$state'];

})();
