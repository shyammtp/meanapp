(function() {
    'use strict'; 

    function drawingcanvas($timeout) {
        return {   
            restrict: "A",
            link : function(scope,element,attrs) {  
                  
                 
                  var ctx = element[0].getContext('2d'); 
                  // variable that decides if something should be drawn on mousemove
                  var drawing = false;

                  // the last coordinates before the current move
                  var lastX,currentX,currentY;
                  var lastY;

                    var BB = element[0].getBoundingClientRect();
                    var WIDTH = element[0].width;
var HEIGHT = element[0].height;
                    var offsetX = BB.left;
var offsetY = BB.top;

var dragok = false;
var startX;
var startY;

                  var rects = [];
                    rects.push({
                        x: 75 - 15,
                        y: 50 - 15,
                        width: 30,
                        height: 30,
                        fill: "#444444",
                        isDragging: false
                    });
                    rects.push({
                        x: 75 - 25,
                        y: 50 - 25,
                        width: 30,
                        height: 30,
                        fill: "#ff550d",
                        isDragging: false
                    });
                    rects.push({
                        x: 75 - 35,
                        y: 50 - 35,
                        width: 30,
                        height: 30,
                        fill: "#800080",
                        isDragging: false
                    });
                    rects.push({
                        x: 75 - 45,
                        y: 50 - 45,
                        width: 30,
                        height: 30,
                        fill: "#0c64e8",
                        isDragging: false
                    });
                    $timeout(function() {
                        rects.push({
                            x: 75 - 45,
                            y: 50 - 45,
                            width: 30,
                            height: 30,
                            fill: "#f00",
                            isDragging: false
                        });
                    },6000)
                    var imageX=50;
                    var imageY=50;
    var imageWidth,imageHeight,imageRight,imageBottom;
                    var img=new Image();
                    img.src="http://localhost:3000/theme/assets/lib/white/img/logo-horizontal_106.png";
                    imageWidth=img.width;
                    imageHeight=img.height;
                    imageRight=imageX+imageWidth;
                    imageBottom=imageY+imageHeight

                    draw();
                    console.log(img);
                    // draw a single rect
                    function rect(x, y, w, h) {
                        ctx.beginPath();
                        ctx.rect(x, y, w, h);
                        ctx.closePath();
                        ctx.fill();
                        var textX = x+w/2-ctx.measureText('blah').width/2;
                        var textY = y+h/2;
                        ctx.fillStyle = 'black';
                        ctx.fillText("blah",textX, textY); 

                    }

                    // clear the canvas
                    function clear() {
                        ctx.clearRect(0, 0, WIDTH, HEIGHT);
                    }

                    function draw() {
                        clear(); 
                        ctx.fillStyle = "#FAF7F8";
                        rect(0, 0, WIDTH, HEIGHT);
                        // redraw each rect in the rects[] array
                        for (var i = 0; i < rects.length; i++) {
                            var r = rects[i];
                            ctx.fillStyle = r.fill;
                            rect(r.x, r.y, r.width, r.height);
                        }
                    }

                  element.bind('mousedown', function(e){
                     var mx = parseInt(e.clientX - offsetX);
                        var my = parseInt(e.clientY - offsetY); 
                        dragok = false;
                        for (var i = 0; i < rects.length; i++) {
                            var r = rects[i];
                            if (mx > r.x && mx < r.x + r.width && my > r.y && my < r.y + r.height) {
                                // if yes, set that rects isDragging=true
                                dragok = true;
                                r.isDragging = true;
                            }
                        }
                        // save the current mouse position
                        startX = mx;
                        startY = my;
                  }); 
                  element.bind('mousemove', function(e){
                        if (dragok) { 
                            // tell the browser we're handling this mouse event
                            e.preventDefault();
                            e.stopPropagation();

                            // get the current mouse position
                            var mx = parseInt(e.clientX - offsetX);
                            var my = parseInt(e.clientY - offsetY);

                            // calculate the distance the mouse has moved
                            // since the last mousemove
                            var dx = mx - startX;
                            var dy = my - startY;

                            // move each rect that isDragging 
                            // by the distance the mouse has moved
                            // since the last mousemove
                            for (var i = 0; i < rects.length; i++) {
                                var r = rects[i];
                                if (r.isDragging) {
                                    r.x += dx;
                                    r.y += dy;
                                }
                            }
                            console.log(rects);
                            // redraw the scene with the new rect positions
                            draw();

                            // reset the starting mouse position for the next mousemove
                            startX = mx;
                            startY = my;

                        }
                  }); 
                  element.bind('mouseup', function(event){
                    // stop drawing
                        dragok = false;
                        for (var i = 0; i < rects.length; i++) {
                            rects[i].isDragging = false;
                        }
                  });

                  
 

            }
        }
    }
 

    angular
        .module('mean.tablebook') 
        .directive('drawingcanvas', drawingcanvas);
  
    drawingcanvas.$inject = ['$timeout'];  
})();
