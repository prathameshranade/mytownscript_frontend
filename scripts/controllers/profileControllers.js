(function () {                                                                      //'use strict' in function to avoid problems 
   'use strict';                                                                    // during concatenation(JSHint).
}());

/*global angular */

angular.module('myTownScripts')
    .controller("ProfessionalSelfProfileController",["$scope","ProfessionalProfileService", "AuthFactory", "ngDialog", "writingSpaceService", "$window", function($scope,ProfessionalProfileService,AuthFactory,ngDialog,writingSpaceService,$window) {
        console.clear();
        $scope.displayName="";
        $scope.professionalProfile = {};
        $scope.visitorMessage = {};
        $scope.profilePicture = {};                               //Upload didn't work without defining it
        $scope.showUpdateEmail = false;$scope.showUpdateProfession = false;
        $scope.noWorks = false;
        $scope.likeStatus = true;
        $scope.unlikeStatus = true;
        
        function getProfile() {
            ProfessionalProfileService.getProfessionalProfile().get({scope: AuthFactory.getScope(),userId: AuthFactory.getCitizenID()})
                .$promise.then(
                function(response) {
                    $scope.displayName=response.firstname+" "+response.lastname;
                    $scope.citizen = response;
                    $scope.citizen.townWorks.writings = response.townWorks.writings.reverse();
                    var i=0;
                    while(i != response.townWorks.writings.length){
                        if(response.townWorks.writings[i].writingType == "Musing" || response.townWorks.writings[i].writingType == "140") {                        
                            $scope.citizen.townWorks.writings[i].article = response.townWorks.writings[i].article.replace(/\n/g,"<br>");
                        }
                        i++;
                    }
                    if(!response.townWorks.writings[0]){
                        $scope.noWorks = true;
                    }
                },
                function(response) {
                    $scope.message = "Error: "+response.status + " " + response.statusText;
                });
        }
        getProfile();
        
        $scope.openEditAboutMeModal = function () {
            ngDialog.open({template:"views/profiles/professionalProfile/util/professionalProfileAboutProfessional.html",scope:$scope, classname:"ngdialog-theme-default", controller:"ProfessionalSelfProfileController"});
        };
        $scope.updateAboutProfessional = function () {
            ProfessionalProfileService.postAboutProfessional().save($scope.professionalProfile,
                                                                   function(response) {
                $state.reload();
                ngDialog.close();
            },
                                                                    function(response) {
                $scope.message = "Error: "+response.status + " " + response.statusText;
            });
        };
        $scope.updateProfessionalEmail = function () {
            ProfessionalProfileService.postProfessionalEmail().save($scope.professionalProfile,
                                                                    function(response) {
                $scope.showUpdateEmail = false;
                getProfile();
            },
                                                                    function(response) {
                $scope.message = "Error: "+response.status + " " + response.statusText;
            });
        };
        $scope.updateProfessionalProfessions = function () {
            ProfessionalProfileService.postProfessionalProfessions().save($scope.professionalProfile,
                                                                    function(response) {
                $scope.showUpdateProfession = false;
                AuthFactory.setUpdatedProfessions($scope.professionalProfile.professions);
                getProfile();
            },
                                                                    function(response) {
                $scope.message = "Error: "+response.status + " " + response.statusText;
            });
        };
        $scope.uploadProfilePicture = function() {
            if($scope.profilePicture) {
                ProfessionalProfileService.uploadProfilePicture($scope.profilePicture, "ProfilePicture").then(
                    function(data) {
                        AuthFactory.setUpdatedProfilePicture(data.data);
                        $scope.profilePicture = {};
                        window.location.reload();
                    },function(data) {
                        console.log("Upload Error");
                    });
            }
        };
        $scope.showUpdateEmailInput = function() {
            if($scope.showUpdateEmail) {
                $scope.showUpdateEmail = false;
            } else {
                $scope.showUpdateEmail = true;
            }
        };
        $scope.showUpdateProfessionInput = function() {
            if($scope.showUpdateProfession) {
                $scope.showUpdateProfession = false;
            } else {
                $scope.showUpdateProfession = true;
            }
        };
        $scope.openWritingProfileCategorySelect=function() { 
            ngDialog.open({template:"views/writings/writing_category_select.html",scope:$scope, classname:"ngdialog-theme-default", controller:"writingInputController"});
        };
        $scope.checkWritingType = function(writingType) {
            if(writingType == "Musing" || writingType == "140") {
                return true;
            } else {
                return false;
            }
        };
        $scope.likeWritingMain = function (writingID) {
            if($scope.likeStatus) {
                $scope.likeStatus = !($scope.likeStatus);
                writingSpaceService.postLike().update({writingId: writingID},
                                                      function(response) {
                    $scope.likeStatus = true;
                    getProfile();
                },
                                                      function(response) {
                    $scope.message = "Error: "+response.status + " " + response.statusText;
                });
            }
        };
        $scope.dislikeWritingMain = function (writingID) {
            if($scope.unlikeStatus) {
                $scope.unlikeStatus = !($scope.unlikeStatus);
                writingSpaceService.postDislike().update({writingId: writingID},
                                                         function(response) {
                    getProfile();
                },
                                                         function(response) {
                    $scope.message = "Error: "+response.status + " " + response.statusText;
                });
            }
        };
        $scope.deleteWritingMain = function (writingID) {
            writingSpaceService.deleteWriting().delete({writingId:writingID})
                .$promise.then(
                function(response) {
                    getProfile();
                },
                function(response) {
                    $scope.message = "Error: "+response.status + " " + response.statusText;
                });
        };
        $scope.sendMessage = function() {
            ProfessionalProfileService.postVisitorMessage().save($scope.visitorMessage,
                                                                    function(response) {
                $scope.professionalProfile = {"senderEmail":"","message":""};
                ngDialog.open({template:"views/profiles/professionalProfile/util/messageSentAcknowlegement.html",scope:$scope, classname:"ngdialog-theme-default", controller:"ProfessionalSelfProfileController"});
            },
                                                                    function(response) {
                $scope.message = "Error: "+response.status + " " + response.statusText;
            });
        };
        $scope.closeThisDialog = function() {
            ngDialog.close();
        };
    }])
    .controller("ProfessionalProfileController",["$scope","ProfessionalProfileService", "$stateParams", "ngDialog", "writingSpaceService", function($scope,ProfessionalProfileService,$stateParams,ngDialog,writingSpaceService) {
        console.clear();
        $scope.displayName="";
        $scope.professionalProfile = {};
        $scope.visitorMessage = {};
        $scope.noWorks = false;
        $scope.likeStatus = true;
        $scope.unlikeStatus = true;
        
        function getProfile() {
            ProfessionalProfileService.getProfessionalProfile().get({scope: $stateParams.scope,userId: $stateParams.id})
                .$promise.then(
                function(response) {
                    $scope.displayName=response.firstname+" "+response.lastname;
                    $scope.citizen = response;
                    $scope.citizen.townWorks.writings = response.townWorks.writings.reverse();
                    var i=0;
                    while(i != response.townWorks.writings.length){
                        if(response.townWorks.writings[i].writingType == "Musing" || response.townWorks.writings[i].writingType == "140") {                        
                            $scope.citizen.townWorks.writings[i].article = response.townWorks.writings[i].article.replace(/\n/g,"<br>");
                        }
                        i++;
                    }
                    if(!response.townWorks.writings[0]){
                        $scope.noWorks = true;
                    }
                },
                function(response) {
                    $scope.message = "Error: "+response.status + " " + response.statusText;
                });
        }
        getProfile();
        
        $scope.checkWritingType = function(writingType) {
            if(writingType == "Musing" || writingType == "140") {
                return true;
            } else {
                return false;
            }
        };
        $scope.likeWritingMain = function (writingID) {
            if($scope.likeStatus) {
                $scope.likeStatus = !($scope.likeStatus);
                writingSpaceService.postLike().update({writingId: writingID},
                                                      function(response) {
                    getProfile();
                },
                                                      function(response) {
                    $scope.message = "Error: "+response.status + " " + response.statusText;
                });
            }
        };
        $scope.dislikeWritingMain = function (writingID) {
            if($scope.unlikeStatus) {
                $scope.unlikeStatus = !($scope.unlikeStatus);
                writingSpaceService.postDislike().update({writingId: writingID},
                                                         function(response) {
                    getProfile();
                },
                                                         function(response) {
                    $scope.message = "Error: "+response.status + " " + response.statusText;
                });
            }
        };
        $scope.deleteWritingMain = function (writingID) {
            writingSpaceService.deleteWriting().delete({writingId:writingID})
                .$promise.then(
                function(response) {
                    getProfile();
                },
                function(response) {
                    $scope.message = "Error: "+response.status + " " + response.statusText;
                });
        };
        $scope.sendMessage = function() {
            ProfessionalProfileService.postVisitorMessage().save($scope.visitorMessage,
                                                                    function(response) {
                $scope.professionalProfile = {"senderEmail":"","message":""};
                ngDialog.open({template:"views/profiles/professionalProfile/util/messageSentAcknowlegement.html",scope:$scope, classname:"ngdialog-theme-default", controller:"ProfessionalProfileController"});
            },
                                                                    function(response) {
                $scope.message = "Error: "+response.status + " " + response.statusText;
            });
        };
        $scope.closeThisDialog = function() {
            ngDialog.close();
        };
    }])

    .controller("ProfessionalMessagesController",["$scope","ProfessionalProfileService", "AuthFactory", "ngDialog", function($scope,ProfessionalProfileService,AuthFactory,ngDialog) {
        $scope.username = AuthFactory.getUsername();
        $scope.professions = AuthFactory.getProfessions();
        $scope.profilePicture = AuthFactory.getProfilePicture();
        $scope.showMessages = false;
        $scope.noMessage = false;
        ProfessionalProfileService.getProfessionalMessages().query()
            .$promise.then(
            function(response) {
                $scope.messages = response.reverse();
                if(!response[0]) {
                    $scope.noMessage = true;
                }
                $scope.showMessages = true;
            },
            function(response) {
                $scope.errorMessage = "Error: "+response.status + " " + response.statusText;
            });
        $scope.openWritingProfessionalMessageCategorySelect=function() { 
            ngDialog.open({template:"views/writings/writing_category_select.html",scope:$scope, classname:"ngdialog-theme-default", controller:"writingInputController"});
        };
    }])
    .controller("ProfessionalEarningsController",["$scope","ProfessionalProfileService", "AuthFactory", "ngDialog", function($scope,ProfessionalProfileService,AuthFactory,ngDialog) {
        $scope.username = AuthFactory.getUsername();
        $scope.professions = AuthFactory.getProfessions();
        $scope.profilePicture = AuthFactory.getProfilePicture();
        $scope.showEarnings = false;
        $scope.showEarningsDetails = true;
        $scope.showPartialPaymentInfo = false;
        $scope.showUPI = true;
        
        ProfessionalProfileService.getProfessionalEarnings().get()
            .$promise.then(
            function(response) {
                $scope.earning = response.earnings;
                $scope.writings = response.earnings.writings;
                $scope.showEarnings = true;
                
                if(response.paymentInformation) {
                    $scope.showPartialPaymentInfo = true;
                    $scope.displayString = response.paymentInformation.displayString;
                    if(response.paymentInformation.paymentMethod == "bankAccountTransfer") {
                        $scope.showUPI = false;
                    } else {
                        $scope.showUPI = true;
                    }
                }
            },
            function(response) {
                $scope.errorMessage = "Error: "+response.status + " " + response.statusText;
            });
        $scope.toggleEarningDetails = function() {
            $scope.showEarningsDetails = !$scope.showEarningsDetails;
        };
        $scope.toggleUPI = function() {
            $scope.showUPI = !$scope.showUPI;
        };
        $scope.openModifyPaymentInfo=function() { 
            ngDialog.open({template:"views/util/paymentInformationInput.html",scope:$scope, classname:"ngdialog-theme-default", controller:"PaymentInformationInputController"});
        };
        $scope.openWritingProfessionalEarningsCategorySelect=function() { 
            ngDialog.open({template:"views/writings/writing_category_select.html",scope:$scope, classname:"ngdialog-theme-default", controller:"writingInputController"});
        };
    }])
    .controller("PaymentInformationInputController",["$scope","ProfessionalProfileService", "$window", "ngDialog", "$state", function($scope,ProfessionalProfileService,$window,ngDialog,$state) {
        $scope.paymentInfo={};
        $scope.accountTypes=["Savings","Current"];
        $scope.paymentMethod = "UPI";
        
        $scope.checkPaymentMethod = function() {
            if($scope.paymentMethod == "UPI"){
                return true;
            } else if($scope.paymentMethod == "bankTransfer") {
                return false;
            }
        };
        
        $scope.submitUpiInfo = function(){
            if($('#upiId').val() == $('#upiId_confirm').val()) {
                ProfessionalProfileService.postPaymentUPIInfo().save($scope.paymentInfo,
                                                                     function(response) {
                    $state.reload();
                    ngDialog.close();
                },
                                                                     function(response) {
                    $scope.message = "Error: "+response.status + " " + response.statusText;
                });
            } else {
                $('#upiIDUnmatchedMessage').html('UPI IDs you entered don\'t match.').css('color','#DF0A16');
            }
            
        };
        $scope.submitBankAccountInfo = function(){
            if($('#payment_account_number').val() == $('#payment_account_number_confirm').val()) {
                ProfessionalProfileService.postAboutProfessional().save($scope.paymentInfo,
                                                                        function(response) {
                    $state.reload();
                    ngDialog.close();
                },
                                                                        function(response) {
                    $scope.message = "Error: "+response.status + " " + response.statusText;
                });
            } else {
                $('#accountNumberUnmatchedMessage').html('Account numbers you entered don\'t match.').css('color','#DF0A16');
            }
        };
        $scope.closeThisDialog = function() {
            ngDialog.close();
        };
        
    }])
    .controller("ProfessionalNotificationsController",["$scope","ProfessionalProfileService", "AuthFactory", "ngDialog", function($scope,ProfessionalProfileService,AuthFactory,ngDialog) {
        $scope.username = AuthFactory.getUsername();
        $scope.professions = AuthFactory.getProfessions();
        $scope.profilePicture = AuthFactory.getProfilePicture();
        $scope.showNotifications = false;
        $scope.noNotification = false;
        ProfessionalProfileService.getNotifications().query()
            .$promise.then(
            function(response) {
                $scope.notifications = response.reverse();
                if(!response[0]) {
                    $scope.noNotification = true;
                }
                $scope.showNotifications = true;
            },
            function(response) {
                $scope.errorMessage = "Error: "+response.status + " " + response.statusText;
            });
        $scope.openWritingProfessionalMessageCategorySelect=function() { 
            ngDialog.open({template:"views/writings/writing_category_select.html",scope:$scope, classname:"ngdialog-theme-default", controller:"writingInputController"});
        };
    }])
    .controller("VerificationStatusController",["$scope","ProfessionalProfileService", "ngDialog", function($scope,ProfessionalProfileService,ngDialog) {
        ProfessionalProfileService.getVerificationStatus().get()
            .$promise.then(
            function(response) {
                $scope.verificationStatus = response.verificationStatus;
            },
            function(response) {
                $scope.errorMessage = "Error: "+response.status + " " + response.statusText;
            });
        $scope.openVerificationModal = function() {
            ngDialog.open({template:"views/util/verification/verifyCitizenRegistration.html",scope:$scope,className:"ngdialog-theme-default", controller:"citizenVerificationController"});
        };
    
        $scope.closeThisDialog = function() {
            ngDialog.close();
        };    
    }])
;