angular.module('todoApp', [])
    .controller('TodoController', ['$scope', '$http', function($scope, $http) {

        console.log(5);

        $http.jsonp('http://localhost:8282/r360-backend/apartments/all?' + $.param($scope.search))
            .success(function(apartments){

                console.log('test');

                $scope.apartments = apartments;
                $scope.$apply();
            })
            .error(function(result){

                console.log('error');
            });
    }]);