angular.module('fileModelDirective', [])
.directive('fileModel', ['$parse', function($parse) {                                       //Go through Angular Directives
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var parsedFile = $parse(attrs.fileModel);                   
            
            //look for attribute file-model(fileModel) of <input> and assign it's value, i.e file.upload
            
            var parsedFileSetter = parsedFile.assign;
            
            // Look at $parse.assign documentation. If the expression(file.upload) is assignable, this will be set to a function to change its value on the given context.
            
            element.bind('change', function() {
                scope.$apply(function() {
                    parsedFileSetter(scope, element[0].files[0]);
                    //          function(context, value)
                     /* We pass scope as our 'context' here. So as soon as there is a change in file-model attribute value in the form, which is file.upload, set(assign) the value of the attribute as element[0].files[0] which is the uploaded file in our case All this happens over the context of scope(Look for the file in the $scope). That is $scope.file.upload would be set. */
                    
                });
            });
        }
    };
}]);


/*This directive is to bind the 'type: file' which ng-model doesn't do.*/