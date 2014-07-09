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

        $("#apartment-search-edit").show();
        $("#apartment-search-edit").on('click', function(){ $("#apartment-search-edit-modal").modal('show'); });
        $("#apartment-results").show();
        $("#apartment-results").on('click', function(){ $("#apartment-results-modal").modal('show'); });

        // default search parameters
        $scope.search = { minPrice : 600, maxPrice : 800, minArea : 70, maxArea : 80, 
            minRooms : 3, maxRooms : 3, kitchen : false, garden : true, courtage : false, balcony : true
        };

        // leaflet complains if project is build/minimized if this is not present
        L.Icon.Default.imagePath = 'images/marker/';
        // create a target marker icon to be able to distingush source and targets
        $scope.redIcon = L.icon({iconUrl: 'images/marker/marker-icon-red.png', 
            shadowUrl: 'images/marker/marker-shadow.png', iconAnchor: [12,45], popupAnchor:  [0, -35] });
        
        // add the map and set the initial center to berlin
        var map = L.map('map-apartment', {zoomControl : false}).setView([52.516389, 13.377778], 13);
        // attribution to give credit to OSM map data and VBB for public transportation 
        var attribution ="<a href='https://www.mapbox.com/about/maps/' target='_blank'>© Mapbox © OpenStreetMap</a> | ÖPNV Daten © <a href='http://www.vbb.de/de/index.html' target='_blank'>VBB</a> | developed by <a href='http://www.route360.net/de/' target='_blank'>Route360°</a>";

        $scope.travelTimeControl       = r360.travelTimeControl({
            travelTimes     : [
                { time : 300  , color : "#006837"},
                { time : 600  , color : "#39B54A"},
                { time : 900  , color : "#8CC63F"},
                { time : 1200 , color : "#F7931E"},
                { time : 1500 , color : "#F15A24"},
                { time : 1800 , color : "#C1272D"}
            ],
            position : 'topright', // this is the position in the map
            label: 'Reisezeit: ', // the label, customize for i18n
            initValue: 30 // the inital value has to match a time from travelTimes, e.g.: 40m == 2400s
        });

        // create a new readio button control with the given options
        $scope.travelTypeButtons = r360.radioButtonControl({ buttons : [
            { label: 'Cycling', key: 'bike',    tooltip: 'Cycling speed is on average 15km/h'                               , checked : false },
            { label: 'Walking', key: 'walk',    tooltip: 'Walking speed is on average 5km/h'                                , checked : false },
            { label: 'ÖPNV',    key: 'transit', tooltip: 'Public transportation includes buses, trams, trains and subways.' , checked : true  },
            { label: 'Car',     key: 'car',     tooltip: 'Car speed is limited by speed limit'                              , checked : false }]
        });

        // add the newly created control to the map
        map.addControl($scope.travelTimeControl);
        map.addControl($scope.travelTypeButtons);

        $scope.addOrRemoveTransitControls = function(){

            if ( $scope.travelTypeButtons.getValue() == 'transit' ) {

                $scope.travelStartDateControl = r360.travelStartDateControl();
                $scope.travelStartTimeControl = r360.travelStartTimeControl();
                map.addControl($scope.travelStartTimeControl);
                map.addControl($scope.travelStartDateControl);
                $scope.travelStartDateControl.onChange(function(value){ $scope.showApartments() });
                $scope.travelStartTimeControl.onSlideStop(function(value){ $scope.showApartments() });
            }
            else {

                if (typeof $scope.travelStartTimeControl !== 'undefined' && typeof $scope.travelStartDateControl !== 'undefined') {
                    
                    map.removeControl($scope.travelStartTimeControl);
                    $scope.travelStartTimeControl = undefined;
                    map.removeControl($scope.travelStartDateControl);
                    $scope.travelStartDateControl = undefined;
                }
            }

            $scope.showApartments(); 
        }


        // bind the action to the change event of the radio travel mode element
        $scope.travelTypeButtons.onChange(function(value){ $scope.addOrRemoveTransitControls(); });
        $scope.travelTimeControl.onSlideStop(function() { $scope.showApartments(); });

        $scope.reachableApartmentLayer      = L.featureGroup().addTo(map);
        $scope.notReachableApartmentLayer   = L.featureGroup().addTo(map);
        $scope.placesLayer                  = L.featureGroup().addTo(map);

        r360.config.serviceKey = 'uhWrWpUhyZQy8rPfiC7X';
        var cpl = r360.route360PolygonLayer();
        map.addLayer(cpl);

         // initialising the base map. To change the base map just change following lines as described by cloudmade, mapbox etc..
        L.tileLayer('http://a.tiles.mapbox.com/v3/' + $config.mapboxId + '/{z}/{x}/{y}.png', {
            maxZoom: 18,
            attribution: attribution
        }).addTo(map);

        /**
         *
         */
        $scope.showApartments = function(){

            $scope.reachableApartmentLayer.clearLayers();   
            $scope.notReachableApartmentLayer.clearLayers();
            $scope.placesLayer.clearLayers();

            var places = $scope.getPlaces();
            if ( places.length > 0 ) {

                var travelOptions = r360.travelOptions();
                travelOptions.setSources(places);
                travelOptions.setTravelTimes($scope.travelTimeControl.getValues());
                travelOptions.setTravelType($scope.travelTypeButtons.getValue());

                // we only need to set the time for transit
                if (typeof $scope.travelStartTimeControl !== 'undefined' && 
                    typeof $scope.travelStartDateControl !== 'undefined') {

                    travelOptions.setDate($scope.travelStartDateControl.getValue());
                    travelOptions.setTime($scope.travelStartTimeControl.getValue());
                }

                // call the service
                r360.PolygonService.getTravelTimePolygons(travelOptions, function(polygons){

                    cpl.clearLayers();
                    cpl.addLayer(polygons);
                    map.fitBounds(cpl.getBoundingBox());
                });
            }

            ApartmentFactory.getApartments($scope.search).success(function (apartments) { 

                $scope.tableParams = new ngTableParams({ page : 1, count   : 10, sorting: { name: 'asc' } }, {
                    counts : [],
                    total: apartments.length,
                    getData: function($defer, params) {

                        var orderedData = params.sorting() ? $filter('orderBy')(apartments, params.orderBy()) : apartments;
                        $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
                    }
                });
        
                $scope.apartments = apartments; 

                _.each($scope.apartments, function(apartment){

                    L.marker([apartment.lat, apartment.lon]).addTo($scope.reachableApartmentLayer).bindPopup(
                        '<h4>' + apartment.title + '</h4> \
                        <img class="img-responsive" src="' + apartment.img + '"> \
                        <a target="_blank" href="http://www.immobilienscout24.de/expose/'+apartment.id+'"> \
                            <button type="button" class="btn btn-default">Expose</button> \
                        </a>'
                    );
                });
            });
        }

        // get all the values from the autocomplete place choser
        $scope.getPlaces = function(){

            var places = [];
            _.each($scope.autoCompletes, function(autoComplete) { 

                if (typeof autoComplete.getValue() != 'undefined') {

                    var item = autoComplete.getValue();
                    item.getLatLng = function(){ return this.latlng; }
                    places.push(item);
                    var marker = L.marker(item.getLatLng(), { icon : $scope.redIcon}).addTo($scope.placesLayer);
                    marker.bindPopup("<h2>"+ item.firstRow +"</h2>");
                }
            });

            return places;
        }

        $scope.autoCompletes = [];
        _.each(_.range(0,3), function(index){

            $scope.autoCompletes.push(r360.placeAutoCompleteControl({country : "Deutschland", placeholder : 'Select start!'}));
            $scope.autoCompletes[index].onSelect($scope.showApartments);
            // this hack can be delete in upcoming versions of route360°
            $scope.autoCompletes[index].setValue = function(item){ 
                this.options.value = item;
                var mapId = $(this.options.map._container).attr("id");
                $("#autocomplete-"+mapId).val(item.firstRow);
            }
            map.addControl($scope.autoCompletes[index]);
        });

        // toggle the modals 
        $scope.showResultView       = function(){ $('#apartment-results-modal').modal('show'); };
        $scope.showEditSearchView   = function(){ $('#apartment-search-edit-modal').modal('show'); };
        
        // on changes of the inputs we need to update the view
        $scope.$watch('search', function() { $scope.showApartments(); }, true);

        $scope.autoCompletes[0].setFieldValue("Berlin, Berlin");
        $scope.autoCompletes[0].setValue({
            firstRow    : "Berlin, Berlin",
            getLatLng   : function (){ return this.latlng; },
            label       : "Berlin, Berlin",
            latlng      : L.latLng(52.517037, 13.38886),
            secondRow   : "Berlin",
            term        : "Berlin",
            value       : "Berlin, Berlin"
        });
    });
