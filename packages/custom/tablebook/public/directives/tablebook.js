(function() {
    'use strict'; 

    function drawingcanvas($timeout,$window,Backend,Authentication,ArrayUtil) { 
        return {    
            images : [],
            layer : '',
            stage : '',
            rotationdegree : 45,
            scope : {
                labelform: '&labelform',
            },
            link : function($scope,element,attrs) { 
                var _obj = this; 
                var width = 900;
                var height = 800;
                if(!this.stage) {
                    this.stage = new Konva.Stage({
                      container: element[0],
                      width: width,
                      height: height
                    });
                    this.layer = new Konva.Layer();
                    this.stage.add(this.layer);
                } 
                $scope.$parent.canvasstage = this.stage;

                $scope.id = 0;
                $scope.$on('updatestage',function(e,data) {
                    var floordata = data.floor;
                    if(!floordata.design) {
                        _obj.stage = new Konva.Stage({
                          container: element[0],
                          width: width,
                          height: height
                           
                        });
                        _obj.layer = new Konva.Layer();
                        _obj.stage.add(_obj.layer);
                    }
                    if(floordata.design) {
                        if(_obj.stage!= '') {
                            _obj.stage.destroy();
                        } 
                        _obj.stage = Konva.Node.create(floordata.design, element[0]);
                         
                         $scope.$parent.canvasstage =  _obj.stage;
                         
                        var ss = [];
                        angular.forEach( _obj.stage.getChildren(),function(v,d){
                            _obj.layer = v;
                            var context = _obj.layer.getContext();
                            context.setAttr('fillStyle', 'red'); 
                            angular.forEach(v.getChildren(),function(g,h){

                                 angular.forEach(g.getChildren(),function(a,n){ 

                                        if(a.className === 'Image') {
                                            if(a.getAttr('name') === 'deleteimg') {
                                                var deleteImageObj = new Image();
                                                deleteImageObj.onload = function() {
                                                     a.image(deleteImageObj); v.draw(); 
                                                }
                                                deleteImageObj.src = 'http://localhost:3000/theme/assets/lib/white/img/delete-cross.png';

                                                a.on('mouseover',function(e) {
                                                    document.body.style.cursor = 'pointer';
                                                });
                                                a.on('mousedown',function(e) {
                                                    g.destroy();
                                                    v.draw();
                                                });
                                                a.on('mouseout',function(e) {
                                                    document.body.style.cursor = 'default';
                                                });
                                                
                                            } else if (a.getAttr('name') === 'rotateimg') {
                                                var rotateImageObj = new Image();
                                                rotateImageObj.onload = function() {
                                                    a.image(rotateImageObj);
                                                    v.draw();
                                                };
                                                rotateImageObj.src = 'http://localhost:3000/theme/assets/lib/white/img/rotate_icon.png';
                                                a.on('mouseover',function(e) {
                                                    document.body.style.cursor = 'pointer';
                                                });
                                                a.on('mousedown',function(e) {
                                                    g.rotation(g.rotation()+45);
                                                    v.draw();
                                                });
                                                a.on('mouseout',function(e) {
                                                    document.body.style.cursor = 'default';
                                                });
                                            } else { 
                                                var imageObj = new Image();
                                                imageObj.onload = function() {
                                                    a.image(imageObj);
                                                    v.draw();
                                                };
                                                imageObj.src = 'http://localhost:3000/theme/assets/lib/white/img/table/'+a.getAttr('name')+'.png';
                                                
                                            }
                                            console.log(a.getAttr('name'));
                                        }
                                        if(a.className ==='Text') {
                                            var d = a.getId().split(".");
                                            if(ArrayUtil.get(d,2)){
                                                ss.push(parseInt(ArrayUtil.get(d,2)));
                                            }
                                            a.on('mouseover',function(e) {
                                                document.body.style.cursor = 'pointer';
                                            });
                                            a.on('mousedown',function(e) { 
                                                var text = e.currentTarget;
                                                var group = text.getParent();
                                                var currentchildren;
                                                var currentimage;
                                                angular.forEach(group.getChildren(), function(v,l) {  
                                                    if(v.getClassName() == 'Image') {    
                                                        currentimage = v;                
                                                    }                        
                                                });
                                                if(currentimage) { 
                                                   $scope.labelform({data : {text : text,layer : group.getParent(),image : currentimage}});
                                                } 
                                            })
                                            a.on('mouseout',function(e) {
                                                document.body.style.cursor = 'default';
                                            })
                                        }

                                 });
                                 
                            })
                        })
                        $scope.id = Math.max.apply(null, ss);  
                    }
                })
                $scope.$on('createelement',function(e,data) {
                    
                     $scope.id++;

                    var uniqueid = Authentication.getRestaurantId()+'.'+data.floorid;
                    var group = new Konva.Group({
                        x : 50,
                        y : 50,
                        draggable : true,
                        rotation : 0
                    })
                    var blueText = new Konva.Text({
                        fontSize: 16,
                        fontFamily: 'Calibri',
                        text: 'Element '+$scope.id, 
                        fill: 'black',
                        align : 'center',
                        id : uniqueid+'.'+$scope.id 
                    });
                    var deleteImageObj = new Image();
                    var rotateImageObj = new Image();
                    var imageObj = new Image();
                    var rect = new Konva.Image({
                      x: 0,
                      y: 0,
                      name : data.name,
                      id : uniqueid+'.'+$scope.id+'.'+data.name
                    });var deleteimg = new Konva.Image({
                      x: 0,
                      y: 0,
                      width: 16,
                      height : 16,
                      name : 'deleteimg'
                    });

                    var rotateimg = new Konva.Image({
                      x: 0,
                      y: 0,
                      width: 16,
                      height : 16,
                      name : 'rotateimg'
                    });
                    
                    imageObj.onload = function() {
                        rect.image(imageObj);
                        rect.width = imageObj.width;
                        rect.height = imageObj.height; 

                        blueText.width(imageObj.width);
                        rotateimg.x(imageObj.width);
                        deleteimg.x(-20);
                        //blueText.height(imageObj.height);
                        var offsetx = (imageObj.width / 2) - blueText.getTextWidth();
                        var offsety = (imageObj.height / 2) - blueText.getTextHeight();
                        blueText.offsetY(-(offsety+10)); 
                        _obj.layer.draw(); 
                    }
                    deleteImageObj.onload = function() {
                         deleteimg.image(deleteImageObj); _obj.layer.draw(); 
                    }
                    deleteImageObj.src = 'http://localhost:3000/theme/assets/lib/white/img/delete-cross.png';
                    imageObj.src = 'http://localhost:3000'+data.image;


                    rotateImageObj.onload = function() {
                         rotateimg.image(rotateImageObj); _obj.layer.draw(); 
                    }
                    rotateImageObj.src = 'http://localhost:3000/theme/assets/lib/white/img/rotate_icon.png';
                   
                    group.add(rect).add(blueText).add(deleteimg).add(rotateimg);
                    _obj.layer.add(group); 
                    blueText.on('mouseover',function(e) {
                        document.body.style.cursor = 'pointer';
                    });
                    blueText.on('mousedown',function(e) { 
                        var text = e.currentTarget;
                        var group = text.getParent();
                        var currentchildren;
                        var currentimage;
                        angular.forEach(group.getChildren(), function(v,l) {  
                            if(v.getClassName() == 'Image') {    
                                currentimage = v;                
                            }                        
                        });
                        if(currentimage) { 
                           $scope.labelform({data : {text : text,layer : group.getParent(),image : currentimage}});
                        } 
                    })
                    deleteimg.on('mouseover',function(e) {
                        document.body.style.cursor = 'pointer';
                    });
                    rotateimg.on('mousedown',function(e){
                        group.rotation(group.rotation()+45);
                        _obj.layer.draw();
                    })
                    deleteimg.on('mousedown',function(e) {
                        group.destroy();
                        _obj.layer.draw();
                    });
                    deleteimg.on('mouseout',function(e) {
                        document.body.style.cursor = 'default';
                    });
                    /*group.on('click',function(e) {
                        var grs = e.currentTarget; 
                        console.log(grs.getLayer());
                        var currentchildren;
                        var currentimage;
                        angular.forEach(grs.getChildren(), function(v,l) {  
                            if(v.getClassName() == 'Text') {    
                                currentchildren = v;                
                            } 

                            if(v.getClassName() == 'Image') {    
                                currentimage = v;                
                            }                        
                        });
                        if(currentchildren) { 
                           $scope.labelform({data : {text : currentchildren,layer : grs.getLayer(),image : currentimage}});
                        }
                    })*/
                    blueText.on('mouseout',function(e) {
                        document.body.style.cursor = 'default';
                    })
                    _obj.images.push(group);  
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
  
    drawingcanvas.$inject = ['$timeout','$window','Backend','Authentication','ArrayUtil'];  
})();
