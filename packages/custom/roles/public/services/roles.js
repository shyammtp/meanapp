(function() {
    'use strict';

    function Roles($http, $q,$window,$compile, Authentication, ArrayUtil) {
        this.permissions = [];
        return { 
            saveRole : function(data) {
                var deferred = $q.defer();
                $http.post('/api/settings/saverole',data,{headers : {'Authorization' : 'Bearer '+Authentication.getToken(),'_rid' : Authentication.getRestaurantId()}}).then(function(response) {
                    deferred.resolve(response);
                }, function(response) {
                    deferred.reject(response);
                });
                return deferred.promise;
            },
            getRoles : function() {
                var deferred = $q.defer();
                $http.get('/api/settings/getroles',{headers : {'Authorization' : 'Bearer '+Authentication.getToken(),'_rid' : Authentication.getRestaurantId()}}).then(function(response) {
                    deferred.resolve(response);
                }, function(response) {
                    deferred.reject(response);
                });
                return deferred.promise;
            },
            getRolesSet : function(rids) {
                var deferred = $q.defer();
                $http.post('/api/roles/getrolesset', {'rids' : rids}, {headers : {'Authorization' : 'Bearer '+Authentication.getToken(),'_rid' : Authentication.getRestaurantId()}}).then(function(response) {
                    deferred.resolve(response);
                }, function(response) {
                    deferred.reject(response);
                });
                return deferred.promise;
            },
            setPermissions : function(dat) {
                this.permissions = data;
                return this;
            },
            getPermissions  : function() {
                return this.permissions;
            },
            isAuthenticated : function(index) {
                if(!Authentication.isLoggedIn()) {
                    return false;
                }
                var _obj = this;
                var roles = []; 
                try {
                    roles = JSON.parse($window.localStorage['roles']);
                    if(!$window.localStorage['rolepermissions']) {
                         this.getRolesSet(roles.join(",")).then(function(res){
                            var data = (typeof res.data.data !== 'undefined') ? res.data.data : [];
                            var pr = [];
                            angular.forEach(data,function(b,c){
                                for(var h in b.permissions) {
                                    pr.push(h);
                                }
                            })
                            $window.localStorage['rolepermissions'] = JSON.stringify(pr);
                            _obj.setPermissions(pr);
                        }) 
                    }
                } catch(e) {

                }
                var master = $window.localStorage['is_master'];
                if(master !== 'false') {  
                   return true; 
                } else {
                   var rolespermissions = [];

                   try {
                        rolespermissions = JSON.parse($window.localStorage['rolepermissions']);
                   } catch(e) {

                   } 
                   console.log("RolePermission",rolespermissions);
                    if(rolespermissions.indexOf(index) > -1) {
                        return true;
                    } else {
                        return false;
                    }
                }
            },
        };
    }

    angular
        .module('mean.roles')
        .factory('Roles', Roles);

    
    Roles.$inject = ['$http', '$q','$window','$compile','Authentication','ArrayUtil'];


})();
