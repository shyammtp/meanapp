(function() {
    'use strict';

    /* jshint -W098 */
    function TitleController($scope,Page) {
         $scope.Page = Page;  
         $scope.shyam = 'shyam'; 
    }

    function BackendCoreController($scope,getsettings,$location,$window,Authentication,$state,Backend,$stateParams,getmenus,getcurrency,getassetsdata) { 
        $window.settings = {};
        angular.forEach(getsettings.data,function(v,e){
            $window.settings[v.name] = v.value;
        });
        $window.menus = getmenus.data; 
        $window.current_currency = getcurrency; 
        $window.assetsdata = getassetsdata; 
        console.log($state);
        console.log($window.settings);
           
    }



    function BackendController($scope, Global, Backend, $stateParams,$rootScope,$location,$state, Authentication,$window,Product,$timeout,ItemMenus) {
       

        var bm = this;   
        bm.credentials = {
            email : '',
            password: ''
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
            if($state.current.name === 'login'){
                return false;
            }
            if($state.current.name !== '/admin/login')  {
                if(params.hasheader === 'false') {
                    return false;
                }
            } else {
                return false;
            }
            return true;
        }
        if($state.current.name === 'login'){
            return false;
        }
         $scope.shyam = 'shyam';
        $scope.$on('child', function (event, data) {
            if(typeof data.externaljs!== 'undefined') {
                $scope.externaljs = data.externaljs;
            } 
        }); 
        $scope.assetspath = Backend.getassetpath(); 
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
        $scope.placeneworder = function() {
            Materialize.toast('Click on Add order for the respected customer', 5000);
            $location.path('/admin/customers');
        }
        $scope.assetspath = '/theme/assets/lib/black/';
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
 

        $scope.switchtoorder = function() {
            $location.path('/admin/orders/list');
        }
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

        $scope.logout = function() {
            Authentication.logout();
            $state.go('login'); 
            Materialize.toast('Logged out Successfully', 4000);            
        } 
        /*$scope.loadScript = function(url, type, charset) {
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
        };*/

    } 
 

     function SettingsController($scope,Backend,ArrayUtil,Page,$window,Authentication) { 
        $scope.settings = {};
        Page.setTitle('My new title');
        $scope.directories = $scope.$parent.$parent.directories;
        $scope.settings = $window.settings;
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
        
        $scope.paymentmethods = [];         
        $scope.settings.cashondelivery_dname = 'Cash on delivery';
        $scope.settings.check_dname = 'Pay by check';
        $scope.settings.storepayment_dname = 'Pay in store';
        $scope.settings.moneyorder_dname = 'Pay by Money Order';
        $scope.settings.bankdeposit_countries = 'all';
        $scope.settings.bankdeposit_information = 'Bank Name: ACME Bank\r\nBank Branch: New York\r\nAccount Name: John Smith\r\nAccount Number: XXXXXXXXXXXX\r\nType any special instructions in here.';
        $scope.settings.bankdeposit_dname = 'Bank Deposit';


        $scope.activatepayment = function(index) {
            $scope.paymentmethods.push(index);
            $scope.settings[index] = true;
            $scope.paymentmethods = ArrayUtil.arrayunique($scope.paymentmethods);
            console.log($scope.paymentmethods);
        } 
        $scope.deactivatepayment = function(index) {            
            $scope.paymentmethods = ArrayUtil.remove($scope.paymentmethods,index);
            $scope.settings[index] = false;
            console.log($scope.paymentmethods);
        }

        $scope.checkpaymentenabled = function(index) {
            if(ArrayUtil.get($scope.settings,index) === "true") {
                $scope.paymentmethods.push(index);
                $scope.paymentmethods = ArrayUtil.arrayunique($scope.paymentmethods);
            }
            var ud = $scope.paymentmethods;
            if(ud.indexOf(index) > -1) {
                return true;
            }
            return false;
        }

         $scope.savesettings = function(settings) {   
            var success = 0,error = 0;

            Backend.saveAllSettings(settings,Authentication.getRestaurantId()).then(function(res){ 
                var ds = {}; 
                angular.forEach(res.data.data,function(v,k) {
                    ds[v.name] = v.value;
                }) 
                Materialize.toast('Settings Saved Successfully', 4000);
            },function(res) {
                if(res.status == 500) {
                    Materialize.toast(res.data.message, 4000,'errortoast');
                }
            });
        }

    }



     function DirectoryController($scope,ListWidget,Backend,ArrayUtil,Page,$window,$document,NgMap,ShyamGoogleMap) { 
        var vm = this,directorymap; 
        var parentdata  = {};
        parentdata.externaljs = 'backend/views/'+theme+'/products/category/js.html'; 
        $scope.$emit('child', parentdata);
        $scope.setdirectory = function(map) {
            directorymap = map;
        }
        $scope.directory = {}; 
        $scope.directory.sorting = 1;
        $scope.getdirectoryMap = function(id) { 
            if(typeof directorymap[id] != 'undefined') {
                var c = directorymap[id]; 
                var address = ArrayUtil.get(c,'name');
                if(ArrayUtil.get(c,'address_value')) {
                    address = address+","+ArrayUtil.get(c,'address_value');
                }
                if(ShyamGoogleMap.getMap()) { 
                    ShyamGoogleMap.addressMap(address);
                    if(ArrayUtil.get(c,'zonebox')) {
                        ShyamGoogleMap.loadPolygonData(ArrayUtil.get(c,'zonebox'));
                    }
                }
                vm.data = c;
                vm.addresskeyword = address;

                this.directory['edit'] = ArrayUtil.get(c,'name');
                this.directory['level'] = ArrayUtil.get(c,'level');
                this.directory['directory_name'] = ArrayUtil.get(c,'name');
                this.directory['directory_id'] = ArrayUtil.get(c,'_id');  
                this.directory['sorting'] = ArrayUtil.get(c,'sorting');  
                this.directory['parent_id'] = this.directory['parent_url'] = '';
            }  
        } 
        //$scope.googleMapsUrl="https://maps.googleapis.com/maps/api/js?key=AIzaSyCjoi5ll46SSCWaMA-SpwvAyVGKziIcuBw";

        NgMap.getMap().then(function(map) { 
            ShyamGoogleMap.init(map);
            ShyamGoogleMap.loadDrawing(vm); 

        });

        vm.drawresponse = function(coor) {
            console.log(coor);
            $scope.directory['zonebox'] = coor;
        }

        $scope.addnewdirectory = function(cat) { 
            $scope.directory = {};
            var c = ArrayUtil.get(directorymap,ArrayUtil.get(cat,'directory_id'),{}); 
            $scope.directory['edit'] = '';
            $scope.directory['sorting'] =  ArrayUtil.get(cat,'sorting');
            $scope.directory['parent_directory_name'] =  ArrayUtil.get(cat,'directory_name');
            $scope.directory['parent_id'] = ArrayUtil.get(cat,'directory_id'); 
        }
        $scope.directoryupdated = false;
        $scope.savedirectory = function(cat) { 
            if(ArrayUtil.get(cat,'directory_id')) {
                ShyamGoogleMap.clearSelection();
            }
            var params = {}; 
            if(ArrayUtil.get(cat,'parent_id')) {
                params['parent'] = ArrayUtil.get(cat,'parent_id');
            }
            params['directory_name'] = ArrayUtil.get(cat,'directory_name');
            params['sorting'] = ArrayUtil.get(cat,'sorting');
            params['zonebox'] = ArrayUtil.get(cat,'zonebox'); 

            if(ArrayUtil.get(cat,'directory_id')) params['directory_id'] = ArrayUtil.get(cat,'directory_id');
            Backend.saveDirectory(params).then(function(res) {
                 Materialize.toast("Directory Updated", 4000);
                 $scope.directoryupdated = true;
                  $scope.directory = {};
                    $scope.directory.sorting = 1;
                },function(err) {
                    if(err.status == 500) {
                        Materialize.toast(ArrayUtil.get(ArrayUtil.get(err,'data'),'message','directory not saved'), 4000,'errortoast');
                    } 
            });
        }
        $scope.deleteDirectory = function(cat) {
            var con = confirm('Are you sure want to delete this directory? Make sure this directory doesn\'t have any children into it');
            if(con) {
                var params = {'id' : ArrayUtil.get(cat,'directory_id')}; 
                Backend.deleteDirectory(params).then(function(res) {
                    Materialize.toast("Directory removed successfully", 4000);
                     $scope.directoryupdated = true;
                     $scope.directory = {};
                }, function(err) {
                    if(err.status == 500) {
                        Materialize.toast(ArrayUtil.get(ArrayUtil.get(err,'data'),'message','directory not deleted'), 4000,'errortoast');
                    }
                })
            }
            
        }
        $scope.addRootdirectory = function() {
            $scope.directory = {}; 
            $scope.directory.sorting = 1;
        } 

    }

    function WidgetController($scope,ListWidget,$location,Backend,$rootScope,$state,$timeout) { 
         var vm = this;  
         vm.setPage = setPage; 
         ListWidget.init();
         ListWidget.defaultSortColumn = 'template_type';
         ListWidget.addColumn('name',{'type' : 'text','title' : 'Name',defaultValue : '--',width : '30%'});
         ListWidget.addColumn('index',{'type' : 'text','title' : 'Template Index',defaultValue : '--',width : '30%'}); 
         ListWidget.addColumn('nocolumn',{'type' : 'notype','title' : 'Actions',defaultValue : '--',width : '20%',sortable : false,filterable : false,'render' : 'backend/views/'+theme+'/settings/template/renderer/actions.html'});
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
        $scope.edittemplate = {};
        
        $scope.edittemplates = function(object) {
            $scope.edittemplate = object;
            classie.toggle( document.getElementById( 'cbp-spmenu-s2' ), 'cbp-spmenu-open' );
            Backend.loadSider($scope,'cbp-spmenu-s2','backend/views/'+theme+'/settings/template/edit.html',function(scope) {
                $timeout(function() {
                    tinymce.remove();
                    tinymce.init({
                        selector : '.editortextarea',body_class : 'colorwhite',
                        menubar : false,
                        document_base_url : '/bower_components/tinymce/',
                        height:'450px',plugins: ["colorpicker code image textcolor"],
                        toolbar1: "code | insertfile undo redo | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image preview | forecolor backcolor",
                        content_css : '/theme/assets/lib/'+theme+'/css/tinymcecontent.css',
                        editor_css : '/theme/assets/lib/'+theme+'/css/tinymceeditor.css',
                        init_instance_callback: function (editor) {
                                editor.on('blur', function (e) {
                                    $scope.edittemplate['email_message'] = editor.getContent(); 
                                    
                                });
                                
                        },
                        setup: function (ed) {
                            ed.on('init', function(args) {
                                console.log('shyam');
                            });
                        } 
                    });
                })
                
            }); 
            
            angular.element('.cd-overlay').addClass('is-visible');
        }
        $scope.savetemplate = function() {
            console.log('NotificationTemplateSave',$scope.edittemplate); 
            Backend.saveTemplate($scope.edittemplate._id, $scope.edittemplate).then(function(response) {
                var data = response.data;
                if(data.success) {
                    Materialize.toast("Template updated successfully", 4000); 
                    $scope.edittemplate = {};
                    $scope.closethis();
                }
            });
        }
        $scope.closethis = function() { 
            classie.toggle( document.getElementById( 'cbp-spmenu-s2' ), 'cbp-spmenu-open' );            
            angular.element('.cd-overlay').removeClass('is-visible');
        } 
    }

    function CustomerController($scope,ListWidget,$location,Backend,$rootScope,$state,$timeout) { 
         var vm = this;  
         vm.setPage = setPage; 

         ListWidget.init();
         ListWidget.defaultSortColumn = 'name';
         ListWidget.addColumn('name',{'type' : 'text','title' : 'Name',defaultValue : '--',width : '20%'});
         ListWidget.addColumn('email',{'type' : 'text','title' : 'Email',defaultValue : '--',width : '30%'}); 
         ListWidget.addColumn('phone',{'type' : 'text','title' : 'Phone',defaultValue : '--',width : '30%'}); 
         ListWidget.addColumn('nocolumn',{'type' : 'notype','title' : 'Actions',defaultValue : '--',width : '20%',sortable : false,filterable : false,'render' : 'backend/views/'+theme+'/users/renderer/actions.html'});
         ListWidget.setDataRequestUrl('/api/users/get'); 
         
        function setPage(page) { 
            if(page < 1) {
                page = 1;
            }
            ListWidget.request({page: page,limit : 20,passtoken : true}).then(function(res){  
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
        $scope.user = {};
        $scope.isedit = false;
        $scope.edituser = function(object) { 
            $scope.isedit = true;
            $scope.user = object; 
            classie.toggle( document.getElementById( 'cbp-spmenu-s2' ), 'cbp-spmenu-open' );
            Backend.loadSider($scope,'cbp-spmenu-s2','backend/views/'+theme+'/users/edit.html'); 
            angular.element('.cd-overlay').addClass('is-visible');
        }
        $scope.addUser = function() { 
            $scope.isedit = false;
            $scope.user = {};
            classie.toggle( document.getElementById( 'cbp-spmenu-s2' ), 'cbp-spmenu-open' );
            Backend.loadSider($scope,'cbp-spmenu-s2','backend/views/'+theme+'/users/edit.html'); 
            angular.element('.cd-overlay').addClass('is-visible');
        }
        $scope.saveUser = function() {
            Backend.saveUser($scope.user).then(function(response) {
                var data = response.data;
                if(data.success) {
                    Materialize.toast(data.message, 4000); 
                    $scope.user = {};
                    $scope.closethis();
                } else {
                     Materialize.toast('Problem while saving', 4000,'errortoast');
                }
            },function(err) {
                if(err.status == 500) {
                    Materialize.toast(err.data.message, 2000,'errortoast');
                }
            });
        }
        $scope.closethis = function() { 
            classie.toggle( document.getElementById( 'cbp-spmenu-s2' ), 'cbp-spmenu-open' );            
            angular.element('.cd-overlay').removeClass('is-visible');
        }
    }



    function DashboardController($scope, Global, Backend, $stateParams,$rootScope,$location,$state, Authentication,$window,Product,$timeout,ItemMenus,moment) {
         
        var bm = this;     
        $scope.operational = {};
        $scope.cstepcomplete = [];
        $scope.cstep = ''; 
        $scope.resmenus = [];
        $scope.dsettings = {};
        $scope.resitems = [];
        $scope.charges = [];
        ItemMenus.getAllMenus().then(function(res){ 
            var menus = $scope.resmenus = res.data.menus;
            if(menus.length > 0) { 
                $scope.cstepcomplete.push('step1'); 
                $scope.cstep = 'step1';  
            }
            triggerstep2();
        });
        $scope.settings = $window.settings;
        if($scope.settings.operationtimings) {
            $scope.operational = $scope.settings.operationtimings;
        }
        function triggerstep2() {
            if($scope.settings.storeaddress && $scope.settings.country && $scope.settings.minimumorderprice ) {
                $scope.cstepcomplete.push('step2'); 
                $scope.cstep = 'step2';
                triggerstep3();
            } 
        }

        $scope.savesettings = function(settings,forstep) {   
            var success = 0,error = 0;
            Backend.saveAllSettings(settings).then(function(res){ 
                var ds = {};
                angular.forEach(res.data.data,function(v,k) {
                    ds[v.name] = v.value;
                })
                $scope.settings = ds; 
                if(ds.operationtimings) {
                    $scope.operational = ds.operationtimings;
                }
                if(forstep === 'step5') {
                    triggerstep5();
                } 
                if(forstep === 'step2') { 
                    $scope.cstepcomplete.push('step2'); 
                    $scope.cstep = 'step2';
                    triggerstep3(); 
                }
                Materialize.toast('Settings Saved Successfully', 4000);
            });
        }

        function triggerstep3() {
            ItemMenus.getItems().then(function(ress) { 
                $scope.resitems = ress.data;
                if($scope.resitems.length > 0) {
                    $scope.cstepcomplete.push('step3'); 
                    $scope.cstep = 'step3';  
                    triggerstep4();
                }
            }) 
        }

        function triggerstep4() {
            ItemMenus.getAllDeliveryCharges().then(function(res){
                $scope.charges = res.data.data;
                if($scope.charges.length > 0) {
                    $scope.cstepcomplete.push('step4'); 
                    $scope.cstep = 'step4';  
                    triggerstep5();
                }
            })
        }

        $scope.submitstatus = function(settings,forstep) {
            $scope.savesettings(settings,forstep);
        }

        function triggerstep5() {
            if(typeof $scope.settings['status'] !== 'undefined' && $scope.settings['status'] === true) {
                $scope.cstepcomplete.push('step5'); 
                $scope.cstep = 'step5';
            } else {
                if ($scope.cstepcomplete.indexOf('step5') > -1) {
                    $scope.cstepcomplete.splice($scope.cstepcomplete.indexOf('step5'), 1); 
                    $scope.cstep = 'step4';
                } 
            }
        }

        $scope.checkcompletedstep = function(step) {
            if($scope.cstepcomplete.indexOf(step) > -1) {
                return true;
            }
            return false;
        }
 
        var myDate = new Date();
        var hrs = myDate.getHours();

        var greet;
        var bggreet = 0;

        if (hrs < 12) {
            greet = 'Good Morning';
            bggreet = 1;
        } 
        else if (hrs >= 12 && hrs <= 17) {
            bggreet = 2;
            greet = 'Good Afternoon';
        }
        else if (hrs >= 17 && hrs <= 24) {
            bggreet = 3;
            greet = 'Good Evening';
        }

        $scope.greet = greet;
        $scope.bggreet = bggreet;
 
        $scope.directories = [];
        Backend.getAllDirectories().then(function(response){
            $scope.directories = response.data;
        })  
        $scope.orders = []; 
         $scope.todaysales = 0; 
         var days = $scope.days = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
        $scope.$watch('operational',function() {
            angular.forEach(days,function(v,j){
                if(typeof $scope.operational[v] === 'undefined') {
                    $scope.operational[v] = {};
                }
                if(typeof $scope.form.operationalhours[v] === 'undefined') {
                   $scope.form.operationalhours[v] = {};
                }
                if($scope.operational[v].status) {
                    var from = moment('2015-12-01T'+moment($scope.operational[v].from, ["h:mmA"]).format("HH:mm")); //todays date
                    var to = moment("2015-12-01T"+moment($scope.operational[v].to, ["h:mmA"]).format("HH:mm")); // another date
                    var duration = moment.duration(to.diff(from));
                    var hrs = duration.asHours();
                    if(hrs > 0) {
                        $scope.form.operationalhours[v].$setValidity('time',true);
                    } else {
                        $scope.form.operationalhours[v].$setValidity('time',false);
                    }
                    console.log(hrs);
                } else {
                    $scope.form.operationalhours[v].$setValidity('time',true);
                }
            })
        },true)

         
        
        requorder({gettodays : true}); 

        function requorder(filter) {
            ItemMenus.getOrdersCond(filter).then(function(res){
                $scope.orders = res.data.data;
                angular.forEach($scope.orders,function(v,l){
                    if(v.priceset) {
                        $scope.todaysales += v.priceset.grandtotal;
                    }
                })

            })    
        }
        
        $scope.copytime = function(day) { 
            angular.forEach(days,function(v,j){
                if(typeof $scope.operational[v] === 'undefined') {
                    $scope.operational[v] = {};
                }
                $scope.operational[v].status = $scope.operational[day].status;
                $scope.operational[v].from = $scope.operational[day].from;
                $scope.operational[v].to = $scope.operational[day].to;
            });
        }


        $scope.saveTimings = function(operational) { 
            
            console.log(operational);     
            $scope.savesettings({'operationtimings' : JSON.stringify(operational)});
        }


    } 
 


    angular
        .module('mean.backend')
        .controller('BackendCoreController', BackendCoreController)
        .controller('CustomerController', CustomerController)
        .controller('DirectoryController', DirectoryController)
        .controller('BackendController', BackendController) 
        .controller('TitleController', TitleController)
        .controller('SettingController', SettingsController)
        .controller('DashboardController', DashboardController)
        .controller('WidgetController', WidgetController);

    BackendController.$inject = ['$scope','Global', 'Backend', '$stateParams','$rootScope','$location','$state','Authentication','$window','Product','$timeout','ItemMenus'];
    DashboardController.$inject = ['$scope','Global', 'Backend', '$stateParams','$rootScope','$location','$state','Authentication','$window','Product','$timeout','ItemMenus','moment'];
    TitleController.$inject = ['$scope','Page'];
    BackendCoreController.$inject = ['$scope','getsettings','$location','$window','Authentication','$state','Backend','$stateParams','getmenus','getcurrency','getassetsdata'];
    SettingsController.$inject = ['$scope','Backend','ArrayUtil','Page','$window','Authentication'];
    DirectoryController.$inject = ['$scope','ListWidget','Backend','ArrayUtil','Page','$window','$document','NgMap','ShyamGoogleMap'];
    WidgetController.$inject = ['$scope','ListWidget','$location','Backend','$rootScope','$state','$timeout'];
    CustomerController.$inject = ['$scope','ListWidget','$location','Backend','$rootScope','$state','$timeout']; 

})();
