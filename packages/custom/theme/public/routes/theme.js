(function() {
    'use strict';

    function Theme($stateProvider,$locationProvider,$urlRouterProvider) {
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

         

        //$viewPathProvider.override('backend/views/'+theme+'/orders/list.html', 'backend/views/'+theme+'/orders/lists.html');

        $locationProvider
            .html5Mode({enabled:true, requireBase:false});
    }

    function Run($rootScope, $state) { 
        
        var state = $state.get('admin_order_list');
        console.log(state);
        if(state) {
            //state.templateUrl = 'backend/views/'+theme+'/orders/lists.html';
        }
    }

    angular
        .module('mean.theme')
        .config(Theme)
        .run(Run);

    
    Run.$inject = ['$rootScope','$state'];
    Theme.$inject = ['$stateProvider','$locationProvider','$urlRouterProvider'];

})();
