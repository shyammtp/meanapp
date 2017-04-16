(function() {
    'use strict';
    var _ = require('lodash');
    /*var inheritsFrom = function (child, parent) {
        child.prototype = Object.create(parent.prototype);
    };

     var _abstractRender = function() { 
        this._column = {};
    }
    _abstractRender.prototype.render = function(data) { 
        if(_.includes(this._column.index,'.')) {
            var sd = this._column.index.split(".");
            var value = sd.reduce( function (prev, cur) {                
                return prev[cur]; //|| {}; Might want to include the commented out part if keys might not be defined
            }, data);
            return value; 
        }
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
*/
    function GMAP($http, $q,Authentication) { 
        this.map = false;
        this.coordinatesset = '';
        this.selectedShape = '';
        this.drawingmanager;
        this.overlay;
        this.parent;
        this.addeddata;
        return {  
            init : function(map) {
                this.map = map;
                return this;
            },
            getMap : function() {
                return this.map;
            },
            addressMap : function(address) {
                var _obj = this;
                var geocoder = new google.maps.Geocoder();
                geocoder.geocode({
                    'address': address
                }, function(results, status) { 
                    if (status == google.maps.GeocoderStatus.OK) {
                        _obj.getMap().setCenter(results[0].geometry.location);
                    }
                });
            },
            loadPolygonData : function(geojson){

                console.log(geojson);
                var _obj = this;
                if (geojson) {  
                    if(this.addeddata) {
                        for (var i = 0; i < this.addeddata.length; i++)
                            this.getMap().data.remove(this.addeddata[i]);
                    }  
                    var geojsonobj =  {
                      "type": "Feature",
                      "geometry": geojson 
                    };
                    this.addeddata = this.getMap().data.addGeoJson(geojsonobj);
                    this.getMap().data.setStyle({
                      strokeColor: '#f26b3e',
                      fillOpacity: 0.2,
                      fillColor: '#f26b3e'
                    });
                console.log('in');
                    //zoom(this.getMap());
                }
            },
            loadDrawing : function(controller) {
                this.parent = controller;
                if(controller.addresskeyword) {
                    this.addressMap(controller.addresskeyword);
                }
                if(controller.data && controller.data.zonebox) {
                    this.loadPolygonData(controller.data.zonebox);
                }
                console.log(controller);
                var _obj = this,polygonset = [];
                var drawingManager = this.drawingmanager = new google.maps.drawing.DrawingManager({
                  drawingMode: google.maps.drawing.OverlayType.POLYGON,
                  drawingControl: true,
                  drawingControlOptions: {
                    position: google.maps.ControlPosition.TOP_CENTER,
                    drawingModes: ['polygon']
                  }, 
                    polygonOptions: {
                         editable: true
                   },
                  circleOptions: {
                    fillColor: '#ffff00',
                    fillOpacity: 1,
                    strokeWeight: 2,
                    clickable: false,
                    editable: true,
                    zIndex: 1
                  }
                });
                drawingManager.setMap(this.map);
                google.maps.event.addListener(drawingManager, 'overlaycomplete', function(event) {
                  if (event.type == 'polygon') {
                   // var radius = event.overlay.getRadius();
                    _obj.overlay = event.overlay;
                    drawingManager.setDrawingMode(null);
                    var coordinates = (event.overlay.getPath());    
                    coordinates.push(coordinates.getAt(0));
                    drawingManager.setOptions({
                        drawingControl: false
                   });
                    polygonset.push(coordinates); 
                    _obj.coordinatesset = _obj.gen_multipolygon_path(polygonset)
                    controller.drawresponse(_obj.coordinatesset); 
                    //_obj.setSelection(newShape);

                    console.log('coordinates',_obj.coordinatesset);
                    //overlayClickListener(polygon.overlay);
                  }
                });
            },
            getPolygonCoordinates : function() {
                return this.coordinatesset;
            },
            clearSelection : function() {
                var _obj = this;
                this.drawingmanager.setOptions({
                    drawingControl: true
                })
                if(_obj.overlay) {
                    _obj.overlay.setMap(null);
                }
                if (_obj.selectedShape) {
                 _obj.selectedShape.setEditable(false);
                 _obj.selectedShape = null;
                }
             },
            setSelection : function(shape) {
                var _obj = this;
                this.clearSelection();
                _obj.selectedShape = shape;
                shape.setEditable(true); 
            },
            gen_multipolygon_path : function (polygonset)
            {   
               var polycoordinates = {},coor=[];
               for (var j = 0; j< polygonset.length; j++) {
                    coor[j] = [];
                   var leng = polygonset[j].getLength();  
                  var psets = new Array(); 
                  for(var i = 0; i<leng; i++) {
                        psets[i] = [];
                      var long = (polygonset[j].getAt(i).lng());
                      var lat = (polygonset[j].getAt(i).lat());
                      psets[i][0] = long;
                      psets[i][1] = lat;
                      
                   } 
                   coor[j] = psets;
                  //coor.push("(("+psets.join(",")+"))");
               }; 
               polycoordinates.type = 'Polygon';
               polycoordinates.coordinates = coor;

               console.log('psets',polycoordinates);
               return polycoordinates;
                //return "MULTIPOLYGON("+coor.join(",")+")";
            },
            overlayClickListener : function(polygon) {

            }
        }
    }
 

    angular
        .module('mean.backend') 
        .factory('ShyamGoogleMap',GMAP)  ;
    GMAP.$inject = ['$http', '$q','Authentication'];

})();
