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

        $('#tabs').tab();

        $scope.test = 'test';
    });
