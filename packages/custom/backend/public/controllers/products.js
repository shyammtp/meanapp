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
    function CatalogAddController($scope,ArrayUtil, Product,$location,$timeout) { 
 		var vm = this,categoryset = Product.getCategoryTreeSetForAdd();
        //console.log(categoryset);
        $scope.form = {};
 		if(categoryset== undefined) {
 			$location.path('admin/products/catalog/classify');
 		} 
 		$scope.infoattributes = $scope.pricing = $scope.description = $scope.more_details = {};
        

    	var lastcat = Product.getCategoryForAdd(); 
        //console.log(lastcat);

    	if(lastcat != undefined) {
	    	var attributes = ArrayUtil.get(lastcat,'attributes',{}); 
	    	$scope.infoattributes = ArrayUtil.sort(ArrayUtil.get(attributes,'info',{}));  
            console.log($scope.infoattributes);
	    	$scope.pricing = ArrayUtil.sort(ArrayUtil.get(attributes,'pricing',{}));
	    	$scope.description = ArrayUtil.sort(ArrayUtil.get(attributes,'description',{})); 
	    	$scope.more_details = ArrayUtil.sort(ArrayUtil.get(attributes,'more_details',{}));
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
        vm.product= {};

        $scope.saveproduct = function() { 

            console.log($scope.product);
            vm.product.category_id = ArrayUtil.get(lastcat,'_id');
            vm.product.category_collection = [];
            vm.product.category_collection = ArrayUtil.get(lastcat,'tree_path').split("/");
            vm.product.category_collection.push(ArrayUtil.get(lastcat,'_id'));  
            Product.addProductData(vm.product).saveProduct().then(function(res) {
                console.log(res);
                $scope.$broadcast('savedproduct',{response: res.data}); 
                $scope._id = ArrayUtil.get(res.data.data,'_id');  
                Materialize.toast('Product added successfully', 4000); 
            });

        }  
        $scope.$watch('product',function() {
            console.log($scope.form.productForm);
        })
        $scope.validateClass = function(elementid) {
            var ele = angular.element('#'+elementid);
            console.log(ele);
        }
        $timeout(function(){ 
        })
        $scope.submitForm = function(isValid) {
             
            if(isValid) {
                alert('Our Form is amazing');
            } else {
                $scope.maininfoclass = 'test';
            }
         }

        $scope.upload = function (file,s) {
            if(typeof vm.product.images == 'undefined') {
                vm.product.images = {};
            }
            vm.product.images[s] = file; 
            /*Upload.upload({
                url: 'upload/url',
                data: {file: file, 'username': $scope.username}
            }).then(function (resp) {
                console.log('Success ' + resp.config.data.file.name + 'uploaded. Response: ' + resp.data);
            }, function (resp) {
                console.log('Error status: ' + resp.status);
            }, function (evt) {
                var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
            });*/

        };
        $scope.getScope = function(s) {
           vm.product = s; 
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
	    	Product.getCategoryAttribute(ArrayUtil.get(lastcat,'_id'),false).then(function(res) {
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

        $scope.savecopyCategory = function(data) { 
            Product.setCopyCategoryAttribute(Product.getCategoryForAdd());
            Product.setCategory(data);
            $location.path('admin/products/catalog/attributes/copy/form');
        }

        $scope.copyattributes = function() {  
            var data = Product.getCategoryForAdd();
            var finalcat = Product.getCopyCategoryAttribute();
            var conf = confirm('Heads up!!! You are copying the attributes to this category. This will override other added attribute inside the category. Are you sure?');
            if(data.attributes !== undefined) {  
                if(conf) {
                    Product.overrideCategoryAttribute(finalcat._id, data.attributes).then(function(res) {   
                        Materialize.toast('Attributes copied to this category', 4000);
                        Product.setCategory(finalcat);
                        $location.path('admin/products/catalog/attributes/form');
                    });
                }
            }
        }
        $scope.cancelcopy = function() {   
            var finalcat = Product.getCopyCategoryAttribute();
            Product.setCategory(finalcat);
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

    function CatalogVariantsListController($scope,ArrayUtil,ListWidget) {
        var vm = this;  
         vm.setPage = setPage;
         ListWidget.init();
         ListWidget.add_link = '/admin/products/catalog/variants/form';
         ListWidget.defaultSortColumn = 'type';
         ListWidget.addColumn('variant_name',{'type' : 'text','title' : 'Variant',defaultValue : '--',width : '30%'});
         ListWidget.addColumn('display_name',{'type' : 'number','title' : 'Display Name',width : '30%'}); 
         ListWidget.addColumn('type',{'type' : 'select','title' : 'Type',width : '20%','options' : [{label : "System",id:'system'},
            {label : "custom",id:'custom'}]});
         ListWidget.addColumn('nocolumn',{'type' : 'notype','title' : 'Actions',defaultValue : '--',width : '20%',sortable : false,filterable : false,'render' : 'backend/views/products/catalog/variants/list/renderer/action.html'});
         ListWidget.setDataRequestUrl('/api/catalog/listvariants'); 
         
        function setPage(page) { 
            if(page < 1) {
                page = 1;
            }
            ListWidget.request({page: page,limit : 20,passtoken : true}).then(function(res){  
                console.log(res.data.docs);
                ListWidget.setTotalItems(res.data.total)
                        .setPageSize(20).setPage(page)
                        .setDBResults(res.data.docs);   
                $scope.pager = ListWidget.getPager();  
                $scope.dbresult = ListWidget.getDbResults();
            });    
        }  
        $scope.widgetlimitchange = function(selected) {
            ListWidget.request({page: 1,limit : selected,passtoken : true}).then(function(res){  
                ListWidget.setTotalItems(res.data.total)
                        .setPageSize(selected).setPage(1)
                        .setDBResults(res.data.docs);   
                $scope.pager = ListWidget.getPager();  
                $scope.dbresult = ListWidget.getDbResults();
            }); 
        }
        setPage(1);
        
    }

    function CatalogVariantsetListController($scope,ArrayUtil,ListWidget) {
        var vm = this;  
         vm.setPage = setPage;
         ListWidget.init();
         ListWidget.add_link = '/admin/products/catalog/variants/set/form';
         ListWidget.defaultSortColumn = 'type';
         ListWidget.addColumn('set_name',{'type' : 'text','title' : 'Set Name',defaultValue : '--',width : '60%'}); 
         ListWidget.addColumn('nocolumn',{'type' : 'notype','title' : 'Actions',defaultValue : '--',width : '40%',sortable : false,filterable : false,'render' : 'backend/views/products/catalog/variants/set/list/renderer/action.html'});
         ListWidget.setDataRequestUrl('/api/catalog/listvariantset'); 
         
        function setPage(page) { 
            if(page < 1) {
                page = 1;
            }
            ListWidget.request({page: page,limit : 20,passtoken : true}).then(function(res){  
                ListWidget.setTotalItems(res.data.total)
                        .setPageSize(20).setPage(page)
                        .setDBResults(res.data.docs);   
                $scope.pager = ListWidget.getPager();  
                $scope.dbresult = ListWidget.getDbResults();
            });    
        }  
        $scope.widgetlimitchange = function(selected) {
            ListWidget.request({page: 1,limit : selected,passtoken : true}).then(function(res){  
                ListWidget.setTotalItems(res.data.total)
                        .setPageSize(selected).setPage(1)
                        .setDBResults(res.data.docs);   
                $scope.pager = ListWidget.getPager();  
                $scope.dbresult = ListWidget.getDbResults();
            }); 
        }
        setPage(1);
        
    }

    function CatalogVariantsFormController($scope,ArrayUtil,Product,$location,$stateParams) {
        var vm = this;   
        $scope.varianttypes = Product.getVariantTypes();  
        $scope.type = '';
        if(typeof $stateParams.variantid != 'undefined') {
            Product.getVariantById({id : $stateParams.variantid}).then(function(response) {
                var d = response.data;
                if(!response.data._id) {
                    Materialize.toast('Invalid Variant', 4000,'errortoast');
                    $location.path('admin/products/catalog/variants');
                }
                $scope.variant_name = d.variant_name;
                $scope.display_name = d.display_name; 
                vm.variantdata._id = d._id;
                $scope.type = ArrayUtil.get(d.type,0);
                $scope.$broadcast('loadedvariant',{res : d}); 
            })
        } 
        $scope.settype = function(type) {
            $scope.type = type;
            vm.data = {};
        } 
        $scope.assetspath = $scope.$parent.assetspath;
        vm.variantdata = {};
        $scope.savevariant = function() { 
            $scope.$broadcast('formsubmitted',true);            
                //console.log(vm.data);
            vm.variantdata.variant_name = $scope.variant_name;
            vm.variantdata.display_name = $scope.display_name; 
            vm.variantdata.type = $scope.type; 
            vm.variantdata.data = vm.data;
            Product.saveVariant(vm.variantdata).then(function(res){
                Materialize.toast('Variant Added Successfully', 4000);
                $location.path('admin/products/catalog/variants');
            });
            
        }

        $scope.getScope = function(s) {
           vm.data = s; 
        } 

    }

    function CatalogVariantsetFormController($scope,ArrayUtil,Product,$location,$stateParams) {
        var vm = this,vtypes = Product.getVariantTypes();
        $scope.variantoptions = [];  
        $scope.choosedoptions = []; 
        Product.getAllVariants().then(function(res) {
            console.log(vtypes);
            if(res.status === 200) {
                var d = res.data,options = [];
                angular.forEach(d, function(v,k) {
                    var dg = {};

                    dg.type = ArrayUtil.get(ArrayUtil.get(v,'type'),0);
                    dg.typename = ArrayUtil.get(ArrayUtil.get(vtypes,dg.type),'title');
                    dg.variant_name = ArrayUtil.get(v,'variant_name');
                    dg.display_name = ArrayUtil.get(v,'display_name');
                    dg.id = v._id;
                    options.push(dg);
                });
                $scope.variantoptions = options;
                console.log($scope.variantoptions);
            }
        });
        $scope.openmodal = function() { 
        }
        $scope.appendtoset = function(opt) {
            
            $scope.choosedoptions.push(opt);
        }
        $scope.removeoption = function(index) {
            $scope.choosedoptions.splice(index,1);
        }
        $scope.sortableOptions = {
            axis : 'y'
        }
        /*$scope.varianttypes = Product.getVariantTypes();  
        $scope.type = '';
        if(typeof $stateParams.variantid != 'undefined') {
            Product.getVariantById({id : $stateParams.variantid}).then(function(response) {
                var d = response.data;
                if(!response.data._id) {
                    Materialize.toast('Invalid Variant', 4000,'errortoast');
                    $location.path('admin/products/catalog/variants');
                }
                $scope.variant_name = d.variant_name;
                $scope.display_name = d.display_name; 
                vm.variantdata._id = d._id;
                $scope.type = ArrayUtil.get(d.type,0);
                $scope.$broadcast('loadedvariant',{res : d}); 
            })
        } 
        $scope.settype = function(type) {
            $scope.type = type;
            vm.data = {};
        } 
        $scope.assetspath = $scope.$parent.assetspath;
        vm.variantdata = {};
        $scope.savevariant = function() { 
            $scope.$broadcast('formsubmitted',true);            
                //console.log(vm.data);
            vm.variantdata.variant_name = $scope.variant_name;
            vm.variantdata.display_name = $scope.display_name; 
            vm.variantdata.type = $scope.type; 
            vm.variantdata.data = vm.data;
            Product.saveVariant(vm.variantdata).then(function(res){
                Materialize.toast('Variant Added Successfully', 4000);
                $location.path('admin/products/catalog/variants');
            });
            
        }

        $scope.getScope = function(s) {
           vm.data = s; 
        } */

    }
  

    angular
        .module('mean.backend') 
        .controller('CategoryController', CategoryController)
        .controller('CatalogController', CatalogController)
        .controller('CatalogAddController', CatalogAddController)
        .controller('CatalogAttributesController', CatalogAttributesController) 
        .controller('CatalogVariantsListController', CatalogVariantsListController)
        .controller('CatalogVariantsetListController', CatalogVariantsetListController)
        .controller('CatalogVariantsFormController', CatalogVariantsFormController) 
        .controller('CatalogVariantsetFormController', CatalogVariantsetFormController) ;

    CategoryController.$inject = ['$scope', 'Global', 'Backend','ArrayUtil','Product'];
    CatalogController.$inject = ['$scope', 'Global', 'Backend','ArrayUtil','Product','$timeout','$location'];  
    CatalogAttributesController.$inject = ['$scope', 'Global', 'Backend','ArrayUtil','Product','$timeout','$location']; 
    CatalogAddController.$inject = ['$scope', 'ArrayUtil','Product','$location','$timeout'];
    CatalogVariantsListController.$inject = ['$scope', 'ArrayUtil','ListWidget'];
    CatalogVariantsetListController.$inject = ['$scope', 'ArrayUtil','ListWidget'];
    CatalogVariantsFormController.$inject = ['$scope', 'ArrayUtil','Product','$location','$stateParams'];
    CatalogVariantsetFormController.$inject = ['$scope', 'ArrayUtil','Product','$location','$stateParams'];
})();
