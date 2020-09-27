(function () {                                                      //'use strict' in function to avoid problems during concatenation(JSHint).
   'use strict'; 
}());

/*global angular */                                                  // make 'angular' global for JSHint to understand.

angular.module('myTownScripts', ['ui.router','ngResource', 'ngDialog', 'fileModelDirective', 'ngSanitize', 'ngDesktopNotification'])              //['ngDialog']. ui-router- For routing pages.NgResource for making REST API requests
.config(function($stateProvider, $urlRouterProvider, ngDialogProvider, $locationProvider) {
    ngDialogProvider.setDefaults({
        closeByDocument: false
    });
    
    $stateProvider
    
    // route for the home page
    .state("app",{
        url:"/",
        views: {
            'header': {
                templateUrl: "views/header.html",
                controller:"HeaderController"
            },
            content: {
                templateUrl: "views/landingPage.html",
                controller:"landingPageController"
            }
        }
    })
    .state("app.my_town",{
        url:"MyTown",
        views: {
            "content@": {
            templateUrl:"views/my_town_activity.html",
            controller:"MyTownActivityController"
            }
        }
    })
    
    .state("app.facebook", {
        url:"facebook/:username/:token/:ID/:scope/:professions/:verificationStatus/:isAlreadyRegistered",
        views: {
            "content@": {
                templateUrl:"views/util/auth/facebookPage.html",
                controller:"facebookPageController"
            }
        }
    })
    .state("app.facebookFailure", {
        url:"facebook/failure",
        views: {
            "content@": {
                templateUrl:"views/util/auth/facebookPageFailure.html"
            }
        }
    })
    .state("app.facebookUpdateData", {
        url:"facebook/updateData",
        views: {
            "content@": {
                templateUrl:"views/util/auth/facebookUpdate.html",
                controller:"facebookUpdateDataController"
            }
        }
    })
    
    .state("app.professionalSelfProfile", {
        url:"writersProfile",
        views: {
            "content@": {
                templateUrl:"views/profiles/professionalProfile/writingProfile.html",
                controller:"ProfessionalSelfProfileController"
            }
        }
    })
    .state("app.professional_messages", {
        url:"writers_messages",
        views: {
            "content@": {
                templateUrl:"views/util/professional/messages.html",
                controller:"ProfessionalMessagesController"
            }
        }
    })
    .state("app.professional_notifications", {
        url:"notifications",
        views: {
            "content@": {
                templateUrl:"views/util/header/notifications.html",
                controller:"ProfessionalNotificationsController"
            }
        }
    })
    .state("app.professional_earnings", {
        url:"writers_earnings",
        views: {
            "content@": {
                templateUrl:"views/util/professional/professionalEarnings.html",
                controller:"ProfessionalEarningsController"
            }
        }
    })
    .state("app.professional_profile", {
        url:"writersProfile/:scope/:id",
        views: {
            "content@": {
                templateUrl:"views/profiles/professionalProfile/writingProfile.html",
                controller:"ProfessionalProfileController"
            }
        }
    })
    .state("app.searchProfessionalFirstname", {
        url:"professional/search/:firstname",
        views: {
            "content@": {
                templateUrl:"views/util/searchProfessional.html",
                controller:"searchProfessionalViewController"
            }
        }
    })
    .state("app.searchProfessionalFirstnameLastname", {
        url:"professional/search/:firstname/:lastname",
        views: {
            "content@": {
                templateUrl:"views/util/searchProfessional.html",
                controller:"searchProfessionalViewController"
            }
        }
    })
    
    .state("app.restaurant_list",{
        url:"restaurant_list",
        views: {
            "content@": {
            templateUrl:"views/entities/restaurant_list.html",
            controller:"HotelsListController"
            }
        }
    })
    
    .state("app.writing_space",{
        url:"writing_space",
        views: {
            "content@": {
            templateUrl:"views/writings/writing_space.html",
            controller:"WritingSpaceController"
            }
        }
    })
    .state("app.writing_space_opinion", {
        url:"writing_space/:id/:writingType",
        views: {
            "content@": {
                templateUrl:"views/writings/writing_space_opinion.html",
                controller:"writingIndividualController"
            }
        }
    })
    .state("app.town_chronicles",{
        url:"town_chronicles",
        views: {
            "content@": {
            templateUrl:"views/news/town_chronicle.html",
            controller:"TownChroniclesController"
            }
        }
    })
    .state("app.news_individual", {
        url:"town_chronicles/:id",
        views: {
            "content@": {
                templateUrl:"views/news/news_individual.html",
                controller:"NewsIndividualController"
            }
        }
    })
    
    .state("app.hotels_home",{
        url:"restaurants/",
        views: {
            "content@": {
            templateUrl:"views/entities/hotels_home.html",
            controller:"HotelsHomeController"
            }
        }
    })
    .state("app.order_food",{
        url:"restaurants/:restaurantName/order_food",
        views: {
            "content@": {
            templateUrl:"views/entities/order_food.html",
            controller:"FoodOrderController"
            }
        }
    })
    .state("app.delivery_details",{
        url:"restaurants/:restaurantName/delivery_details",
        views: {
            "content@": {
            templateUrl:"views/entities/delivery_details.html",
            controller:"DeliveryDetailsController"
            }
        }
    })
    .state("app.food_order_tray",{
        url:"restaurants/:restaurantName/food_order_tray",
        views: {
            "content@": {
            templateUrl:"views/entities/food_order_tray.html",
            controller:"FoodOrderTrayController"
            }
        }
    })
    .state("app.order_status",{
        url:"restaurants/:restaurantName/order_status",
        views: {
            "content@": {
            templateUrl:"views/entities/order_status.html",
            controller:"FoodOrderStatusController"
            }
        }
    })
    
    ;
    $urlRouterProvider.otherwise('/');
})
;