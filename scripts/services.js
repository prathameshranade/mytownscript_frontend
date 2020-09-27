(function () {                                                                  //'use strict' in function to avoid problems
   'use strict';                                                                // during concatenation(JSHint).
}());

/*global angular */                                                             // make 'angular' global for JSHint to understand.

angular.module("myTownScripts")

    .constant("baseURL","https://mytownscripts.com/")

    .factory('$localStorage', ['$window', function($window) {                //Storage gets attached to the window of the browser
        return {
            store: function (key, value) {
                $window.localStorage[key]= value;
            },
            get: function (key, defaultValue) {
                return $window.localStorage[key] || defaultValue;
            },
            remove: function (key) {
                $window.localStorage.removeItem(key);
            },
            storeObject: function (key, value) {
                $window.localStorage[key] = JSON.stringify(value);
            },
            getObject: function (key, defaultValue) {
                return JSON.parse($window.localStorage[key] || defaultValue);
            }
        };
    }])

    .factory('AuthFactory', ['$resource', '$localStorage','baseURL', '$http', '$rootScope', function($resource, $localStorage , baseURL, $http,   $rootScope) {
            
        var authFac = {};
        var authToken= undefined;
        var TOKEN_KEY = 'Token';
        var citizenID;
        var isAuthenticated = false;
        var loginResponseStatus = "";
        var registerResponseStatus = "";
        var firstname = '';
        var scope = '';
        var professions = '', profilePicture = '',verificationStatus,isFacebookLogin=false, restaurantName, restaurantID;
        
        function loadUserCredentials() {
            var credentials = $localStorage.getObject(TOKEN_KEY, '{}');
            if (credentials.firstname != undefined) {
                console.log("useCredentials in loadUserCredentials: "+credentials);
                useCredentials(credentials);
            } else if(credentials.restaurantName != undefined) {
                console.log("useRestaurantCredentials in loadUserCredentials: "+credentials);
                useRestaurantCredentials(credentials);
            }
        }
        
        function storeUserCredentials(credentials) {
            $localStorage.storeObject(TOKEN_KEY, credentials);
            if (credentials.firstname != undefined) {
                console.log("useCredentials in storeUserCredentials: "+credentials);
                useCredentials(credentials);
            } else if(credentials.restaurantName != undefined) {
                console.log("useRestaurantCredentials in storeUserCredentials: "+credentials);
                useRestaurantCredentials(credentials);
            }
//            useCredentials(credentials);
        }
        
        function useCredentials(credentials) {
            isAuthenticated = true;
            firstname = credentials.firstname;
            authToken = credentials.token;
            citizenID = credentials.citizenID;
            scope = credentials.scope;
            professions = credentials.professions;
            profilePicture = credentials.profilePicture;
            verificationStatus = credentials.verificationStatus;
            $http.defaults.headers.common['x-access-token'] = authToken;           //Setting the token in the Header
        }
        
        function destroyUserCredentials() {
            authToken = undefined;
            firstname= '';
            isAuthenticated = false;
            citizenID = '';
            scope = '';
            professions = '';
            profilePicture = '';
            verificationStatus= '';
            
            $http.defaults.headers.common['x-access-token'] = authToken;
            $localStorage.remove(TOKEN_KEY);
        }
        
        function useRestaurantCredentials(credentials) {
            
            isAuthenticated = true;
            restaurantName = credentials.restaurantName;
            authToken = credentials.token;
            restaurantID = credentials.ID;
            scope = credentials.scope;
            $http.defaults.headers.common['x-access-token'] = authToken;           //Setting the token in the Header
        }
        
        function destroyRestaurantCredentials() {
            authToken = undefined;
            restaurantName= '';
            isAuthenticated = false;
            restaurantID = '';
            scope = '';
            
            $http.defaults.headers.common['x-access-token'] = authToken;
            $localStorage.remove(TOKEN_KEY);
        }
        
        authFac.login = function(logindata){
            $resource(baseURL+'users/login')
                .save(logindata,
                      function(response){
                if(!response.usertype) {
                    storeUserCredentials({firstname:response.firstname, token: response.token, citizenID:response.ID, scope:response.scope,professions:response.professions,profilePicture:response.profilePicture,verificationStatus:response.verificationStatus});
                    $rootScope.$broadcast('login:Successful');
                    loginResponseStatus = response.status;
                    $rootScope.$broadcast('login:checkStatus');
                } else if(response.usertype == "Restaurant") {
                    storeUserCredentials({restaurantName:response.name, token: response.token, restaurantID:response.ID, scope:response.scope});
//                $rootScope.$broadcast('restaurantLogin:Successful');
                    loginResponseStatus = response.status;
                    $rootScope.$broadcast('restaurantLogin:checkStatus');
                }
            },
                      function(response){
                $http.defaults.headers.common['x-access-token']= undefined;
                loginResponseStatus = response.status;
                $rootScope.$broadcast('login:checkStatus');
            });
        };
        /*authFac.loginRestaurant = function(logindata){
            $resource(baseURL+'hotelAuth/login')
                .save(logindata,
                      function(response){
                
            },
                      function(response){
                $http.defaults.headers.common['x-access-token']= undefined;
                loginResponseStatus = response.status;
                $rootScope.$broadcast('login:checkStatus');
            });                    
        };*/
        
        authFac.facebookSaveCredentials = function(Rfirstname, Rtoken, RID, Rscope,Rprofessions, RprofilePicture, RverificationStatus){
            
            storeUserCredentials({firstname:Rfirstname, token: Rtoken, citizenID:RID, scope:Rscope, professions:Rprofessions,profilePicture:RprofilePicture,verificationStatus:RverificationStatus});
            loginResponseStatus = 200;
            $rootScope.$broadcast('login:Successful');
            
            $rootScope.$broadcast('login:checkStatusFB');
        };
        
        authFac.logout = function() {
            $resource(baseURL + "users/logout").get(function(response){});
            if(firstname) {
                destroyUserCredentials();
            } else if(restaurantName){
                destroyRestaurantCredentials();
            }
        };
        
        authFac.register = function(registerData){
            $resource(baseURL+'users/register')
                .save(registerData,
                      function(response){
                authFac.login(registerData);
                registerResponseStatus = response.status;
                
            },
                      function(response){
                registerResponseStatus = response.status;
                $rootScope.$broadcast('registration:Not Successful');
            });
        };
        authFac.registerRestaurant = function(registerData){
            $resource(baseURL+'hotelAuth/register')
                .save(registerData,
                      function(response){
                authFac.login(registerData);
                registerResponseStatus = response.status;
                
            },
                      function(response){
                registerResponseStatus = response.status;
                $rootScope.$broadcast('registration:Not Successful');
            });
        };
        authFac.uploadAadharNumberVerificationImage = function(file, filename) {
            var fd = new FormData();
            fd.append(filename, file.upload);
            return $http.post(baseURL+"citizen/uploadAadharNumberSideVerificationDocPicture", fd, {
                transformRequest: angular.identity,                                //Prevent Angular from serializing data
                headers: { 'Content-Type': undefined }                                  // Let the server decide what type.
            });
        };
        authFac.uploadAddressVerificationImage = function(file, filename) {
            var fd = new FormData();
            fd.append(filename, file.upload);
            return $http.post(baseURL+"citizen/uploadAddressSideVerificationDocPicture", fd, {
                transformRequest: angular.identity,                                //Prevent Angular from serializing data
                headers: { 'Content-Type': undefined }                                  // Let the server decide what type.
            });
        };
        
        authFac.loginResponseStatus = function() {
            return loginResponseStatus;
        };
        authFac.registerResponseStatus = function() {
            return registerResponseStatus;
        };
        
        authFac.isAuthenticated = function() {
            return isAuthenticated;
        };
        authFac.getUsername = function() {
            return firstname;  
        };
        
        authFac.getCitizenID = function() {
            return citizenID;
        };
        authFac.getScope = function() {
            return scope;
        };
        authFac.getTownName = function() {
            var townName = scope.slice(0,-6);
            townName = townName.charAt(0).toUpperCase() + townName.slice(1);
            return townName;
        };
        authFac.getProfessions = function() {
            return professions;
        };
        authFac.getProfilePicture = function() {
            return profilePicture;
        };
        authFac.getVerificationStatus = function() {
            if(verificationStatus == "false") {
                verificationStatus = false;
            }
            return verificationStatus;
        };
        authFac.getisFacebookLogin = function() {
            return isFacebookLogin;
        };
        authFac.setisFacebookLogin = function(facebookLoginStatus) {
            isFacebookLogin = facebookLoginStatus;
        };
        authFac.setFacebookUpdatedData = function(UpdatedScope,updatedToken) {
            storeUserCredentials({firstname:firstname, token: updatedToken, citizenID:citizenID,   scope:UpdatedScope,professions:professions,profilePicture:profilePicture,verificationStatus:verificationStatus});
        };
        authFac.setUpdatedProfessions = function(updatedProfessions) {
            storeUserCredentials({firstname:firstname, token: authToken, citizenID:citizenID,   scope:scope,professions:updatedProfessions,profilePicture:profilePicture,verificationStatus:verificationStatus});
        };
        authFac.setUpdatedProfilePicture = function(updatedProfilePicture) {
            storeUserCredentials({firstname:firstname, token: authToken, citizenID:citizenID,   scope:scope,professions:professions,profilePicture:updatedProfilePicture,verificationStatus:verificationStatus});
        };
        
        authFac.getRestaurantName = function() {
            return restaurantName;  
        };
        
        loadUserCredentials();
        
        return authFac;
    }])
    .service("headerService",["$resource","baseURL", "$http", function($resource, baseURL, $http) {
        this.getProfessionalSearchResultsFirstname = function() {
            return $resource(baseURL+"professionalProfile/professional/search/:firstname",null, {'update':{method:'PUT' }});
        };
        this.getProfessionalSearchResultsFirstnameLastname = function() {
            return $resource(baseURL+"professionalProfile/professional/search/:firstname/:lastname",null, {'update':{method:'PUT' }});
        };
        this.setCustomHeaders = function () {
            $http.defaults.headers.common['requestMaker'] = 'MyTownScripts';
        };
    }])
    .service("passwordOperationsService",["$resource","baseURL", function($resource, baseURL) {
        
        this.postSetPasswords= function() {
            return $resource(baseURL+"users/setPassword",null,{save:{method:"POST"}});
        };
        this.postChangePasswords= function() {
            return $resource(baseURL+"users/changePassword",null,{save:{method:"POST"}});
        };
    }])
    .service("writingSpaceService",["$http", "$resource","baseURL",function($http, $resource, baseURL) {
        
        var writingTypeInputTemp, writingTypeMainTemp="Opinion", writingsFilterID="writingsOpinionFilter";
        
        this.postWritingOpinion= function() {
            return $resource(baseURL+"writings/writing",null,{save:{method:"POST"}});
        };
        this.getWritingOpinion = function() {
            return $resource(baseURL+"writings/:writingType",null, {'update':{method:'PUT' }});
        };
        this.getWritingOpinionTemp = function() {
            return $resource(baseURL+"writings/temp/:writingType",null, {'update':{method:'PUT' }});
        };
        this.deleteWriting = function() {
            return $resource(baseURL+"writings/writing/:writingId",null, {'update':{method:'PUT' }});
        };
        this.getWriting = function() {
            return $resource(baseURL+"writings/writing/:writingId",null, {'update':{method:'PUT' }});
        };
        this.getWritingTemp = function() {
            return $resource(baseURL+"writings/writing/temp/:writingId",null, {'update':{method:'PUT' }});
        };
        
        this.postLike = function() {
            return $resource(baseURL+"writings/writing/:writingId/likes",{writingId:"@writingId"}, {'update':{method:'PUT' }});
        };
        this.postDislike = function() {
            return $resource(baseURL+"writings/writing/:writingId/dislikes",{writingId:"@writingId"}, {'update':{method:'PUT' }});
        };
        
        this.postComment = function() {
            return $resource(baseURL+"writings/writing/:writingId/comments",{writingId:"@writingId"}, {'update':{method:'PUT' }});
        };
        this.deleteComment = function() {
            return $resource(baseURL+"writings/writing/:writingId/comments/:commentId",{writingId:"@writingId",commentId:"@commentId"}, {'update':{method:'PUT' }});
        };
        
        this.uploadImage = function(file, filename) {
            var fd = new FormData();
            fd.append(filename, file.upload);
            return $http.post(baseURL+"writings/writing/uploadImage", fd, {
                transformRequest: angular.identity,                                      //Prevent Angular from serializing data
                headers: { 'Content-Type': undefined }                                  // Let the server decide what type.
            });
        };
        
        this.setWritingTypeTemp = function(writingType) {
            writingTypeInputTemp = writingType;
        };
        
        this.getWritingTypeTemp = function() {
            return writingTypeInputTemp;
        };
        
        this.setWritingTypeMainTemp = function(writingType) {
            writingTypeMainTemp = writingType;
        };
        
        this.getWritingTypeMainTemp = function() {
            return writingTypeMainTemp;
        };
        
    }])
    .service("newsService",["$http", "$resource","baseURL",function($http, $resource, baseURL) {
        
        var writingTypeInputTemp, newsTypeMainTemp="MyTownScriptsCitizenReported";
        
        this.postNewsReport= function() {
            return $resource(baseURL+"news/news",null,{save:{method:"POST"}});
        };
        this.getNewsReports = function() {
            return $resource(baseURL+"news/:newsType",null, {'update':{method:'PUT' }});
        };
        this.getNewsReportsTemp = function() {
            return $resource(baseURL+"news/temp/:newsType",null, {'update':{method:'PUT' }});
        };
        this.getIndividualNews = function() {
            return $resource(baseURL+"news/news/:newsId",null, {'update':{method:'PUT' }});
        };
        this.getIndividualNewsTemp = function() {
            return $resource(baseURL+"news/news/temp/:newsId",null, {'update':{method:'PUT' }});
        };
        
        this.deleteNews = function() {
            return $resource(baseURL+"news/news/:newsId",null, {'update':{method:'PUT' }});
        };
        
        this.postVerify = function() {
            return $resource(baseURL+"news/news/:newsId/verify",{newsId:"@newsId"}, {'update':{method:'PUT' }});
        };
        this.postUnVerify = function() {
            return $resource(baseURL+"news/news/:newsId/unVerify",{newsId:"@newsId"}, {'update':{method:'PUT' }});
        };
        this.postRefute = function() {
            return $resource(baseURL+"news/news/:newsId/refute",{newsId:"@newsId"}, {'update':{method:'PUT' }});
        };
        this.postUnRefute = function() {
            return $resource(baseURL+"news/news/:newsId/unRefute",{newsId:"@newsId"}, {'update':{method:'PUT' }});
        };
        
        this.postComment = function() {
            return $resource(baseURL+"news/news/:newsId/comments",{writingId:"@newsId"}, {'update':{method:'PUT' }});
        };
        this.deleteComment = function() {
            return $resource(baseURL+"news/news/:newsId/comments/:commentId",{writingId:"@newsId",commentId:"@commentId"}, {'update':{method:'PUT' }});
        };
        
        this.uploadImage = function(file, filename) {
            var fd = new FormData();
            fd.append(filename, file.upload);
            return $http.post(baseURL+"news/news/uploadImage", fd, {
                transformRequest: angular.identity,                                      //Prevent Angular from serializing data
                headers: { 'Content-Type': undefined }                                  // Let the server decide what type.
            });
            
            };
        
        this.setNewsTypeTemp = function(newsType) {
            newsTypeMainTemp = newsType;
        };
        
        this.getNewsTypeTemp = function() {
            return newsTypeMainTemp;
        };
        
    }])

    
    .service('ProfessionalProfileService',["baseURL", "$resource", "$http", function(baseURL, $resource, $http) {
        var loggedIn;
        this.getLoggedIn = function() {
            return loggedIn;
        };
        this.setLoggedIn = function() {
            loggedIn = true;
        };
        this.getProfessionalProfile = function() {
            return $resource(baseURL+"professionalProfile/:scope/:userId",null, {'update':{method:'PUT' }});
        };
        this.postAboutProfessional = function() {
            return $resource(baseURL+"professionalProfile/aboutProfessional",null,{save:{method:"POST"}});
        };
        this.postProfessionalEmail = function() {
            return $resource(baseURL+"professionalProfile/professionalEmail",null,{save:{method:"POST"}});
        };
        this.postProfessionalProfessions = function() {
            return $resource(baseURL+"professionalProfile/professionalProfessions",null,{save:{method:"POST"}});
        };
        this.uploadProfilePicture = function(file, filename) {
            var fd = new FormData();
            fd.append(filename, file.upload);
            return $http.post(baseURL+"professionalProfile/uploadProfessionalProfilePicture", fd, {
                transformRequest: angular.identity,                                //Prevent Angular from serializing data
                headers: { 'Content-Type': undefined }                                  // Let the server decide what type.
            });
            
            };
        this.postVisitorMessage = function() {
            return $resource(baseURL+"professionalProfile/professional/sendMessage",null,{save:{method:"POST"}});
        };
        this.getProfessionalMessages = function() {
            return $resource(baseURL+"professionalProfile/readMessage",null, {'update':{method:'PUT' }});
        };
        this.getNotifications = function() {
            return $resource(baseURL+"professionalProfile/getNotifications",null, {'update':{method:'PUT' }});
        };
        this.getProfessionalEarnings = function() {
            return $resource(baseURL+"professionalProfile/getEarnings",null, {'update':{method:'PUT' }});
        };
        this.getHeaderUpdatesStatus = function() {
            return $resource(baseURL+"professionalProfile/headerStatus",null, {'update':{method:'PUT' }});
        };
        this.updateProfessionalUnseenMessageStatus = function() {
            return $resource(baseURL+"professionalProfile/newMessageSeen",null,{'update':{method:'PUT' }});
        };
        this.postPaymentUPIInfo = function() {
            return $resource(baseURL+"professionalProfile/paymentInformation/upi",null,{save:{method:"POST"}});
        };
        this.submitBankAccountInfo = function() {
            return $resource(baseURL+"professionalProfile/paymentInformation/bankTransfer",null,{save:{method:"POST"}});
        };
        this.getVerificationStatus = function() {
            return $resource(baseURL+"citizen/verificationStatus",null, {'update':{method:'PUT' }});
        };
        this.getFacebookCallbackProfilePicture = function() {
            return $resource(baseURL+"citizen/getCallbackFacebookProfilePicture/:id",null, {'update':{method:'PUT' }});
        };
    }])
    .service('CitizenInfoService',["baseURL", "$resource", "$http", function(baseURL, $resource, $http) {
        this.postFacebookLoginUpdates = function() {
            return $resource(baseURL+"citizen/facebookLoginUdpateInfo",null,{save:{method:"POST"}});
        };
    }])
    .service('CommercialOperationsService',["baseURL", "$resource", function(baseURL, $resource) {
        this.postClick = function() {
            return $resource(baseURL+"writingsCommercialService/:writingId/adClicks",{writingId:"@writingId"}, {'update':{method:'PUT' }});
        };
    }])
    .service('TownService',["baseURL", "$resource", function(baseURL, $resource) {
        this.getTownActivity = function() {
            return $resource(baseURL+"town/getMyTownActivity",null, {'update':{method:'PUT' }});
        };
    }])
    .service('UtilService',["baseURL", "$resource", function(baseURL, $resource) {
        this.getRestaurantNames = function() {
            return $resource(baseURL+"restaurant/mts/restaurantNames",null, {'update':{method:'PUT' }});
        };
        this.getHeaderStatus = function() {
            return $resource(baseURL+"restaurant/:restaurantName/headerStatus",null, {'update':{method:'PUT' }});
        };
    }])
    .service('foodOrderService',['$http', '$resource', 'baseURL', '$localStorage', function($http, $resource, baseURL, $localStorage) {  
        var dishTray = [],restaurantName;
        this.getDishes = function(){
            return $resource(baseURL+"restaurant/:restaurantName/menu",null, {'update':{method:'PUT' }});
        };
        this.postFoodTray = function() {
            return $resource(baseURL+"restaurant/:restaurantName/orderFood", null, {'save':{method:'post'}});
        };
        this.getFoodTray = function() {
            return $resource(baseURL+"restaurant/foodOrderTray",null, {'update':{method:'PUT' }});
        };
        this.confirmFoodOrder =function() {
            return $resource(baseURL+"restaurant/:restaurantName/confirmOrder", null, {'update':{method:'PUT'}});
        };
        this.deleteOrder = function() {
            return $resource(baseURL+"restaurant/removeOrder/:foodTrayId", null, {'update':{method:'PUT'}});
        };
        this.cancelOrder = function() {
            return $resource(baseURL+"restaurant/:restaurantName/cancelOrder/:foodTrayId", null, {'update':{method:'PUT'}});
        };
        this.removeDish = function() {
            return $resource(baseURL+"restaurant/removeOrder/:foodTrayId", null, {'save':{method:'post'}});
        };
        this.postDeliveryDetails = function() {
            return $resource(baseURL+"restaurant/deliveryInfo", null, {'save':{method:'post'}});
        };
        this.setDishTray = function(dishTrayTemp) {
            dishTray = dishTrayTemp;
        };
        this.getDishTray = function() {
            return dishTray;
        };
        this.setRestaurantName = function(restaurantNameTemp) {
            $localStorage.store("MyTownScripts_RestaurantName", restaurantNameTemp);
        };
        this.getRestaurantName = function() {
            restaurantName = $localStorage.get("MyTownScripts_RestaurantName", "Restaurant not found");
            return restaurantName;
        };
    }])
    ;
    