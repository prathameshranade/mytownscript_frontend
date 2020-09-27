(function () {                                                                      //'use strict' in function to avoid problems 
   'use strict';                                                                    // during concatenation(JSHint).
}());

/*global angular */

angular.module('myTownScripts')
    .controller("LeftGridController",["$scope","AuthFactory","ProfessionalProfileService", function($scope,AuthFactory,ProfessionalProfileService) {
        $scope.username = AuthFactory.getUsername();
        $scope.professions = AuthFactory.getProfessions();
        $scope.profilePicture = AuthFactory.getProfilePicture();
        
    }])
    .controller("citizenVerificationController",["$scope", "AuthFactory", "ngDialog", "$state","ProfessionalProfileService", function($scope,AuthFactory,ngDialog,$state,ProfessionalProfileService) {
        $scope.aadharNumberVerificationDocImage = {};
        $scope.aadharNumberVerificationDocButtonStatus = true;
        $scope.addressVerificationDocImage = {};
        $scope.addressVerificationDocButtonStatus = true;
        $scope.verificationStatus;
        $scope.citizenPresenceStatus = false;
        $scope.aadharNumberUploadStatus = false;
        $scope.aadharNumberVerificationImage;
        $scope.loggedIn = ProfessionalProfileService.getLoggedIn();
        $scope.uploadAadharNumberVerificationImage = function() {
            if(($scope.aadharNumberVerificationDocImage) && ($scope.aadharNumberVerificationDocButtonStatus)) {
                $scope.aadharNumberVerificationDocButtonStatus = !($scope.aadharNumberVerificationDocButtonStatus);
                AuthFactory.uploadAadharNumberVerificationImage($scope.aadharNumberVerificationDocImage, "verificationDocImage").then(
                    function(response) {
                        if(response.data == "Citizen already added") {
                            $scope.citizenPresenceStatus = true;
                        } else {
                            $scope.aadharNumberUploadStatus = true;
                            $scope.aadharNumberVerificationImage=response.data;
                        }
                    },function(response) {
                        console.log("Upload Error");
                    });
            }
        };
        $scope.uploadAddressVerificationDoc = function() {
            if(($scope.addressVerificationDocImage) && ($scope.addressVerificationDocButtonStatus)) {
                $scope.addressVerificationDocButtonStatus = !($scope.addressVerificationDocButtonStatus);
                AuthFactory.uploadAddressVerificationImage($scope.addressVerificationDocImage, $scope.aadharNumberVerificationImage).then(
                    function(response) {
                    
                        $scope.verificationStatus = true;
                        ngDialog.open({template:"views/util/verification/welcomeUnverifiedCitizen.html",scope:$scope,className:"ngdialog-theme-default", controller:"citizenVerificationController"});
                    },function(response) {
                        console.log("Upload Error");
                    });
            }
        };
        $scope.continueWithoutVerification = function() {
            $scope.verificationStatus = false; ngDialog.open({template:"views/util/verification/welcomeUnverifiedCitizen.html",scope:$scope,className:"ngdialog-theme-default", controller:"citizenVerificationController"});
        };
        $scope.closeThisDialog = function() {
            $state.go("app.my_town", {}, {reload: true});
            ngDialog.close();
        };
    }])
    .controller("HeaderDialogGenericController",["$scope","AuthFactory","ngDialog","$window","$state","ProfessionalProfileService", function($scope,AuthFactory,ngDialog,$window,$state,ProfessionalProfileService) {
        $scope.username = AuthFactory.getUsername();
        $scope.closeThisDialog = function() {
            ngDialog.close();
        };
    }])
    .controller("HotelsListController",["$scope","UtilService", function($scope,UtilService) {
        $scope.message = "Wait...";
        $scope.showHotelsList = false;
        $scope.noHotel = false;
//        $scope.restaurants = [];
        
        UtilService.getRestaurantNames().query(
            function(response) {
                $scope.showHotelsList = true;
                $scope.restaurants = response;
                console.log($scope.restaurants);
                if(!$scope.restaurants[0]) {
                    $scope.noHotel = true;
                }
            },
            function(response) {
                $scope.message = "Error: "+response.status + " " + response.statusText;
            });
    }])
;