(function() {
    'use strict';
    Array.prototype.contains = function(v) {
        for(var i = 0; i < this.length; i++) {
            if(this[i] === v) return true;
        }
        return false;
    };

    Array.prototype.unique = function() {
        var arr = [];
        for(var i = 0; i < this.length; i++) {
            if(!arr.contains(this[i])) {
                arr.push(this[i]);
            }
        }
        return arr; 
    }

    function Backend($http, $q,$window,$compile,Authentication,ArrayUtil,$timeout) {
        return {
            name: 'backend',
            localsdata : {},
            checkCircle: function(circle) {
                var deferred = $q.defer();

                $http.get('/api/backend/example/' + circle).success(function(response) {
                    deferred.resolve(response);
                }).error(function(response) {
                    deferred.reject(response);
                });
                return deferred.promise;

            },
            getMenus : function() {
                var deferred = $q.defer();
                $http.get('/api/backend/menus').then(function(response) {
                    deferred.resolve(response);
                }, function(response) {
                    deferred.reject(response);
                });
                return deferred.promise;
            },
            getLocals : function() {
                var deferred = $q.defer();
                $http.get('/api/locals').then(function(response) {
                    deferred.resolve(response);
                }, function(response) {
                    deferred.reject(response);
                });
                return deferred.promise;
            },
            getAssetsData : function() {
                return this.getLocals().then(function(response) {
                    return {path : response.data.assetspath,theme : response.data.theme};
                });
            },
            getassetpath : function() { 
                /*if($window.assetsdata !== undefined) {
                    return (typeof $window.assetsdata.path !== 'undefined') ? $window.assetsdata.path : '';
                } */
                return '/theme/assets/lib/'+theme+'/';
            },
            getGeneralData : function(index) {
                var deferred = $q.defer();
                $http.get('/api/generaldatas',{cache : true}).then(function(response) {
                    var d = response.data;
                    if(typeof d[index] !== 'undefined') {
                        deferred.resolve(d[index]);
                    }  
                }, function(response) {
                    deferred.reject(response);
                }); 
                return deferred.promise;
            },
            saveSettings : function(name, value, place_id) { 
                var deferred = $q.defer();
                $http.post('/api/settings/save',{name : name, value : value, place_id : place_id},{headers : {'Authorization' : 'Bearer '+Authentication.getToken(),'_rid' : Authentication.getRestaurantId()}}).then(function(response) {
                    deferred.resolve(response);
                }, function(response) {
                    deferred.reject(response);
                });
                return deferred.promise;
            },
            saveAllSettings : function(datas,rid) { 
                var deferred = $q.defer();
                datas.rid =  rid;
                $http.post('/api/settings/saveall',datas,{headers : {'Authorization' : 'Bearer '+Authentication.getToken(),'_rid' : Authentication.getRestaurantId()}}).then(function(response) {
                    deferred.resolve(response);
                }, function(response) {
                    deferred.reject(response);
                });
                return deferred.promise;
            },
            saveTemplate : function(id, datas) { 
                var deferred = $q.defer();
                 
                $http.put('/api/notificationtemplate/save/'+id,datas,{headers : {'Authorization' : 'Bearer '+Authentication.getToken()}}).then(function(response) {
                    deferred.resolve(response);
                }, function(response) {
                    deferred.reject(response);
                });
                return deferred.promise;
            },
            saveUser : function(datas) { 
                var deferred = $q.defer();
                 
                $http.post('/api/users/save',datas,{headers : {'Authorization' : 'Bearer '+Authentication.getToken()}}).then(function(response) {
                    deferred.resolve(response);
                }, function(response) {
                    deferred.reject(response);
                });
                return deferred.promise;
            },
            getSettings: function(place_id) {
                var deferred = $q.defer();
                $http.get('/api/settings/get',{params : {rid : place_id},headers : {'Authorization' : 'Bearer '+Authentication.getToken(),'_rid' : Authentication.getRestaurantId()}}).then(function(response) {
                    deferred.resolve(response);
                }, function(response) {
                    deferred.reject(response);
                });
                return deferred.promise;
            },
            getAllDirectories: function() {
                var deferred = $q.defer();
                $http.get('/api/settings/getcountries',{cache  : true}).then(function(response) {
                    deferred.resolve(response);
                }, function(response) {
                    deferred.reject(response);
                });
                return deferred.promise;
            },
            getAllNotificationTemplate: function(params) {
                var deferred = $q.defer(); 
                $http.get('/api/notificationtemplate/getall',{params: params,cache  : true}).then(function(response) {
                    deferred.resolve(response);
                }, function(response) {
                    deferred.reject(response);
                });
                return deferred.promise;
            },
            upload: function(fd) {
                $http.post('/api/settings/upload', fd, {
                    withCredentials: false,
                    headers: {
                      'Content-Type': undefined
                    },
                    transformRequest: angular.identity,
                    params: {
                      fd
                    },
                    responseType: 'arraybuffer'
                  });
            },
            getAdminConfig : function(index) {
                 var deferred = $q.defer(); 
                $http.get('/api/adminconfig',{params: {'index' : index},cache  : true}).then(function(response) {
                    deferred.resolve(response);
                }, function(response) {
                    deferred.reject(response);
                });
                return deferred.promise;
            },
            loadSider : function(scope,elementid,template,cb) {
                var t = '<div class="sider-container" ng-include="\''+template+'\'"></div>';
                console.log(t);
                angular.element('#'+elementid).html(t);
                $timeout(function() {
                $compile(angular.element('#'+elementid))(scope);
                if(cb) {
                    cb(scope);
                }
                })
            },
            getDirectories : function() {
                var deferred = $q.defer();
                $http.get('/api/directory/getall',{headers : {'Authorization' : 'Bearer '+Authentication.getToken()}}).then(function(response) {
                    deferred.resolve(response);
                }, function(response) {
                    deferred.reject(response);
                });
                return deferred.promise; 
            },
            saveDirectory : function(params) {
                var deferred = $q.defer();
                $http.post('/api/directory/save?parent='+ArrayUtil.get(params,'parent'),params,{ headers : {'Authorization' : 'Bearer '+Authentication.getToken()}}).then(function(response) {
                    deferred.resolve(response);
                }, function(response) {
                    deferred.reject(response);
                });
                return deferred.promise;
            },
            deleteDirectory : function(params) {
                var deferred = $q.defer(); 
                $http.delete('/api/directory/delete/'+ArrayUtil.get(params,'id'),{ headers : {'Authorization' : 'Bearer '+Authentication.getToken()}}).then(function(response) {
                    deferred.resolve(response);
                }, function(response) {
                    deferred.reject(response);
                });
                return deferred.promise;
            },
            getDirectoryCache : function() {
                var deferred = $q.defer();
                $http.get('/api/directory/getallcache',{headers : {'Authorization' : 'Bearer '+Authentication.getToken()}}).then(function(response) {
                    deferred.resolve(response);
                }, function(response) {
                    deferred.reject(response);
                });
                return deferred.promise;
            },
            
            getDirectoryByType : function(params,level) {
                var deferred = $q.defer();
                $http.post('/api/directory/get?level='+level,params,{headers : {'Authorization' : 'Bearer '+Authentication.getToken()}}).then(function(response) {
                    deferred.resolve(response);
                }, function(response) {
                    deferred.reject(response);
                });
                return deferred.promise;
            }
        };
    }

    function Authentication($http, $q,$window) {        
        var saveToken = function(token) {
            $window.localStorage['login-token'] = token;
        },
        saveUser = function(user) {
            console.log("AuthenticationSaveUser",user);
            $window.localStorage['user'] =  user._id;
            if(user.restaurant_id) {
                $window.localStorage['restaurant_id'] = user.restaurant_id;
            }
            if(user.roles) {
                $window.localStorage['roles'] = JSON.stringify(user.roles);
                $window.localStorage['is_master'] = JSON.stringify(user.is_master);
            }
        },
        getRestaurantId = function() {
            return $window.localStorage['restaurant_id'];
        },
        getToken = function() {
            return $window.localStorage['login-token'];
        },
        getUser = function() {
            return $window.localStorage['user'];
        },
        
        logout = function() {
            $window.localStorage.removeItem('login-token');
            $window.localStorage.removeItem('roles');
            $window.localStorage.removeItem('user');
            $window.localStorage.removeItem('restaurant_id');
            $window.localStorage.removeItem('rolepermissions'); 
        }, isLoggedIn = function() {
              var token = getToken();
              var payload;

              if(token){
                payload = token.split('.')[1];
                payload = $window.atob(payload);
                payload = JSON.parse(payload);  

                if(payload.roles) {
                    $window.localStorage['roles'] = JSON.stringify(payload.roles);
                    $window.localStorage['is_master'] = payload.is_master;
                }
                return payload.exp > Date.now() / 1000;
              } else {
                return false;
              }
            },
        login = function(credentials) {
            var deferred = $q.defer();
            $http.post('/api/adminlogin',credentials).then(function(response) {

                deferred.resolve(response);
            }, function(response) {
                
                deferred.reject(response);
            });
            return deferred.promise;
        };
        return {
            saveToken : saveToken,
            saveUser : saveUser,
            getUser : getUser,
            getToken : getToken, 
            logout : logout,
            getRestaurantId : getRestaurantId,
            isLoggedIn : isLoggedIn,
            login : login
        }
    }

    function ArrayUtil() {
        return {
            get : function(obj, key, deflt) {
                deflt || (deflt = ''); 
                if(typeof obj[key] !== 'undefined') {
                    return obj[key];
                }
                return deflt;
            },
            sort : function(arra) {
                var ref = [];
                for (var sv in arra) {
                    ref.push({key : sv,sort : this.get(arra[sv],'sort',1) })
                }
                ref.sort(function(a,b){
                    return a.sort - b.sort;
                    }
                );
                var finalset = {};
                for (var dg in ref) {
                    finalset[this.get(ref[dg],'key')] = this.get(arra,this.get(ref[dg],'key'),{})
                }
                return finalset;
            },
            arrayunique : function(array) {
                return array.unique();
            },
            remove : function(array, index) { 
                var ind = array.indexOf(index);
                if (ind > -1) {
                   array.splice(ind, 1);
                }
                return array;
            },
            replaceStr : function (str, find, replace) {
                for (var i = 0; i < find.length; i++) {
                    str = str.replace(new RegExp(find[i], 'gi'), replace[i]);
                }
                return str;
            },
            slugtitle : function(str) {
                return str
                    .toLowerCase()
                    .replace(/ /g,'-')
                    .replace(/[^\w-]+/g,'')
                    ;
            }
        }
    }

    function Socket(socketFactory) { 
        return socketFactory({
            prefix: '',
            ioSocket: io.connect('http://localhost:8000')
        });
    }

    function Page() {
        var title = '';
        return {
            title: function() { return title; },
            setTitle: function(newTitle) { title = newTitle }
        }
    }
 

    angular
        .module('mean.backend')
        .factory('Backend', Backend)
        .factory('Authentication',Authentication)
        .factory('ArrayUtil',ArrayUtil)
        .factory('Socket',Socket)
        .factory('Page',Page);

    Backend.$inject = ['$http', '$q','$window','$compile','Authentication','ArrayUtil','$timeout'];
    Authentication.$inject = ['$http', '$q','$window'];
    Socket.$inject = ['socketFactory'];

})();
