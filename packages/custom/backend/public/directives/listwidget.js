(function() {
    'use strict';

    var CryptoJS = require("crypto-js");
    var secretKey = 'SHYAMPRADEEP';
    function listwidget(ListWidget) { 
        return { 
            templateUrl : 'backend/views/widget/list.html',
            replace: true,
            link : function(scope,element,attrs) { 
                scope.dbresult = ListWidget.getDbResults(); 
                scope.columns = ListWidget.getColumnsData(); 
                scope.widgetfilter = {};
                scope.widgetsearchfilter = function() {  
                    var encryptedData = CryptoJS.AES.encrypt(angular.toJson(scope.widgetfilter), secretKey).toString();
                    console.log(ListWidget.getRequestParams());
                    var params = angular.merge(ListWidget.getRequestParams(),{page : 1, filter : encryptedData});
                   
                   ListWidget.request({page : 1, filter : encryptedData}).then(function(res) {
                        ListWidget.setTotalItems(res.data.total)
                                 .setPage(1)
                                .setDBResults(res.data.docs);   
                        scope.pager = ListWidget.getPager();  
                        scope.dbresult = ListWidget.getDbResults();
                   });
                }
                scope.resetwidgetsearchfilter = function() {

                   ListWidget.request({page : 1},['filter']).then(function(res) {
                        ListWidget.setTotalItems(res.data.total)
                                 .setPage(1)
                                .setDBResults(res.data.docs);   
                        scope.pager = ListWidget.getPager();  
                        scope.dbresult = ListWidget.getDbResults();
                   });
                }
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
                    return '';
                }
            } 

        }
    }

    function widgetCustomRender($parse) {
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
                return ListWidget.getColumn(k).renderRow(data);
            }
            return '';
        }
    }

    function columnfilter(ListWidget,$sce) {
        return function(k) {  
            var column = ListWidget.getColumn(k); 
            if(typeof column != 'undefined') { 
                return ListWidget.getColumn(k).renderFilter();
            }
            return '';
        }
    }

    function widgetFilterText($parse) {
        return { 
            templateUrl : 'backend/views/widget/filter/text.html', 
            link : function(scope,element,attrs) {  
                scope.filtername = attrs.index;
            }

        }
    }

    function widgetFilterNumber($parse) {
        return { 
            templateUrl : 'backend/views/widget/filter/number.html', 
            link : function(scope,element,attrs) {  
                scope.filtername = attrs.index;
            }

        }
    }
    function widgetFilterSelect(ListWidget) {
        return { 
            templateUrl : 'backend/views/widget/filter/select.html', 
            link : function(scope,element,attrs) { 
                scope.filtername = attrs.index;
                var data = ListWidget.getColumn(attrs.index).data;
                if(typeof data.options != 'undefined') { 
                    scope.items = data.options;
                } 
            }

        }
    }

    function widgetPagination(ListWidget) {
        return { 
            restrict: 'A', 
            templateUrl : 'backend/views/widget/pager.html', 
            link : function(scope,element,attrs) { 
                //$scope = scope;
                 
               
            }

        }
    }


    angular
        .module('mean.backend')
        .directive('listwidget', listwidget)        
        .filter('columnrender',['ListWidget','$sce',columnrender])
        .filter('columnfilter',['ListWidget','$sce',columnfilter])
        .directive('widgetCustomRender', widgetCustomRender)
        .directive('widgetFilterText', widgetFilterText)
        .directive('widgetFilterNumber', widgetFilterNumber)
        .directive('widgetFilterSelect', ['ListWidget',widgetFilterSelect])
        .directive('widgetPagination',['ListWidget',widgetPagination]);

    listwidget.$inject = ['ListWidget'];
 

})();
