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

        dataFactory.getApartments = function (searchParams) {

            return $http({
                url     : urlBase + 'all', 
                method  : "GET",
                params  : searchParams
             });
        };

        // dataFactory.getCustomer = function (id) {
        //     return $http.get(urlBase + '/' + id);
        // };

        // dataFactory.insertCustomer = function (cust) {
        //     return $http.post(urlBase, cust);
        // };

        // dataFactory.updateCustomer = function (cust) {
        //     return $http.put(urlBase + '/' + cust.ID, cust)
        // };

        // dataFactory.deleteCustomer = function (id) {
        //     return $http.delete(urlBase + '/' + id);
        // };

        // dataFactory.getOrders = function (id) {
        //     return $http.get(urlBase + '/' + id + '/orders');
        // };

        return dataFactory;
    });