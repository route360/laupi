'use strict';

/**
 * @ngdoc overview
 * @name route360DemoApp
 * @description
 * # route360DemoApp
 *
 * Main module of the application.
 */
angular
  .module('route360DemoApp', [
    'ngRoute',
    'ngTouch',
    'cfg',
    'ui.checkbox',
    'ngTable',
    'ui.bootstrap',
    'isteven-multi-select'
  ])
  .config(function ($routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'views/map.html',
            controller: 'MapCtrl',
            resolve: {
                laupisDatabase: function (DataService) {
                    return DataService.getData().then(function (response) {
                        return response.data;
                    });
                }
            }
        })
        .otherwise({
            redirectTo: '/'
        });
    });
