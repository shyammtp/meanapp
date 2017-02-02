(function() {
    'use strict'; 
    function Backend($stateProvider,$locationProvider) {
        $stateProvider.state('login', {
            url: '/admin/login',
            templateUrl: 'backend/views/login.html'
        })


        .state('dashboard', {
            url: '/admin/dashboard',
            templateUrl: 'backend/views/page/dashboard.html',
            params: {title : 'shyam'}
        })
 

        .state('general_settings', {
            url: '/admin/settings/general',
            templateUrl: 'backend/views/settings/general.html',
            params: {title : 'General Settings',breadcrumbs : [{title : 'Home', link:'admin/dashboard'},{title : 'Settings', link: 'admin/settings'},{title : 'General'}]},
             
        })

        .state('settings_notification_template', {
            url: '/admin/settings/template',
            templateUrl: 'backend/views/settings/template/list.html',
            params: {title : 'Notification Template',breadcrumbs : [{title : 'Home', link:'admin/dashboard'},{title : 'Settings', link: 'admin/settings'},{title : 'Notification Template'}]},
             
        });
        ;
        $locationProvider
            .html5Mode({enabled:true, requireBase:false});
          
    }
    var adminconfig;
    function Run($rootScope, $state, $location,Authentication,Backend) { 
        Backend.getAdminConfig('openaccess').then(function(response) {
            adminconfig = response.data;
        })
        $rootScope.$on('$stateChangeStart', function(event, nextRoute, currentRoute) {
            if(typeof adminconfig !== 'undefined' && adminconfig.indexOf(nextRoute.name) !== -1) {
                return;
            }
            if(nextRoute.name == 'login') {
                if(Authentication.isLoggedIn()) {
                    $location.path('/admin/dashboard');
                }
                return;
            }
            if(!Authentication.isLoggedIn()) {
                $location.path('/admin/login');
            }

        });
    }

    angular
        .module('mean.backend')
        .config(Backend)
        .run(Run);

    Run.$inject = ['$rootScope','$state','$location','Authentication','Backend'];
    Backend.$inject = ['$stateProvider','$locationProvider'];

})();
