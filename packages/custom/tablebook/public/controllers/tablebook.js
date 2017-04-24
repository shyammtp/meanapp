(function() {
    'use strict';

    /* jshint -W098 */

    function TablebookController($scope, Global, Tablebook, $stateParams,Backend,ArrayUtil) {

        $scope.createelement = function(img,name) {
        	$scope.$broadcast('createelement',{image : img, name : name,floorid : ArrayUtil.get($stateParams,'floorid')});
        }
        $scope.clabel = '';
        $scope.table = {};
        $scope.currentgroup = {};
        $scope.canvasstage = {};
        $scope.floors = [];
        $scope.currentfloor = {};
        function loadPlans() {
            Tablebook.getPlans().then(function(res){
                var data = res.data.data;
                var floors = [];
                angular.forEach(data,function(b,f){
                    if(typeof $stateParams.floorid !== 'undefined' && $stateParams.floorid === b._id) {
                        var cfloor = {};
                        cfloor.name = b.floor_name;
                        cfloor.index = b.floor_index;
                        cfloor._id = b._id;
                        cfloor.design = b.design;
                        $scope.currentfloor = cfloor;
                        $scope.$broadcast('updatestage',{floor :cfloor });
                        console.log($scope.currentfloor);
                    }
                    floors.push({name : b.floor_name,index : b.floor_index,id : b._id}); 
                });
                $scope.floors = floors;
            })
        }
        
        loadPlans();
        $scope.floorplan = {}; 
        $scope.triggertableform = function(data) {
            $scope.clabel = '';
            $scope.table = {};
            $scope.currentgroup = data;console.log(data);
            classie.toggle( document.getElementById( 'cbp-spmenu-s2' ), 'cbp-spmenu-open' );
            Backend.loadSider($scope,'cbp-spmenu-s2','tablebook/views/'+theme+'/tablebook/design/tablenameform.html'); 
            angular.element('.cd-overlay').addClass('is-visible');  
        }
        

        $scope.closethis = function() { 
            classie.toggle( document.getElementById( 'cbp-spmenu-s2' ), 'cbp-spmenu-open' );            
            angular.element('.cd-overlay').removeClass('is-visible');
        }  

        $scope.savelabel = function(table) { 
            $scope.clabel = table.labelname;
            $scope.currentgroup.text.text(table.labelname); 
            $scope.clabel = '';
            $scope.table = {};
            //var offsety = ($scope.currentgroup.image.height / 2) - $scope.currentgroup.text.getTextHeight();
            //$scope.currentgroup.text.offsetY(-(offsety+10));  
             
            $scope.currentgroup.layer.draw();
            $scope.closethis();
        }

        $scope.savedata = function() {
            var vg = $scope.currentfloor; 
            $scope.floorplan._id = vg._id;
            $scope.floorplan.design = JSON.parse($scope.canvasstage.toJSON()); 
            console.log($scope.floorplan);
            Tablebook.savefloor($scope.floorplan).then(function(res) {
                var data = res.data.data;
                if(res.data.success) {
                     Materialize.toast("Data Saved", 4000);
                }
                loadPlans();
            });
        }

        $scope.addfloor = function() {
            classie.toggle( document.getElementById( 'cbp-spmenu-s2' ), 'cbp-spmenu-open' );
            Backend.loadSider($scope,'cbp-spmenu-s2','tablebook/views/'+theme+'/tablebook/design/addfloor.html'); 
            angular.element('.cd-overlay').addClass('is-visible');
        }

        $scope.savefloor = function(floor) {
            var fl = {};
            fl.name = floor.name;
            fl.index = ArrayUtil.slugtitle(floor.name);
            Tablebook.savefloor(fl).then(function(res) {
                var data = res.data.data;
                loadPlans();
            })
            $scope.floors.push(fl);
            $scope.closethis();
        } 
 
    }

    angular
        .module('mean.tablebook')
        .controller('TablebookController', TablebookController);

    TablebookController.$inject = ['$scope', 'Global', 'Tablebook', '$stateParams','Backend','ArrayUtil'];

})();
