(function() {
    'use strict';

    function Column() {
        return {
            data : {},
            setData : function(data) {
                this.data = data;
                return this;
            },
            setWidget : function(obj) {
                this.list = obj;
                return this;
            },
            renderType : function() {
                switch(this.data.type) {
                    case 'text':
                    return ""
                    break;
                }
            },
            renderRow : function() 
            {

            }
        }
    }

    function Widget($http, $q,WidgetColumn) {   
        return { 
            columns : {},
            dbResults : [],
            addColumn : function(columnname, columndata) {
                if(!columnname) {
                    return this;
                }
                this.columns[columnname] = WidgetColumn.setData(columndata);
                return this;
            },
            getColumns : function() { 
                console.log(this.columns);
                return this.columns;
            },
            setDBResults : function(data) {
                this.dbResults = data;
                return this;
            },
            getDbResults : function() {
                return this.dbResults;
            },
        };
    }

    angular
        .module('mean.backend')
        .factory('WidgetColumn', Column)
        .factory('ListWidget', Widget);

    Widget.$inject = ['$http', '$q','WidgetColumn'];

})();
