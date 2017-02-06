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
                methodToCall: '&method'
            }, 
            templateUrl : 'backend/views/products/catalog/classify/category.html',
            link : function(scope,element,attrs) {
                var _obj = this,containerwidth = angular.element('.ca-container').width();
                var c = Math.floor(containerwidth / 330);
                angular.element('.ca-container').css('width',(330*4)+'px');
                var el = angular.element('.ca-wrapper');
                /*element.contentcarousel({
                    // speed for the sliding animation
                    sliderSpeed : 500,
                    // easing for the sliding animation
                    sliderEasing: 'easeOutExpo',
                    // speed for the item animation (open / close)
                    itemSpeed   : 500,
                    // easing for the item animation (open / close)
                    itemEasing  : 'easeOutExpo',
                    // number of items to scroll at a time
                    scroll  : 4 
                });*/

                scope.categoriestree = {};
                Product.getCategoryTree().then(function(res){
                    scope.categoriestree = res.data;                   
                }); 
                var template = [],lev = 1,pickedcategory = {};
                scope.childrentree=[]; 
                scope.savecategory = function(data) {
                   Product.setCategory(data);
                   $location.path('admin/products/catalog/information');
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
                   angular.element('.ca-wrapper').scrollLeft(wi);
                }
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
            templateUrl: 'backend/views/widget/modal.html', 
            link : function(scope,element,attrs) { 
                element.modal({
                    dismissible: false,
                    starting_top: '0%', // Starting top style attribute
                    ending_top: '0%', // Ending top style attribute
                    opacity : .9
                }); 
                scope.modalelement = element;
            }

        }
    }

    function shModallink() { 
        return {    
            link : function(scope,element,attrs) { 
                element.bind('click',function(){
                    scope.modalelement.modal('open');
                })   
            }

        }
    }

    angular
        .module('mean.backend')
        .directive('mdSelect', mdSelect)
        .directive('shModal', shModal)
        .directive('shInput', shInput)
        .directive('jsdirtree', jsTree)
        .directive('categoryselectslider', categoryselectslider)
        .directive('shModalLink', shModallink);
 
    jsTree.$inject = ['Product','ArrayUtil','$timeout'];
    categoryselectslider = ['Product','$compile','$location']
})();
