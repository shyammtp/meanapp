(function() {
    'use strict'; 
    function Roles($stateProvider,$locationProvider,$urlRouterProvider,BackendProvider) {
        var Backend = BackendProvider.$get();
     console.log(Backend);
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
                params: {title : 'New Order',breadcrumbs : [{title : 'Home', link:'admin/dashboard'},{title : 'New Order'}]},
             })
          )
          ;
        $locationProvider
            .html5Mode({enabled:true, requireBase:false});
          
    } 
     angular
        .module('mean.roles')
        .config(Roles);
     Roles.$inject = ['$stateProvider','$locationProvider','$urlRouterProvider','BackendProvider'];

})();
