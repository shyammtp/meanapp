(function() {
    'use strict';

    var inheritsFrom = function (child, parent) {
        child.prototype = Object.create(parent.prototype);
    };

     var _abstractRender = function() { 
        this._column = {};
    }
    _abstractRender.prototype.render = function(data) { 
        return data[this._column.index];
    }
    _abstractRender.prototype.setColumn = function(column) { 
        this._column = column;
        return this;
    }
    _abstractRender.prototype.getColumn = function() { 
        return this._column;
    }

    function Utility() {
        return {
            objectGet : function(object, key, de) {
                var defalt = de || '';                
                if(!object.hasOwnProperty(key)) {
                    return defalt;
                } 
                return object[key];
            }
        }
    }


    var textRender = function() {} 
    var numberRender = function() {} 

    inheritsFrom(textRender, _abstractRender);
    textRender.prototype.render = function(data) {  
        var value = _abstractRender.prototype.render.call(this,data), column = this.getColumn(); 
        if(!value) {
           value = Utility().objectGet(column,'defaultValue','---');
        }
        return value;
    }
    inheritsFrom(numberRender, _abstractRender);
    numberRender.prototype.render = function(data) { 
        var value = _abstractRender.prototype.render.call(this,data), column = this.getColumn();
        if(typeof value == 'undefined' || !value) {
            value = Utility().objectGet(column,'defaultValue','');
        }
        return value;
    }


    function Column(data){
      if (!(this instanceof Column)){
        var obj = Object.create(Column.prototype);
        return Column.apply(obj, arguments);
      }
      this.data = data; 
      this.renderRow = function(data) {
        switch(this.data.type) {
            case "text":
                var obj = new textRender();
                obj.setColumn(this.data);
                return obj.render(data);
            break;
            case "number":
                var obj = new numberRender();
                obj.setColumn(this.data);
                return obj.render(data);

        } 
        return '';
      }
      this.getData = function(key,_de) {
        var _de = _de || false;
        return Utility().objectGet(this.data,key,_de);
      }
      return this;
    }

    function Widget($http, $q,Util) {   
        return { 
            columns : {},
            dbResults : [],
            addColumn : function(columnname, columndata) {
                if(!columnname) {
                    return this;
                }  
                columndata.dindex = columnname;
                if(!columndata.hasOwnProperty('index')) {
                    columndata.index = columnname;
                }
                this.columns[columnname] = new Column(columndata);
                return this;
            },
            getColumns : function() { 
                //console.log(this.columns);
                return this.columns;
            },
            setDBResults : function(data) {
                this.dbResults = data;
                return this;
            },
            getDbResults : function() {
                return this.dbResults;
            },
            getColumn : function(columnname) {
                return this.columns[columnname];
            },
            getColumnsData: function() {
                var columns = [];
                for(var k in this.columns) {
                    if (this.columns.hasOwnProperty(k)) { 
                        columns.push(this.columns[k].data)
                    }                    
                }
                return columns;
            }
        };
    }

    angular
        .module('mean.backend') 
        .factory('Util',Utility)
        .factory('ListWidget', Widget);

    Widget.$inject = ['$http', '$q','Util'];

})();
