(function() {
    'use strict';

    function listwidget(ListWidget) { 
        return { 
            templateUrl : 'backend/views/widget/list.html',
            replace: true,
            link : function(scope,element,attrs) { 
                scope.dbresult = ListWidget.getDbResults();  
                scope.columns = ListWidget.getColumns();  
            },
            compile : function(element,attrs) {
                console.log(element);
            }

        }
    }

    function widgetCustomRender() {
        return { 
            template : '<div ng-include="getContentUrl()"></div>', 
            link : function(scope,element,attrs) { 
                scope.getContentUrl = function() {
                    return attrs.template;
               } 
            }

        }
    }

    function columnrender(ListWidget,$sce) {
        return function(k,data) { 
            var column = ListWidget.getColumn(k); 
            if(typeof column != 'undefined') { 
                if(column.getData('render')) {
                    var html ="<widget-custom-render template='"+column.getData('render')+"'></widget-custom-render>";
                    return $sce.trustAsHtml('<h1>asdsa</h1>');
                }
                return ListWidget.getColumn(k).renderRow(data);
            }
            return '';
        }
    }

    angular
        .module('mean.backend')
        .directive('listwidget', listwidget)        
        .filter('columnrender',['ListWidget','$sce',columnrender])
        .directive('widgetCustomRender', widgetCustomRender);

    listwidget.$inject = ['ListWidget'];
 

})();
