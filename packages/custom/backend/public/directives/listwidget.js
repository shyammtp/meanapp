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

    function columnrender(ListWidget) {
        return function(k) {
            return ListWidget.getColumn(k).renderRow();
        }
    }

    angular
        .module('mean.backend')
        .directive('listwidget', listwidget)
        .filter('columnrender',['ListWidget',columnrender]);

    listwidget.$inject = ['ListWidget'];
 

})();
