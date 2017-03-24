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

    function Backend($http, $q,$compile) {
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
                    return {path : '/theme/assets/lib/'+response.data.theme+'/',theme : response.data.theme};
                });
            },
            saveSettings : function(name, value, place_id) { 
                var deferred = $q.defer();
                $http.post('/api/settings/save',{name : name, value : value, place_id : place_id}).then(function(response) {
                    deferred.resolve(response);
                }, function(response) {
                    deferred.reject(response);
                });
                return deferred.promise;
            },
            saveAllSettings : function(datas) { 
                var deferred = $q.defer();
                 
                $http.post('/api/settings/saveall',datas).then(function(response) {
                    deferred.resolve(response);
                }, function(response) {
                    deferred.reject(response);
                });
                return deferred.promise;
            },
            getSettings: function(place_id) {
                var deferred = $q.defer();
                $http.get('/api/settings/get',{place_id : place_id}).then(function(response) {
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
            loadSider : function(scope,elementid,template) {
                var t = '<div class="sider-container" ng-include="\''+template+'\'"></div>'
                angular.element('#'+elementid).html(t);
                $compile(angular.element('#'+elementid))(scope);
            }
        };
    }

    function Authentication($http, $q,$window) {        
        var saveToken = function(token) {
            $window.localStorage['login-token'] = token;
        },
        getToken = function() {
            return $window.localStorage['login-token'];
        },
        logout = function() {
            $window.localStorage.removeItem('login-token');
        }, isLoggedIn = function() {
              var token = getToken();
              var payload;

              if(token){
                payload = token.split('.')[1];
                payload = $window.atob(payload);
                payload = JSON.parse(payload);  
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
            getToken : getToken,
            logout : logout,
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
            }
        }
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
        .factory('Page',Page);

    Backend.$inject = ['$http', '$q','$compile'];
    Authentication.$inject = ['$http', '$q','$window'];

})();
