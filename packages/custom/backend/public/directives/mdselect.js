(function() {
    'use strict';

    function mdSelect() { 
        return {  
            /*templateUrl: 'backend/views/widget/elements/select.html',*/
            scope: true,
            link : function(scope,element,attrs) {  
                if(attrs.value) {
                    element.val(attrs.value);
                }
                element.material_select();
            }

        }
    }
    function jsTree(Product,ArrayUtil,$timeout) {
        return {    
            replace: 'true',
            scope: {
                methodToCall: '&method',
                categoryupdated : '='
            }, 
            loadCategoriesTree : function(scope,element) { 
                Product.getCategories().then(function(res) { 
                    var categoryset = [],catmap = {}; 
                    res.data.forEach(function(s) { 
                        var d = {};
                        d.id = ArrayUtil.get(s,'_id');
                        d.parent = ArrayUtil.get(s,'category_parent_id','#');
                        d.text = ArrayUtil.get(ArrayUtil.get(s,'category_name'),'en'); 
                        categoryset.push(d);
                        catmap[ArrayUtil.get(s,'_id')] = s;
                    });  
                    scope.$parent.setCategory(catmap);
                     
                     element.jstree({
                        'core' : {
                            'data' : categoryset,
                            'check_callback' : true,
                            'themes' : {
                                'responsive': false
                            }
                        },
                        'dnd' : {
                            use_html5 : true
                        },
                        'types' : {
                            'default' : {
                                'icon' : 'fa fa-folder icon-state-info icon-md'
                            },
                            'file' : {
                                'icon' : 'fa fa-file icon-state-default icon-md'
                            }
                        },
                        'plugins' : ['types', 'dnd']
                    });
                });
                 element.on('select_node.jstree',function(e,data) {
                    $timeout (function() { 
                        scope.finish(data.selected[0]); 
                    });
                });
            },
            link : function(scope,element,attrs) {
                var _obj = this;
                 scope.$watch('categoryupdated', function() {
                   if(typeof scope.categoryupdated ==='undefined') return;
                   if(scope.categoryupdated == true) {
                       scope.$parent.categoryupdated = false;
                       element.jstree('destroy');
                       _obj.loadCategoriesTree(scope,element);
                   }
                });
                
                this.loadCategoriesTree(scope,element);                
                scope.finish = function (id) {
                    scope.methodToCall({value: id});                                
                }
                
                /*angular.element(document).on('dnd_stop.vakata.jstree', function (e, data) {
                   var ref = element.jstree(true);
                    var parents = ref.get_node(data.element);
                    console.log(data.element);
                    console.log(parents);
                }); */
               
            }

        }
    }

    function categoryselectslider(Product,$compile,$location) {
        return {    
            replace: 'true',
            scope: {
                methodToCall: '&method',
                controllerSaveCategory : '&save'
            }, 
            templateUrl : 'backend/views/products/catalog/classify/category.html',
            link : function(scope,element,attrs) {
                var _obj = this,containerwidth = angular.element('.ca-container').width();
                var c = Math.round(containerwidth / 330);
                if(c == 0) {
                    c = 1;
                }
                angular.element('.ca-wrapper').css('width',(330*c)+'px');
                var el = angular.element('.ca-wrapper'); 

                scope.categoriestree = {};
                Product.getCategoryTree().then(function(res){
                    scope.categoriestree = res.data;                   
                }); 
                var template = [],lev = 1,pickedcategory = {};
                scope.childrentree=[]; 
                scope.savecategory = function(data) {
                    scope.controllerSaveCategory({data : data});                   
                }
                scope.getChildrencount = function(v) {
                    if(v == undefined) return 0;
                    return Object.keys(v).length;
                }
                scope.isactive = function(key) { 
                    for(var k in scope.pickedcategoryset) {
                        if(!scope.pickedcategoryset.hasOwnProperty(k)) continue;
                        if(scope.pickedcategoryset[k]._id == key) {
                            return true;
                            break;
                        }
                    }
                    return false;
                }
                scope.pickedcategoryset = {};
                scope.loadsub = function(data,level) {

                    scope.finalcategory = data;
                    scope.pickedcategoryset = pickedcategory; 
                    level || (level = 1);
                    lev = level + 1; 
                    for(var i=0;i<template.length;i++) {
                        var ind = level-1; // 1
                        if(i > ind) { // 0 >= 1
                            if(typeof template[i] !== 'undefined') {
                                template[i].remove();
                                delete template[i];
                            }
                            if(typeof pickedcategory[i] !== 'undefined') {
                                delete pickedcategory[i];
                            }
                        } 
                    }  
                    if(data.children != undefined && Object.keys(data.children).length > 0) {
                        
                        scope.childrentree['children'+(lev-1)] = data.children;
                        var t = angular.element('<div class="ca-item">\
                                            <div class="ca-item-main">  \
                                                <ul>\
                                                    <li ng-repeat="(k,v) in childrentree.children'+(lev-1)+'"><a href="javascript:;"  ng-class="{\'children\' : getChildrencount(v.children),\'active\' : isactive(v._id) }" ng-click="loadsub(v,'+lev+')">{{v.category_name.en}}</a></li>\
                                                </ul>\
                                            </div> \
                                        </div> ');
                       
                    } else {
                        var t = angular.element('<div class="ca-item">\
                                            <div class="ca-item-main">  \
                                                <h2>{{finalcategory.category_name.en}}</h2>\
                                                <button type="button" ng-click="savecategory(finalcategory)" class="btn btn-primary">Select</button> \
                                            </div> \
                                        </div> ');
                    }
                    pickedcategory[lev-1] = data;
                    template[lev-1] = t;
                    _obj.updatestyle(template);
                    scope.methodToCall({value: pickedcategory});                 
                    el.append(t);  
                    $compile(t)(scope);
                } 

            }, updatestyle : function(template) {
                var x = 0,  totalwidth = angular.element('.ca-wrapper').width(); 
                for(var k in template) {
                    if(!template.hasOwnProperty(k)) continue;
                    x = x+330;
                    template[k].css({left : x});
                }
                if(x >= totalwidth) { 
                    var wi = (x+330)+'px';
                   angular.element('.ca-wrapper').animate({'scrollLeft' : wi});
                }
            }

        }
    }

    function attributeManager(Product,$compile,$location,ArrayUtil) {
         return {    
            replace: 'true', 
            scope : {
                passdirdata : '&method',
                cancelmethod : '&cancelmethod'

            },
            template: '<div ng-include="getContentUrl()"></div>', 
            link : function(scope,element,attrs) { 
                scope.optionsfield = [];
                var categoryset = Product.getCategoryForAdd(),_obj = this;  
                _obj.resetAttr(scope,attrs);
                scope.getContentUrl = function() { 
                    return 'backend/views/products/catalog/attributes/form/' + attrs.type + '.html';
                }
                /*Product.getCategoryAttribute(ArrayUtil.get(categoryset,'_id')).then(function(res) {
                    $scope.attributedata = ArrayUtil.get(res.data,'attributes',{});

                });*/
                    /*scope.validateattributename = function(name) {
                    console.log(name);
                    //scope.attribute_name = name.toLowerCase().replace(/\s+/g,'');
                });*/ 
                scope.updatefields = function(block) {
                    if(!block) {
                        block = 'info';
                    } 
                    var ats = ArrayUtil.get(categoryset,'attributes');
                    var fobject = ArrayUtil.get(ats,block,{}),selectoptions = [];
                    angular.forEach(fobject,function(v,k) { 
                        selectoptions.push({'value': v.attribute_name, 'title' : v.title.en});
                    });
                    scope.parentselects = selectoptions;
                } 
                scope.updatefields();
                
                scope.saveAttribute = function(attributefield) { 
                    if(ArrayUtil.get(attributefield,'type') == 'text' 
                        || ArrayUtil.get(attributefield,'type') == 'select'
                        || ArrayUtil.get(attributefield,'type') == 'number'
                        || ArrayUtil.get(attributefield,'type') == 'date') {
                        var finaldata = {};
                        if(ArrayUtil.get(attributefield,'attribute_name')) {
                            finaldata[ArrayUtil.get(attributefield,'attribute_name')] = attributefield;
                            Product.setCatalogAttributeData(finaldata);
                            Product.saveCategoryAttribute({'category_id':ArrayUtil.get(categoryset,'_id'),'block' : ArrayUtil.get(attributefield,'block','info')}).then(function(res) {
                                if(res.status == 200) { 
                                    _obj.resetAttr(scope,attrs);
                                    categoryset = ArrayUtil.get(res,'data',{});
                                    scope.passdirdata({data : res});
                                    Materialize.toast("Attribute Saved successfully", 4000); 
                                     scope.cancel();
                                } else {
                                    Materialize.toast(res.message, 4000);
                                }
                            });

                        } 
                    }
                }
                scope.addMoreOptions = function() {
                    scope.optionsfield.push({});
                }
                scope.hasparent = false;
                 scope.$on('editattributes',function(event, data){
                        scope.updatefields(ArrayUtil.get(data,'block'));
                        scope.hasparent = ArrayUtil.get(data,'parent');
                     _obj.loadAttribute(scope, data);
                 });
                 scope.cancel = function() {
                    scope.cancelmethod();
                 }
                 scope.removeLastOption = function(attributefield) {                                         
                    if(scope.optionsfield.length > 0) {
                        delete attributefield.options[Object.keys(attributefield.options)[Object.keys(attributefield.options).length-1]];
                        scope.optionsfield.splice(-1,1);
                        scope.attributefield = attributefield;
                    }
                 }

            },loadAttribute : function(scope, data) { 
                scope.attributefield = data.attributes;
                scope.attributefield.block = ArrayUtil.get(data,'block');
                scope.attributefield.previous_block = ArrayUtil.get(data,'block'); 
                var optionsfield = ArrayUtil.get( data.attributes,'options',{}),optf = [];
                angular.forEach(optionsfield,function(sm,b){
                    optf.push(sm);
                });
                scope.optionsfield = optf; 
            }, resetAttr : function(scope,attrs) {
                    scope.attributefield = {};
                    scope.attributefield.type = attrs.type;
                    scope.attributefield.block = 'info';
                    scope.attributefield.is_system = false;
            }
        }
    }

    function catalogfield(Product,$compile,$location,ArrayUtil) {
        return {
            template: '<div ng-include="getContentUrl()"></div>',
            products : {},
            scope : {
                catalogattributes : '=',
                parentattribute : '=',                
                productscope : '&productscope'
            },
            link : function(scope,element,attrs) {
                scope.product = {}; 
                var _obj = this;
                scope.$watchCollection('product', function() { 
                    _obj.products = angular.extend({}, _obj.products, scope.product);  
                    scope.productscope({productscope : _obj.products});
                });  
                if(attrs.type == 'text') {
                    this.initText(scope,element,attrs);
                } 
                if(attrs.type == 'date') {
                    this.initDate(scope,element,attrs);
                }
                scope.getContentUrl = function() { 
                    return 'backend/views/products/catalog/fields/form/' + attrs.type + '.html';
                }
                scope.countObject = function(obd) {
                    if(obd == undefined) {
                        return false;
                    }
                    if(Object.keys(obd).length > 0) {
                        return true;
                    }
                    return false;
                }
                
                scope.getwidthpercent = function(children) {
                    if(children == undefined) return '100%';
                    var le = Object.keys(children).length;
                    if(le > 1) {
                        le = le+1;
                    }
                    var percent = (100 / le);
                    return percent+'%';
                }  
            },
            initText : function(scope,element,attrs) {
               
            },initDate : function(scope,element,attrs) {
                 angular.element('.date-picker',element).datepicker({
                    orientation: "top auto",
                    autoclose: true
                });
            }

        }
    }

    function shInput() { 
        return {  
            templateUrl: 'backend/views/widget/elements/input.html',
            scope: true,
            link : function(scope,element,attrs) {  
               
            }

        }
    }
     function shModal() { 
        return { 
            transclude: true, 
            templateUrl: 'backend/views/widget/modal.html',
            link : function(scope,element,attrs) { 
                scope.open = function(){
                    angular.element('.modal',element).modal('open');
                    scope.inctemplate = attrs.templateinc;
                };
                
                angular.element('.modal',element).modal({
                    dismissible: true,
                    starting_top: '0%', // Starting top style attribute
                    ending_top: '0%', // Ending top style attribute
                    opacity : .9
                });   
            }

        }
    }
 

    function filterrange() {
        return function(input,total) {
            total = parseInt(total);

            for (var i=0; i<total; i++) {
              input.push(i);
            }

            return input;
        }
    }
 

    angular
        .module('mean.backend')
        .filter('filterrange',filterrange)
        .directive('mdSelect', mdSelect)
        .directive('shModal', shModal)
        .directive('shInput', shInput)
        .directive('jsdirtree', jsTree)
        .directive('categoryselectslider', categoryselectslider)
        .directive('attributemanager',attributeManager) 
        .directive('catalogfield',catalogfield);
 
    jsTree.$inject = ['Product','ArrayUtil','$timeout'];
    categoryselectslider = ['Product','$compile','$location'];    
    attributeManager = ['Product','$compile','$location','ArrayUtil'];    
    catalogfield = ['Product','$compile','$location','ArrayUtil']; 
})();
