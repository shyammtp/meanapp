(function() {
    'use strict';

    function Backend($stateProvider,$locationProvider) {
        $stateProvider.state('admin login page', {
            url: '/admin/login',
            templateUrl: 'backend/views/login.html'
        }).state('admin dasboard page', {
            url: '/admin/dashboard',
            templateUrl: 'backend/views/page/dashboard.html'
        }).state('backend circles example', {
            url: '/backend/example/:circle',
            templateUrl: 'backend/views/example.html'
        });

         $locationProvider.html5Mode(true);
    }

    angular
        .module('mean.backend')
        .config(Backend);

    Backend.$inject = ['$stateProvider','$locationProvider'];

})();
