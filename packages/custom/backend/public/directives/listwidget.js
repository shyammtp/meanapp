(function() {
    'use strict';

    function listwidget(ListWidget) { 
        return { 
            templateUrl : 'backend/views/widget/list.html',
            replace: true,
            link : function(scope,element,attrs) { 
                scope.dbresult = ListWidget.getDbResults(); 
                scope.columns = ListWidget.getColumnsData();
                console.log( scope.columns);
                scope.getColumnRenderStatus = function(k) {
                    var c = ListWidget.getColumn(k);
                    if(typeof c.data.render!='undefined') {
                        return true;
                    }
                    return false;
                } 
                scope.getColumnRender = function(k) {
                    var c = ListWidget.getColumn(k); 
                    if(typeof c.data.render!='undefined') {
                        return c.data.render;
                    }
                    return 'ss';
                }
            } 

        }
    }

    function widgetCustomRender($parse) {
        return { 
            template : '<div ng-include="getContentUrl()"></div>', 
            link : function(scope,element,attrs) { 
                console.log(attrs);
                console.log($parse(attrs.rowObject)(scope));
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
