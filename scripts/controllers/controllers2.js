(function () {                                                                      //'use strict' in function to avoid problems 
   'use strict';                                                                    // during concatenation(JSHint).
}());

/*global angular */

angular.module('myTownScripts')
    .controller("TownChroniclesController",["$scope","newsService", "AuthFactory", "ngDialog", function($scope,newsService,AuthFactory, ngDialog) {
        $scope.message = "Wait...";
        $scope.showTownChronicles = false;
        $scope.noNews = false;
        
        $scope.username = AuthFactory.getUsername();
        $scope.professions = AuthFactory.getProfessions();
        $scope.profilePicture = AuthFactory.getProfilePicture();
        $scope.verifyButtonStatus = true;
        $scope.refuteButtonStatus = true;
        var scope = AuthFactory.getScope();
        var townName = scope.slice(0,-6);
        $scope.townName = townName.charAt(0).toUpperCase() + townName.slice(1);
        
        function getNewsType() {
            if(AuthFactory.isAuthenticated()) {
                newsService.getNewsReports().query({newsType:newsService.getNewsTypeTemp()})
                    .$promise.then(
                    function(response) {
                        $scope.noNews = false;
                        response.reverse();
                        $scope.newss = response;
                        $scope.showTownChronicles = true;
                        if(!$scope.newss[0]) {
                            $scope.noNews = true;
                        }
                    },
                    function(response) {
                        $scope.message = "Error: "+response.status + " " + response.statusText;
                    });
            } else {
                newsService.getNewsReportsTemp().query({newsType:newsService.getNewsTypeTemp()})
                    .$promise.then(
                    function(response) {
                        $scope.noNews = false;
                        response.reverse();
                        $scope.newss = response;
                        $scope.showTownChronicles = true;
                        if(!$scope.newss[0]) {
                            $scope.noNews = true;
                        }
                    },
                    function(response) {
                        $scope.message = "Error: "+response.status + " " + response.statusText;
                    });
            }
        }
        getNewsType();
            
        $scope.verifyNewsMain = function (newsID) {
            if(AuthFactory.isAuthenticated()) {
                if($scope.verifyButtonStatus) {
                    $scope.verifyButtonStatus = !($scope.verifyButtonStatus);
                    newsService.postVerify().update({newsId: newsID},
                                                    function(response) {
                        $scope.verifyButtonStatus = true;
                        getNewsType();
                    },
                                                    function(response) {
                        $scope.message = "Error: "+response.status + " " + response.statusText;
                    });
                }
            } else {
                ngDialog.open({ template: 'views/util/auth/loginModal.html', scope: $scope, classname: 'ngdialog-theme-default', controller:"loginModalController"});
            }
        };
        $scope.unVerifyNewsMain = function (newsID) {
            if($scope.verifyButtonStatus) {
                $scope.verifyButtonStatus = !($scope.verifyButtonStatus);
                newsService.postUnVerify().update({newsId: newsID},
                                                      function(response) {
                    $scope.verifyButtonStatus = true;
                    getNewsType();
                },
                                                      function(response) {
                    $scope.message = "Error: "+response.status + " " + response.statusText;
                });
            }
        };
        
        $scope.refuteNewsMain = function (newsID) {
            if(AuthFactory.isAuthenticated()) {
                if($scope.verifyButtonStatus) {
                    $scope.verifyButtonStatus = !($scope.verifyButtonStatus);
                    newsService.postRefute().update({newsId: newsID},
                                                    function(response) {
                        $scope.verifyButtonStatus = true;
                        getNewsType();
                    },
                                                    function(response) {
                        $scope.message = "Error: "+response.status + " " + response.statusText;
                    });
                }
            } else {
                ngDialog.open({ template: 'views/util/auth/loginModal.html', scope: $scope, classname: 'ngdialog-theme-default', controller:"loginModalController"});
            }
        };
        $scope.unRefuteNewsMain = function (newsID) {
            if($scope.verifyButtonStatus) {
                $scope.verifyButtonStatus = !($scope.verifyButtonStatus);
                newsService.postUnRefute().update({newsId: newsID},
                                                      function(response) {
                    $scope.verifyButtonStatus = true;
                    getNewsType();
                },
                                                      function(response) {
                    $scope.message = "Error: "+response.status + " " + response.statusText;
                });
            }
        };
        
        $scope.select = function(setType) {
                
                if (setType === 1) {
                    newsService.setNewsTypeTemp('MyTownScriptsCitizenReported');
                    $scope.typeCheck = "MyTownScriptsCitizenReported";
                    getNewsType();
                }
                else if (setType === 2) {
                    newsService.setNewsTypeTemp('CitizenReported');
                    $scope.typeCheck = "CitizenReported";
                    getNewsType();
                }
            };
        
        $scope.openWritingSpaceCategorySelect=function() { 
                ngDialog.open({template:"views/writings/writing_category_select.html",scope:$scope, classname:"ngdialog-theme-default", controller:"writingInputController"});
            };
        
        $scope.openNewsReportInput=function() { 
            if(AuthFactory.isAuthenticated()) {
                ngDialog.open({template:"views/news/news_report_input.html",scope:$scope, classname:"ngdialog-theme-default", controller:"newsInputController"});
            } else {
                ngDialog.open({ template: 'views/util/auth/loginModal.html', scope: $scope, classname: 'ngdialog-theme-default', controller:"loginModalController"});
            }
        };
        }])
    .controller("newsInputController",["$scope","newsService","ngDialog", "$state", "AuthFactory", function($scope,newsService,ngDialog, $state, AuthFactory) {
        $scope.newsReportInput={"verifiers":"", "refuters":""};
        $scope.verified = AuthFactory.getVerificationStatus();
        $scope.submitNewsButtonStatus = true;
        $scope.newsCategories = ['News', 'Viral', 'Other'];
        $scope.newsCategory;
            var imageFileName;
            
            $scope.sendNewsReport=function() {
                if($scope.newsCategory === "Other") {
                    
                } else {
                    $scope.newsReportInput.category = $scope.newsCategory;
                }
                console.log($scope.newsReportInput.category);
                if($scope.submitNewsButtonStatus) {
                    $scope.submitNewsButtonStatus = !($scope.submitNewsButtonStatus);
                    newsService.postNewsReport().save($scope.newsReportInput,
                                                              function(response) {
                    
                        imageFileName = response._id;
                    
                        if($scope.file) {
                            newsService.uploadImage($scope.file, imageFileName).then(
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
                },
                                                              function(response) {
                    $scope.message = "Error: "+response.status + " " + response.statusText;
                });
                }
            };
            
        }])
    .controller('NewsIndividualController',['$scope', '$stateParams', '$state', 'newsService',"AuthFactory", "ngDialog", function($scope, $stateParams, $state, newsService,AuthFactory,ngDialog) {
            
        $scope.mycomment = {};
        var newsID = $stateParams.id;
//        $scope.contemplativeBackground = false;
        $scope.showNewsIndividual = false;
        $scope.username = AuthFactory.getUsername();
        $scope.professions = AuthFactory.getProfessions();
        $scope.profilePicture = AuthFactory.getProfilePicture();
        $scope.verifyButtonStatus = true;
        $scope.refuteButtonStatus = true;
        $scope.commentForm = {};
        $scope.townName = AuthFactory.getTownName();
        
        function getNews() {
                if(AuthFactory.isAuthenticated()) {
                    newsService.getIndividualNews().get({newsId: newsID})
                        .$promise.then(
                        function(response) { 
                            response.article = response.report.replace(/\n/g,"</p><p style=\"font-size:1.2em; line-height:1.6em;\">");
                            $scope.news = response;
                            $scope.showNewsIndividual = true;
                        },
                        function(response) {
                            $scope.message = "Error: "+response.status + " " + response.statusText;
                        });
                } else {
                    newsService.getIndividualNewsTemp().get({newsId: newsID})
                        .$promise.then(
                        function(response) { 
                            response.article = response.report.replace(/\n/g,"</p><p style=\"font-size:1.2em; line-height:1.6em;\">");
                            $scope.news = response;
                            $scope.showNewsIndividual = true;
                        },
                        function(response) {
                            $scope.message = "Error: "+response.status + " " + response.statusText;
                        });
                }
            }
        getNews();
            
        $scope.verifyNews = function (newsID) {
            if(AuthFactory.isAuthenticated()) {
                if($scope.verifyButtonStatus) {
                    $scope.verifyButtonStatus = !($scope.verifyButtonStatus);
                    newsService.postVerify().update({newsId: newsID},
                                                    function(response) {
                        $scope.verifyButtonStatus = true;
                        getNews();
                    },
                                                    function(response) {
                        $scope.message = "Error: "+response.status + " " + response.statusText;
                    });
                }
            } else {
                ngDialog.open({ template: 'views/util/auth/loginModal.html', scope: $scope, classname: 'ngdialog-theme-default', controller:"loginModalController"});
            }
        };
        $scope.unVerifyNews = function (newsID) {
            if($scope.verifyButtonStatus) {
                $scope.verifyButtonStatus = !($scope.verifyButtonStatus);
                newsService.postUnVerify().update({newsId: newsID},
                                                      function(response) {
                    $scope.verifyButtonStatus = true;
                    getNews();
                },
                                                      function(response) {
                    $scope.message = "Error: "+response.status + " " + response.statusText;
                });
            }
        };
        
        $scope.refuteNews = function (newsID) {
            if(AuthFactory.isAuthenticated()) {
                if($scope.refuteButtonStatus) {
                    $scope.refuteButtonStatus = !($scope.refuteButtonStatus);
                    newsService.postRefute().update({newsId: newsID},
                                                    function(response) {
                        $scope.refuteButtonStatus = true;
                        getNews();
                    },
                                                    function(response) {
                        $scope.message = "Error: "+response.status + " " + response.statusText;
                    });
                }
            } else {
                ngDialog.open({ template: 'views/util/auth/loginModal.html', scope: $scope, classname: 'ngdialog-theme-default', controller:"loginModalController"});
            }
        };
        $scope.unRefuteNews = function (newsID) {
            if($scope.refuteButtonStatus) {
                $scope.refuteButtonStatus = !($scope.refuteButtonStatus);
                newsService.postUnRefute().update({newsId: newsID},
                                                  function(response) {
                    $scope.refuteButtonStatus = true;
                    getNews();
                },
                                                  function(response) {
                    $scope.message = "Error: "+response.status + " " + response.statusText;
                });
            }
        };
        
        $scope.deleteNews = function () {
            newsService.deleteNews().delete({newsId:newsID})
                .$promise.then(
                function(response) {
                    $state.go("app.town_chronicles");
                },
                function(response) {
                    $scope.message = "Error: "+response.status + " " + response.statusText;
                });
        };
//        console.log($scope.commentForm.$pristine);
        $scope.submitComment = function () {
            if(AuthFactory.isAuthenticated()) {
                newsService.postComment().save({newsId: newsID}, $scope.mycomment)
                    .$promise.then(
                    function(response) {
                        $scope.mycomment = {};
                        console.log($scope.commentForm.$pristine);
                        getNews();
                    },
                    function(response) {
                        $scope.message = "Error: "+response.status + " " + response.statusText;
                    });
            } else {
                ngDialog.open({ template: 'views/util/auth/loginModal.html', scope: $scope, classname: 'ngdialog-theme-default', controller:"loginModalController"});
            }
        };
        $scope.deleteComment = function (commentID) {
                newsService.deleteComment().delete({newsId:newsID,commentId:commentID})
                    .$promise.then(
                    function(response) {
                        getNews();
                    },
                    function(response) {
                        $scope.message = "Error: "+response.status + " " + response.statusText;
                    });
            };
            $scope.openNewsReportInput=function() { 
            if(AuthFactory.isAuthenticated()) {
                ngDialog.open({template:"views/news/news_report_input.html",scope:$scope, classname:"ngdialog-theme-default", controller:"newsInputController"});
            } else {
                ngDialog.open({ template: 'views/util/auth/loginModal.html', scope: $scope, classname: 'ngdialog-theme-default', controller:"loginModalController"});
            }
        };
        }])
    .controller('MyTownActivityController',['$scope', 'TownService', 'AuthFactory', 'ngDialog', 'writingSpaceService', 'newsService', function($scope,TownService,AuthFactory,ngDialog,writingSpaceService,newsService) {
        console.clear();
        $scope.message = "Wait...";
        $scope.username = AuthFactory.getUsername();
        $scope.professions = AuthFactory.getProfessions();
        $scope.profilePicture = AuthFactory.getProfilePicture();
        $scope.showTownActivity = false;
        $scope.noTownActivity = false;
        $scope.likeStatus = true;
        $scope.unlikeStatus = true;
        $scope.verifyButtonStatus = true;
        $scope.refuteButtonStatus = true;
        $scope.showMobileMyTown = false;
        var scope = AuthFactory.getScope();
        var townName = scope.slice(0,-6);
        $scope.townName = townName.charAt(0).toUpperCase() + townName.slice(1);
        
        function getMyTownActivity() {
            TownService.getTownActivity().query().$promise.then(
                function(response) {
                    $scope.showTownActivity = true;
                    if(!response[0]) {
                        $scope.noTownActivity = true;
                    }
                    response.reverse();
                    var i=0;
                    while(i != response.length){
                        if((response[i].writingType) && (response[i].writingType == "Musing" || response[i].writingType == "140")) {
                            response[i].article = response[i].article.replace(/\n/g,"<br>");
                        }
                        i++;
                        console.log("In While");
                    }
                    $scope.townActivities = response;
                },
                function(response) {
                    $scope.message = "Error: "+response.status + " " + response.statusText;
                }
            );
        }
        getMyTownActivity();
        $scope.checkWriting = function(writingType) {                           //Called four times. (unknown reason)
            if(writingType == "Musing" || writingType == "140") {
                return false;
            } else {
                return true;
            }
        };
        $scope.toggleShowMobileMyTown = function() {
            $scope.showMobileMyTown = !$scope.showMobileMyTown;
        };
        
        $scope.likeWritingMain = function (writingID) {
            if($scope.likeStatus) {
                $scope.likeStatus = !($scope.likeStatus);
                writingSpaceService.postLike().update({writingId: writingID},
                                                      function(response) {
                    $scope.likeStatus = true;
                    getMyTownActivity();
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
                    $scope.unlikeStatus = true;
                    getMyTownActivity();
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
                    getMyTownActivity();
                },
                function(response) {
                    $scope.message = "Error: "+response.status + " " + response.statusText;
                });
        };
        
        $scope.verifyNewsMain = function (newsID) {
            if($scope.verifyButtonStatus) {
                $scope.verifyButtonStatus = !($scope.verifyButtonStatus);
                newsService.postVerify().update({newsId: newsID},
                                                function(response) {
                    $scope.verifyButtonStatus = true;
                    getMyTownActivity();
                },
                                                function(response) {
                    $scope.message = "Error: "+response.status + " " + response.statusText;
                });
            }
        };
        $scope.unVerifyNewsMain = function (newsID) {
            if($scope.verifyButtonStatus) {
                $scope.verifyButtonStatus = !($scope.verifyButtonStatus);
                newsService.postUnVerify().update({newsId: newsID},
                                                  function(response) {
                    $scope.verifyButtonStatus = true;
                    getMyTownActivity();
                },
                                                  function(response) {
                    $scope.message = "Error: "+response.status + " " + response.statusText;
                });
            }
        };
        
        $scope.refuteNewsMain = function (newsID) {
            if($scope.verifyButtonStatus) {
                $scope.verifyButtonStatus = !($scope.verifyButtonStatus);
                newsService.postRefute().update({newsId: newsID},
                                                function(response) {
                    $scope.verifyButtonStatus = true;
                    getMyTownActivity();
                },
                                                function(response) {
                    $scope.message = "Error: "+response.status + " " + response.statusText;
                });
            }
        };
        $scope.unRefuteNewsMain = function (newsID) {
            if($scope.verifyButtonStatus) {
                $scope.verifyButtonStatus = !($scope.verifyButtonStatus);
                newsService.postUnRefute().update({newsId: newsID},
                                                  function(response) {
                    $scope.verifyButtonStatus = true;
                    getMyTownActivity();
                },
                                                  function(response) {
                    $scope.message = "Error: "+response.status + " " + response.statusText;
                });
            }
        }; 
        
        $scope.openTownActivityWritingCategorySelect=function() { 
            ngDialog.open({template:"views/writings/writing_category_select.html",scope:$scope, classname:"ngdialog-theme-default", controller:"writingInputController"});
        };
        
        $scope.openTownActivityNewsReportInput=function() { 
            ngDialog.open({template:"views/news/news_report_input.html",scope:$scope, classname:"ngdialog-theme-default", controller:"newsInputController"});
        };
        
    }])
    .controller('HotelsHomeController',['$scope', 'UtilService', 'AuthFactory', 'ngDialog', '$state', function($scope,UtilService,AuthFactory,ngDialog,$state) {
//        console.clear();
        $scope.message = "Wait...";
        $scope.username = AuthFactory.getUsername();
        $scope.professions = AuthFactory.getProfessions();
        $scope.profilePicture = AuthFactory.getProfilePicture();
        $scope.showHotels = false;
        $scope.noTownActivity = false;
        $scope.likeStatus = true;
        $scope.unlikeStatus = true;
        $scope.verifyButtonStatus = true;
        $scope.refuteButtonStatus = true;
        $scope.showMobileMyTown = false;
        $scope.dateNow = new Date(Date.now());
        var morningFrom, morningTo, nightMainFrom, nightMainTo;
        var scope = AuthFactory.getScope();
        var townName = scope.slice(0,-6);
        $scope.townName = townName.charAt(0).toUpperCase() + townName.slice(1);
        
        $scope.showHotelsList = false;
        $scope.noHotel = false;
        
        UtilService.getHeaderStatus().get({restaurantName: "MyTownScripts"})
            .$promise.then(
            function(response){
                $scope.activeOrder = response.active;
            },
            function(response){
                $scope.message = "Error: "+response.status + " " + response.statusText;
            }
        );
        
        UtilService.getRestaurantNames().query(
            function(response) {
                $scope.showHotelsList = true;
                $scope.restaurants = response;
                $scope.showHotels = true;
//                console.log($scope.restaurants);
                if(!$scope.restaurants[0]) {
                    $scope.noHotel = true;
                }
            },
            function(response) {
                $scope.message = "Error: "+response.status + " " + response.statusText;
            });
        
        $scope.orderFood = function(now, restaurantName) {
            if((morningFrom < now && now < morningTo) || (nightMainFrom < now && now < nightMainTo)) 
            {
                $state.go("app.order_food",{restaurantName: restaurantName},{});
            } else {
                console.log("In else");
                ngDialog.open({ template: 'views/entities/util/restaurantClosed.html', scope: $scope, classname: 'ngdialog-theme-default'});
            }
        };
        $scope.checkTimings = function(mornFrom, mornTo, nightFrom, nightTo, now) {
            morningFrom = mornFrom, morningTo = mornTo, nightMainFrom = nightFrom, nightMainTo = nightTo;

            if((mornFrom < now && now < mornTo) || (nightFrom < now && now < nightTo)) {
                return true;
            } else {
                return false;
            }
        };
        
        $scope.toggleShowMobileMyTown = function() {
            $scope.showMobileMyTown = !$scope.showMobileMyTown;
        };
        
        $scope.openTownActivityWritingCategorySelect=function() { 
            ngDialog.open({template:"views/writings/writing_category_select.html",scope:$scope, classname:"ngdialog-theme-default", controller:"writingInputController"});
        };
        
        $scope.openTownActivityNewsReportInput=function() { 
            ngDialog.open({template:"views/news/news_report_input.html",scope:$scope, classname:"ngdialog-theme-default", controller:"newsInputController"});
        };
        
    }])
    .controller('FoodOrderController', ['$scope', 'foodOrderService','$state', 'AuthFactory', '$stateParams', 'ngDialog', function($scope, foodOrderService,$state,AuthFactory,$stateParams,ngDialog) {
        $scope.tab = 1;
        $scope.filtText = '';
        $scope.showDetails = false;
        $scope.showMenu = false;
        $scope.message = "Loading ...";
        $scope.quant = "0";

        $scope.totalBill = 0;
        var dishTray = [];
        var dishTrayTemp = [];
        var addDishButtons = [];
        console.log("$stateParams.restaurantName: "+$stateParams.restaurantName);
        foodOrderService.setRestaurantName($stateParams.restaurantName);
        $scope.restaurantNameFoodOrder = foodOrderService.getRestaurantName();
        
        foodOrderService.getDishes().query({restaurantName: $scope.restaurantNameFoodOrder}).$promise.then(
            function(response) {
                $scope.dishes = response;
                $scope.showMenu = true;
            },
            function(response) {
                $scope.message = "Error: "+response.status + " " + response.statusText;
            });
        
        $scope.select = function(setTab) {
            $scope.tab = setTab;
            
            if (setTab === 2) {
                $scope.filtText = "soups_starters";
            }
            else if (setTab === 3) {
                $scope.filtText = "maincourse";
            }
            else if (setTab === 4) {
                $scope.filtText = "tandoor";
            }
            else if (setTab === 5) {
                $scope.filtText = "rice";
            }
            else if (setTab === 6) {
                $scope.filtText = "dessert_beverages";
            }
            else if (setTab === 7) {
                $scope.filtText = "other";
            }
            else {
                $scope.filtText = "";
            }
        };
        
        $scope.isSelected = function (checkTab) {
            return ($scope.tab === checkTab);
        };
        
        $scope.toggleDetails = function() {
            $scope.showDetails = !$scope.showDetails;
        };
        
        $scope.placeOnTray = function() {
            if(AuthFactory.isAuthenticated()) {
                for(var i=0;i<dishTray.length;i++) {
                    if(dishTray[i].quantity <= 0) {
                        dishTray.splice(i,1);
                    }
                }
                var dishTrayJson = {
                    "dishes":dishTray,
                    "bill" : $scope.totalBill
                };
                if(dishTray[0]) {
                    foodOrderService.postFoodTray().save({restaurantName: $scope.restaurantNameFoodOrder}, dishTrayJson)
                        .$promise.then(
                        function(response) {

                            $state.go("app.delivery_details",{restaurantName: $scope.restaurantNameFoodOrder},{});
                        },
                        function(response) {
                            $scope.message = "Error: "+response.status + " " + response.statusText;
                        });
                }
            } else {
                ngDialog.open({ template: 'views/util/auth/loginModal.html', scope: $scope, classname: 'ngdialog-theme-default', controller:"loginModalController"});
            }

        };
        
        $scope.addQuantity = function(dish) {
            document.getElementById("orderQty_"+dish._id).value++;
            var index = dishTrayTemp.indexOf(dish._id);
            $scope.totalBill = parseInt($scope.totalBill) + parseInt(dish.price);
            dishTray[index].quantity = document.getElementById("orderQty_"+dish._id).value;
        };
        
        $scope.addDishButtonStatus = function (dishId) {
            var buttonStatus=false;
            for(var i=(addDishButtons.length-1);i>-1;i--) {
                if(dishId == addDishButtons[i]) {
                    buttonStatus = true;
                    break;
                }
            }
            return buttonStatus;
        };
        
        $scope.addToOrder = function(dish) {
            dishTray.push({'dish': dish._id, 'quantity': 1, 'name': dish.name});

            $scope.totalBill = parseInt($scope.totalBill) + parseInt(dish.price);
            document.getElementById("orderQty_"+dish._id).value = 1;
            dishTrayTemp.push(dish._id);

            addDishButtons.push(dish._id);
            
        };
        $scope.reduceQuantity = function(dish) {
            if(document.getElementById("orderQty_"+dish._id).value > 0) {
                document.getElementById("orderQty_"+dish._id).value--;
                $scope.totalBill = parseInt($scope.totalBill) - parseInt(dish.price);
                var index = dishTrayTemp.indexOf(dish._id);
                dishTray[index].quantity = document.getElementById("orderQty_"+dish._id).value;
            }
        };
        
    }])
    .controller('FoodOrderTrayController', ['$scope', 'foodOrderService', '$state', '$stateParams', 'AuthFactory', function($scope, foodOrderService, $state, $stateParams, AuthFactory) {
        $scope.tab = 1;
        $scope.filtText = '';
        $scope.showFoodTray = false;
        $scope.showDetails = false;
        $scope.message = "Loading ...";
        var citizenId = AuthFactory.getCitizenID();
        var foodTrayId;
    
        $scope.toggleDetails = function() {
            $scope.showDetails = !$scope.showDetails;
        };
        
        function getFoodTray() {
            foodOrderService.getFoodTray().get()
                .$promise.then(
                function(response) {
                    if(response.dishes[0]) {
                        $scope.foodTray = response;

                        foodTrayId = response._id;
                        $scope.showFoodTray = true;
                    } else {
                        $state.go("app.order_food",{restaurantName: $stateParams.restaurantName},{});
                    }

                },
                function(response){
                    $scope.message = "Error: "+response.status + " " + response.statusText;
                }
            );
        }
        getFoodTray();
        
        $scope.confirmOrder = function() {
            foodOrderService.confirmFoodOrder().save({restaurantName: $stateParams.restaurantName}, {'foodTrayId':foodTrayId})
                .$promise.then(
                function(response) {
                    var mqttHostname = "mytownscripts.com";
                    var mqttPort = "8083";
                    
                    var client = new Paho.MQTT.Client(mqttHostname, Number(mqttPort), citizenId);   //Do not connect with same clientID
                    var message = new Paho.MQTT.Message("Order Placed by");
                    function onConnect() {
                        console.log("onConnect");
                        message.destinationName = "MyTownScripts/hotels/order";
                        client.send(message);
                        $state.go("app.order_status",{restaurantName: $stateParams.restaurantName},{});
                    }
                    client.connect({onSuccess:onConnect,useSSL: true});
                },
                function(response) {
                    $scope.message = "Error: "+response.status + " " + response.statusText;
                });
        };
        $scope.deleteOrder = function() {
            foodOrderService.deleteOrder().delete({foodTrayId: foodTrayId})
                .$promise.then(
                function(response) {
                    $state.go("app.order_food",{restaurantName: $stateParams.restaurantName},{});
                },
                function(response) {
                    $scope.message = "Error: "+response.status + " " + response.statusText;
                });
        };
        $scope.removeDish = function(dishTemp) {
            var dish = {'quantity': dishTemp.quantity,'dish':dishTemp.dish._id};
            foodOrderService.removeDish().save({foodTrayId: foodTrayId}, {'dish':dish})
                .$promise.then(
                function(response) {
                    getFoodTray();
                },
                function(response) {
                    $scope.message = "Error: "+response.status + " " + response.statusText;
                });
        };
        
        
        $scope.toggleContactDetails = function() {
            $scope.showContactDetails = !($scope.showContactDetails);
        };
    }])
    .controller('FoodOrderStatusController', ['$scope', 'foodOrderService', 'AuthFactory', '$state', 'desktopNotification', function($scope, foodOrderService, AuthFactory, $state, desktopNotification) {
        var foodTrayId;
        $scope.tab = 1;
        $scope.filtText = '';
        $scope.showFoodTray = false;
        $scope.showDetails = false;
        $scope.message = "Loading ...";
        $scope.orderReady = false;
        $scope.orderAccepted = false;
        var restaurantName = foodOrderService.getRestaurantName();
    
        $scope.toggleDetails = function() {
            $scope.showDetails = !$scope.showDetails;
        };
        
        function getFoodTray() {
            foodOrderService.getFoodTray().get()
                .$promise.then(
                function(response){
                    $scope.foodTray = response;
                    foodTrayId = response._id;
                    $scope.showFoodTray = true;
                    $scope.orderReady = response.ready;
                    $scope.orderAccepted = (response.accept || response.reject.reject);
                    
                    if(!$scope.orderAccepted) {
                        var mqttHostname = "mytownscripts.com";
                        var mqttPort = "8083";
                        var citizenName = response.citizenName;
                        
                        var client = new Paho.MQTT.Client(mqttHostname, Number(mqttPort), AuthFactory.getCitizenID());   //Do not connect with same clientID
        
                        // set callback handlers
                        client.onConnectionLost = onConnectionLost;
                        client.onMessageArrived = onMessageArrived;
        
                        // connect the client
                        function subscribeMQTT() {
                            client.connect({onSuccess:onConnect,useSSL: true});
            
                            // called when the client connects
                            function onConnect() {
//                                console.log("onConnect");
                                var subscribeOptions = {
                                    qos: 2,
                                };
                                
                                client.subscribe("MyTownScripts/hotels/orderStatus"+citizenName, subscribeOptions);
                            }
                        }
                        
                        function onConnectionLost(responseObject) {
                            if (responseObject.errorCode !== 0) {
//                                console.log("subscribe onConnectionLost:"+responseObject.errorMessage);
                                //                    subscribeMQTT();
                            }
                        }
                        
                        // called when a message arrives
                        function onMessageArrived(message) {
//                            console.log("onMessageArrived:"+message.payloadString);
                            getFoodTray();
                            desktopNotification.requestPermission().then(function (permission) {
                                // User allowed the notification
                                desktopNotification.show('Hello', {
                                    body: 'Order Accepted',
                                    onClick: function () {
                                    }
                                });
                            }, function (permission) {
                                // User denied the notification
                                window.alert('Unable to show notification: ' + permission);
                            });
                        }
                        
                        subscribeMQTT();
                    }
                },
                function(response){
                    $scope.message = "Error: "+response.status + " " + response.statusText;
                }
            );
        }
        getFoodTray();
        
        $scope.toggleContactDetails = function() {
            $scope.showContactDetails = !($scope.showContactDetails);
        };
        $scope.toggleReject = function() {
            $scope.showRejectReason = !($scope.showRejectReason);
        };
        
        $scope.deleteOrder = function() {
            foodOrderService.cancelOrder().delete({'restaurantName':restaurantName,foodTrayId: foodTrayId})
                .$promise.then(
                function(response) {
                    var mqttHostname = "mytownscripts.com";
                    var mqttPort = "8083";
                    var client = new Paho.MQTT.Client(mqttHostname, Number(mqttPort), AuthFactory.getCitizenID());   //Do not connect with same clientID
                    var message = new Paho.MQTT.Message("Order Placed by");
                    function onConnect() {
//                        console.log("onConnect");
                        message.destinationName = "MyTownScripts/hotels/order";
                        client.send(message);
                        $state.go("app.order_food",{restaurantName: restaurantName},{reload: true});
                    }
                    client.connect({onSuccess:onConnect,useSSL: true});
                },
                function(response) {
                    $scope.message = "Error: "+response.status + " " + response.statusText;
                });
        };
    }])
    .controller('DeliveryDetailsController', ['$scope', '$state', 'foodOrderService',  function($scope, $state,foodOrderService) {
        $scope.contactInfo = {};
         $scope.submitDeliveryDetails = function() {
             foodOrderService.postDeliveryDetails().save($scope.contactInfo,
                                                         function(response) {
                 $state.go("app.food_order_tray",{restaurantName: foodOrderService.getRestaurantName()},{});
             },
                                                         function(response) {
                 $scope.message = "Error: "+response.status + " " + response.statusText;
             });
         };
    }])
;