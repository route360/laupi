'use strict';

/**
 * @ngdoc service
 * @name route360DemoApp.ApartmentFactory
 * @description
 * # ApartmentFactory
 * Factory in the route360DemoApp.
 */
angular.module('route360DemoApp')
    .factory('ApartmentFactory', function ($http, $config) {

        var urlBase = $config.serviceUrl + "apartments/";
        var dataFactory = {};

        dataFactory.getApartment = function (id, callback) {

            $http.jsonp(urlBase + id + '?callback=JSON_CALLBACK')
                .success(function(result){ callback(result) })
                .error(function(result){ console.log('error'); console.log(result)});
        };

        dataFactory.getApartmentsByIds = function (ids, callback) {

            $http.jsonp(urlBase + 'list?' + $.param({id : ids, callback : 'JSON_CALLBACK'}, true))
                .success(function(result){ callback(result) })
                .error(function(result){ console.log('error'); console.log(result)});
        };

        return dataFactory;
    });