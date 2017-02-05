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

    function categoryselectslider(Product,ArrayUtil,$timeout) {
        return {    
            replace: 'true',
            scope: true,  
            templateUrl : 'backend/views/products/catalog/classify/category.html',
            link : function(scope,element,attrs) {
                var _obj = this;
                element.contentcarousel({
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
})();
