'use strict';

/**
 * @ngdoc service
 * @name route360DemoApp.ApartmentService
 * @description
 * # ApartmentService
 * Service in the route360DemoApp.
 */
angular.module('route360DemoApp')
    .service('ApartmentService', function ApartmentService($http, $config) {
        
        this.getApartment = function(id, callback) {
            
            $http.jsonp($config.serviceUrl + "apartments/" + id + "?callback=JSON_CALLBACK")
                .success(callback(ap));
        };     
    });
