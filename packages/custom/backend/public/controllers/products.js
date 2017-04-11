(function() {
    'use strict';  
    var CryptoJS = require("crypto-js");
    var secretKey = 'SHYAMPRADEEP';

    function CategoryController($scope, Global, Backend,ArrayUtil, Product) { 
         var vm = this,categorymap;   
         //console.log($ocLazyLoad);
        var parentdata  = {};
        parentdata.externaljs = 'backend/views/'+theme+'/products/category/js.html'; 
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

    function loadProductList(controller, ListWidget, $scope,url)
    {
        controller.setPage = setPage;
        ListWidget.init();         
        ListWidget.defaultSortColumn = 'type';
        ListWidget.isFilter = false;
        ListWidget.addColumn('mainimage',{'type' : 'text','title' : 'Image',defaultValue : '--',width : '20%','render' : 'backend/views/'+theme+'/products/catalog/list/renderer/image.html',sortable : false,filterable : false});
        ListWidget.addColumn('sku',{'type' : 'text','title' : 'SKU',width : '30%','index' : 'data.sku'});  
        ListWidget.addColumn('product_title',{'type' : 'number','title' : 'Product Name','index' : 'data.item_name',width : '30%','render' : 'backend/views/'+theme+'/products/catalog/list/renderer/name.html'});  
        ListWidget.addColumn('nocolumn',{'type' : 'notype','title' : 'Actions',defaultValue : '--',width : '20%',sortable : false,filterable : false,'render' : 'backend/views/'+theme+'/products/catalog/list/renderer/action.html'});
        ListWidget.setDataRequestUrl(url); 
         
        function setPage(page) { 
            if(page < 1) {
                page = 1;
            }
            ListWidget.request({page: page,limit : 20,passtoken : true,nocache : true}).then(function(res){  
                console.log(res.data.docs);
                ListWidget.setTotalItems(res.data.total)
                        .setPageSize(20).setPage(page)
                        .setDBResults(res.data.docs);   
                $scope.pager = ListWidget.getPager();  
                $scope.dbresult = ListWidget.getDbResults();
            });    
        }  
        $scope.widgetlimitchange = function(selected) {
            ListWidget.request({page: 1,limit : selected,passtoken : true,nocache : true}).then(function(res){  
                ListWidget.setTotalItems(res.data.total)
                        .setPageSize(selected).setPage(1)
                        .setDBResults(res.data.docs);   
                $scope.pager = ListWidget.getPager();  
                $scope.dbresult = ListWidget.getDbResults();
            }); 
        }
        setPage(1);
    }

    function CatalogListController($scope, ListWidget, Backend,ArrayUtil, Product,$timeout,$location,Authentication,$stateParams) {
        var vm = this;
        $scope.advsearch = {};
        $scope.dbresult = {};
        $scope.views = {};
        var querys = {};
        console.log($stateParams);
        $scope.advsearch.userid = Authentication.getUser();  
        $scope.advsearch.settingtype = 'productviews';  
        $scope.$watch('filterproduct',function(oldval, newval) {
            if(newval !== oldval && newval !== undefined) {
                querys['productkeywords'] = oldval;
                var qstring = '';
                angular.forEach(querys, function(g,h) {
                    qstring += h+'='+g+'&';
                });
                loadProductList(vm, ListWidget, $scope,'/api/catalog/list?'+qstring); 
            } 
        });
        $scope.cview = $stateParams.view;
        
        Product.getProductViewInterface().then(function(res) {
            $scope.views = res.data;            
            if($stateParams.view !== undefined) {
                var viewcond = ArrayUtil.get(res.data,$stateParams.view);
                
                if(ArrayUtil.get(viewcond,'sortorderfield')) {
                    querys['sortkey'] = ArrayUtil.get(viewcond,'sortorderfield');
                    querys['sortdir'] = ArrayUtil.get(viewcond,'sortorderby',-1);
                }
                if(ArrayUtil.get(viewcond,'searchkeyword')) {
                    querys['searchkeyword'] = ArrayUtil.get(viewcond,'searchkeyword'); 
                }
                var querystring = '';
                angular.forEach(querys, function(g,h) {
                    querystring += h+'='+g+'&';
                });
                loadProductList(vm, ListWidget, $scope,'/api/catalog/list?'+querystring); 
            }     
        }); 
    
        loadProductList(vm, ListWidget, $scope,'/api/catalog/list');
         
        $scope.advancedsearch = function() {
            classie.toggle( document.getElementById( 'cbp-spmenu-s2' ), 'cbp-spmenu-open' );
            Backend.loadSider($scope,'cbp-spmenu-s2','backend/views/'+theme+'/products/catalog/list/customsearchform.html'); 
            angular.element('.cd-overlay').addClass('is-visible');
        }  
        $scope.currencycode = Product.getCurrency('currency_code');
        $scope.savesearch = function(type) {
            if(type === 'save' && $scope.advsearch.searchname) {
                Product.saveInterface($scope.advsearch).then(function(res) {
                    $scope.advsearch = {};
                    $scope.views = res.data;
                    Materialize.toast("Searched saved successfully", 4000); 
                    classie.toggle( document.getElementById( 'cbp-spmenu-s2' ), 'cbp-spmenu-open' );            
                    angular.element('.cd-overlay').removeClass('is-visible');
                });
            }
        }
        $scope.closethis = function() { 
            classie.toggle( document.getElementById( 'cbp-spmenu-s2' ), 'cbp-spmenu-open' );            
            angular.element('.cd-overlay').removeClass('is-visible');
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


    function CatalogAddController($scope,ArrayUtil, Product,$location,$timeout, Backend,Upload,$stateParams) { 
 		var vm = this,categoryset = Product.getCategoryTreeSetForAdd();
        var lastcat = Product.getCategoryForAdd(); var variationset = {};
        $scope.form = {};
 		if(categoryset === undefined && typeof $stateParams.product_id === 'undefined') {
 			$location.path('admin/products/catalog/classify');
 		} 

        function resetVariables() {
            $scope.infoattributes = $scope.pricing = $scope.description = $scope.more_details = {};
            $scope.variantsetoptions = [];
            $scope.optionset = [];
            variationset = {};
            $scope.subproducts = [];
            $scope.subproduct = {};
            $scope.product = {};  
            $scope.variantslist = {};
            vm.product= {};
            $scope.subproducteditindex = -1;
            $scope.variants = {} 
        }
        resetVariables();

        $scope.cancelmanage = function(){
            resetVariables();
            $location.path('admin/products/catalog');
        }

        $scope.$on('loadattributesfields',function() {  
            var attributes = ArrayUtil.get(lastcat,'attributes',{}); 
            $scope.infoattributes = ArrayUtil.sort(ArrayUtil.get(attributes,'info',{}));  
            $scope.pricing = ArrayUtil.sort(ArrayUtil.get(attributes,'pricing',{}));
            $scope.description = ArrayUtil.sort(ArrayUtil.get(attributes,'description',{})); 
            $scope.more_details = ArrayUtil.sort(ArrayUtil.get(attributes,'more_details',{}));
        });
        if(lastcat !== undefined) { 
            $scope.$broadcast('loadattributesfields');
        } 
         

        var publishdata = function(data) { 
            $scope.product = data; 
            $scope.updateset(ArrayUtil.get(data,'variantsetid'));
            $scope.product = angular.extend({},$scope.product, data.data); 

            $scope.product.optionset = ArrayUtil.get(data,'variantsetid'); 
            $scope.product.filepath = ArrayUtil.get(data,'gallery',{}); 
            $scope.product.mainimagepath = ArrayUtil.get(data,'mainimage');
            $scope.subproducts = parseproducts(ArrayUtil.get(data,'subproducts'));  
            $scope.variantslist[ArrayUtil.get(data,'variantsetid')] = $scope.subproducts;
            $scope.variants[ArrayUtil.get(data,'variantsetid')] = $scope.subproducts;
            $scope.product._id = data._id;
            $scope.$broadcast('editproduct',{data: data.data}); 
        }

        function parseproducts(ds) {
            var gd = []; 
            angular.forEach(ds,function(df,h){
                var fghg = {} ,opt = df.options;
                fghg = df;
                fghg.options = {};
                var ks = [];
                angular.forEach(opt,function(gh,ss) {     
                    var hj = {}               
                    hj[gh.key] = gh.value;
                    fghg.options[ss] = hj;
                });  
                gd.push(fghg);
            }); 
        
            return gd;
        }
        Product.getAllVariantset().then(function(response) {
                var data = response.data;
                angular.forEach(data, function(v,l){
                    var gg = {};
                    variationset[v._id] = v;
                    gg.name = v.set_name;
                    gg.value = v._id;                
                    $scope.variantsetoptions.push(gg);

                });
                 if(typeof $stateParams.product_id !== 'undefined') {
                     Product.getProductById($stateParams.product_id).then(function(res){ 
        
                        if(res.data === null) { 
        
                            Materialize.toast('Invalid Product', 4000,'errortoast'); 
                            $location.path('admin/products/catalog/classify');
                            return;
                        }
                        Product.getCategoryPath(res.data.category_collection).then(function(cre){ 
                            var gfgsa = {};
                            var k = 1;
                            angular.forEach(cre.data, function(ghh, fg) {
                                gfgsa[k] = ghh;
                                k++;
                            })
                            Product.setCategoryTreeSet(gfgsa);
                            $scope.pickedcategory = categoryset = Product.getCategoryTreeSetForAdd();
                            
                        });
                        Product.getCategoryAttribute(res.data.category_id).then(function(ress) {
                            Product.setCategory(ress.data);
                            lastcat = Product.getCategoryForAdd();
                            if(!lastcat) {
                                Materialize.toast('No Category Mapped to this product', 4000,'errortoast'); 
                                $location.path('admin/products/catalog');
                            }
                            $scope.$broadcast('loadattributesfields');                    
                            publishdata(res.data);
                        }); 
                    }) 
                }
                 
            });

        $scope.checkobjectlength = function(obj) { 
            if(Object.keys(obj).length > 0) {
                return true;
            }
            return false;
        }

        $scope.updateset = function(d) { 
            $scope.choosedvariantset = d; 
            $scope.variantslist = ArrayUtil.get(variationset,d,{}); 
            $scope.subproducts = ArrayUtil.get($scope.variants,d,[]);
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
        $scope.saveproduct = function() {  
            vm.product.category_id = ArrayUtil.get(lastcat,'_id'); 
            vm.product.category_collection = [];
            vm.product.category_collection = ArrayUtil.get(lastcat,'tree_path').split("/");
            vm.product.category_collection.push(ArrayUtil.get(lastcat,'_id'));  
            vm.product.variants = ArrayUtil.get($scope.variants,$scope.choosedvariantset,[]);
            vm.product.mainimage = $scope.product.mainimagepath;
            vm.product.gallery = $scope.product.filepath; 
            vm.product.variantsetid = $scope.choosedvariantset; 
            vm.product._id = $scope.product._id; 
            console.log(vm.product._id);
            Product.resetProductData().addProductData(vm.product).saveProduct().then(function(res) { 
                $scope.$broadcast('savedproduct',{response: res.data}); 
                $scope.product._id = ArrayUtil.get(res.data.data,'_id');  
                $location.path('admin/products/catalog');
                if(vm.product._id ) {
                    Materialize.toast('Product updated successfully', 4000);
                } else {
                    Materialize.toast('Product saved successfully', 4000); 
                }
                resetVariables();
            },function(err) {
                if(err.status === 500) { 
                    Materialize.toast(err.statusText, 4000,'errortoast');
                     Materialize.toast(err.data.errmsg, 4000,'errortoast');
                }
                console.log(err);
            });

        }   
        $scope.validateClass = function(elementid) {
            var ele = angular.element('#'+elementid); 
        } 
        $scope.submitForm = function(isValid) {             
            if(isValid) {
                alert('Our Form is amazing');
            } else {
                $scope.maininfoclass = 'test';
            }
         }

        $scope.upload = function (file,s) {
            if(typeof vm.product.images === 'undefined') {
                vm.product.images = {};
            }
            vm.product.images[s] = file;  

        };
        $scope.getScope = function(s) {  
           vm.product = s;  
           $scope.product = angular.extend({},$scope.product,s); 
        }
 		$scope.pickedcategory = categoryset;
        
        $scope.createsku = function() {
            $scope.subproduct = {}; 
            $scope.subproducteditindex  = -1;
            classie.toggle( document.getElementById( 'cbp-spmenu-s2' ), 'cbp-spmenu-open' );
            Backend.loadSider($scope,'cbp-spmenu-s2','backend/views/'+theme+'/products/catalog/fields/createsku.html'); 
            angular.element('.cd-overlay').addClass('is-visible');
        }
        $scope.closethis = function() { 
            $scope.subproduct = {}; 
            angular.element('.cd-overlay').removeClass('is-visible');
            classie.toggle( document.getElementById( 'cbp-spmenu-s2' ), 'cbp-spmenu-open' );
        }
        $scope.savesubproduct = function() { 
            var validone = validatesku();
            if(validone) {
                if($scope.subproducteditindex !== -1 && ArrayUtil.get($scope.subproducts,$scope.subproducteditindex)){
                    $scope.subproducts[$scope.subproducteditindex] = $scope.subproduct; 
                } else {
                    $scope.subproducts.push($scope.subproduct); 
                }
                
                $scope.variants[$scope.variantslist._id] = $scope.subproducts;
                angular.element('.cd-overlay').removeClass('is-visible');
                classie.toggle( document.getElementById( 'cbp-spmenu-s2' ), 'cbp-spmenu-open' );
                $scope.subproduct = {}; 
                Materialize.toast('Date stored temporarly. Save the whole product form and store it permanantly',4000); 
            } else {
                alert('Already SKU Attached to this product');
            }
        }
        $scope.editsku = function(index) {
            $scope.subproducteditindex = index;
            $scope.subproduct = ArrayUtil.get($scope.subproducts,index,{}); 
            angular.element('.cd-overlay').addClass('is-visible');
            Backend.loadSider($scope,'cbp-spmenu-s2','backend/views/'+theme+'/products/catalog/fields/createsku.html'); 
            classie.toggle( document.getElementById( 'cbp-spmenu-s2' ), 'cbp-spmenu-open' );
        }


        $scope.upload = function(file) {
            Upload.upload({
                url : '/api/fileupload?temppath=./uploads/variants/',
                data : {image : file,temppath : './uploads/'},
                method : 'POST'
            }).then(function(resp) { 
                if(resp.status === 200) {
                    if(resp.data.filedata) {
                       $scope.subproduct.image = resp.data.filedata.path;
                    }
                }
                
            }, function (resp) {
                console.log('Error status: ' + resp.status);
            }, function (evt) {
                var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                console.log('progress: ' + progressPercentage + '% ');
            })
        }


        $scope.uploadimage = function(file,hidden) {
            Upload.upload({
                url : '/api/fileupload?temppath=./uploads/products/',
                data : {image : file,temppath : './uploads/'},
                method : 'POST'
            }).then(function(resp) { 
                if(resp.status === 200) {
                    if(resp.data.filedata) {
                        if(hidden == 'mainimage') {
                            $scope.product.mainimagepath = resp.data.filedata.path;
                        } else { 
                            if($scope.product.filepath === undefined) {
                                $scope.product.filepath = {};
                            }
                           $scope.product.filepath[hidden] = resp.data.filedata.path;
                        }
                            console.log($scope.product);
                            console.log(hidden);
                    }
                }
                console.log(resp);
            }, function (resp) {
                console.log('Error status: ' + resp.status);
            }, function (evt) {
                var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                console.log('progress: ' + progressPercentage + '% ');
            })
        }

        var validatesku = function() {
            var s = $scope.subproducts, cpr = $scope.subproduct,error = 0,alist = [],clist = [],loop = true;
            angular.forEach(s, function(gh,ht){
                console.log($scope.subproducteditindex+"---"+ht);
                loop = true;
                if($scope.subproducteditindex !== -1 && parseInt($scope.subproducteditindex) === parseInt(ht)) {
                    loop = false;
                } 
                if(loop) {
                    var hsd = [];
                    angular.forEach(gh.options , function(gv,hh) {                    
                        angular.forEach(gv, function(h,jf){
                            hsd.push(h+":"+jf);
                        });                    
                    });
                    alist.push(hsd);
                }
            });
            console.log(cpr);
            angular.forEach(cpr.options , function(gv,hh) {
                angular.forEach(gv, function(h,jf){
                    clist.push(h+":"+jf);
                });
            });
            console.log(clist);
            console.log(alist);
            var tl = clist.length;
            angular.forEach(alist, function(v,z){
                var k = 0;
                angular.forEach(v, function(i,u){                    
                    var kgd = clist.indexOf(i);
                    if(kgd > -1) {
                        k++;
                    }
                }); 
                if(k === tl) {
                    error = 1;
                    return;
                }
            }); 
            return (error == 0) ? true : false;      
        }

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
         ListWidget.addColumn('nocolumn',{'type' : 'notype','title' : 'Actions',defaultValue : '--',width : '20%',sortable : false,filterable : false,'render' : 'backend/views/'+theme+'/products/catalog/variants/list/renderer/action.html'});
         ListWidget.setDataRequestUrl('/api/catalog/listvariants'); 
         
        function setPage(page) { 
            if(page < 1) {
                page = 1;
            }
            ListWidget.request({page: page,limit : 20,passtoken : true,nocache : true}).then(function(res){  
                console.log(res.data.docs);
                ListWidget.setTotalItems(res.data.total)
                        .setPageSize(20).setPage(page)
                        .setDBResults(res.data.docs);   
                $scope.pager = ListWidget.getPager();  
                $scope.dbresult = ListWidget.getDbResults();
            });    
        }  
        $scope.widgetlimitchange = function(selected) {
            ListWidget.request({page: 1,limit : selected,passtoken : true,nocache : true}).then(function(res){  
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
         ListWidget.addColumn('nocolumn',{'type' : 'notype','title' : 'Actions',defaultValue : '--',width : '40%',sortable : false,filterable : false,'render' : 'backend/views/'+theme+'/products/catalog/variants/set/list/renderer/action.html'});
         ListWidget.setDataRequestUrl('/api/catalog/listvariantset'); 
         
        function setPage(page) { 
            if(page < 1) {
                page = 1;
            }
            ListWidget.request({page: page,limit : 20,passtoken : true,nocache : true}).then(function(res){  
                ListWidget.setTotalItems(res.data.total)
                        .setPageSize(20).setPage(page)
                        .setDBResults(res.data.docs);   
                $scope.pager = ListWidget.getPager();  
                $scope.dbresult = ListWidget.getDbResults();
            });    
        }  
        $scope.widgetlimitchange = function(selected) {
            ListWidget.request({page: 1,limit : selected,passtoken : true,nocache : true}).then(function(res){  
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
        $scope.editindex = -1;
        vm.variantdata = {};
        $scope.variantid = false;
        $scope.ruleslength = 0;
        if(typeof $stateParams.variantid != 'undefined') {
            $scope.variantid = $stateParams.variantid;
            Product.getVariantsetById({id : $stateParams.variantid}).then(function(response) {
                var d = response.data;
                if(!response.data._id) {
                    Materialize.toast('Invalid Variant Set', 4000,'errortoast');
                    $location.path('admin/products/catalog/variants/set');
                }
                $scope.set_name = d.set_name;
                $scope.choosedoptions = $scope.option_set = d.option_set; 
                $scope.ruleslength = ArrayUtil.get(d,'rules',[]).length;
                vm.variantdata._id = d._id;
               // $scope.type = ArrayUtil.get(d.type,0);
               // $scope.$broadcast('loadedvariant',{res : d}); 
            })
        } 

        Product.getAllVariants().then(function(res) {
            
            if(res.status === 200) {
                var d = res.data,options = [];
                console.log(d);
                angular.forEach(d, function(v,k) {
                    var dg = {};

                    dg.type = ArrayUtil.get(ArrayUtil.get(v,'type'),0);
                    dg.typename = ArrayUtil.get(ArrayUtil.get(vtypes,dg.type),'title');
                    dg.variant_name = ArrayUtil.get(v,'variant_name');
                    dg.display_name = ArrayUtil.get(v,'display_name');
                    if(dg.type === 'swatch') {
                         var listval = ArrayUtil.get(ArrayUtil.get(v,'type_datas'),'listvalues');
                         var sfg = [];
                         angular.forEach(listval,function(sv,sk){
                            sv.required = ArrayUtil.get(sv,'required',true);
                            sfg.push(sv);
                        });
                        v.type_datas.listvalues = sfg;
                    }
                    dg.typedata = ArrayUtil.get(v,'type_datas');
                    dg.required = ArrayUtil.get(v,'required',true);

                    dg.id = v._id;
                    options.push(dg);
                });
                $scope.variantoptions = options; 
                //console.log($scope.updatedoptions);
            }
        });

        $scope.saveupdated = function() {
            Materialize.toast('Saved the data temporarly. Please save this whole form to update', 4000);
            $scope.editindex = -1;
        }

        $scope.edititem = function(index) {
            $scope.editindex = index;
        }

        $scope.hasIndex =  function(obj,key) { 
            if(ArrayUtil.get(obj,key,false)) {
                return true;
            }
            return false;
        }

        $scope.getenabledoptions = function(options) {
            var opt = [];
            if(ArrayUtil.get(options,'type') == 'swatch') {
                angular.forEach(ArrayUtil.get(ArrayUtil.get(options,'typedata'),'listvalues'),function(v,k){
                    var g = {};
                    g.name = ArrayUtil.get(v,'swatchname');
                    opt.push(g);
                });
                return opt;
            }
        }
        $scope.openmodal = function() { 
            angular.element('.modal').modal('open');
            $scope.$broadcast('modaltemplate','backend/views/'+theme+'/widget/elements/input.html');
        }
        $scope.appendtoset = function(opt) {
            
            $scope.choosedoptions.push(opt);
        }
        $scope.removeoption = function(index) {
            $scope.choosedoptions.splice(index,1);
        }
        $scope.sortableOptions = {
            update : function(e,ui) {
                $scope.editindex = -1;
            },
            axis : 'y'
        }
        $scope.savevariant = function() {
            vm.variantdata.set_name = $scope.set_name;  
            vm.variantdata.option_set = $scope.choosedoptions;
            Product.saveVariantSet(vm.variantdata).then(function(res){
                Materialize.toast('Variant Set Added Successfully', 4000);
                $location.path('admin/products/catalog/variants/set');
            });
        } 

    }

    function CatalogVariantsetrulesListController($scope,ArrayUtil,ListWidget,$stateParams,Backend,Product,$location,$state) {
        var vm = this;
        vm.setPage = setPage;
        $scope.rules = {};
         vm.variantdata = {};
         $scope.set_name = '';
        $scope.variantid = false;
        $scope.hasParams = false;
        var loadrule = function() {
            if(typeof $stateParams.variantid != 'undefined') {

                $scope.variantid = $stateParams.variantid;
                Product.getVariantsetById({id : $stateParams.variantid}).then(function(response) {
                    var d = response.data; 
                    if(!response.data._id) {
                        Materialize.toast('Invalid Variant Set', 4000,'errortoast');
                        $location.path('admin/products/catalog/variants/set');
                    } 
                    $scope.set_name = d.set_name;
                    $scope.option_set = d.option_set; 
                    var s = 0;
                    angular.forEach(d.option_set,function(vvb,fg){
                        var listvalues = ArrayUtil.get(vvb.typedata,'listvalues',false);
                        if(listvalues) {
                            s++;
                        }
                    });
                    $scope.hasParams = (s > 0);
                });
            } 
        }
        loadrule();
        $scope.closethis = function() { 
            classie.toggle( document.getElementById( 'cbp-spmenu-s2' ), 'cbp-spmenu-open' );
        }

        $scope.editrule = function(index) { 
            Product.getVariantRuleByIndex({id : $scope.variantid, index : index}).then(function(res) { 
                $scope.editid = index;
                $scope.rules = res.data;
                $scope.opensider(false);
            });
            
        }

        $scope.saverule = function() {
            if(!$scope.variantid) {
                return false;
            } 
            if(!$scope.hasParams) {
                return false;
            }
            var params = {};
            params.rules = $scope.rules;
            if($scope.editid) {
                params.index = $scope.editid;
            } 
            Product.saveVariantRule($scope.variantid,params).then(function(res) {
                var d = res.data;
                $scope.rules = {};
                classie.toggle( document.getElementById( 'cbp-spmenu-s2' ), 'cbp-spmenu-open' );
                Materialize.toast('Rule saved successfully', 4000); 
               loadlist(); 
            });
        }
        $scope.opensider = function(newinit) {
            if(newinit) {
                $scope.rules = {};
            }
            classie.toggle( document.getElementById( 'cbp-spmenu-s2' ), 'cbp-spmenu-open' );
            Backend.loadSider($scope,'cbp-spmenu-s2','backend/views/'+theme+'/products/catalog/variants/set/rules/form.html'); 
        }

        var loadlist = function() { 
            ListWidget.init();
            ListWidget.defaultSortColumn = 'type';
            ListWidget.isFilter = false;
            ListWidget.isPaging = false;
            ListWidget.addColumn('name',{'type' : 'text','title' : 'When This Is Selected',defaultValue : '--',width : '40%','render' : 'backend/views/'+theme+'/products/catalog/variants/set/rules/renderer/name.html'}); 
            ListWidget.addColumn('change',{'type' : 'text','title' : 'Make this change',defaultValue : '--',width : '40%','render' : 'backend/views/'+theme+'/products/catalog/variants/set/rules/renderer/change.html'});
            ListWidget.addColumn('nocolumn',{'type' : 'notype','title' : 'Actions',defaultValue : '--',width : '20%',sortable : false,filterable : false,'render' : 'backend/views/'+theme+'/products/catalog/variants/set/rules/renderer/action.html'});
            ListWidget.setDataRequestUrl('/api/catalog/listvariantrulesset?id='+$stateParams.variantid);  
            setPage(1);
        }
        loadlist();
        function setPage(page) { 
            if(page < 1) {
                page = 1;
            }
            ListWidget.request({page: page,limit : 20,passtoken : true,nocache : true}).then(function(res){  
                ListWidget.setTotalItems(res.data.total)
                        .setPageSize(20).setPage(page)
                        .setDBResults(res.data.docs);   
                $scope.pager = ListWidget.getPager();  
                $scope.dbresult = ListWidget.getDbResults();
            });    
        }  
        $scope.widgetlimitchange = function(selected) {
            ListWidget.request({page: 1,limit : selected,passtoken : true,nocache : true}).then(function(res){  
                ListWidget.setTotalItems(res.data.total)
                        .setPageSize(selected).setPage(1)
                        .setDBResults(res.data.docs);   
                $scope.pager = ListWidget.getPager();  
                $scope.dbresult = ListWidget.getDbResults();
            }); 
        }
        
    }

    function menusController($scope,ItemMenus,ArrayUtil,$timeout,Socket) { 
        
        $scope.menus = [];
        $scope.activemenus = [];
        ItemMenus.getAllMenus().then(function(res){
            $scope.menus = res.data.menus;
        });
        $scope.inactivemenus = [];
        $scope.$watch('menus',function() {
            var mens = [],acmes = [];
            angular.forEach($scope.menus, function(gh,sg){
                if(gh.status !== true) {
                    mens.push(gh);
                }
                if(gh.status === true) {
                    acmes.push(gh);
                }
            });
            $scope.inactivemenus = mens;
            $scope.activemenus = acmes;
        });

        Socket.on('article.created', function(article) {
            console.log(article);
        });

        $scope.menuupdated  = false;
        $scope.saveMenus = function(menu) {  
            var params = {}; 
            params['menu_name'] = {'en' : ArrayUtil.get(menu,'menu_name')};
            if(ArrayUtil.get(menu,'_id')) params['_id'] = ArrayUtil.get(menu,'_id');
            ItemMenus.saveMenus(params).then(function(res) {
                 Materialize.toast("Menu Updated", 4000);
                $scope.menuupdated = true;
                $scope.menu = {};
                $scope.menus = res.data.menus;
                },function(err) {
                    if(err.status == 500) {
                        Materialize.toast(ArrayUtil.get(ArrayUtil.get(err,'data'),'message','Menu not saved'), 4000,'errortoast');
                    } 
            });
        }
        $scope.editmenu = function(id,menuname) {
            $scope.menu = {};
            $scope.menu._id = id;
            $scope.menu.menu_name = menuname;
        }

        function updatesort() {
            var sorts = [],sortnumber = 1; 
            $timeout(function() {
                angular.forEach($scope.activemenus, function(gghh,sdg) {
                    sorts.push({'_id' : gghh._id,'sorting' : sortnumber});
                    sortnumber++;
                }); 
                var params = {};
                params.forsort = true;
                params.items = sorts;
                ItemMenus.saveMenus(params).then(function(res) {
                    Materialize.toast("Menu Updated", 4000);
                    $scope.menuupdated = true;
                    $scope.menu = {}; 
                    $scope.menus = res.data.menus;
                    },function(err) {
                        if(err.status == 500) {
                            Materialize.toast(ArrayUtil.get(ArrayUtil.get(err,'data'),'message','Menu not saved'), 4000,'errortoast');
                        } 
                });
            });
        }

        $scope.sortableOptions = {
            update : function(e,ui) {
                updatesort();
            },
            axis : 'y',
            'ui-floating': true
        } 

        $scope.menuactive = function(id) {
            var params = {}; 
            if(!id) {
                Materialize.toast("Invalid Menu", 4000,"errortoast");
                return false;
            }
            params['status'] = 1;
            params['_id'] = id;
            ItemMenus.saveMenus(params).then(function(res) {
                 Materialize.toast("Menu Updated", 4000);
                $scope.menuupdated = true;
                $scope.menu = {};
                $scope.menus = res.data.menus;
                },function(err) {
                    if(err.status == 500) {
                        Materialize.toast(ArrayUtil.get(ArrayUtil.get(err,'data'),'message','Menu not saved'), 4000,'errortoast');
                    } 
            });
        } 

        $scope.deletemenu = function(id) {
            var confg = confirm('Are you sure want to delete this menu?');
            if(confg) {
                var params = {}; 
                if(!id) {
                    Materialize.toast("Invalid Menu", 4000,"errortoast");
                    return false;
                } 
                params['id'] = id;
                ItemMenus.deleteMenus(params).then(function(res) {
                    Materialize.toast("Menu Deleted Successfully", 4000);
                    $scope.menuupdated = true;
                    $scope.menu = {};
                    $scope.menus = res.data.menus;
                    },function(err) {
                        if(err.status == 500) {
                            Materialize.toast(ArrayUtil.get(ArrayUtil.get(err,'data'),'message','Menu not deleted'), 4000,'errortoast');
                        } 
                });
            }
        }

        $scope.menuinactive = function(id) {
            var params = {}; 
            if(!id) {
                Materialize.toast("Invalid Menu", 4000,"errortoast");
                return false;
            }
            params['status'] = -1;
            params['_id'] = id;
            params['sorting'] = 50000;
            ItemMenus.saveMenus(params).then(function(res) {
                 Materialize.toast("Menu Updated", 4000);
                $scope.menuupdated = true;
                $scope.menu = {};
                $scope.menus = res.data.menus;
                },function(err) {
                    if(err.status == 500) {
                        Materialize.toast(ArrayUtil.get(ArrayUtil.get(err,'data'),'message','Menu not saved'), 4000,'errortoast');
                    } 
            });
        }

        $scope.newmenuadd = function() {
            $scope.menu = {};
        }
    }



    function MenuItemsController($scope,ItemMenus,ArrayUtil,$timeout,Product,Upload) { 
        var vm = this;
        $scope.items = []; 
        $scope.menus = [];  

        vm.item = {};
        $scope.item = {};
        var variationset= {},items = {};
        $scope.menusub = {};
        $scope.menuassign = {};
        $scope.variantsetoptions = []; 
        Product.getAllVariantset().then(function(response) {
             var data = response.data;
            angular.forEach(data, function(v,l){
                var gg = {};
                variationset[v._id] = v;
                gg.name = v.set_name;
                gg.value = v._id;                
                $scope.variantsetoptions.push(gg); 
            });
        });


        function loopitems(its) {
            angular.forEach(its, function(v,l){
                angular.forEach(v.menus,function(a,r){ 
                    if(typeof $scope.menuassign[v._id] === 'undefined') {
                        $scope.menuassign[v._id] = {};
                    }
                    if(typeof $scope.menuitems[a] === 'undefined') {
                        $scope.menuitems[a] = [];
                    }
                    $scope.menuitems[a].push(v);
                    $scope.menuassign[v._id][a] = true; 
                })
                items[v._id] = v;
            });
        }

        $scope.getMenuItems = function(menuid) {
            var itms = ArrayUtil.get($scope.menuitems,menuid); 
            return itms;
        }

        $scope.menuitems = {};
        ItemMenus.getAllMenus().then(function(res){
            $scope.menus = res.data.menus;
            ItemMenus.getItems().then(function(ress) {
                loopitems(ress.data); 
                $scope.items = ress.data;
            })
        });
        $scope.variationoptiongroups = [];
        $scope.$watch('item.optionset',function() {
            if($scope.item.optionset !== undefined) {
                var set = ArrayUtil.get(variationset,$scope.item.optionset);
                $scope.variationoptiongroups = ArrayUtil.get(set,'option_set');
                console.log(set);
            } 
        })
        $scope.uploadimage = function(file,hidden) {
            Upload.upload({
                url : '/api/fileupload?temppath=./uploads/items/',
                data : {image : file,temppath : './uploads/'},
                method : 'POST'
            }).then(function(resp) { 
                if(resp.status === 200) {
                    if(resp.data.filedata) {
                        if(hidden == 'mainimage') {
                            $scope.item.mainimagepath = resp.data.filedata.path;
                        }    
                    }
                }
                console.log(resp);
            }, function (resp) {
                console.log('Error status: ' + resp.status);
            }, function (evt) {
                var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                console.log('progress: ' + progressPercentage + '% ');
            })
        }

        $scope.edititem = function(id) {
            var item = ArrayUtil.get(items,id);
            var edititem = {};
            edititem = ArrayUtil.get(item,'data');
            edititem._id = ArrayUtil.get(item,'_id');
            $scope.item = edititem;
        }

        $scope.deleteitem = function(id) {
            var confg = confirm('Are you sure want to delete this item?');
            if(confg) {
                var params = {}; 
                if(!id) {
                    Materialize.toast("Invalid Item", 4000,"errortoast");
                    return false;
                } 
                params['id'] = id;
                ItemMenus.deleteItem(params).then(function(res) {
                    Materialize.toast("Item Deleted Successfully", 4000);                    
                    $scope.items = [];
                    $scope.menuassign = {};
                    loopitems(res.data.items); 
                    $scope.items = res.data.items; 
                    },function(err) {
                        if(err.status == 500) {
                            Materialize.toast(ArrayUtil.get(ArrayUtil.get(err,'data'),'message','Item not deleted'), 4000,'errortoast');
                        } 
                });
            }
        }

        $scope.saveitem = function() {  
            vm.item = {}; 
            vm.item = $scope.item;
            vm.item.is_foodie = true; 
            vm.item.mainimage = $scope.item.mainimagepath;
            vm.item.gallery = $scope.item.filepath; 
            vm.item.variantsetid = $scope.item.optionset; 
            vm.item._id = $scope.item._id;  
            $scope.menuassign = {};
            Product.resetProductData().addProductData(vm.item).saveProduct().then(function(res) {  
                $scope.item = {};
                $scope.variationoptiongroups = [];   
                if(vm.item._id ) {
                    Materialize.toast('Item updated successfully', 4000);
                } else {
                    Materialize.toast('Item saved successfully', 4000); 
                }
                ItemMenus.getItems().then(function(ress) {
                    loopitems(ress.data); 
                    $scope.items = ress.data;
                })
                //resetVariables();
            },function(err) {
                if(err.status === 500) { 
                    Materialize.toast(err.statusText, 4000,'errortoast');
                     Materialize.toast(err.data.errmsg, 4000,'errortoast');
                }
                console.log(err);
            });
        }
        $scope.cancelmanage = function() {
            $scope.item = {};
            $scope.variationoptiongroups = [];  
        }
        $scope.showmenus = function(id) {
            if(typeof $scope.menusub[id] === 'undefined') { 
                $scope.menusub[id] = true;
            } else if($scope.menusub[id] === true) {
                $scope.menusub[id] = false;
            } else if($scope.menusub[id] === false) {
                $scope.menusub[id] = true;
            }
        }

        $scope.productupdatemenu = function(id) { 
            var sctr = ArrayUtil.get($scope.menuassign,id,{}),gg= []; 
            angular.forEach(sctr, function(gh,ds) {
                if(gh === true) { 
                    gg.push(ds);
                }
            }) 
            ItemMenus.setMenu(id,gg).then(function(res){
                $scope.menuitems = {};
                ItemMenus.getItems().then(function(ress) {
                    angular.forEach(ress.data, function(v,l){
                        angular.forEach(v.menus,function(a,r){  
                            if(typeof $scope.menuitems[a] === 'undefined') {
                                $scope.menuitems[a] = [];
                            }
                            $scope.menuitems[a].push(v);  
                        })
                        items[v._id] = v;
                    });
                    $scope.items = ress.data;
                })
            });
        }
    }

    function CartOrderController($scope,ItemMenus,ArrayUtil,$timeout,Socket,Authentication,$location) {

        $scope.orders = [];
        var reference = [];
        ItemMenus.cartOrders().then(function(res) {
            console.log(res);
            $scope.orders = res.data;
            angular.forEach(res.data,function(g,r){
                reference.push(g.cart_reference);
            });

            Socket.on('cart.orders',function(d) { 
                 $scope.$emit('orderupdate',{ref : reference,data : d}); 
            });
        });

        $scope.goto = function(id) {
            $location.path('/admin/orders/items/live/'+id);
            return;
        }

        $scope.takeorder = function(id) { 
            ItemMenus.updateCart(id,{'reserved_for' : Authentication.getUser(),'change' : true}).then(function(res){
                var dt = res.data;
                if(!dt.success) {
                    Materialize.toast(dt.message, 4000,'errortoast');
                    return;
                }
                if(dt.success) {
                    $scope.goto(id);
                    return;
                }
            })
        }
    }

    function CartOrderItemController($scope,ItemMenus,ArrayUtil,$timeout,Socket,Authentication,$location,$stateParams) {

         $scope.cart = {};
         console.log($stateParams);
         if($stateParams.cartid != undefined) {

            ItemMenus.getOrder($stateParams.cartid).then(function(res){         
                    $scope.cart = res.data.cart;
                    $scope.cart.sumprices = ItemMenus.calculatePrices(res.data.cart);
                    console.log($scope.cart);
                },function(err) { 
                if(err.status == 500) {
                    Materialize.toast(ArrayUtil.get(ArrayUtil.get(err,'data'),'message','Category not saved'), 4000,'errortoast');
                    $location.path('/admin/cart/orders');
                    return;
                } 
            });
            Socket.on('cart.orders',function(d) { 
                angular.forEach(d,function(w,c) {
                    if($stateParams.cartid === w._id) {
                        $scope.cart = w;
                        $scope.cart.sumprices = ItemMenus.calculatePrices(w);
                    }
                })
            });

            $scope.subitem_names = function(o) {
                var names = [];
                angular.forEach(o.options,function(gh,dds) {
                    var t = gh.name;
                    if(gh.price > 0) {
                        t += '('+ gh.price + ')';
                    }
                    names.push(t);
                });
                return names.join(", ");
            }

            $scope.subitem_price = function(o) {
                var total = 0;
                angular.forEach(o.options,function(gh,dds) {
                    total+= parseFloat(gh.price);
                });
                return total > 0 ? total : false;
            }
         }
    }
  

    angular
        .module('mean.backend') 
        .controller('CategoryController', CategoryController)
        .controller('CartOrderController', CartOrderController)
        .controller('CartOrderItemController', CartOrderItemController)
        .controller('menusController', menusController)
        .controller('MenuItemsController', MenuItemsController)
        .controller('CatalogListController', CatalogListController)
        .controller('CatalogController', CatalogController)
        .controller('CatalogAddController', CatalogAddController)
        .controller('CatalogAttributesController', CatalogAttributesController) 
        .controller('CatalogVariantsListController', CatalogVariantsListController)
        .controller('CatalogVariantsetListController', CatalogVariantsetListController)
        .controller('CatalogVariantsFormController', CatalogVariantsFormController) 
        .controller('CatalogVariantsetrulesListController', CatalogVariantsetrulesListController) 
        .controller('CatalogVariantsetFormController', CatalogVariantsetFormController) ;

    CategoryController.$inject = ['$scope', 'Global', 'Backend','ArrayUtil','Product'];
    menusController.$inject = ['$scope','ItemMenus','ArrayUtil','$timeout','Socket'];
    CartOrderController.$inject = ['$scope','ItemMenus','ArrayUtil','$timeout','Socket','Authentication','$location'];
    CartOrderItemController.$inject = ['$scope','ItemMenus','ArrayUtil','$timeout','Socket','Authentication','$location','$stateParams'];
    MenuItemsController.$inject = ['$scope','ItemMenus','ArrayUtil','$timeout','Product','Upload'];
    CatalogController.$inject = ['$scope', 'Global', 'Backend','ArrayUtil','Product','$timeout','$location'];  
    CatalogListController.$inject = ['$scope', 'ListWidget', 'Backend','ArrayUtil','Product','$timeout','$location','Authentication','$stateParams'];  
    CatalogAttributesController.$inject = ['$scope', 'Global', 'Backend','ArrayUtil','Product','$timeout','$location']; 
    CatalogAddController.$inject = ['$scope', 'ArrayUtil','Product','$location','$timeout','Backend','Upload','$stateParams'];
    CatalogVariantsListController.$inject = ['$scope', 'ArrayUtil','ListWidget'];
    CatalogVariantsetListController.$inject = ['$scope', 'ArrayUtil','ListWidget'];
    CatalogVariantsetrulesListController.$inject = ['$scope', 'ArrayUtil','ListWidget','$stateParams','Backend','Product','$location','$state'];
    CatalogVariantsFormController.$inject = ['$scope', 'ArrayUtil','Product','$location','$stateParams'];
    CatalogVariantsetFormController.$inject = ['$scope', 'ArrayUtil','Product','$location','$stateParams'];
})();
