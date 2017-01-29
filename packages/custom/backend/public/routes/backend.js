(function() {
    'use strict';

    function Backend($stateProvider,$locationProvider) {
        $stateProvider.state('admin login page', {
            url: '/admin/login',
            templateUrl: 'backend/views/login.html'
        })


        .state('admin dasboard page', {
            url: '/admin/dashboard',
            templateUrl: 'backend/views/page/dashboard.html',
            params: {title : 'shyam'}
        })
 

        .state('general settings', {
            url: '/admin/settings/general',
            templateUrl: 'backend/views/settings/general.html',
            params: {title : 'General Settings',breadcrumbs : [{title : 'Home', link:'admin/dashboard'},{title : 'Settings', link: 'admin/settings'},{title : 'General'}]},
             
        })

        .state('settings Notifiction template', {
            url: '/admin/settings/template',
            templateUrl: 'backend/views/settings/template/list.html',
            params: {title : 'Notification Template',breadcrumbs : [{title : 'Home', link:'admin/dashboard'},{title : 'Settings', link: 'admin/settings'},{title : 'Notification Template'}]},
             
        });
        ;
        $locationProvider
            .html5Mode({enabled:true, requireBase:false});
          
    }

    angular
        .module('mean.backend')
        .config(Backend);

    Backend.$inject = ['$stateProvider','$locationProvider'];

})();
