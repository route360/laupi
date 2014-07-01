'use strict';

/**
 * @ngdoc function
 * @name route360DemoApp.controller:ApartmentCtrl
 * @description
 * # ApartmentCtrl
 * Controller of the route360DemoApp
 */
angular.module('route360DemoApp')
    .controller('ApartmentCtrl', function ($scope, $config, ApartmentFactory, $filter, ngTableParams) {
 
        $scope.search = {
            minPrice : 300,
            maxPrice : 800,
            minArea : 50,
            maxArea : 80,
            minRooms : 2,
            maxRooms : 3,
            kitchen : false,
            garden : false,
            courtage : false,
            balcony : true
        };

        // leaflet complains if project is build/minimized if this is not present
        L.Icon.Default.imagePath = 'images/marker/';
        
        // add the map and set the initial center to berlin
        var map = L.map('map-apartment', {zoomControl : false}).setView([52.516389, 13.377778], 13);
        // attribution to give credit to OSM map data and VBB for public transportation 
        var attribution ="<a href='https://www.mapbox.com/about/maps/' target='_blank'>© Mapbox © OpenStreetMap</a> | ÖPNV Daten © <a href='http://www.vbb.de/de/index.html' target='_blank'>VBB</a> | developed by <a href='http://www.route360.net/de/' target='_blank'>Route360°</a>";

        // add a layer in which we will paint the route
        $scope.apartmentLayer = L.featureGroup().addTo(map);

         // initialising the base map. To change the base map just change following lines as described by cloudmade, mapbox etc..
        L.tileLayer('http://a.tiles.mapbox.com/v3/' + $config.mapboxId + '/{z}/{x}/{y}.png', {
            maxZoom: 18,
            attribution: attribution
        }).addTo(map);


        $scope.showApartments = function(){

            $scope.apartmentLayer.clearLayers();

            ApartmentFactory.getApartments($scope.search).success(function (apartments) { 

                $scope.tableParams = new ngTableParams({
                    page    : 1,            // show first page
                    count   : 9,          // count per page
                    sorting: { name: 'asc' }     // initial sorting
                }, {
                    total: apartments.length, // length of data
                    getData: function($defer, params) {

                        console.log(apartments);
                        // use build-in angular filter
                        var orderedData = params.sorting() ? $filter('orderBy')(apartments, params.orderBy()) : apartments;

                        $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
                    }
                });
        
                $scope.apartments = apartments; 

                console.log($scope.apartments.length);

                _.each($scope.apartments, function(apartment){

                    L.marker([apartment.lat, apartment.lon]).addTo($scope.apartmentLayer).bindPopup(
                        '<h4>' + apartment.title + '</h4> \
                        <img src="http://placekitten.com/g/200/150"> \
                        <a target="_blank" href="http://www.immobilienscout24.de/expose/'+apartment.id+'"> \
                            <button type="button" class="btn btn-default">Expose</button> \
                        </a>'
                    );
                });
            });
        }
        
        // on changes of the inputs we need to update the view
        $scope.$watch('search', function() { $scope.showApartments(); }, true);
    });
