(function() {
    'use strict'; 

    function drawingcanvas($timeout,$window) { 
        return {   
            restrict: "A",
            images : [],
            link : function($scope,element,attrs) { 
                var obj = this; 
                var width = $window.innerWidth;
                var height = $window.innerHeight;
                var stage = new Konva.Stage({
                  container: element[0],
                  width: width,
                  height: height
                });
                var layer = new Konva.Layer();
                  stage.add(layer);

                $scope.$on('createelement',function(e,img) {
                    var group = new Konva.Group({
                        x : 50,
                        y : 50,
                        draggable : true
                    })
                    var blueText = new Konva.Text({
                        fontSize: 26,
                        fontFamily: 'Calibri',
                        text: 'bound below',
                        fill: 'black',
                        align : 'center',
                        offsetX : 200,
                        padding: 10
                    });
                    var imageObj = new Image();
                    var rect = new Konva.Image({
                      x: 50,
                      y: 50
                    });
                    imageObj.onload = function() {
                        rect.image(imageObj);
                        rect.width = imageObj.width;
                        rect.height = imageObj.height;
                        layer.draw(); 
                    }
                    imageObj.src = 'http://www.vmp.com'+img;
                    group.add(rect).add(blueText);
                    layer.add(group);
                    obj.images.push(group);  
                })
                       

                   /* layer.on('mouseover', function(evt) {
                        var shape = evt.target;
                        document.body.style.cursor = 'pointer';
                        //shape.strokeEnabled(false);
                        layer.draw();
                    });
                    layer.on('mouseout', function(evt) {
                        var shape = evt.target;
                        document.body.style.cursor = 'default';
                        //shape.strokeEnabled(true);
                        layer.draw();
                    });*/

            }
        }
    }
 

    angular
        .module('mean.tablebook') 
        .directive('drawingcanvas', drawingcanvas);
  
    drawingcanvas.$inject = ['$timeout','$window'];  
})();
