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
        .directive('shModalLink', shModallink);
 

})();
