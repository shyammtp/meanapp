(function() {
    'use strict';

    function listwidget(ListWidget) { 
        return { 
            templateUrl : 'backend/views/widget/list.html',
            link : function(scope,element,attrs) { 
                scope.dbresult = ListWidget.getDbResults(); 
            }

        }
    }

    angular
        .module('mean.backend')
        .directive('listwidget', listwidget);

    listwidget.$inject = ['ListWidget'];
 

})();
