'use strict';

/**
 * @ngdoc function
 * @name route360DemoApp.controller:NavCtrl
 * @description
 * # NavCtrl
 * Controller of the route360DemoApp
 */
angular.module('route360DemoApp')
  .controller('NavCtrl', ['$scope', '$location', function ($scope, $location) {
    
    $scope.navClass = function(page){

        var currentRoute = $location.path().substring(1) || 'home';
        return page === currentRoute ? 'active' : '';
    };  

    $scope.loadHome       = function(){ $location.url('/'); };
    $scope.loadContact    = function(){ $location.url('/contact'); };
    $scope.loadAbout      = function(){ $location.url('/about'); };
    $scope.loadTest       = function(){ $location.url('/test'); };
  }]);