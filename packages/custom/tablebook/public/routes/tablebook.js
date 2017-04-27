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
                url : '/admin/tables?floorid',
                templateUrl: 'tablebook/views/'+theme+'/tablebook/design.html',
                params: {title : 'Table Design',hasheader : 'false',fullwidth : true,breadcrumbs : [{title : 'Home', link:'admin/dashboard'},{title : 'Floor Plan'}]},
             })
          );
       $locationProvider
            .html5Mode({enabled:true, requireBase:false});
    }

    function Run($rootScope, $state, $location,Authentication,Backend,$window) { 
         
        $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) { 
            console.log(toState);
        })

         
    }

    angular
        .module('mean.tablebook')
        .config(Tablebook)
        .run(Run);

    Run.$inject = ['$rootScope','$state','$location','Authentication','Backend','$window'];
    Tablebook.$inject = ['$stateProvider','$locationProvider','$urlRouterProvider','AuthenticationProvider','BackendProvider'];

})();
