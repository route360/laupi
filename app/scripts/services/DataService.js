'use strict';

/**
 * @ngdoc service
 * @name route360DemoApp.DataService
 * @description
 * # DataService
 * Service in the route360DemoApp.
 */
angular.module('route360DemoApp')
    .factory('DataService', function($http){
        return {
            getData: function(){
                return $http.get('https://www.laupi.de/map-app.json');
            }
        };
});