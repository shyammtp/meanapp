(function() {
    'use strict';

    function Theme($stateProvider) {
        $stateProvider.state('theme example page', {
            url: '/theme/example',
            templateUrl: 'theme/views/index.html'
        }).state('theme circles example', {
            url: '/theme/example/:circle',
            templateUrl: 'theme/views/example.html'
        });
    }

    angular
        .module('mean.theme')
        .config(Theme);

    Theme.$inject = ['$stateProvider'];

})();
