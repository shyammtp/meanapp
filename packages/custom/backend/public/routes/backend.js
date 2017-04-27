(function() {
    'use strict'; 
    function Backend($stateProvider,$locationProvider,$urlRouterProvider,AuthenticationProvider) {
      
        var Authentication = AuthenticationProvider.$get();

        var defal = {resolve : {
                getsettings : function(Backend) {
                  console.log("Authtoken",Authentication.getToken());
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
            //console.log($locationProvider);
        $urlRouterProvider.otherwise('/admin/dashboard');
        $stateProvider.state('login',angular.extend({},{},{
                url: '/admin/login',
                templateUrl: 'backend/views/'+theme+'/login.html',
                params: {title : 'Login'}
            })
        )


        .state('dashboard', angular.extend({},defal, {
                url: '/admin/dashboard',
                templateUrl: 'backend/views/'+theme+'/page/dashboard.html',
                params: {title : 'Dashboard',openaccess : true}
            })
        )
        
 
 

        .state('general_settings', 
            angular.extend({},defal, {
                url: '/admin/settings/general',
                templateUrl: 'backend/views/'+theme+'/settings/general.html',
                params: {title : 'General Settings',breadcrumbs : [{title : 'Home', link:'admin/dashboard'},{title : 'Settings', link: 'admin/settings'},{title : 'General'}]},
                 
            })
        )
        .state('directory_management', 
            angular.extend({},defal, {
                url: '/admin/settings/directory',
                templateUrl: 'backend/views/'+theme+'/settings/directory/list.html',
                params: {title : 'General Settings',breadcrumbs : [{title : 'Home', link:'admin/dashboard'},{title : 'Settings', link: 'admin/settings'},{title : 'General'}]},
                 
            })
        )
        .state('payment_settings', angular.extend({},defal, {
            url: '/admin/settings/payments',
            templateUrl: 'backend/views/'+theme+'/settings/payments.html',
            params: {title : 'Payment Settings',breadcrumbs : [{title : 'Home', link:'admin/dashboard'},{title : 'Settings', link: 'admin/settings'},{title : 'Payments'}]},
             
        })
        )

        .state('settings_notification_template', angular.extend({},defal,  {
            url: '/admin/settings/template',
            templateUrl: 'backend/views/'+theme+'/settings/template/list.html',
            params: {title : 'Notification Template',breadcrumbs : [{title : 'Home', link:'admin/dashboard'},{title : 'Settings', link: 'admin/settings'},{title : 'Notification Template'}]},
             
        })
        )
         .state('products_category', angular.extend({},defal,  {
                url: '/admin/products/category',
                templateUrl: 'backend/views/'+theme+'/products/category/list.html',
                params: {title : 'Products Category',breadcrumbs : [{title : 'Home', link:'admin/dashboard'},{title : 'Products', link: 'admin/products/catalog'},{title : 'Category'}]},
                 
            })
         )
          .state('products_catalog', angular.extend({},defal,{
            url: '/admin/products/catalog?view',
            templateUrl: 'backend/views/'+theme+'/products/catalog/list.html',
            params: {title : 'Products Catalog',breadcrumbs : [{title : 'Home', link:'admin/dashboard'},{title : 'Products', link: 'admin/products/catalog'},{title : 'Add a product'}]}
        }))
         .state('products_catalog_step1', 
            angular.extend({},defal,{
            url: '/admin/products/catalog/classify',
            templateUrl: 'backend/views/'+theme+'/products/catalog/classify.html',
            params: {title : 'Products Catalog',breadcrumbs : [{title : 'Home', link:'admin/dashboard'},{title : 'Products', link: 'admin/products/catalog'},{title : 'Add a product'}]},
             
        })
        ) 
        .state('product_catalog_info', 
            angular.extend({},defal, {
                url : '/admin/products/catalog/information',
                templateUrl: 'backend/views/'+theme+'/products/catalog/information.html',
                params: {title : 'Products Catalog',breadcrumbs : [{title : 'Home', link:'admin/dashboard'},{title : 'Products'}]},
             })
        )
         .state('product_catalog_editmode',
            angular.extend({},defal, {
                url : '/admin/products/catalog/information/{product_id}',
                templateUrl: 'backend/views/'+theme+'/products/catalog/information.html',
                params: {title : 'Products Catalog',breadcrumbs : [{title : 'Home', link:'admin/dashboard'},{title : 'Products', link: 'admin/products/catalog'},{title : 'Add a product'}]},
             })

          )
         .state('product_catalog_attributes_list',
             angular.extend({},defal,  {
                url : '/admin/products/catalog/attributes',
                templateUrl: 'backend/views/'+theme+'/products/catalog/attributes/list.html',
                params: {title : 'Products Catalog Attributes',breadcrumbs : [{title : 'Home', link:'admin/dashboard'},{title : 'Products'}]},
             })
         )
          .state('product_catalog_attributes_classify',     
             angular.extend({},defal,  {
                url : '/admin/products/catalog/attributes/classify',
                templateUrl: 'backend/views/'+theme+'/products/catalog/attributes/classify.html',
                params: {title : 'Products Catalog Attributes',breadcrumbs : [{title : 'Home', link:'admin/dashboard'},{title : 'Products', link: 'admin/products/catalog'},{title : 'Add a product'}]},
             })

          )
          .state('product_catalog_attributes_form',
            angular.extend({},defal,  {
                url : '/admin/products/catalog/attributes/form',
                templateUrl: 'backend/views/'+theme+'/products/catalog/attributes/form.html',
                params: {title : 'Products Catalog Attribute Form',breadcrumbs : [{title : 'Home', link:'admin/dashboard'},{title : 'Products', link: 'admin/products'},{title : 'Add a product'}]},
             })

           )
          .state('product_catalog_attributes_copy_classify', 
            angular.extend({},defal,  {
                url : '/admin/products/catalog/attributes/copy',
                templateUrl: 'backend/views/'+theme+'/products/catalog/attributes/copy/classify.html',
                params: {title : 'Products Catalog Attribute Form', hasheader : 'false',breadcrumbs : [{title : 'Home', link:'admin/dashboard'},{title : 'Products', link: 'admin/products'},{title : 'Add a product'}]},
             })

            )
          .state('product_catalog_attributes_copy_form', 
            angular.extend({},defal,  {
                url : '/admin/products/catalog/attributes/copy/form',
                templateUrl: 'backend/views/'+theme+'/products/catalog/attributes/copy/form.html',
                params: {title : 'Products Catalog Attribute Form',hasheader : 'false',breadcrumbs : [{title : 'Home', link:'admin/dashboard'},{title : 'Products', link: 'admin/products'},{title : 'Add a product'}]},
             })
          )
          .state('product_catalog_variants', 
            angular.extend({},defal,  {
                url : '/admin/products/catalog/variants',
                templateUrl: 'backend/views/'+theme+'/products/catalog/variants/list.html',
                params: {title : 'Products Catalog Variants',breadcrumbs : [{title : 'Home', link:'admin/dashboard'},{title : 'Products', link: 'admin/products'},{title : 'Variants'}]},
             })

          )
          .state('product_catalog_variants_form', 
            angular.extend({},defal,  {
                url : '/admin/products/catalog/variants/form',
                templateUrl: 'backend/views/'+theme+'/products/catalog/variants/form.html',
                params: {title : 'Create new variant',breadcrumbs : [{title : 'Home', link:'admin/dashboard'},{title : 'Products', link: 'admin/products'},{title : 'Variants','link' : '/admin/products/catalog/variants'},{title : 'Add/Edit Variants'}]},
             })
           )
          .state('product_catalog_variants_form_edit',angular.extend({},defal,   {
                url : '/admin/products/catalog/variants/form/{variantid}',
                templateUrl: 'backend/views/'+theme+'/products/catalog/variants/form.html',
                params: {title : 'Create new variant',breadcrumbs : [{title : 'Home', link:'admin/dashboard'},{title : 'Products', link: 'admin/products'},{title : 'Variants','link' : '/admin/products/catalog/variants'},{title : 'Add/Edit Variants'}]},
             })
             )
          .state('product_catalog_variants_set_list', angular.extend({},defal,   {
                url : '/admin/products/catalog/variants/set',
                templateUrl: 'backend/views/'+theme+'/products/catalog/variants/set/list.html',
                params: {title : 'Product catalog variants set',breadcrumbs : [{title : 'Home', link:'admin/dashboard'},{title : 'Products', link: 'admin/products'},{title : 'Variants Set'}]},
             })
          ).state('product_catalog_variants_set_form', angular.extend({},defal,   {
                url : '/admin/products/catalog/variants/set/form',
                templateUrl: 'backend/views/'+theme+'/products/catalog/variants/set/form.html',
                params: {title : 'Create new variant set',breadcrumbs : [{title : 'Home', link:'admin/dashboard'},{title : 'Products', link: 'admin/products'},{title : 'Variants set','link' : '/admin/products/catalog/variants/set'},{title : 'Add/Edit Variants'}]},
             })
          )
          .state('product_catalog_variants_set_form_edit', angular.extend({},defal,   {
                url : '/admin/products/catalog/variants/set/form/{variantid}',
                templateUrl: 'backend/views/'+theme+'/products/catalog/variants/set/form.html',
                params: {title : 'Create new variant set',breadcrumbs : [{title : 'Home', link:'admin/dashboard'},{title : 'Products', link: 'admin/products'},{title : 'Variants Set','link' : '/admin/products/catalog/variants/set'},{title : 'Add/Edit Variants'}]},
             })
          ).state('product_catalog_variants_set_rules_edit', 
           angular.extend({},defal,  {
                url : '/admin/products/catalog/variants/set/rules/{variantid}',
                templateUrl: 'backend/views/'+theme+'/products/catalog/variants/set/rules/list.html',
                params: {title : 'Create new variant set',breadcrumbs : [{title : 'Home', link:'admin/dashboard'},{title : 'Products', link: 'admin/products'},{title : 'Variants Set','link' : '/admin/products/catalog/variants/set'},{title : 'Manage Rules'}]},
             })
           )
          .state('admin_food_menus', angular.extend({},defal,   {
                url : '/admin/menus',
                templateUrl: 'backend/views/'+theme+'/menus/index.html',
                params: {title : 'Menus',breadcrumbs : [{title : 'Home', link:'admin/dashboard'},{title : 'Menus'}]},
             })
          )
          .state('admin_food_items', angular.extend({},defal,   {
                url : '/admin/menus/items',
                templateUrl: 'backend/views/'+theme+'/menus/items/index.html',
                params: {title : 'Items',breadcrumbs : [{title : 'Home', link:'admin/dashboard'},{title : 'Menus',link : 'admin/menus'},{title : 'items'}]},
             })
          )
           .state('admin_food_orders', angular.extend({},defal,   {
                url : '/admin/orders/live',
                templateUrl: 'backend/views/'+theme+'/orders/live.html',
                params: {title : 'Items',hasheader : 'false',breadcrumbs : [{title : 'Home', link:'admin/dashboard'},{title : 'Menus',link : 'admin/menus'},{title : 'items'}]},
             })
          )
           .state('admin_food_orders_items', angular.extend({},defal,   {
                url : '/admin/orders/items/live/{cartid}',
                templateUrl: 'backend/views/'+theme+'/orders/items/live.html',
                params: {title : 'Items',hasheader : 'false',breadcrumbs : [{title : 'Home', link:'admin/dashboard'},{title : 'Menus',link : 'admin/menus'},{title : 'items'}]},
             })
          ).state('admin_customers', angular.extend({},defal,   {
                url : '/admin/customers',
                templateUrl: 'backend/views/'+theme+'/users/list.html',
                params: {title : 'Customers',breadcrumbs : [{title : 'Home', link:'admin/dashboard'},{title : 'Customers'}]},
             })
          ).state('admin_order_place_list', angular.extend({},defal,   {
                url : '/admin/orders/place?user',
                templateUrl: 'backend/views/'+theme+'/orders/new.html',
                params: {title : 'New Order',breadcrumbs : [{title : 'Home', link:'admin/dashboard'},{title : 'New Order'}]},
             })
          )
          .state('admin_order_place_payment', angular.extend({},defal,   {
                url : '/admin/orders/place/payment',
                templateUrl: 'backend/views/'+theme+'/orders/payment.html',
                params: {title : 'New Order',breadcrumbs : [{title : 'Home', link:'admin/dashboard'},{title : 'New Order'}]},
             })
          )
          .state('admin_delivery_charges', angular.extend({},defal,   {
                url : '/admin/delivery/charges',
                templateUrl: 'backend/views/'+theme+'/menus/delivery/charges/list.html',
                params: {title : 'New Order',breadcrumbs : [{title : 'Home', link:'admin/dashboard'},{title : 'New Order'}]},
             })
          )

          .state('admin_order_list', angular.extend({},defal,   {
                url : '/admin/orders/list',
                templateUrl: 'backend/views/'+theme+'/orders/list.html',
                params: {title : 'New Order', permissionindex : 'manageorders',breadcrumbs : [{title : 'Home', link:'admin/dashboard'},{title : 'New Order'}]},
             })
          ) 
          ;
        $locationProvider
            .html5Mode({enabled:true, requireBase:false});
          
    }
    var adminconfig;
    function Run($rootScope, $state, $location,Authentication,Backend,$window) { 
        Backend.getAdminConfig('openaccess').then(function(response) {
            adminconfig = response.data;
        })


        $rootScope.backend = Backend;
        $rootScope.assetspath = Backend.getassetpath();
        $rootScope.theme = theme; 
        $rootScope.preloader = false;
        $rootScope.$on('$stateChangeStart', function(event, nextRoute, currentRoute) {  
            /*if(nextRoute.name === 'general_settings') {
                return $location.path('/access/denied');
            }*/
            $rootScope.preloader = true;
//            console.log(Authentication.getToken());
            if(Authentication.isLoggedIn()) {
                if(nextRoute.name === 'login') { 
                    $window.location.href = 'admin/dashboard';
                    return;
                }
            }
            if(!Authentication.isLoggedIn()) {  
                if(nextRoute.name !== 'login') { 
                    $window.location.href = 'admin/login';
                   return $state.go('login');
                }
            }
            return; 

        });
        $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
            $rootScope.preloader = false;
            $rootScope.pageTitle = toState.params.title;
            console.log(toState);
        })

        $rootScope.checkmoduleexists = function(name) {
            if(!name) {
                return true;
            }
          try {
                return !!angular.module(name);    
              } catch (e) {
          }
        }
    }

    angular
        .module('mean.backend')
        .config(Backend)
        .run(Run);

    Run.$inject = ['$rootScope','$state','$location','Authentication','Backend','$window'];
    Backend.$inject = ['$stateProvider','$locationProvider','$urlRouterProvider','AuthenticationProvider','BackendProvider'];

})();
