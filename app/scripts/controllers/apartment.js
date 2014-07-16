'use strict';

/**
 * @ngdoc function
 * @name route360DemoApp.controller:ApartmentCtrl
 * @description
 * # ApartmentCtrl
 * Controller of the route360DemoApp
 */
angular.module('route360DemoApp')
    .controller('ApartmentCtrl', function ($scope, $config, ApartmentFactory, $filter, ngTableParams, $timeout, TableParamFactory) {

        r360.config.serviceUrl = 'http://localhost:8080/api/'

        // TODO
        // 1. Filter by routing time ... DONE
        // 2. Routen anzeigen
        // 3. Marker Drag&Drop, Reverse Geocoding
        // 4. Verschneidungsmöglichkeiten
        // 5. Löschen von markern
        // 6. Browserkompatibilität
        // 7. Mit einem AutoComplete anfangen
        // 8. angeklickte marker andere farbe
        // 9. hover
        // 10. 

        $scope.markerColors = [ 'green', 'orange', 'purple', 'blue', 'red' ];
        $scope.apartment = {};
        $scope.test= { key : 'value'};

        $("#apartment-search-edit").show();
        $("#apartment-search-edit").on('click', function(){ $("#apartment-search-edit-modal").modal('show'); });
        $("#apartment-results").show();
        $("#apartment-results").on('click', function(){ $("#apartment-results-modal").modal('show'); });

        // default search parameters
        $scope.search = { 
            minPrice : 700, maxPrice : 800, 
            minArea : 70, maxArea : 80, 
            minRooms : 3, maxRooms : 3, 
            kitchen : false, garden : false, courtage : false, balcony : true
        };

        // leaflet complains if project is build/minimized if this is not present
        L.Icon.Default.imagePath = 'images/marker/';

        // add the map and set the initial center to berlin
        var map = L.map('map-apartment', {zoomControl : false}).setView([52.516389, 13.377778], 13);
        // attribution to give credit to OSM map data and VBB for public transportation 
        var attribution ="<a href='https://www.mapbox.com/about/maps/' target='_blank'>© Mapbox © OpenStreetMap</a> | ÖPNV Daten © <a href='http://www.vbb.de/de/index.html' target='_blank'>VBB</a> | developed by <a href='http://www.route360.net/de/' target='_blank'>Route360°</a>";
        // initialising the base map. To change the base map just change following lines as described by cloudmade, mapbox etc..
        L.tileLayer('http://a.tiles.mapbox.com/v3/' + $config.mapboxId + '/{z}/{x}/{y}.png', { maxZoom: 18, attribution: attribution }).addTo(map);

        r360.config.defaultTravelTimeControlOptions.travelTimes = [
            { time : 600   , color : "#006837"},
            { time : 1200  , color : "#39B54A"},
            { time : 1800  , color : "#8CC63F"},
            { time : 2400  , color : "#F7931E"},
            { time : 3000  , color : "#F15A24"},
            { time : 3600  , color : "#C1272D"}
        ];

        $scope.travelTimeControl = r360.travelTimeControl({
            travelTimes : r360.config.defaultTravelTimeControlOptions.travelTimes,
            position    : 'topright', // this is the position in the map
            label       : 'Reisezeit: ', // the label, customize for i18n
            initValue   : 20 // the inital value has to match a time from travelTimes, e.g.: 40m == 2400s
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

        $scope.reachableApartmentLayer      = L.featureGroup().addTo(map);
        $scope.notReachableApartmentLayer   = L.featureGroup().addTo(map);
        $scope.placesLayer                  = L.featureGroup().addTo(map);
        $scope.routesLayer                  = L.featureGroup().addTo(map);
        $scope.polygonLayer                 = r360.route360PolygonLayer();
        map.addLayer($scope.polygonLayer);

        // get all the values from the autocomplete place choser
        $scope.getPlaces = function(){

            var places = [];
            _.each($scope.autoCompletes, function(autoComplete, index) { 

                if (typeof autoComplete.getValue() != 'undefined') {

                    var item        = autoComplete.getValue();
                    item.getLatLng  = function(){ return this.latlng; }
                    item.id         = item.latlng.lat + "" + item.latlng.lng;
                    places.push(item);


                    var marker = r360.Util.getMarker(item.latlng, 
                        { color : $scope.markerColors[index], iconPath: L.Icon.Default.imagePath, draggable : true }).addTo($scope.placesLayer);
                    marker.bindPopup("<h2>"+ item.firstRow +"</h2>");

                    marker.on("dragend", function(event){

                        autoComplete.getValue().latlng = marker.getLatLng();
                        $scope.showApartments();

                        r360.Util.getAddressByCoordinates(marker.getLatLng(), 'de', function(json){
                    
                            var displayName = r360.Util.formatReverseGeocoding(json);
                            autoComplete.setFieldValue(displayName);
                            marker.bindPopup('<h2>' + displayName + '</h2>');
                        });
                    });
                }
            });

            return places;
        }

        /**
         *
         */
        $scope.showApartments = function(){

            $scope.reachableApartmentLayer.clearLayers();   
            $scope.notReachableApartmentLayer.clearLayers();
            $scope.placesLayer.clearLayers();
            $scope.routesLayer.clearLayers();
            $scope.polygonLayer.clearLayers();

            var places        = $scope.getPlaces();
            var travelOptions = r360.travelOptions();

            if ( places.length > 0 ) {

                travelOptions.setSources(places);
                travelOptions.setTravelTimes($scope.travelTimeControl.getValues());
                travelOptions.setTravelType($scope.travelTypeButtons.getValue());
                travelOptions.setMaxRoutingTime(_.max($scope.travelTimeControl.getValues()));

                // we only need to set the time for transit
                if (typeof $scope.travelStartTimeControl !== 'undefined' && 
                    typeof $scope.travelStartDateControl !== 'undefined') {

                    travelOptions.setDate($scope.travelStartDateControl.getValue());
                    travelOptions.setTime($scope.travelStartTimeControl.getValue());
                }

                // call the service
                r360.PolygonService.getTravelTimePolygons(travelOptions, function(polygons){

                    $scope.polygonLayer.addLayer(polygons);
                    map.fitBounds($scope.polygonLayer.getBoundingBox());
                });

                ApartmentFactory.getApartments($scope.search).success(function (apartments) { 

                    // get the apartments and update the list
                    $scope.apartments  = apartments; 
                    $scope.tableParams = TableParamFactory.create($scope.apartments);
                    // $scope.tableParams.reload();
                    travelOptions.setSources(places);
                    _.each(apartments, function(apartment){

                        apartment.getLatLng = function() { return L.latLng(this.lat, this.lon); };
                        travelOptions.addTarget(apartment);
                    })

                    // call the service
                    r360.TimeService.getRouteTime(travelOptions, function(sources){

                        // each source has the same number of targets and in the same order
                        _.each(_.range(0, sources[0].targets.length), function(targetIndex){

                            var apartment = _.find($scope.apartments, function(apartment){ return apartment.id == sources[0].targets[targetIndex].id ; });

                            // 1. get average routing time
                            var travelTime = 0;
                            var travelTimes = [];
                            _.each(sources, function(source) { 
                                // get the travel time for this target for every source
                                var tt = source.targets[targetIndex].travelTime;
                                travelTime += tt == -1 ? -10000000 : tt;
                                travelTimes.push({id: targetIndex, travelTime : tt});
                            });
                            apartment.travelTime = travelTime / travelTimes.length;

                            // 2. create a marker depending on 1.
                            // the default marker is a plain circle marker
                            var poiSymbol = L.circleMarker([apartment.lat, apartment.lon], 
                                { color: "white", fillColor: 'red', fillOpacity: 1.0, stroke : true, radius : 5 });

                            // the travel time to these apartment is shorter then the maximum travel width
                            // all other apartment will remain with the circle marker
                            if ( apartment.travelTime > 0 && apartment.travelTime <= travelOptions.getMaxRoutingTime() ) {

                                // only a rule of three
                                // 1) set min und max percent of the marker
                                var maxPercent = 1;
                                var minPercent = 0.5;

                                // 2) calculate the distance
                                var frame = maxPercent - minPercent;

                                // 3) get maximum travel time
                                var maxTravelTime = travelOptions.maxRoutingTime;

                                // 4) how much percent of the frame equal one second
                                var percentPerSecond = frame / maxTravelTime;

                                // 5) scale factor for the marker
                                var scale = minPercent + (maxTravelTime - apartment.travelTime) * percentPerSecond;

                                // lower bound
                                if ( scale < minPercent ) scale = minPercent;

                                // create the icon with the calculated scaled width and height
                                var iconSize = { width : 25, height : 41 };
                                var poiSymbol = L.marker([apartment.lat, apartment.lon], {icon : L.icon({ 
                                    iconUrl:        'images/marker/marker-icon-red.png', 
                                    shadowUrl:      'images/marker/marker-shadow.png',
                                    iconAnchor:     [iconSize.width * scale,   iconSize.height * scale], 
                                    shadowAnchor:   [iconSize.width * scale,   iconSize.height * scale], 
                                    iconSize:       [iconSize.width * scale,   iconSize.height * scale],
                                    shadowSize:     [iconSize.height * scale,  iconSize.height * scale],
                                    popupAnchor:    [-15,  - iconSize.height * scale + 5]})});

                                // add the apartment to the map
                                poiSymbol.addTo($scope.reachableApartmentLayer);
                            }
                            else poiSymbol.addTo($scope.notReachableApartmentLayer);

                            var debug = ''; _.each(travelTimes, function(tt){ debug += '<pre>'+ tt.id + ': '+ tt.travelTime +' seconds</pre>'; }); debug += '<pre>average: '+ apartment.travelTime +' seconds</pre>';
                            // poiSymbol.bindPopup(debug);

                            // show the routes on mouseover
                            poiSymbol.on('click mouseover', function(){

                                $scope.apartment = apartment;
                                $scope.routesLayer.clearLayers();

                                travelOptions.setSources(places);
                                travelOptions.setTargets([poiSymbol]);
                                r360.RouteService.getRoutes(travelOptions, function(routes){

                                    $scope.apartment.routes = routes;
                                    $scope.$apply(); // update view because of out of angular call

                                    // one route for each source and target combination
                                    _.each(routes, function(route){

                                        // create one polyline for the route and a polyline for the polyline's halo
                                        _.each(r360.Util.routeToLeafletPolylines(route, { addPopup : false }), function(polylineSegment){
                                            _.each(polylineSegment, function(polylines){ polylines.addTo($scope.routesLayer); });
                                        });

                                        // add marker if the route segment changes, indicates transfers
                                        _.each(route.getSegments(), function(segment, index) {
                                            
                                            // only add changing markers for öpnv switches 
                                            if ( segment.getType() == "TRANSFER" ) 
                                                var marker = L.circleMarker(_.last(route.getSegments()[index - 1].getPoints()), { color: "white", 
                                                    fillColor: '#EF832F', fillOpacity: 1.0, stroke : true, radius : 7 }).addTo($scope.routesLayer);
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            }
        }

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
        $scope.addOrRemoveTransitControls();
        $scope.travelTypeButtons.onChange(function(value){ $scope.addOrRemoveTransitControls(); });
        $scope.travelTimeControl.onSlideStop(function() { $scope.showApartments(); });

        
        // $scope.$watch('filter.$', function () {
        //     if (  typeof $scope.tableParams !== 'undefined' && $scope.tableParams.data.length > 0) {
        //         $scope.tableParams.reload();
        //     }
        // });

        $scope.autoCompletes = [];
        // create a autocomplete
        var autoComplete = r360.placeAutoCompleteControl({ 
            country     : "Deutschland", 
            placeholder : 'Select start!', 
            reset       : true,
            image       : L.Icon.Default.imagePath + 'marker-icon-' + $scope.markerColors[0] + '.png'
        });
        // define what is happing on select
        autoComplete.onSelect(function() {

            // add a new autocomplete
            if ( $scope.autoCompletes.length < 3 ) {

                var newAutoComplete = r360.placeAutoCompleteControl({ 
                    country : "Deutschland", 
                    placeholder : 'Select start!', 
                    reset : true, 
                    image :  L.Icon.Default.imagePath + 'marker-icon-' + $scope.markerColors[$scope.autoCompletes.length + 1] + '.png'
                });
                map.addControl(newAutoComplete);
                $scope.autoCompletes.push(newAutoComplete);

                // recalculate the position of this hack
                $('#apartment-details').css('top',  ((53 * $scope.autoCompletes.length) + 10) + 'px');
            }

            // redraw view
            $scope.showApartments();
        });
        $scope.autoCompletes.push(autoComplete);
        map.addControl(autoComplete);

        $('#apartment-details').css('top',  ((53 * $scope.autoCompletes.length) + 10) + 'px');
        $('#apartment-details').on('mouseover', function(){ map.scrollWheelZoom.disable(); });
        $('#apartment-details').on('mouseout' , function(){ map.scrollWheelZoom.enable(); });      

        // toggle the modals 
        $scope.showResultView       = function(){ $('#apartment-results-modal').modal('show'); };
        $scope.showEditSearchView   = function(){ $('#apartment-search-edit-modal').modal('show'); };
        
        // on changes of the inputs we need to update the view
        $scope.$watch('search', function() { 
            
            $scope.showApartments();
            if ( typeof $scope.tableParams !== 'undefined') $scope.tableParams.reload(); 
        }, true);


        // set default values for debugging/developing
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
        // $scope.autoCompletes[1].setFieldValue("Invalidenstraße, Berlin");
        // $scope.autoCompletes[1].setValue({
        //     firstRow    : "Invalidenstraße, Berlin",
        //     getLatLng   : function (){ return this.latlng; },
        //     id          : "52.52795313.374074",
        //     label       : "Invalidenstraße, Berlin",
        //     latlng      : L.latLng(52.527953, 13.374074),
        //     secondRow   : "Invalidenstraße 10557 Berlin",
        //     term        : "Invalidenstraße",
        //     value       : "Invalidenstraße, Berlin"
        // });
    });
