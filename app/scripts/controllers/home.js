'use strict';

/**
 * @ngdoc function
 * @name route360DemoApp.controller:HomeCtrl
 * @description
 * # HomeCtrl
 * Controller of the route360DemoApp
 */
angular.module('route360DemoApp')
    .controller('HomeCtrl', function ($scope) {
        $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];

        console.log('HOME CONTROLLER CALLED');
        $scope.test = 'test';
    });
