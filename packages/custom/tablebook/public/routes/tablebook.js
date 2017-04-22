(function() {
    'use strict';

    function Tablebook($stateProvider,$locationProvider,$urlRouterProvider,AuthenticationProvider,BackendProvider) {
        var Authentication = AuthenticationProvider.$get();
        var Backend = BackendProvider.$get();
        var defal = {resolve : {
                getsettings : function(Backend) {
                  if(Authentication.getToken()) {
                    return Backend.getSettings(Authentication.getRestaurantId());
                  }
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
        $stateProvider.state('admin_tables', angular.extend({},defal,   {
                url : '/admin/tables',
                templateUrl: 'tablebook/views/'+theme+'/tablebook/design.html',
                params: {title : 'Table Design',hasheader : 'false',breadcrumbs : [{title : 'Home', link:'admin/dashboard'},{title : 'Floor Plan'}]},
             })
          );
       $locationProvider
            .html5Mode({enabled:true, requireBase:false});
    }

    angular
        .module('mean.tablebook')
        .config(Tablebook);

    Tablebook.$inject = ['$stateProvider','$locationProvider','$urlRouterProvider','AuthenticationProvider','BackendProvider'];

})();
