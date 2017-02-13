(function() {
    'use strict';
  

    function CategoryController($scope, Global, Backend,ArrayUtil, Product) { 
         var vm = this,categorymap;   
         //console.log($ocLazyLoad);
        var parentdata  = {};
        parentdata.externaljs = 'backend/views/products/category/js.html'; 
        $scope.$emit('child', parentdata);  
        $scope.setCategory = function(map) {
        	categorymap = map;
        }
		$scope.category = {}; 
        $scope.getCategoryMap = function(id) {
        	if(typeof categorymap[id] != 'undefined') {
        		var c = categorymap[id]; 
        		this.category['edit'] = ArrayUtil.get(ArrayUtil.get(c,'category_name'),'en');
        		this.category['category_name'] = ArrayUtil.get(ArrayUtil.get(c,'category_name'),'en');
        		this.category['category_id'] = ArrayUtil.get(c,'_id');  
        		this.category['parent_id'] = this.category['parent_category_url'] = '';
        	}  
        } 
        $scope.addnewcategory = function(cat) { 
        	$scope.category = {};
        	var c = ArrayUtil.get(categorymap,ArrayUtil.get(cat,'category_id'),{}); 
        	$scope.category['edit'] = '';
        	$scope.category['parent_category_name'] =  ArrayUtil.get(cat,'category_name');
        	$scope.category['parent_id'] = ArrayUtil.get(cat,'category_id');
    		$scope.category['parent_category_url'] = ArrayUtil.get(c,'category_url');
        }
        $scope.categoryupdated = false;
        $scope.saveCategory = function(cat) { 
        	var params = {};
        	if(ArrayUtil.get(cat,'parent_id')) {
        		params['parent'] = ArrayUtil.get(cat,'parent_category_url');
        	}
        	params['category_name'] = {'en' : ArrayUtil.get(cat,'category_name')};
        	if(ArrayUtil.get(cat,'category_id')) params['category_id'] = ArrayUtil.get(cat,'category_id');
        	Product.saveCategory(params).then(function(res) {
        		 Materialize.toast("Category Updated", 4000);
        		 $scope.categoryupdated = true;
        		  $scope.category = {};
        		},function(err) {
        			if(err.status == 500) {
        				Materialize.toast(ArrayUtil.get(ArrayUtil.get(err,'data'),'message','Category not saved'), 4000,'errortoast');
        			} 
        	});
        }
        $scope.deleteCategory = function(cat) {
        	var con = confirm('Are you sure want to delete this category? Make sure this category doesn\'t have any children into it');
        	if(con) {
        		var params = {'id' : ArrayUtil.get(cat,'category_id')}; 
        		Product.deleteCategory(params).then(function(res) {
        			Materialize.toast("Category removed successfully", 4000);
        			 $scope.categoryupdated = true;
        			 $scope.category = {};
        		}, function(err) {
        			if(err.status == 500) {
        				Materialize.toast(ArrayUtil.get(ArrayUtil.get(err,'data'),'message','Category not deleted'), 4000,'errortoast');
        			}
        		})
        	}
        	
        }
        $scope.addRootCategory = function() {
        	$scope.category = {};
        }
    }

    function CatalogController($scope, Global, Backend,ArrayUtil, Product,$timeout,$location) {
 		var vm = this;
        $scope.pickedcategory = {};
        var originalData = {}; 
 		$scope.getCategoryList = function(data) {			  
			$timeout(function() {
				Product.setCategoryTreeSet(data);
	            $scope.pickedcategory = data; 
	        }); 
        }   
        $scope.saveCategory = function(data) {
    		Product.setCategory(data);
           $location.path('admin/products/catalog/information');
        }
        $scope.checkarrow = function(index) { 
            if(parseInt(index) > 1) {
                return true;
            } 
            return false;
        }
    }
    function CatalogAddController($scope,ArrayUtil, Product,$location) {
 		var vm = this,categoryset = Product.getCategoryTreeSetForAdd();

 		if(categoryset== undefined) {
 			$location.path('admin/products/catalog/classify');
 		} 
 		$scope.infoattributes = $scope.pricing = $scope.description = $scope.more_details = {};

    	var lastcat = Product.getCategoryForAdd(); 
    	if(lastcat != undefined) {
    		console.log(lastcat);
	    	var attributes = ArrayUtil.get(lastcat,'attributes',{}); 
	    	$scope.infoattributes = ArrayUtil.get(attributes,'info',{}); console.log($scope.infoattributes);
	    	$scope.pricing = ArrayUtil.get(attributes,'pricing',{});
	    	$scope.description = ArrayUtil.get(attributes,'description',{}); 
	    	$scope.more_details = ArrayUtil.get(attributes,'more_details',{});
	    }
 		$scope.checkarrow = function(index) { 
            if(parseInt(index) > 1) {
                return true;
            } 
            return false;
        }
        $scope.countObject = function(obd) {
        	if(obd == undefined) {
        		return false;
        	}
        	if(Object.keys(obd).length > 0) {
        		return true;
        	}
        	return false;
        }
        $scope.getwidthpercent = function(children) {
        	var le = Object.keys(children).length;
        	if(le > 0) {
        		le = le+1;
        	}
        	var percent = (100 / le);
        	return percent+'%';
        }
 		$scope.pickedcategory = categoryset;
    }

    function CatalogAttributesController($scope, Global, Backend,ArrayUtil, Product,$timeout,$location) 
    {
    	//$scope.attribute_type = 'text';
    	var vm = this,categoryset = Product.getCategoryTreeSetForAdd();
    	if($location.path() == '/admin/products/catalog/attributes/form') {
    		if(categoryset== undefined) {
	 			$location.path('/admin/products/catalog/attributes/classify');
	 			return;
	 		}
    	}
    	var lastcat = Product.getCategoryForAdd();
    	$scope.attributes = vm.attributedata  = {}; 
    	if(lastcat!= undefined) { 
    		$scope.categoryname = ArrayUtil.get(ArrayUtil.get(lastcat,'category_name'),'en');
	    	Product.getCategoryAttribute(ArrayUtil.get(lastcat,'_id')).then(function(res) {
	    		vm.attributedata =  $scope.attributes = ArrayUtil.get(res.data,'attributes',{});

	    	});
	    }
    	$scope.checkchildren = function(children) {
    		if(children==undefined) return false;
    		if(Object.keys(children).length) {
    			return true;
    		}
    		return false;
    	}
        $scope.pickedcategory = {};
	        var originalData = {};  
 		$scope.getCategoryList = function(data) {			  
			$timeout(function() {
				Product.setCategoryTreeSet(data);
	            $scope.pickedcategory = data; 
	        }); 
        }   
        $scope.saveCategory = function(data) {
    		Product.setCategory(data);
           	$location.path('admin/products/catalog/attributes/form');
        }
        $scope.checkarrow = function(index) { 
            if(parseInt(index) > 1) {
                return true;
            } 
            return false;
        }
         $scope.getDirData = function(data) { 
        	vm.attributedata = $scope.attributes = ArrayUtil.get(ArrayUtil.get(data,'data'),'attributes');
        } 

        $scope.editAttribute = function(index,block,parent) {
        	parent || (parent = '');  
            var cattributes = ArrayUtil.get(vm.attributedata,block,{});
            if(parent) { 
            	var sca = ArrayUtil.get(cattributes,parent,{});
            	var scopeattributes = ArrayUtil.get(sca.children,index,{});
            } else {
            	var scopeattributes = ArrayUtil.get(cattributes,index,{});
            }
            $scope.attribute_type = ArrayUtil.get(scopeattributes,'type','text');
            $timeout(function() {
        		$scope.$broadcast('editattributes',{index: index, block : block,attributes : scopeattributes,parent : parent});
        	});
        }

        $scope.deleteAttribute = function(index,block,parent) {   
        	var c = confirm ('Are you sure want to delete this attribute?');
        	if(c) {
	            Product.deleteCategoryAttribute(ArrayUtil.get(lastcat,'_id'),index,block,parent).then(function(res) {
	            	console.log(res.data);
		    		vm.attributedata =  $scope.attributes = ArrayUtil.get(res.data,'attributes',{});
		    	});
	        }
        }

        $scope.addNewAttribute = function(type) { 
            $scope.attribute_type = type;
        }
        $scope.cancel = function() {
        	$scope.attribute_type = false;
        }
        $scope.countObject = function(obd) {
        	if(obd == undefined) {
        		return false;
        	}
        	if(Object.keys(obd).length > 0) {
        		return true;
        	}
        	return false;
        }        
    }
  

    angular
        .module('mean.backend') 
        .controller('CategoryController', CategoryController)
        .controller('CatalogController', CatalogController)
        .controller('CatalogAddController', CatalogAddController)
        .controller('CatalogAttributesController', CatalogAttributesController);

    CategoryController.$inject = ['$scope', 'Global', 'Backend','ArrayUtil','Product'];
    CatalogController.$inject = ['$scope', 'Global', 'Backend','ArrayUtil','Product','$timeout','$location'];  
    CatalogAttributesController.$inject = ['$scope', 'Global', 'Backend','ArrayUtil','Product','$timeout','$location'];
    CatalogAddController.$inject = ['$scope', 'ArrayUtil','Product','$location'];
})();
