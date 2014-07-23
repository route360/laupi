'use strict';

/**
 * @ngdoc function
 * @name route360DemoApp.controller:ApartmentCtrl
 * @description
 * # ApartmentCtrl
 * Controller of the route360DemoApp
 */
angular.module('route360DemoApp')
    .controller('ApartmentCtrl', function ($window, $http, $scope, $config, ApartmentFactory, $filter, ngTableParams, $timeout, TableParamFactory, ApartmentService, $cookieStore) {

        // TODO
        // 1. Filter by routing time                ... DONE
        // 2. Routen anzeigen                       ... DONE
        // 3. Marker Drag&Drop, Reverse Geocoding   ... DONE
        // 4. Verschneidungsmöglichkeiten           ... DONE
        // 5. Löschen von markern                   ... DONE
        // 6. Browserkompatibilität                 ... IN PROGERSS
        // 7. Mit einem AutoComplete anfangen       ... DONE
        // 8. angeklickte marker andere farbe       ... DONE
        // 9. hover                                 ... IN PROGRESS
        // 10. check for update cronjob             ... IN PROGRESS
        // 11. Multilinguality                      ... IN PROGRESS
        //      11a. Translations                   ... IN PROGRESS
        //      11b. Language Switcher              ... NOT STARTED
        $scope.places = [];
        $scope.markerColorsHex = [ '#338433', '#BC5A1D', '#4F2474', '#226CBE', '#B71632', '#656565' ];
        $scope.markerColors = [ 'green', 'orange', 'purple', 'blue', 'red', 'grey' ];

        // cookie stuff
        $scope.cookieKeys = { visited : 'clickedApartments', hidden : 'hiddenApartments', liked : 'likedApartments' };
        // remove this for production
        // $cookieStore.remove($scope.cookieKeys.visited);
        // $cookieStore.remove($scope.cookieKeys.hidden);
        // $cookieStore.remove($scope.cookieKeys.liked);
        if ( typeof $cookieStore.get($scope.cookieKeys.visited) == 'undefined' ) $cookieStore.put($scope.cookieKeys.visited, []);
        if ( typeof $cookieStore.get($scope.cookieKeys.hidden)  == 'undefined' ) $cookieStore.put($scope.cookieKeys.hidden, []);
        if ( typeof $cookieStore.get($scope.cookieKeys.liked)   == 'undefined' ) $cookieStore.put($scope.cookieKeys.liked, []);
        // cookied end

        // modal stuff start
        $("#apartment-search-edit").show();
        $("#apartment-search-edit").on('click', function(){ $("#apartment-search-edit-modal").modal('show'); });
        
        $("#apartment-results").show();
        $("#apartment-results").on('click', function(){ 

            $scope.apartmentsTableParams = TableParamFactory.create($scope.apartments);
            $scope.$apply();
            $("#apartment-results-modal").modal('show'); 
        });
        
        $("#apartment-liked").show();
        $("#apartment-liked").on('click', function(){ 
            
            $("#apartment-liked-modal").modal('show'); 
            ApartmentFactory.getApartmentsByIds($cookieStore.get($scope.cookieKeys.liked), function(apartments){

                $scope.likedTableParams = TableParamFactory.create(apartments);
            });
        });
        // modal stuff end

        $scope.hideHelp = false;
        $scope.status   = { isFirstOpen: true, oneAtATime : true };

        // default search parameters
        $scope.search = { 
            minPrice : 700, maxPrice : 800, 
            minArea : 70, maxArea : 80, 
            minRooms : 3, maxRooms : 3, 
            kitchen : false, garden : false, courtage : false, balcony : true,
            intersection : 'average',
            callback : 'JSON_CALLBACK'
        };

        // leaflet complains if project is build/minimized if this is not present
        L.Icon.Default.imagePath = 'images/marker/';

        // add the map and set the initial center to berlin
        $scope.map = L.map('map-apartment', {zoomControl : false}).setView([52.516389, 13.377778], 13);
        // attribution to give credit to OSM map data and VBB for public transportation 
        var attribution ="<a href='https://www.mapbox.com/about/maps/' target='_blank'>© Mapbox © OpenStreetMap</a> | ÖPNV Daten © <a href='http://www.vbb.de/de/index.html' target='_blank'>VBB</a> | developed by <a href='http://www.route360.net/de/' target='_blank'>Route360°</a>";
        // initialising the base map. To change the base map just change following lines as described by cloudmade, mapbox etc..
        L.tileLayer('http://a.tiles.mapbox.com/v3/' + $config.mapboxId + '/{z}/{x}/{y}.png', { maxZoom: 18, attribution: attribution }).addTo($scope.map);

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
        $scope.map.addControl($scope.travelTimeControl);
        $scope.map.addControl($scope.travelTypeButtons);

        $scope.apartmentLayer  = L.featureGroup().addTo($scope.map);
        $scope.placesLayer     = L.featureGroup().addTo($scope.map);
        $scope.routesLayer     = L.featureGroup().addTo($scope.map);
        $scope.polygonLayer    = r360.route360PolygonLayer();
        $scope.map.addLayer($scope.polygonLayer);

        /**
         * [getPlaces get all the values from the autocomplete place choser]
         */
        $scope.getPlaces = function(){

            // clear everything
            $scope.places = [];
            $scope.placesLayer.clearLayers();

            _.each($scope.autoCompletes, function(autoComplete, index) { 

                // only valid (non-empty) autocompletes are used for search
                if ( typeof autoComplete != 'undefined' &&
                     typeof autoComplete.getValue() != 'undefined' &&
                     Object.keys(autoComplete.getValue()).length !== 0 ) {

                    var item        = autoComplete.getValue();
                    item.getLatLng  = function(){ return this.latlng; }
                    item.id         = item.latlng.lat + "" + item.latlng.lng;
                    $scope.places.push(item);

                    var marker = r360.Util.getMarker(item.latlng, 
                        { color : $scope.markerColors[index], iconPath: L.Icon.Default.imagePath, draggable : true }).addTo($scope.placesLayer);

                    // what happens if someone drags the marker
                    marker.on("dragend", function(event){

                        // ask the service for a proper name 
                        r360.Util.getAddressByCoordinates(marker.getLatLng(), 'de', function(json){
                            
                            // udpate the values in the auto complete
                            autoComplete.update(marker.getLatLng(), r360.Util.formatReverseGeocoding(json));
                            // rerender view
                            $scope.showApartments();
                        });
                    });
                }
            });
        }

        /**
         * [showApartments description]
         * @return {[type]} [description]
         */
        $scope.showApartments = function(){

            $scope.apartmentLayer.clearLayers();   
            $scope.apartmentLayer.clearLayers();
            $scope.routesLayer.clearLayers();
            $scope.polygonLayer.clearLayers();
            $('#apartment-details').hide();
            $scope.getPlaces();

            var travelOptions = r360.travelOptions();

            if ( $scope.places.length > 0 ) {

                travelOptions.setSources($scope.places);
                travelOptions.setTravelTimes($scope.travelTimeControl.getValues());
                travelOptions.setTravelType($scope.travelTypeButtons.getValue());
                travelOptions.setMaxRoutingTime(_.max($scope.travelTimeControl.getValues()));
                travelOptions.setIntersectionMode($scope.search.intersection);

                // we only need to set the time for transit
                if (typeof $scope.travelStartTimeControl !== 'undefined' && 
                    typeof $scope.travelStartDateControl !== 'undefined') {

                    travelOptions.setDate($scope.travelStartDateControl.getValue());
                    travelOptions.setTime($scope.travelStartTimeControl.getValue());
                }
                // call the service
                r360.PolygonService.getTravelTimePolygons(travelOptions, function(polygons){

                    $scope.polygonLayer.addLayer(polygons);
                    $scope.map.fitBounds($scope.polygonLayer.getBoundingBox());
                });

                $http.jsonp($config.serviceUrl + 'apartments/all?' + $.param($scope.search))
                .success(function(apartments){

                    // get the apartments and update the list
                    $scope.apartments  = apartments; 
                    $scope.tableParams = TableParamFactory.create($scope.apartments);
                    // $scope.tableParams.reload();
                    travelOptions.setSources($scope.places);
                    _.each($scope.apartments, function(apartment){
                        apartment.getLatLng = function() { return L.latLng(this.lat, this.lon); };

                        if ( !_.contains($cookieStore.get($scope.cookieKeys.hidden), apartment.id) )
                            travelOptions.addTarget(apartment);
                    });

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
                                travelTime += tt == -1 ? undefined : tt;
                                travelTimes.push({id: targetIndex, travelTime : tt});
                            });
                            apartment.averageTravelTime = travelTime / travelTimes.length;

                            // 2. create a marker depending on 1.
                            // the default marker is a plain circle marker
                            var color = 'red';
                            if (_.contains($cookieStore.get($scope.cookieKeys.visited), apartment.id) ) 
                                color = 'grey';

                            var iconSize  = { width : 25, height : 41 };
                            var iconUrl   = 'images/marker/marker-icon-red.png';
                            if (_.contains($cookieStore.get($scope.cookieKeys.visited), apartment.id) ) 
                                iconUrl = 'images/marker/marker-icon-grey.png';
 
                            var apartmentSymbol;

                            // the travel time to these apartment is shorter then the maximum travel width
                            // all other apartment will remain with the circle marker
                            if ( apartment.averageTravelTime != undefined && apartment.averageTravelTime <= travelOptions.getMaxRoutingTime() ) {

                                // only a rule of three
                                // 1) set min und max percent of the marker
                                var maxPercent = $config.markerMaxPercent;
                                var minPercent = $config.markerMinPercent;

                                // 2) calculate the distance
                                var frame = maxPercent - minPercent;

                                // 3) get maximum travel time
                                var maxTravelTime = travelOptions.maxRoutingTime;

                                // 4) how much percent of the frame equal one second
                                var percentPerSecond = frame / maxTravelTime;

                                // 5) scale factor for the marker
                                var scale = minPercent + (maxTravelTime - apartment.averageTravelTime) * percentPerSecond;

                                // lower bound
                                if ( scale < minPercent ) scale = minPercent;

                                var iconUrl = 'images/marker/marker-icon-red.png';
                                if (_.contains($cookieStore.get($scope.cookieKeys.visited), apartment.id) ) 
                                    iconUrl = 'images/marker/marker-icon-grey.png';

                                // create the icon with the calculated scaled width and height
                                var icon     = L.icon({ 
                                    iconUrl:        iconUrl, 
                                    shadowUrl:      'images/marker/marker-shadow.png',
                                    iconAnchor:     [iconSize.width * scale,   iconSize.height * scale], 
                                    shadowAnchor:   [iconSize.width * scale,   iconSize.height * scale], 
                                    iconSize:       [iconSize.width * scale,   iconSize.height * scale],
                                    shadowSize:     [iconSize.height * scale,  iconSize.height * scale],
                                    popupAnchor:    [-15,  - iconSize.height * scale + 5]});

                                var apartmentSymbol = L.marker([apartment.lat, apartment.lon], {icon : icon} );
                                apartmentSymbol.icon = icon;

                                // add the apartment to the map
                                apartmentSymbol.addTo($scope.apartmentLayer);
                            }
                            else {

                                apartment.averageTravelTime = 10000000;

                                var scale    = 0.4;
                                var icon     = L.icon({ 
                                    iconUrl:        iconUrl, 
                                    shadowUrl:      'images/marker/marker-shadow.png',
                                    iconAnchor:     [iconSize.width * scale,   iconSize.height * scale], 
                                    shadowAnchor:   [iconSize.width * scale,   iconSize.height * scale], 
                                    iconSize:       [iconSize.width * scale,   iconSize.height * scale],
                                    shadowSize:     [iconSize.height * scale,  iconSize.height * scale],
                                    popupAnchor:    [-15,  - iconSize.height * scale + 5]});

                                apartmentSymbol      = L.marker([apartment.lat, apartment.lon], {icon : icon});
                                apartmentSymbol.icon = icon;
                                // add the apartment to the map
                                apartmentSymbol.addTo($scope.apartmentLayer);
                            }

                            // bind the apartment id to the marker
                            apartmentSymbol.id = apartment.id;

                            // show the info window on mouseover and click
                            apartmentSymbol.on('click mouseover', $scope.clickMarker(apartmentSymbol, apartment, travelOptions));
                        });
                    });
                });
            }
        };

        /**
         * [clickMarker description]
         * @param  {[type]} apartmentSymbol [description]
         * @param  {[type]} apartment       [description]
         * @param  {[type]} travelOptions   [description]
         * @return {[type]}                 [description]
         */
        $scope.clickMarker = function(apartmentSymbol, apartment, travelOptions){

            return function() {

                // mark the apartment as visited
                var cookie = $cookieStore.get($scope.cookieKeys.visited);
                if (!_.contains(cookie, apartmentSymbol.id)) cookie.push(apartmentSymbol.id);
                $cookieStore.put($scope.cookieKeys.visited, cookie);

                // this hack is due to the fact that we need to remove a circle marker
                // if we want to change its color
                if ( apartment.routes ) return;

                // get the apartment details from the server
                ApartmentFactory.getApartment(apartmentSymbol.id, function (apartment) { 

                    $scope.changeApartmentSymbolColor(apartmentSymbol, apartment, travelOptions);

                    $scope.apartment = apartment;
                    $scope.routesLayer.clearLayers();
                    $('#apartment-details').show();

                    // display the liked button
                    if ( _.contains($cookieStore.get($scope.cookieKeys.liked), $scope.apartment.id) ) $scope.apartment.liked = true;

                    // define source and target
                    travelOptions.setSources([apartmentSymbol]);
                    travelOptions.setTargets($scope.places);

                    // query the server
                    r360.RouteService.getRoutes(travelOptions, function(routes){

                        $scope.apartment.averageTravelTime = _.reduce(routes, function(sum, route){ return route.getTravelTime() + sum; }, 0) / routes.length;
                        $scope.apartment.routes = routes;
                        $scope.$apply(); // update view because of out of angular call

                        // one route for each source and target combination
                        _.each(routes, function(route, index){

                            route.icon = L.Icon.Default.imagePath + 'marker-icon-' + $scope.markerColors[index] + '.png';
                            route.end  = $scope.places[index].firstRow;
                            $scope.$apply(); // update view because of out of angular call

                            $scope.paintPolylines(route, $scope.markerColors[index]);
                        });
                    });
                });
            };
        }

        /**
         * [changeApartmentSymbolColor description]
         * @param  {[type]} apartmentSymbol [description]
         * @param  {[type]} apartment       [description]
         * @param  {[type]} travelOptions   [description]
         * @return {[type]}                 [description]
         */
        $scope.changeApartmentSymbolColor = function(apartmentSymbol, apartment, travelOptions){

            apartmentSymbol.icon.options.iconUrl = L.Icon.Default.imagePath + 'marker-icon-grey.png';;
            apartmentSymbol.setIcon(apartmentSymbol.icon);
        }

        /**
         * [hideApartment description]
         * @param  {[type]} id [description]
         * @return {[type]}    [description]
         */
        $scope.hideApartment = function(id) {

            var cookie = $cookieStore.get($scope.cookieKeys.hidden);
            if ( !_.contains(cookie, id) ) cookie.push(id);
            $cookieStore.put($scope.cookieKeys.hidden, cookie);

            $scope.apartmentLayer.eachLayer(function (layer) {
                if ( layer.id == id ) {
                    $scope.apartmentLayer.removeLayer(layer);
                    $scope.routesLayer.clearLayers();
                    $('#apartment-details').hide();
                }
            });
        };

        /**
         * [likeApartment description]
         * @param  {[type]} id [description]
         * @return {[type]}    [description]
         */
        $scope.likeApartment = function(id) {

            var cookie = $cookieStore.get($scope.cookieKeys.liked);
            // not liked yet, so go like it
            if ( !_.contains(cookie, id) ) {

                $scope.apartment.liked = true;
                cookie.push(id);
            }
            // remove liking
            else {

                cookie = _.without(cookie, id);
                $scope.apartment.liked = false;
            }
            // store add or delete in same cookie
            $cookieStore.put($scope.cookieKeys.liked, cookie);
        };

        /**
         * [openExpose description]
         * @param  {[type]} id [description]
         * @return {[type]}    [description]
         */
        $scope.openExpose = function(id) {

            $window.open('http://immobilienscout24.de/expose/' + id);
        };

        /**
         * [paintPolylines description]
         * @param  {[type]} route [description]
         * @param  {[type]} color [description]
         * @return {[type]}       [description]
         */
        $scope.paintPolylines = function(route, color){

            _.each(route.getSegments(), function(segment, index){

                if ( segment.getType() == "TRANSFER" ) return;

                var polylineOptions         = {};
                polylineOptions.color       = color;

                var polylineHaloOptions     = {};
                polylineHaloOptions.weight  = 7;
                polylineHaloOptions.color   = "white";
                
                // the first and the last segment is walking so we need to dotted lines
                if ( index == 0 || index == (route.getLength() - 1) ) polylineOptions.dashArray = "1, 8";

                var halo = L.polyline(segment.getPoints(), polylineHaloOptions).addTo($scope.routesLayer);
                var line = L.polyline(segment.getPoints(), polylineOptions).addTo($scope.routesLayer);
            });

            // we have to do this twice because otherwise the transfer marker would be
            // on top of one line and underneath another 
            _.each(route.getSegments(), function(segment, index){

                if ( segment.getType() == "TRANSFER" ) {

                    L.circleMarker(_.first(route.getSegments()[index - 1].getPoints()), { color: "white", 
                        fillColor: color, fillOpacity: 1.0, stroke : true, radius : 7 }).addTo($scope.routesLayer);

                    return;
                }
            });
        };

        /**
         * [addOrRemoveTransitControls description]
         *
         * 
         */
        $scope.addOrRemoveTransitControls = function(){

            if ( $scope.travelTypeButtons.getValue() == 'transit' ) {

                $scope.travelStartDateControl = r360.travelStartDateControl();
                $scope.travelStartTimeControl = r360.travelStartTimeControl();
                $scope.map.addControl($scope.travelStartTimeControl);
                $scope.map.addControl($scope.travelStartDateControl);
                $scope.travelStartDateControl.onChange(function(value){ $scope.showApartments() });
                $scope.travelStartTimeControl.onSlideStop(function(value){ $scope.showApartments() });
            }
            else {

                if (typeof $scope.travelStartTimeControl !== 'undefined' && typeof $scope.travelStartDateControl !== 'undefined') {
                    
                    $scope.map.removeControl($scope.travelStartTimeControl);
                    $scope.travelStartTimeControl = undefined;
                    $scope.map.removeControl($scope.travelStartDateControl);
                    $scope.travelStartDateControl = undefined;
                }
            }

            $scope.showApartments(); 
        };

        // bind the action to the change event of the radio travel mode element
        $scope.addOrRemoveTransitControls();
        $scope.travelTypeButtons.onChange(function(value){ $scope.addOrRemoveTransitControls(); });
        $scope.travelTimeControl.onSlideStop(function() { $scope.showApartments(); });

        $scope.autoCompletes = [];
        $scope.addAutoComplete = function(){

            // create a autocomplete
            var autoComplete = r360.placeAutoCompleteControl({ 
                country     : "Deutschland", 
                placeholder : 'Select start!', 
                reset       : true,
                image       : L.Icon.Default.imagePath + 'marker-icon-' + $scope.markerColors[$scope.autoCompletes.length] + '.png'
            });
            autoComplete.index = $scope.autoCompletes.length;

            var reset = function(){

                autoComplete.reset();

                $('#apartment-details').hide();
                // redraw view
                $scope.showApartments();
            };

            var select = function() {

                // add a new autocomplete
                if ( $scope.autoCompletes.length < $config.maxAutoCompletes ) 
                    $scope.addAutoComplete();

                // redraw view
                $scope.showApartments();
            }

            // define what is happing on select
            autoComplete.onSelect(select);
            autoComplete.onReset(reset);

            $scope.autoCompletes.push(autoComplete);
            $scope.map.addControl(autoComplete);

            // recalculate the position of this hack
            $('#apartment-details').css('top',  ((53 * $scope.autoCompletes.length) + 10) + 'px');
            $('#apartment-details').css('max-height',  ($('#map-apartment').height() -  (53 * $scope.autoCompletes.length) - 20) + 'px');
        };

        $scope.addAutoComplete();
        $scope.addAutoComplete();
        
        $('#apartment-details').css('top',  ((53 * $scope.autoCompletes.length) + 10) + 'px');
        $('#apartment-details').on('mouseover', function(){ $scope.map.scrollWheelZoom.disable(); });
        $('#apartment-details').on('mouseout' , function(){ $scope.map.scrollWheelZoom.enable(); });      

        // toggle the modals 
        $scope.showResultView       = function(){

            $scope.apartmentsTableParams = TableParamFactory.create($scope.apartments);
            $('#apartment-results-modal').modal('show'); 
        };
        $scope.showEditSearchView   = function(){ $('#apartment-search-edit-modal').modal('show'); };
        $scope.showLikedView        = function(){ $('#apartment-liked-modal').modal('show'); };
        // end toggle modals
        
        // on changes of the inputs we need to update the view
        $scope.$watch('search', function() { console.log($scope.search); $scope.showApartments(); }, true);

        $scope.map.on('resize', function(){

            $('#apartment-details').css('top',  ((53 * $scope.autoCompletes.length) + 10) + 'px');
            $('#apartment-details').css('max-height',  ($('#map-apartment').height() -  (53 * $scope.autoCompletes.length) - 20) + 'px');
        });

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
        
        $scope.showApartments();
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
        $('#apartment-details').css('max-height',  ($('#map-apartment').height() -  (53 * $scope.autoCompletes.length) - 20) + 'px');
    });