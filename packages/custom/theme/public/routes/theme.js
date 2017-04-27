(function() {
    'use strict';

    function Theme($stateProvider,$locationProvider,$urlRouterProvider) {
         
         

        //$viewPathProvider.override('backend/views/'+theme+'/orders/list.html', 'backend/views/'+theme+'/orders/lists.html');

        $locationProvider
            .html5Mode({enabled:true, requireBase:false});
    }

    

    angular
        .module('mean.theme')
        .config(Theme) ;

     
    Theme.$inject = ['$stateProvider','$locationProvider','$urlRouterProvider'];

})();
