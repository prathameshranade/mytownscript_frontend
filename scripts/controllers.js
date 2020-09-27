(function () {                                                                      //'use strict' in function to avoid problems 
   'use strict';                                                                    // during concatenation(JSHint).
}());

/*global angular */

angular.module('myTownScripts')

        .controller("HeaderController",["$scope","AuthFactory","ngDialog","$state","$rootScope","$window", "ProfessionalProfileService", "headerService", function($scope,AuthFactory,ngDialog,$state,$rootScope,$window,ProfessionalProfileService,headerService) {
            $scope.username="";
            $scope.loggedIn=false;
            $scope.searchQueryParameters = {};
            
            headerService.setCustomHeaders();
            
            function headerUpdatesFlags() {
                ProfessionalProfileService.getHeaderUpdatesStatus().get()
                .$promise.then(
                function(response) {
                    $scope.unseenMessages = response.professionalProfile.messages.statusFlags.unseenMessageStatus;
                    $scope.newNotifications = response.notifications.newNotifications;
                },
                function(response) {
                    $scope.message = "Error: "+response.status + " " + response.statusText;
                });
            }
            
            if(AuthFactory.isAuthenticated()) {
                $scope.loggedIn = true;
                $scope.username = AuthFactory.getUsername();
                $scope.profilePicture = AuthFactory.getProfilePicture();
                headerUpdatesFlags();
            } else {
                if(($state.is('app.writing_space') || $state.is('app.town_chronicles'))) {
                    ngDialog.open({ template: 'views/util/auth/loginModal.html', scope: $scope, classname: 'ngdialog-theme-default', controller:"loginModalController"});
                } else if($state.is('app.writing_space_opinion') || $state.is('app.news_individual')){
                    
                } else {
                    $state.go("app");
                }
            }
            
            $scope.doLogout = function() {
                AuthFactory.logout();
                $state.go("app");
                window.location.reload();
            };
            $scope.openLogin = function() {
                ngDialog.open({ template: 'views/util/auth/loginModal.html', scope: $scope, classname: 'ngdialog-theme-default', controller:"loginModalController"});
            };
            $rootScope.$on("login:Successful",function(){
                $scope.loggedIn=AuthFactory.isAuthenticated();
                $scope.username=AuthFactory.getUsername();
            });
            $scope.openChangePassword = function() {
                ngDialog.open({ template: 'views/util/changePassword.html', scope: $scope, classname: 'ngdialog-theme-default', controller:"changeCitizenPasswordController"});
            };
            $scope.openUserManual = function() {
                ngDialog.open({template:"views/util/UserManual.html",scope:$scope,className:"ngdialog-theme-default", controller:"HeaderDialogGenericController"});
            };
            $scope.openContactUs = function() {
                ngDialog.open({ template: 'views/util/contactUs.html', scope: $scope, classname: 'ngdialog-theme-default', controller:"HeaderDialogGenericController"});
            };
            $scope.submitSearch = function() {
                var queryParams = String($scope.searchQueryParameters.searchQueryParameters).split(" ");

                if (queryParams[1]) {
                    $state.go("app.searchProfessionalFirstnameLastname", {firstname:queryParams[0],lastname:queryParams[1]}, {});
                } else if(queryParams[0]) {
                    $state.go("app.searchProfessionalFirstname", {firstname:queryParams[0]}, {});
                }
            };
            $scope.updateNewMessageStatus = function () {
                ProfessionalProfileService.updateProfessionalUnseenMessageStatus().update(function(response){
                    $scope.unseenMessages =false;
                }, function(response) {
                    $scope.errorMessage = "Error: "+response.status + " " + response.statusText;
                });
            };
            $scope.updateNewNotificationStatus = function () {
                $scope.newNotifications = false;
            };
            $scope.viewEarnings = function() {
                if(AuthFactory.getVerificationStatus()) {
                    $state.go("app.professional_earnings");
                } else {
                    ProfessionalProfileService.setLoggedIn();
                    ngDialog.open({template:"views/util/verification/verificationStatus.html",scope:$scope,className:"ngdialog-theme-default", controller:"VerificationStatusController"});
                }
            };
            $scope.checkVerificationStatus = function() {
                ProfessionalProfileService.setLoggedIn();
                ngDialog.open({template:"views/util/verification/verificationStatus.html",scope:$scope,className:"ngdialog-theme-default", controller:"VerificationStatusController"});
            };
            $scope.stateis=function(curstate){
                return $state.is(curstate);
            };
        }])
        .controller("searchProfessionalViewController",["$scope","headerService","$stateParams", function($scope,headerService,$stateParams) {
            $scope.professionalSearchResults = "";
            $scope.showSearchResults = false;
            $scope.noSearchResults = false;
            if($stateParams.lastname) {
                headerService.getProfessionalSearchResultsFirstnameLastname().query({firstname:$stateParams.firstname,lastname:$stateParams.lastname},
                                                                                    function(response) {
                    $scope.professionalSearchResults = response;
                    $scope.showSearchResults = true;
                    if(!$scope.professionalSearchResults[0]) {
                        $scope.noSearchResults = true;
                    }
                },
                                                                                    function(response) {
                    $scope.message = "Error: "+response.status + " " + response.statusText;
                });
            } else if($stateParams.firstname) {
                headerService.getProfessionalSearchResultsFirstname().query({firstname:$stateParams.firstname},
                                                                            function(response) {
                    $scope.professionalSearchResults = response;
                    $scope.showSearchResults = true;
                    if(!$scope.professionalSearchResults[0]) {
                        $scope.noSearchResults = true;
                    }
                },
                                                                            function(response) {
                    $scope.message = "Error: "+response.status + " " + response.statusText;
                });
            }
        }])
        .controller("landingPageController",["$scope","AuthFactory","$rootScope","$state", "ngDialog", "$window", function($scope,AuthFactory,$rootScope,$state,ngDialog,$window) {
            $scope.registerData={};
            $scope.landingRegisterButtonStatus = true;
            $scope.joineeType = "";
            $scope.incompleteForm = false;
            $scope.joineeTypes= ["Citizen","Restaurant"];
            
            $('#navbarMain').removeClass('navbar-inverse');
            if(AuthFactory.isAuthenticated()) {
//                $state.go("app.my_town", {}, {reload: true});
                $state.go("app.hotels_home", {}, {reload: true});
            }
            $scope.doRegister=function() {
                if($scope.landingRegisterButtonStatus) {
                    $scope.landingRegisterButtonStatus = !($scope.landingRegisterButtonStatus);
                    if($scope.joineeType == "Citizen") {
                        if($scope.registerData.firstname && $scope.registerData.lastname) {
                            AuthFactory.register($scope.registerData);
                            $scope.landingRegisterForm.$setPristine();
                        } else {
                            $scope.landingRegisterButtonStatus = !($scope.landingRegisterButtonStatus);
                            $scope.incompleteForm = !($scope.incompleteForm);
                        }
                    } else if($scope.joineeType == "Restaurant") {
                        if($scope.registerData.name) {
                            AuthFactory.registerRestaurant($scope.registerData);
                            $scope.landingRegisterForm.$setPristine();
                        } else {
                            $scope.landingRegisterButtonStatus = !($scope.landingRegisterButtonStatus);
                            $scope.incompleteForm = !($scope.incompleteForm);
                        }
                        
                    }
                }
            };
            
            $rootScope.$on('registration:Not Successful', function(){
                if(AuthFactory.registerResponseStatus() == "500") {
                    $scope.landingRegisterButtonStatus = true;
                    $scope.registerError = true;
                }
            });
            $rootScope.$on("login:checkStatus",function () {               //Not heard if not written here as Login Modal is not open so it's controller is not on
                var status = AuthFactory.loginResponseStatus();
                if(status == "401" || status == "500") {
                    $scope.landingRegisterButtonStatus = true;
                    $scope.loginError = true;
                }
                else {
                    ngDialog.close();
//                    $state.go("app.my_town", {}, {reload: true});
                    $state.go("app.hotels_home", {}, {reload: true});
                    /*if(AuthFactory.getVerificationStatus()) {
                        $state.go("app.my_town", {}, {reload: true});
                    } else {
                        ngDialog.open({template:"views/util/verification/verifyCitizenRegistration.html",scope:$scope,className:"ngdialog-theme-default", controller:"citizenVerificationController"});
                    }*/
                }
            });
            $rootScope.$on("restaurantLogin:checkStatus",function () {                         //Not heard if not written here as Login Modal is not open so it's controller is not on
                var status = AuthFactory.loginResponseStatus();
                if(status == "401") {
                    $scope.landingRegisterButtonStatus = true;
                    $scope.loginError = true;
                }
                else {
                    $window.open('http://hotels.mytownscripts.com.s3-website.ap-south-1.amazonaws.com/#/'+AuthFactory.getRestaurantName(), '_self');
                }
            });
            $scope.$on('$destroy', function() {
                $('#navbarMain').addClass('navbar-inverse');
            });
            
        }])
        .controller("loginModalController",["$scope","AuthFactory","ngDialog","$state","$rootScope", "$localStorage", "passwordOperationsService", function($scope,AuthFactory,ngDialog,$state,$rootScope,$localStorage,passwordOperationsService) {

            $scope.loginData = $localStorage.getObject('userinfo','{}');
            $scope.forgottenPassword = {};
            $scope.loginButtonStatus =true;
            
            $scope.doLogin=function() {
                if($scope.loginButtonStatus) {
                    $scope.loginButtonStatus = !($scope.loginButtonStatus);
                    if($scope.rememberMe)
                        $localStorage.storeObject('userinfo',$scope.loginData);
                
                    AuthFactory.login($scope.loginData);
                    $scope.loginForm.$setPristine();
                    $scope.loginData={username:"",password:""};
                }
            };
            $scope.openRegister= function () {
                ngDialog.open({template:"views/util/auth/register.html",scope:$scope,className:"ngdialog-theme-default", controller:"registerController"});
            };
            $scope.openSetPassword= function () {
                ngDialog.open({template:"views/util/forgottenPassword.html",scope:$scope,className:"ngdialog-theme-default", controller:"loginModalController"});
            };
            $scope.closeThisDialog=function(){
                ngDialog.close();
            };
            $rootScope.$on("login:checkStatus",function () { 
                var status = AuthFactory.loginResponseStatus();
                if(status == "401") {
                    $scope.loginError = true;
                    $scope.loginButtonStatus =true;
                }
                else {
                    if(AuthFactory.getVerificationStatus()) {
                        $scope.loginButtonStatus =true;
                    /*Above line probably useless. landingPage is controlling the $state.go*/
                    ngDialog.close();
                    }                    
                }
            });
            $rootScope.$on("restaurantLogin:checkStatus",function () { 
                var status = AuthFactory.loginResponseStatus();
                if(status == "401") {
                    $scope.loginError = true;
                    $scope.loginButtonStatus =true;
                }
                else {
                    if(AuthFactory.getVerificationStatus()) {
                        $scope.loginButtonStatus =true;
                    /*Above line probably useless. landingPage is controlling the $state.go*/
                    ngDialog.close();
                    }                    
                }
            });
            $scope.submitSetPassword = function(){
                
                    passwordOperationsService.postSetPasswords().save($scope.forgottenPassword,
                                                        function(response) {
                        if(response.message == "Password set successfully") {
                            $('#forgottenPasswordMessage').html('Your new password has been sent to your Email Id.<br>Please login to continue').css('color','#293882');
                        }
                        else {
                            $('#forgottenPasswordMessage').html('Password not set.').css('color','#DF0A16');
                        }
                    },
                                                        function(response) {
                        $scope.message = "Error: "+response.status + " " + response.statusText;
                    });
            };
        }])
        .controller("changeCitizenPasswordController",["$scope", "passwordOperationsService", "ngDialog", function($scope,passwordOperationsService,ngDialog) {
            $scope.passwords = {};
            
            $scope.submitChangedPassword = function(){
                if($('#change_password_new_password').val() == $('#change_password_new_password_confirm').val()) {
                    passwordOperationsService.postChangePasswords().save($scope.passwords,function(response) {
                        if(response.message == "Password changed successfully") {
                            ngDialog.open({ template: 'views/util/changePasswordConfirmation.html', scope: $scope, classname: 'ngdialog-theme-default', controller:"changeCitizenPasswordController"});
                        }
                        else {
                            $scope.changePasswordError = true;
                        }
                    },
                                                        function(response) {
                        $scope.message = "Error: "+response.status + " " + response.statusText;
                    });
                } else {
                    $('#changePasswordMessage').html('Your passwords don\'t match.').css('color','#DF0A16');
                }
            };
            
            $scope.closeThisDialog=function(){
                ngDialog.close();
            };
        }])
        .controller("facebookPageController",["$scope", "$stateParams", "AuthFactory", "$state", "$rootScope", "$window", "ngDialog", "ProfessionalProfileService", function($scope, $stateParams, AuthFactory, $state, $rootScope,$window,ngDialog,ProfessionalProfileService) {
            var token = $stateParams.token;
            var username = $stateParams.username;
            var ID = $stateParams.ID;
            var scope = $stateParams.scope;
            var professions = $stateParams.professions;
            var profilePicture;
            var verificationStatus = $stateParams.verificationStatus;
            var status;
            var isAlreadyRegistered = $stateParams.isAlreadyRegistered;
            if (isAlreadyRegistered == "false") {
                isAlreadyRegistered = false;
            }
            
            ProfessionalProfileService.getFacebookCallbackProfilePicture().get({id:ID}).
            $promise.then(function(response) {
                profilePicture =response.profilePicture;
                AuthFactory.facebookSaveCredentials(username,token,ID,scope,professions,profilePicture,verificationStatus);
            
                status = AuthFactory.loginResponseStatus();
            
                if(status == "401") {
                    $scope.loginError = true;
                }
                else {
                    if(isAlreadyRegistered) {
//                        $state.go("app.my_town", {}, {reload: true});
                        $state.go("app.hotels_home", {}, {reload: true});
                    } else {
                        $state.go("app.facebookUpdateData", {}, {reload: true});
                    }
                }
            },
                          function(response) {
                $scope.message = "Error: "+response.status + " " + response.statusText; 
            }
                         );
        }])
        .controller("facebookUpdateDataController",["$scope", "$state", "CitizenInfoService","AuthFactory", function($scope, $state, CitizenInfoService,AuthFactory) {
            $scope.updateData = {};
            $scope.username = AuthFactory.getUsername();
            $scope.doUpdate=function() {
                CitizenInfoService.postFacebookLoginUpdates().save($scope.updateData,
                                                              function(response) {
                    AuthFactory.setFacebookUpdatedData(response.scope, response.token);
//                    $state.go("app.my_town", {}, {reload: true});
                    $state.go("app.hotels_home", {}, {reload: true});
                },
                                                              function(response) {
                    $scope.message = "Error: "+response.status + " " + response.statusText;
                });   
            };
        }])
        .controller("registerController",["$scope","AuthFactory","ngDialog","$rootScope", function($scope,AuthFactory,ngDialog,$rootScope) {
            $scope.registerData={};
            $scope.registerButtonStatus = true;
            $scope.doRegister=function() {
                if($scope.registerButtonStatus) {
                    $scope.registerButtonStatus = !($scope.registerButtonStatus);
                    AuthFactory.register($scope.registerData);
                    $scope.registerForm.$setPristine();
                }
            };
            $scope.closeThisDialog=function(){
                ngDialog.close();
            };
            
            $rootScope.$on('registration:Not Successful', function(){
                if(AuthFactory.registerResponseStatus() == "500") {
                    $scope.registerButtonStatus = true;
                    $scope.registerError = true;
                }
            });
            
        }])
        .controller("citizenController",["$scope", "AuthFactory", function($scope, AuthFactory) {
            var citizenID = String(AuthFactory.getCitizenID());
            $scope.checkUser = function(authorID) {
                if (String(authorID) == citizenID) {
                    return true;
                } else {
                    return false;
                }
            };
        }])
        .controller("WritingSpaceController",["$scope","writingSpaceService", "AuthFactory", "ngDialog", "$state", function($scope,writingSpaceService,AuthFactory, ngDialog,$state) {
            $scope.message = "Wait...";
            $scope.showWritingSpace = false;
            $scope.noRegularWritings = false;
            $scope.noContemplativeWritings = false;
            $scope.username = AuthFactory.getUsername();
            $scope.professions = AuthFactory.getProfessions();
            $scope.profilePicture = AuthFactory.getProfilePicture();
            $scope.likeStatus = true;
            $scope.unlikeStatus = true;
            var scope = AuthFactory.getScope();
            var townName = scope.slice(0,-6);
            $scope.townName = townName.charAt(0).toUpperCase() + townName.slice(1);
            
            function getWritingsType() {
                /*writingSpaceService.getWritingOpinion().query({writingType:writingSpaceService.getWritingTypeMainTemp()})
                
                //Query can accept an 'Array(of object)'(isArray: True) as a respose, whereas get, put, post accepts(expects) only a single object.Ex, query({writingType:$scope.writingType}). if no array use a .get
                
                    .$promise.then(
                    function(response) {
                        $scope.noRegularWritings = false;
                        $scope.noContemplativeWritings = false;
                        if(writingSpaceService.getWritingTypeMainTemp() == "Musing" || writingSpaceService.getWritingTypeMainTemp() == "140") {
                            var i=0;
                            while(i != response.length){
                                response[i].article = response[i].article.replace(/\n/g,"<br>");
                                i++;
                            }
                            if(!$scope.writings[0]) {
                                $scope.noContemplativeWritings = true;
                            }
                        }
                        response.reverse();
                        $scope.writings = response;
                        $scope.showWritingSpace = true;
                        if(!$scope.writings[0]) {
                            $scope.noRegularWritings = true;
                        }
                    },
                    function(response) {
                        $scope.message = "Error: "+response.status + " " + response.statusText;
                    });*/
                if(AuthFactory.isAuthenticated()) {
                writingSpaceService.getWritingOpinion().query({writingType:writingSpaceService.getWritingTypeMainTemp()})
                    .$promise.then(
                    function(response) {
                        $scope.noRegularWritings = false;
                        $scope.noContemplativeWritings = false;
                        response.reverse();
                        $scope.writings = response;
                        if(writingSpaceService.getWritingTypeMainTemp() == "Musing" || writingSpaceService.getWritingTypeMainTemp() == "140") {
                            var i=0;
                            while(i != response.length){
                                response[i].article = response[i].article.replace(/\n/g,"<br>");
                                i++;
                            }
                            console.log("Contemplative writings $scope.writings: "+$scope.writings);
                            if(!$scope.writings[0]) {
                                $scope.noContemplativeWritings = true;
                            }
                        }
                        $scope.showWritingSpace = true;
                        console.log("Regular writings $scope.writings: "+$scope.writings);
                        if(!$scope.writings[0]) {
                            $scope.noRegularWritings = true;
                        }
                    },
                        function(response) {
                            $scope.message = "Error: "+response.status + " " + response.statusText;
                        });
                } else {
                    writingSpaceService.getWritingOpinionTemp().query({writingType:writingSpaceService.getWritingTypeMainTemp()})
                        .$promise.then(
                        function(response) {
                        $scope.noRegularWritings = false;
                        $scope.noContemplativeWritings = false;
                        if(writingSpaceService.getWritingTypeMainTemp() == "Musing" || writingSpaceService.getWritingTypeMainTemp() == "140") {
                            var i=0;
                            while(i != response.length){
                                response[i].article = response[i].article.replace(/\n/g,"<br>");
                                i++;
                            }
                            if(!$scope.writings[0]) {
                                $scope.noContemplativeWritings = true;
                            }
                        }
                        response.reverse();
                        $scope.writings = response;
                        $scope.showWritingSpace = true;
                        if(!$scope.writings[0]) {
                            $scope.noRegularWritings = true;
                        }
                    },
                        function(response) {
                            $scope.message = "Error: "+response.status + " " + response.statusText;
                        });
                }
            }
            getWritingsType();
            
            $scope.likeWritingMain = function (writingID) {
                if(AuthFactory.isAuthenticated()) {
                    if($scope.likeStatus) {
                        $scope.likeStatus = !($scope.likeStatus);
                        writingSpaceService.postLike().update({writingId: writingID},
                                                              function(response) {
                            $scope.likeStatus = true;
                            getWritingsType();
                        },
                                                              function(response) {
                            $scope.message = "Error: "+response.status + " " + response.statusText;
                        });
                    }
                } else {
                    ngDialog.open({ template: 'views/util/auth/loginModal.html', scope: $scope, classname: 'ngdialog-theme-default', controller:"loginModalController"});
                }
            };
            
            $scope.dislikeWritingMain = function (writingID) {
                if($scope.unlikeStatus) {
                    $scope.unlikeStatus = !($scope.unlikeStatus);
                    writingSpaceService.postDislike().update({writingId: writingID},
                                                             function(response) {
                        $scope.unlikeStatus = true;
                        getWritingsType();
                    },
                                                             function(response) {
                        $scope.message = "Error: "+response.status + " " + response.statusText;
                    });
                }
            };
            
            $scope.select = function(setType) {
                
                if (setType === 1) {
                    writingSpaceService.setWritingTypeMainTemp('Opinion');
                    getWritingsType();
                }
                else if (setType === 2) {
                    writingSpaceService.setWritingTypeMainTemp('140');
                    getWritingsType();
                }
                else if (setType === 3) {
                    writingSpaceService.setWritingTypeMainTemp('Musing');
                    getWritingsType();
                }
                else if (setType === 4) {
                    writingSpaceService.setWritingTypeMainTemp('Experience');
                    getWritingsType();
                }
                else if (setType === 5) {
                    writingSpaceService.setWritingTypeMainTemp('Other');
                    getWritingsType();
                }
            };
            
            $scope.openWritingSpaceCategorySelect=function() { 
                if(AuthFactory.isAuthenticated()) {
                    ngDialog.open({template:"views/writings/writing_category_select.html",scope:$scope, classname:"ngdialog-theme-default", controller:"writingInputController"});
                } else {
                    ngDialog.open({ template: 'views/util/auth/loginModal.html', scope: $scope, classname: 'ngdialog-theme-default', controller:"loginModalController"});
                }
            };
            
            $scope.deleteWritingMain = function (writingID) {
                writingSpaceService.deleteWriting().delete({writingId:writingID})
                    .$promise.then(
                    function(response) {
                        getWritingsType();
                    },
                    function(response) {
                        $scope.message = "Error: "+response.status + " " + response.statusText;
                    });
            };
        }])
        .controller("writingInputController",["$scope","writingSpaceService","ngDialog", "$state", "AuthFactory", function($scope,writingSpaceService,ngDialog, $state, AuthFactory) {
            $scope.writingSpaceOpinionInput={"likes":"", "comments":"", "writingType":"",commercialInfo:{advertiseLinkbyUser:""}};
            $scope.checkMusing = false;
            $scope.articlePlaceholder = "Start Writing";
            $scope.showAdlinkInfo = false;
            $scope.verified = AuthFactory.getVerificationStatus();
            $scope.submitWritingButtonStatus = true;
            
            $scope.articleCharacterLength = "";
            var imageFileName;
            $scope.writingSpaceOpinionInput.writingType = writingSpaceService.getWritingTypeTemp();
            
            $scope.openWritingSpaceNotepad=function(writingType) { 
                writingSpaceService.setWritingTypeTemp(writingType);
                ngDialog.open({template:"views/writings/writing_space_opinion_input.html",scope:$scope, classname:"ngdialog-theme-default", controller:"writingInputController"});
            };
            $scope.toggleAdlinkInfo = function () {
                $scope.showAdlinkInfo = !($scope.showAdlinkInfo);
            };
            
            if($scope.writingSpaceOpinionInput.writingType == "Opinion"){
                $scope.checkMusing = false;
                $scope.articlePlaceholder = "Start Writing";            //Share your thoughts
                $scope.articleFontSize = "1em";
                $scope.articleCharacterMinLength = "500";
                $scope.articleCharacterLength = "";
                $scope.articleRows = "30";
            }
            else if($scope.writingSpaceOpinionInput.writingType == "140"){
                $scope.checkMusing = true;
                $scope.articlePlaceholder = "Short but Loaded";
                $scope.articleFontSize = "1.5em";
                $scope.articleCharacterMinLength = "10";
                $scope.articleCharacterLength = "140";
                $scope.articleRows = "5";
            }
            else if($scope.writingSpaceOpinionInput.writingType == "Musing") {
                $scope.checkMusing = true;
                $scope.articlePlaceholder = "Express Yourself. Be free.";
                $scope.articleFontSize = "1.2em";
                $scope.articleCharacterMinLength = "300";
                $scope.articleCharacterLength = "2000";
                $scope.articleRows = "15";
            }
            else if($scope.writingSpaceOpinionInput.writingType == "Experience") {
                $scope.checkMusing = false;
                $scope.articlePlaceholder = "Start Writing";
                $scope.articleFontSize = "1em";
                $scope.articleCharacterMinLength = "500";
                $scope.articleCharacterLength = "";
                $scope.articleRows = "30";
            }
            else if($scope.writingSpaceOpinionInput.writingType == "Other") {
                $scope.checkMusing = false;
                $scope.articlePlaceholder = "Start Writing";
                $scope.articleFontSize = "1em";
                $scope.articleCharacterMinLength = "500";
                $scope.articleCharacterLength = "";
                $scope.articleRows = "30";
            }
            
            $scope.sendWritingOpinion=function() {
                if($scope.submitWritingButtonStatus) {
                    $scope.submitWritingButtonStatus = !($scope.submitWritingButtonStatus);
                    writingSpaceService.postWritingOpinion().save($scope.writingSpaceOpinionInput,
                                                              function(response) {
                    if(!($scope.checkMusing)) { //this 'if' not required
                        imageFileName = response._id;
                    
                        if($scope.file) {
                            writingSpaceService.uploadImage($scope.file, imageFileName).then(
                                function(data) {
                                    $scope.file = {};                                    
                                    $state.reload();
                                    ngDialog.close();
                                },function(data) {
                                    console.log("Upload Error");
                                });
                        } else {
                            $state.reload();
                            ngDialog.close();
                        }
                    } else {
                        $state.reload();
                        ngDialog.close();
                    }   
                },
                                                              function(response) {
                    $scope.message = "Error: "+response.status + " " + response.statusText;
                });
                }
            };
            
        }])
        .controller('writingIndividualController',['$scope', '$stateParams', '$state', 'writingSpaceService',"AuthFactory", "CommercialOperationsService", "ngDialog", function($scope, $stateParams, $state, writingSpaceService,AuthFactory,CommercialOperationsService,ngDialog) {
            
            $scope.mycomment = {};
            var writingID = $stateParams.id;
            $scope.contemplativeBackground = false;
            $scope.showWritingSpaceIndividual = false;
            $scope.username = AuthFactory.getUsername();
            $scope.professions = AuthFactory.getProfessions();
            $scope.profilePicture = AuthFactory.getProfilePicture();
            $scope.likeStatus = true;
            $scope.unlikeStatus = true;
            
            if($stateParams.writingType == "Musing"){
                $scope.contemplativeBackground = true;
                $scope.articleFontSize = "1.5em";
            }
            else if($stateParams.writingType == "140"){
                $scope.contemplativeBackground = true;
                $scope.articleFontSize = "2em";
            }
            else {
                $scope.contemplativeBackground = false;
            }
                
            function getWriting() {
                /*var writing = writingSpaceService.getWriting().get({writingId: writingID})
                
                //Query can accept an 'Array(of object)'(isArray: True) as a respose, whereas get, put, post accepts(expects) only a single object.Ex, query({writingType:$scope.writingType})
                .$promise.then(
                    function(response) {
                        if($scope.contemplativeBackground) {
                            response.article = response.article.replace(/\n/g,"<br>");
                        } else {
                            response.article = response.article.replace(/\n/g,"</p><p style=\"font-size:1.2em; line-height:1.6em;\">");
                        }
                        
                        $scope.writing = response;
                        $scope.showWritingSpaceIndividual = true;
                    },
                    function(response) {
                        $scope.message = "Error: "+response.status + " " + response.statusText;
                    });*/
                if(AuthFactory.isAuthenticated()) {
                    var writing = writingSpaceService.getWriting().get({writingId: writingID})
                    .$promise.then(
                        function(response) {
                            if($scope.contemplativeBackground) {
                                response.article = response.article.replace(/\n/g,"<br>");
                            } else {
                                response.article = response.article.replace(/\n/g,"</p><p style=\"font-size:1.2em; line-height:1.6em;\">");
                            }
                            
                            $scope.writing = response;
                            $scope.showWritingSpaceIndividual = true;
                        },
                        function(response) {
                            $scope.message = "Error: "+response.status + " " + response.statusText;
                        });
                } else {
                    writingSpaceService.getWritingTemp().get({writingId: writingID})
                        .$promise.then(
                        function(response) {
                            if($scope.contemplativeBackground) {
                                response.article = response.article.replace(/\n/g,"<br>");
                            } else {
                                response.article = response.article.replace(/\n/g,"</p><p style=\"font-size:1.2em; line-height:1.6em;\">");
                            }
                            
                            $scope.writing = response;
                            $scope.showWritingSpaceIndividual = true;
                        },
                        function(response) {
                            $scope.message = "Error: "+response.status + " " + response.statusText;
                        });
                }
            }
            getWriting();
            
            $scope.likeWriting = function () {
                    if(AuthFactory.isAuthenticated()) {
                        if($scope.likeStatus) {
                            $scope.likeStatus = !($scope.likeStatus);
                            writingSpaceService.postLike().update({writingId: writingID})
                                .$promise.then(
                                function(response) {
                                    $scope.likeStatus = true;
                                    getWriting();
                                },
                                function(response) {
                                    $scope.message = "Error: "+response.status + " " + response.statusText;
                                });
                        }
                    } else {
                        ngDialog.open({ template: 'views/util/auth/loginModal.html', scope: $scope, classname: 'ngdialog-theme-default', controller:"loginModalController"});
                    }
            };
            $scope.dislikeWriting = function () {
                if($scope.unlikeStatus) {
                    $scope.unlikeStatus =!($scope.unlikeStatus);
                    writingSpaceService.postDislike().update({writingId: writingID})
                        .$promise.then(
                        function(response) {
                            $scope.unlikeStatus = true;
                            getWriting();
                        },
                        function(response) {
                            $scope.message = "Error: "+response.status + " " + response.statusText;
                        });
                }    
            };
            $scope.submitComment = function () {
                if(AuthFactory.isAuthenticated()) {
                    writingSpaceService.postComment().save({writingId: writingID}, $scope.mycomment)
                        .$promise.then(
                        function(response) {
                            $scope.mycomment = {};
//                        $scope.commentForm.$setPristine();
                            getWriting();
                        },
                        function(response) {
                            $scope.message = "Error: "+response.status + " " + response.statusText;
                        });
                } else {
                    ngDialog.open({ template: 'views/util/auth/loginModal.html', scope: $scope, classname: 'ngdialog-theme-default', controller:"loginModalController"});
                }
            };
            $scope.deleteWriting = function () {
                writingSpaceService.deleteWriting().delete({writingId:writingID})
                    .$promise.then(
                    function(response) {
                        $state.go("app.writing_space", {}, {});
                    },
                    function(response) {
                        $scope.message = "Error: "+response.status + " " + response.statusText;
                    });
            };
            $scope.deleteComment = function (commentID) {
                writingSpaceService.deleteComment().delete({writingId:writingID,commentId:commentID})
                    .$promise.then(
                    function(response) {
                        getWriting();
                    },
                    function(response) {
                        $scope.message = "Error: "+response.status + " " + response.statusText;
                    });
            };
            $scope.registerClick = function() {
                CommercialOperationsService.postClick().update({writingId: writingID});
            };
            $scope.openWritingSpaceOpinionCategorySelect=function() { 
                if(AuthFactory.isAuthenticated()) {
                    ngDialog.open({template:"views/writings/writing_category_select.html",scope:$scope, classname:"ngdialog-theme-default", controller:"writingInputController"});
                } else {
                    ngDialog.open({ template: 'views/util/auth/loginModal.html', scope: $scope, classname: 'ngdialog-theme-default', controller:"loginModalController"});
                }
            };
        }])
;