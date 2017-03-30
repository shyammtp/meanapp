(function() {
    'use strict'; 
    function Backend($stateProvider,$locationProvider) {
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
        
        $stateProvider.state('login',angular.extend({},defal,{
                url: '/admin/login',
                templateUrl: 'backend/views/login.html'
            })
        )


        .state('dashboard', angular.extend({},defal, {
                url: '/admin/dashboard',
                templateUrl: 'backend/views/page/dashboard.html',
                params: {title : 'shyam'}
            })
        )
 

        .state('general_settings', 
            angular.extend({},defal, {
                url: '/admin/settings/general',
                templateUrl: 'backend/views/settings/general.html',
                params: {title : 'General Settings',breadcrumbs : [{title : 'Home', link:'admin/dashboard'},{title : 'Settings', link: 'admin/settings'},{title : 'General'}]},
                 
            })
        )
        .state('payment_settings', angular.extend({},defal, {
            url: '/admin/settings/payments',
            templateUrl: 'backend/views/settings/payments.html',
            params: {title : 'Payment Settings',breadcrumbs : [{title : 'Home', link:'admin/dashboard'},{title : 'Settings', link: 'admin/settings'},{title : 'Payments'}]},
             
        })
        )

        .state('settings_notification_template', angular.extend({},defal,  {
            url: '/admin/settings/template',
            templateUrl: 'backend/views/settings/template/list.html',
            params: {title : 'Notification Template',breadcrumbs : [{title : 'Home', link:'admin/dashboard'},{title : 'Settings', link: 'admin/settings'},{title : 'Notification Template'}]},
             
        })
        )
         .state('products_category', angular.extend({},defal,  {
                url: '/admin/products/category',
                templateUrl: 'backend/views/products/category/list.html',
                params: {title : 'Products Category',breadcrumbs : [{title : 'Home', link:'admin/dashboard'},{title : 'Products', link: 'admin/products/catalog'},{title : 'Category'}]},
                 
            })
         )
          .state('products_catalog', angular.extend({},defal,{
            url: '/admin/products/catalog',
            templateUrl: 'backend/views/products/catalog/list.html',
            params: {title : 'Products Catalog',breadcrumbs : [{title : 'Home', link:'admin/dashboard'},{title : 'Products', link: 'admin/products/catalog'},{title : 'Add a product'}]}
        }))
         .state('products_catalog_step1', 
            angular.extend({},defal,{
            url: '/admin/products/catalog/classify',
            templateUrl: 'backend/views/products/catalog/classify.html',
            params: {title : 'Products Catalog',breadcrumbs : [{title : 'Home', link:'admin/dashboard'},{title : 'Products', link: 'admin/products/catalog'},{title : 'Add a product'}]},
             
        })
        ) 
        .state('product_catalog_info', 
            angular.extend({},defal, {
                url : '/admin/products/catalog/information',
                templateUrl: 'backend/views/products/catalog/information.html',
                params: {title : 'Products Catalog',breadcrumbs : [{title : 'Home', link:'admin/dashboard'},{title : 'Products'}]},
             })
        )
         .state('product_catalog_editmode',
            angular.extend({},defal, {
                url : '/admin/products/catalog/information/{product_id}',
                templateUrl: 'backend/views/products/catalog/information.html',
                params: {title : 'Products Catalog',breadcrumbs : [{title : 'Home', link:'admin/dashboard'},{title : 'Products', link: 'admin/products/catalog'},{title : 'Add a product'}]},
             })

          )
         .state('product_catalog_attributes_list',
             angular.extend({},defal,  {
                url : '/admin/products/catalog/attributes',
                templateUrl: 'backend/views/products/catalog/attributes/list.html',
                params: {title : 'Products Catalog Attributes',breadcrumbs : [{title : 'Home', link:'admin/dashboard'},{title : 'Products'}]},
             })
         )
          .state('product_catalog_attributes_classify',     
             angular.extend({},defal,  {
                url : '/admin/products/catalog/attributes/classify',
                templateUrl: 'backend/views/products/catalog/attributes/classify.html',
                params: {title : 'Products Catalog Attributes',breadcrumbs : [{title : 'Home', link:'admin/dashboard'},{title : 'Products', link: 'admin/products/catalog'},{title : 'Add a product'}]},
             })

          )
          .state('product_catalog_attributes_form',
            angular.extend({},defal,  {
                url : '/admin/products/catalog/attributes/form',
                templateUrl: 'backend/views/products/catalog/attributes/form.html',
                params: {title : 'Products Catalog Attribute Form',breadcrumbs : [{title : 'Home', link:'admin/dashboard'},{title : 'Products', link: 'admin/products'},{title : 'Add a product'}]},
             })

           )
          .state('product_catalog_attributes_copy_classify', 
            angular.extend({},defal,  {
                url : '/admin/products/catalog/attributes/copy',
                templateUrl: 'backend/views/products/catalog/attributes/copy/classify.html',
                params: {title : 'Products Catalog Attribute Form', hasheader : 'false',breadcrumbs : [{title : 'Home', link:'admin/dashboard'},{title : 'Products', link: 'admin/products'},{title : 'Add a product'}]},
             })

            )
          .state('product_catalog_attributes_copy_form', 
            angular.extend({},defal,  {
                url : '/admin/products/catalog/attributes/copy/form',
                templateUrl: 'backend/views/products/catalog/attributes/copy/form.html',
                params: {title : 'Products Catalog Attribute Form',hasheader : 'false',breadcrumbs : [{title : 'Home', link:'admin/dashboard'},{title : 'Products', link: 'admin/products'},{title : 'Add a product'}]},
             })
          )
          .state('product_catalog_variants', 
            angular.extend({},defal,  {
                url : '/admin/products/catalog/variants',
                templateUrl: 'backend/views/products/catalog/variants/list.html',
                params: {title : 'Products Catalog Variants',breadcrumbs : [{title : 'Home', link:'admin/dashboard'},{title : 'Products', link: 'admin/products'},{title : 'Variants'}]},
             })

          )
          .state('product_catalog_variants_form', 
            angular.extend({},defal,  {
                url : '/admin/products/catalog/variants/form',
                templateUrl: 'backend/views/products/catalog/variants/form.html',
                params: {title : 'Create new variant',breadcrumbs : [{title : 'Home', link:'admin/dashboard'},{title : 'Products', link: 'admin/products'},{title : 'Variants','link' : '/admin/products/catalog/variants'},{title : 'Add/Edit Variants'}]},
             })
           )
          .state('product_catalog_variants_form_edit',angular.extend({},defal,   {
                url : '/admin/products/catalog/variants/form/{variantid}',
                templateUrl: 'backend/views/products/catalog/variants/form.html',
                params: {title : 'Create new variant',breadcrumbs : [{title : 'Home', link:'admin/dashboard'},{title : 'Products', link: 'admin/products'},{title : 'Variants','link' : '/admin/products/catalog/variants'},{title : 'Add/Edit Variants'}]},
             })
             )
          .state('product_catalog_variants_set_list', angular.extend({},defal,   {
                url : '/admin/products/catalog/variants/set',
                templateUrl: 'backend/views/products/catalog/variants/set/list.html',
                params: {title : 'Product catalog variants set',breadcrumbs : [{title : 'Home', link:'admin/dashboard'},{title : 'Products', link: 'admin/products'},{title : 'Variants Set'}]},
             })
          ).state('product_catalog_variants_set_form', angular.extend({},defal,   {
                url : '/admin/products/catalog/variants/set/form',
                templateUrl: 'backend/views/products/catalog/variants/set/form.html',
                params: {title : 'Create new variant set',breadcrumbs : [{title : 'Home', link:'admin/dashboard'},{title : 'Products', link: 'admin/products'},{title : 'Variants set','link' : '/admin/products/catalog/variants/set'},{title : 'Add/Edit Variants'}]},
             })
          )
          .state('product_catalog_variants_set_form_edit', angular.extend({},defal,   {
                url : '/admin/products/catalog/variants/set/form/{variantid}',
                templateUrl: 'backend/views/products/catalog/variants/set/form.html',
                params: {title : 'Create new variant set',breadcrumbs : [{title : 'Home', link:'admin/dashboard'},{title : 'Products', link: 'admin/products'},{title : 'Variants Set','link' : '/admin/products/catalog/variants/set'},{title : 'Add/Edit Variants'}]},
             })
          ).state('product_catalog_variants_set_rules_edit', 
           angular.extend({},defal,  {
                url : '/admin/products/catalog/variants/set/rules/{variantid}',
                templateUrl: 'backend/views/products/catalog/variants/set/rules/list.html',
                params: {title : 'Create new variant set',breadcrumbs : [{title : 'Home', link:'admin/dashboard'},{title : 'Products', link: 'admin/products'},{title : 'Variants Set','link' : '/admin/products/catalog/variants/set'},{title : 'Manage Rules'}]},
             })
           );
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
