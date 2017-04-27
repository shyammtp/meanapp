(function() {
    'use strict'; 
    function Roles($stateProvider,$locationProvider,$urlRouterProvider,BackendProvider) {
        var Backend = BackendProvider.$get();
        var defal = {resolve : {
                getsettings : function(Backend) {
                   return Backend.getSettings(1);
                },
                getmenus : function(Backend) {
                    return Backend.getMenus();
                },
                getcurrency : function(Backend) {
                    return Backend.getGeneralData('currencies');
                },
                getassetsdata : function(Backend) {
                    return Backend.getAssetsData();
                }
            },
            controller: 'BackendCoreController as vm'};
            //console.log($locationProvider); 
        $stateProvider 
          .state('admin_permissions', angular.extend({},defal,   {
                url : '/admin/permission/roles',
                templateUrl: 'roles/views/'+theme+'/permission/roles.html',
                params: {title : 'New Order',permissionindex : 'manageroles',breadcrumbs : [{title : 'Home', link:'admin/dashboard'},{title : 'New Order'}]},
             })

          ) .state('permission_denied', angular.extend({},defal, {
                url: '/access/denied',
                templateUrl: 'roles/views/'+theme+'/page/denied.html',
                params: {title : 'Access Denied'}
            })
        );


            $locationProvider
              .html5Mode({enabled:true, requireBase:false});            
          } 

    function Run($rootScope, $state, $location,Authentication,Backend,$window,Roles) {          
        $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
            if(typeof toState.params.permissionindex === 'undefined') {
                toState.params.permissionindex = '';
            }
            if(Authentication.isLoggedIn()) {
                if(Roles.isAuthenticated(toState.params.permissionindex)) {
                    // $rootScope.accesspermission = true;
                      console.log('Authenticated');
                } else {
                    // $rootScope.accesspermission = false;
                    console.log('Not Authenticated');
                    if(toState.name !== 'permission_denied') {
                        $state.go('permission_denied');
                        $window.location.href = '/access/denied';
                        return $location.path('/access/denied');
                    }

                }
            }
        });
        var checkmoduleexists = function(name) {
            if(!name) { return true; }
            try { return !!angular.module(name);} catch (e) { }
        }
        $rootScope.accesspermission = function(index) {
            if(checkmoduleexists('mean.roles')) {
                if(Roles.isAuthenticated(index)) {
                    return true;
                }
                return false;
            } 
            return true;
        }             
    }
     angular
        .module('mean.roles')
        .config(Roles)
        .run(Run);

    Run.$inject = ['$rootScope','$state','$location','Authentication','Backend','$window','Roles','$window'];
     Roles.$inject = ['$stateProvider','$locationProvider','$urlRouterProvider','BackendProvider'];

})();
