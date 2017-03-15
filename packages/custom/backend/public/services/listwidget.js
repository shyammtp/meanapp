(function() {
    'use strict';
    var _ = require('lodash');
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
    var selectRender = function() {} 

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

    inheritsFrom(selectRender, _abstractRender);
    selectRender.prototype.render = function(data) { 
        var value = _abstractRender.prototype.render.call(this,data), column = this.getColumn();
        if(typeof value == 'object') {
            value = value.join(",");
        }
        if(typeof value == 'undefined' || !value) {
            value = Utility().objectGet(column,'defaultValue','');
        }
        return value;
    }


    var _abstractFilter = function() {this._column = {};}
    _abstractFilter.prototype.setColumn = function(column) { 
        this._column = column;
        return this;
    }
    _abstractFilter.prototype.getColumn = function() { 
        return this._column;
    }

    var textFilter = function() {}
    inheritsFrom(textFilter, _abstractFilter);
    textFilter.prototype.render = function() {
        return "<text-filter></text-filter>";
    };

    function Column(data){
      if (!(this instanceof Column)){
        var obj = Object.create(Column.prototype);
        return Column.apply(obj, arguments);
      }
      this.data = data; 
      this.renderRow = function(data) {
        if(this.data.type == 'notype') {
            return '';
        }
        switch(this.data.type) {
            case "select":
                var obj = new selectRender();
                obj.setColumn(this.data);
                return obj.render(data);
            break;
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
      this.renderFilter = function() {
        switch(this.data.type) {
            case "number":
            break;
            default: 
                var obj = new textFilter();
                obj.setColumn(this.data);
                return obj.render();
            break;
        }
      }
      this.getData = function(key,_de) {
        var _de = _de || false;
        return Utility().objectGet(this.data,key,_de);
      }
      return this;
    }

    function Widget($http, $q,Util,ListPaginate,Authentication) { 
        return { 
            columns : {},
            pager : {},
            dbResults : [],
            totalItems : 0,
            add_link : '',
            pageSize: 10,
            defaultSortColumn : '',
            defaultSortDirection : 1,
            requestUrl : '', 
            custom_links : '',
            isFilter : true,
            isPaging : true,
            addColumn : function(columnname, columndata) {
                if(!columnname) {
                    return this;
                }   
                columndata.dindex = columnname;
                if(!columndata.hasOwnProperty('index')) {
                    columndata.index = columnname;
                }
                if(!columndata.hasOwnProperty('sortable')) {
                    columndata.sortable = true;
                }
                if(!columndata.hasOwnProperty('filterable')) {
                    columndata.filterable = true;                    
                }
                this.columns[columnname] = new Column(columndata);
                return this;
            },
            setDefaultSortColumn : function(sort) {
                this.defaultSortColumn = sort;
                return this;
            },
            init : function() {
                this.columns = {};
                this.defaultSortColumn = '';
                this.pager = {};
                this.requestUrl = '';
                this.dbResults = [];
                this.custom_links = '';
                this.add_link = '';
                this.isFilter = true;
                this.isPaging = true;
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
            setTotalItems : function(count) {
                this.totalItems = count;
                return this;
            },
            getTotalItems : function() {
                return this.totalItems;
            },
            hasFilter : function() { 
                return this.isFilter;
            },hasPaging : function() { 
                return this.isPaging;
            },
            setPageSize : function(size) {
                this.pageSize = size;
                this.requestParams.limit = size;
                return this;
            },
            getPageSize : function() {
                return this.pageSize;
            },
            getColumnsData: function() {
                var columns = [];
                for(var k in this.columns) {
                    if (this.columns.hasOwnProperty(k)) { 
                        columns.push(this.columns[k].data)
                    }                    
                }
                return columns;
            },
            setCustomLinks : function(html) {
                this.custom_links = html;
                return this;
            },
            getCustomLinks : function() {
                return this.custom_links;
            },
            getAddLink : function() {
                return this.add_link;
            },
            getPager : function() {
                return this.pager;
            },
            setPage : function(page, excl) {
                var excl = excl || false;                
                if(page < 1 || page > this.pager.totalPages) {
                    if(!excl) {
                        return this;
                    }
                } 
                this.pager = ListPaginate.GetPager(this.getTotalItems(),page,this.getPageSize());
                return this;
            },
            getSortColumn : function() {
                return this.defaultSortColumn;
            },
            getSortDir : function() {
                return this.defaultSortDirection;
            },
            setDataRequestUrl : function(url) {
                this.requestUrl = url;
                return this;
            },
            getRequestParams: function() {
                return this.requestParams;
            },
            request : function(params,remove) {                  
                if(typeof this.requestParams === 'undefined') {
                    this.requestParams = {};
                } 
                params['sort'] = this.defaultSortColumn;
                params['sortDir'] = this.defaultSortDirection; 
                this.requestParams = angular.extend(this.requestParams,params);
                var remove = remove || {};
                for(var k in remove) {
                    if(remove.hasOwnProperty(k)) {
                        delete this.requestParams[remove[k]];
                    }
                } 
                var deferred = $q.defer(); 
                var passq = {};
                passq.params = this.requestParams;
                 passq.cache = true;
                if(params.nocache) {
                    passq.cache = false;
                }
                if(params.passtoken) {
                    passq.headers = {'Authorization' : 'Bearer '+Authentication.getToken()};
                }
                $http.get(this.requestUrl,passq).then(function(response) {
                    deferred.resolve(response);
                }, function(response) {
                    deferred.reject(response);
                });
                return deferred.promise;
            }
        };
    }

    function Paginate() {
        return {
            GetPager : function(totalItems, currentPage, pageSize) { 
                 // default to first page
                currentPage = currentPage || 1;
         
                // default page size is 10
                pageSize = pageSize || 10;
         
                // calculate total pages
                var totalPages = Math.ceil(totalItems / pageSize);
         
                var startPage, endPage;
                if (totalPages <= 10) {
                    // less than 10 total pages so show all
                    startPage = 1;
                    endPage = totalPages;
                } else {
                    // more than 10 total pages so calculate start and end pages
                    if (currentPage <= 6) {
                        startPage = 1;
                        endPage = 10;
                    } else if (currentPage + 4 >= totalPages) {
                        startPage = totalPages - 9;
                        endPage = totalPages;
                    } else {
                        startPage = currentPage - 5;
                        endPage = currentPage + 4;
                    }
                }
         
                // calculate start and end item indexes
                var startIndex = (currentPage - 1) * pageSize;
                var endIndex = Math.min(startIndex + pageSize - 1, totalItems - 1);
         
                // create an array of pages to ng-repeat in the pager control
                var pages = _.range(startPage, endPage + 1);
         
                // return object with all pager properties required by the view
                return {
                    totalItems: totalItems,
                    currentPage: currentPage,
                    pageSize: pageSize,
                    totalPages: totalPages,
                    startPage: startPage,
                    endPage: endPage,
                    startIndex: startIndex,
                    endIndex: endIndex,
                    pages: pages
                };
            }   
        }
    }

    angular
        .module('mean.backend') 
        .factory('Util',Utility)
        .factory('ListPaginate', Paginate)
        .factory('ListWidget', Widget);
    Widget.$inject = ['$http', '$q','Util','ListPaginate','Authentication'];

})();
