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
             
        })
         .state('products_category', {
            url: '/admin/products/category',
            templateUrl: 'backend/views/products/category/list.html',
            params: {title : 'Products Category',breadcrumbs : [{title : 'Home', link:'admin/dashboard'},{title : 'Products', link: 'admin/products'},{title : 'Category'}]},
             
        })
          .state('products_catalog', {
            url: '/admin/products/catalog',
            templateUrl: 'backend/views/products/catalog/list.html',
            params: {title : 'Products Catalog',breadcrumbs : [{title : 'Home', link:'admin/dashboard'},{title : 'Products', link: 'admin/products'},{title : 'Add a product'}]},
             
        })
         .state('products_catalog_step1', {
            url: '/admin/products/catalog/classify',
            templateUrl: 'backend/views/products/catalog/classify.html',
            params: {title : 'Products Catalog',breadcrumbs : [{title : 'Home', link:'admin/dashboard'},{title : 'Products', link: 'admin/products'},{title : 'Add a product'}]},
             
        })
 
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
