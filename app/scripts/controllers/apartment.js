'use strict';

/**
 * @ngdoc function
 * @name route360DemoApp.controller:ApartmentCtrl
 * @description
 * # ApartmentCtrl
 * Controller of the route360DemoApp
 */
angular.module('route360DemoApp')
    .controller('ApartmentCtrl', function ($scope, $config) {

        $scope.initSelects = function(){

            $scope.minRooms = 1;
            $scope.maxRooms = 7;
            $scope.minArea = 10;
            $scope.maxArea = 240;
            $scope.minPrice = 100;
            $scope.maxPrice = 2500;

            

            $("#select-rooms").slider({});
            $("#select-area").slider({});
            $("#select-price").slider({});
        }

        $scope.checkboxModel;
        
        // add the map and set the initial center to berlin
        var map = L.map('map-apartment', {zoomControl : false}).setView([52.516389, 13.377778], 13);
        // attribution to give credit to OSM map data and VBB for public transportation 
        var attribution ="<a href='https://www.mapbox.com/about/maps/' target='_blank'>© Mapbox © OpenStreetMap</a> | ÖPNV Daten © <a href='http://www.vbb.de/de/index.html' target='_blank'>VBB</a> | developed by <a href='http://www.route360.net/de/' target='_blank'>Route360°</a>";

         // initialising the base map. To change the base map just change following lines as described by cloudmade, mapbox etc..
        L.tileLayer('http://a.tiles.mapbox.com/v3/' + $config.mapboxId + '/{z}/{x}/{y}.png', {
            maxZoom: 18,
            attribution: attribution
        }).addTo(map);

        $scope.initSelects();
    });
