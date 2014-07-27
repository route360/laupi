'use strict';

/**
 * @ngdoc function
 * @name route360DemoApp.controller:ApartmentCtrl
 * @description
 * # ApartmentCtrl
 * Controller of the route360DemoApp
 */
angular.module('route360DemoApp')
    .controller('ApartmentCtrl', function ($window, $http, $scope, $config, ApartmentFactory, $filter, ngTableParams, $timeout, TableParamFactory, ApartmentService, $cookieStore, $translate) {

        // INVALID .... 29. breite des expose wieder zu breit (geht bei mir im windows unter allen versionen)
        // DONE ....... 1. Filter by routing time             
        // DONE ....... 10. check for update cronjob
        // DONE ....... 11b. Language Switcher              
        // DONE ....... 12. remove multiple request         
        // DONE ....... 13. Nav-leiste (Farbe, Font, Logo) 
        // DONE ....... 15. Schließen button in expose ansicht
        // DONE ....... 16. Eingaben kontrollieren
        // DONE ....... 19. Courtage ja nein
        // DONE ....... 2. Routen anzeigen                    
        // DONE ....... 20. span/class tag im autocomplete
        // DONE ....... 24. leer polygone zoomen auf gesamte welt
        // DONE ....... 25. Informationsfeld über der Karte einbauen
        // DONE ....... 27. marker on hover: https://github.com/maximeh/leaflet.bouncemarker
        // DONE ....... 28. Empty apartment title ""
        // DONE ....... 3. Marker Drag&Drop, Reverse Geocoding
        // DONE ....... 30. click auf reset von leerem eingabefeld löst request aus
        // DONE ....... 31. hinwesie eingabefeld
        // DONE ....... 32. ö-pnv raus aus map
        // DONE ....... 34. max travel time bei average auf maxtraveltime * |places|
        // DONE ....... 35. start marker drag me hinweise
        // DONE ....... 37. leere einträge in den favouriten
        // DONE ....... 4. Verschneidungsmöglichkeiten        
        // DONE ....... 5. Löschen von markern                
        // DONE ....... 7. Mit einem AutoComplete anfangen 
        // DONE ....... 8. angeklickte marker andere farbe 
        // DONE ....... 9. hover für route klick expose    
        // DONE........ 36. doppelte einträge im place auto complete 'tauent'
        // DONE........ 38. wenn keine apartments gefunden werden, wird timeservice ohne targets angefragt
        // DONE ....... 17. Keine Polygone abfragen bei Apartmentänderung
        // IN PROGRESS. 11a. Translations
        // IN PROGRESS. Browserkompatibilität
        // NOT STARTED. 18. Bilder und ERklärungstexte für Verschneidung
        // NOT STARTED. 21. PLZ only uncool 
        // NOT STARTED. 22. beim löschen von marker checken ob zwei leer sind und dann einen löschen
        // NOT STARTED. 23. marker farben korrigieren
        // NOT STARTED. 26. selektierter marker andere farbe
        // NOT STARTED. 33. Optionsslide out für place autocomplete
        // ON HOLD .... 14. Cache aufwärmen
        $scope.places           = [];
        $scope.autoCompletes    = [];
        $scope.updatePolygons   = true;
        $scope.markerColorsHex  = [ '#338433', '#BC5A1D', '#4F2474', '#226CBE', '#B71632', '#656565' ];
        $scope.markerColors     = [ 'green', 'orange', 'purple', 'blue', 'red', 'grey' ];

        // cookie stuff
        $scope.cookieKeys       = { visited : 'clickedApartments', hidden : 'hiddenApartments', liked : 'likedApartments' };
        // remove this for production
        $cookieStore.remove($scope.cookieKeys.visited);
        $cookieStore.remove($scope.cookieKeys.hidden);
        $cookieStore.remove($scope.cookieKeys.liked);
        if ( typeof $cookieStore.get($scope.cookieKeys.visited) == 'undefined' ) $cookieStore.put($scope.cookieKeys.visited, []);
        if ( typeof $cookieStore.get($scope.cookieKeys.hidden)  == 'undefined' ) $cookieStore.put($scope.cookieKeys.hidden, []);
        if ( typeof $cookieStore.get($scope.cookieKeys.liked)   == 'undefined' ) $cookieStore.put($scope.cookieKeys.liked, []);
        $scope.likeCookie = $cookieStore.get($scope.cookieKeys.liked);
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

            if ( $scope.likeCookie.length > 0 ) {

                ApartmentFactory.getApartmentsByIds($cookieStore.get($scope.cookieKeys.liked), function(apartments){
                    $scope.likedTableParams = TableParamFactory.create(apartments);
                    var x = apartments[0]; // hack to get to show the apartmens in the view
                });    
            }
            else $scope.likedTableParams = TableParamFactory.create([]);    
        });
        // modal stuff end

        $scope.hideHelp = true;
        $scope.status   = { isFirstOpen: true, oneAtATime : true };

        // default search parameters
        $scope.search = { 
            minPrice : 300, maxPrice : 800, 
            minArea : 70, maxArea : 80, 
            minRooms : 3, maxRooms : 3, 
            kitchen : false, garden : false, courtage : false, balcony : true,
            intersection : 'average',
            time : new Date(),
            date : new Date(),
            callback : 'JSON_CALLBACK'
        };

        /**
         * [openCalendar opens calender popup in edit search view on click]
         * @param  {[type]} $event [description]
         * @return {[type]}        [description]
         */
        $scope.openCalendar = function($event) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope.opened = true;
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

        // add the newly created control to the map
        // $scope.map.addControl($scope.travelTypeButtons);
        $scope.map.addControl($scope.travelTimeControl);
        $scope.travelTimeControl.onSlideStop(function() { $scope.showApartments(); });

        // create and add the layers to the map
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

                    var item = autoComplete.getValue();
                    item.lat = item.latlng.lat;
                    item.lon = item.latlng.lng;
                    item.id  = item.lat + ';' + item.lon;
                    $scope.places.push(item);

                    var marker = r360.Util.getMarker(item.latlng, 
                        { color : $scope.markerColors[index], iconPath: L.Icon.Default.imagePath, draggable : true }).addTo($scope.placesLayer);

                    // save the marker to initialy add popup for dragging
                    autoComplete.marker = marker;

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
        };

        /**
         * [getDate description]
         * @return {[type]} [description]
         */
        $scope.getDate = function(){

            var month = ($scope.search.date.getMonth() + 1) < 10 ? "0" + ($scope.search.date.getMonth() + 1) : ($scope.search.date.getMonth() + 1); 
            var date  = $scope.search.date.getDate() < 10        ? "0" + $scope.search.date.getDate()        : $scope.search.date.getDate(); 
            var year  = $scope.search.date.getFullYear()
            
            return year + '' + month + '' + date;
        };

        /**
         * [getTime description]
         * @return {[type]} [description]
         */
        $scope.getTime = function(){

            return (($scope.search.time.getHours() * 3600) + $scope.search.time.getMinutes() * 60);
        };

        /**
         * [showApartments description]
         * @return {[type]} [description]
         */
        $scope.showApartments = function(){

            $scope.apartmentLayer.clearLayers();   
            $scope.apartmentLayer.clearLayers();
            $scope.routesLayer.clearLayers();
            $('#apartment-details').hide();
            $scope.getPlaces();

            var travelOptions = r360.travelOptions();

            if ( $scope.places.length > 0 ) {

                travelOptions.setSources($scope.places);
                travelOptions.setTravelTimes($scope.travelTimeControl.getValues());
                travelOptions.setTravelType('transit'); // TODO make this configurable
                travelOptions.setMaxRoutingTime(_.max($scope.travelTimeControl.getValues()));
                travelOptions.setIntersectionMode($scope.search.intersection);
                travelOptions.setDate($scope.getDate());
                travelOptions.setTime($scope.getTime());

                $scope.paintTravelTimePolygons(travelOptions);

                $scope.getApartments(function(apartments){

                    // get the apartments 
                    $scope.apartments  = apartments; 
                    // and update the result list modal view
                    $scope.tableParams = TableParamFactory.create($scope.apartments);
                    // do not query server if no apartments found
                    if ( apartments.length == 0 ) return;
                    
                    // service configuration
                    var travelOptions = r360.travelOptions();
                    travelOptions.setSources($scope.places);
                    travelOptions.setTargets($scope.apartments);
                    travelOptions.setTravelTimes($scope.travelTimeControl.getValues());
                    travelOptions.setTravelType('transit'); // TODO make this configurable
                    travelOptions.setMaxRoutingTime($scope.search.intersection == 'average' ? $scope.places.length * $scope.travelTimeControl.getMaxValue() : $scope.travelTimeControl.getMaxValue());
                    travelOptions.setIntersectionMode($scope.search.intersection);
                    travelOptions.setDate($scope.getDate());
                    travelOptions.setTime($scope.getTime());

                    // call the time service to get the travel times
                    r360.TimeService.getRouteTime(travelOptions, function(sources){

                        // each source has the same number of targets and in the same order
                        _.each(_.range(0, sources[0].targets.length), function(targetIndex){

                            // find the apartment and calculate the average travel time for all input places
                            var apartment = _.find($scope.apartments, function(apartment){ return apartment.id == sources[0].targets[targetIndex].id ; });
                            $scope.setAverageTravelTime(sources, apartment, targetIndex);
                            
                            // create a marker which represents good or bad reachability
                            var apartmentMarker = $scope.createApartmentMarker(apartment, travelOptions);

                            // show the info window on mouseover and click
                            apartmentMarker.on('click',     $scope.clickMarker(apartmentMarker, apartment, travelOptions));
                            apartmentMarker.on('mouseover', $scope.hoverMarker(apartmentMarker, apartment, travelOptions));
                        });
                    });
                });
            }
        };

        $scope.paintTravelTimePolygons = function(travelOptions) {

            if ( $scope.updatePolygons ) {

                // only clear layer if we get new ones
                $scope.polygonLayer.clearLayers();

                // call the service
                r360.PolygonService.getTravelTimePolygons(travelOptions, function(polygons){

                    $scope.polygonLayer.addLayer(polygons);

                    // no polygons were found, intersection did not return anything
                    if ( $scope.polygonLayer.getBoundingBox().equals(L.latLngBounds(L.latLng(-90, -180), L.latLng(90, 180))) ) {

                        var error = noty({text: 'Es gibt keine Gebiete die in der angegebene Reisezeit von allen Orten aus erreichbar sind.', layout : $config.notyLayout, type : 'error' });
                        noty({
                          text: 'Möchtest du die Reisezeit erhöhen?',
                          layout : $config.notyLayout, 
                          buttons: [ 
                            { addClass: 'btn btn-primary', text: 'Ja', onClick: function($noty) {

                                $scope.travelTimeControl.setValue('30');
                                $scope.showApartments();
                                $noty.close();
                                error.close();
                            }},
                            { addClass: 'btn btn-danger', text: 'Nein', onClick: function($noty) {
                                $noty.close();
                                error.close();
                            }}
                          ]
                        });

                        $scope.map.fitBounds($scope.placesLayer.getBounds());
                    }
                    else {

                        $scope.map.fitBounds($scope.polygonLayer.getBoundingBox());
                    }
                });
            }
        };

        /**
         * [getApartments description]
         * @param  {Function} callback [description]
         * @return {[type]}            [description]
         */
        $scope.getApartments = function(callback) {

            $http.jsonp($config.serviceUrl + 'apartments/all?' + $.param($scope.search))
                .success(function(results){

                    var apartments = [];
                    // we dont want to show the hidden apartments on the map
                    _.each(results, function(apartment){
                        if ( !_.contains($cookieStore.get($scope.cookieKeys.hidden), apartment.id) )
                            apartments.push(apartment);
                    });

                    callback(apartments);
                });
        }

        /**
         * [createApartmentMarker description]
         * @param  {[type]} apartment     [description]
         * @param  {[type]} travelOptions [description]
         * @return {[type]}               [description]
         */
        $scope.createApartmentMarker = function(apartment, travelOptions){

            var apartmentMarker, icon;

            // the travel time to these apartment is shorter then the maximum travel width
            // all other apartment will remain with the circle marker
            if ( apartment.averageTravelTime != undefined && apartment.averageTravelTime <= travelOptions.getMaxRoutingTime() ) {

                // only a rule of three
                // 1) calculate the distance
                var frame = $config.markerMaxPercent - $config.markerMinPercent;

                // 2) how much percent of the frame equal one second
                var percentPerSecond = frame / travelOptions.getMaxRoutingTime();

                // 3) scale factor for the marker
                var scale = $config.markerMinPercent + (travelOptions.getMaxRoutingTime() - apartment.averageTravelTime) * percentPerSecond;

                icon                 = $scope.buildIcon(apartment, Math.max(scale, $config.markerMinPercent)); // lower bound
                apartmentMarker      = L.marker([apartment.lat, apartment.lon], { icon : icon } );
                apartmentMarker.icon = icon;
            }
            else {

                apartment.averageTravelTime = 10000000;
                icon                 = $scope.buildIcon(apartment, $config.markerMinPercent - .2);
                apartmentMarker      = L.marker([apartment.lat, apartment.lon], { icon : icon });
                apartmentMarker.icon = icon;
            }

            // add the apartment to the map
            apartmentMarker.addTo($scope.apartmentLayer);
            apartmentMarker.id  = apartment.id;
            apartmentMarker.lat = apartment.lat;
            apartmentMarker.lon = apartment.lon;

            return apartmentMarker;   
        }

        /**
         * [setAverageTravelTime description]
         * @param {[type]} sources     [description]
         * @param {[type]} apartment   [description]
         * @param {[type]} targetIndex [description]
         */
        $scope.setAverageTravelTime = function(sources, apartment, targetIndex){

            var travelTime = 0;
            var travelTimes = [];
            _.each(sources, function(source) { 
                // get the travel time for this target for every source
                var tt = source.targets[targetIndex].travelTime;

                // if ( tt != -1 ) console.log(apartment.id + ': ' + tt);

                travelTime += tt == -1 ? undefined : tt;
                travelTimes.push({id: targetIndex, travelTime : tt});
            });
            apartment.averageTravelTime = travelTime / travelTimes.length;
        };

        /**
         * [buildIcon description]
         * @param  {[type]} apartment [description]
         * @param  {[type]} scale     [description]
         * @return {[type]}           [description]
         */
        $scope.buildIcon = function(apartment, scale) {

            var iconUrl   = 'images/marker/marker-icon-red.png';
            if (_.contains($cookieStore.get($scope.cookieKeys.visited), apartment.id) ) 
                iconUrl = 'images/marker/marker-icon-grey.png';

            var iconSize  = { width : 25, height : 41 };

            // create the icon with the calculated scaled width and height
            return L.icon({ 
                iconUrl:        iconUrl, 
                shadowUrl:      'images/marker/marker-shadow.png',
                iconAnchor:     [iconSize.width * scale,   iconSize.height * scale], 
                shadowAnchor:   [iconSize.width * scale,   iconSize.height * scale], 
                iconSize:       [iconSize.width * scale,   iconSize.height * scale],
                shadowSize:     [iconSize.height * scale,  iconSize.height * scale],
                popupAnchor:    [-15,  - iconSize.height * scale + 5]});
        };

        /**
         * [hoverMarker description]
         * @param  {[type]} apartmentMarker [description]
         * @param  {[type]} apartment       [description]
         * @param  {[type]} travelOptions   [description]
         * @return {[type]}                 [description]
         */
        $scope.hoverMarker = function(apartmentMarker, apartment, travelOptions){

            return function(){

                // define source and target
                travelOptions.setSources([apartmentMarker]);
                travelOptions.setTargets($scope.places);

                // remove old routes
                $scope.routesLayer.clearLayers();

                // query the server
                r360.RouteService.getRoutes(travelOptions, function(routes){

                    // one route for each source and target combination
                    _.each(routes, function(route, index){

                        route.icon = L.Icon.Default.imagePath + 'marker-icon-' + $scope.markerColors[index] + '.png';

                        $scope.paintPolylines(route, $scope.markerColors[index]);
                    });
                });
            };
        }

        /**
         * [clickMarker description]
         * @param  {[type]} apartmentMarker [description]
         * @param  {[type]} apartment       [description]
         * @param  {[type]} travelOptions   [description]
         * @return {[type]}                 [description]
         */
        $scope.clickMarker = function(apartmentMarker, apartment, travelOptions){

            return function() {

                // mark the apartment as visited
                var cookie = $cookieStore.get($scope.cookieKeys.visited);
                if (!_.contains(cookie, apartmentMarker.id)) cookie.push(apartmentMarker.id);
                $cookieStore.put($scope.cookieKeys.visited, cookie);

                // get the apartment details from the server
                ApartmentFactory.getApartment(apartmentMarker.id, function (apartment) { 

                    $scope.changeapartmentMarkerColor(apartmentMarker, apartment, travelOptions);

                    $scope.apartment = apartment;
                    $scope.routesLayer.clearLayers();
                    $('#apartment-details').show();

                    // display the liked button
                    if ( _.contains($cookieStore.get($scope.cookieKeys.liked), $scope.apartment.id) ) $scope.apartment.liked = true;

                    // define source and target
                    travelOptions.setSources([apartmentMarker]);
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
         * [changeapartmentMarkerColor description]
         * @param  {[type]} apartmentMarker [description]
         * @param  {[type]} apartment       [description]
         * @param  {[type]} travelOptions   [description]
         * @return {[type]}                 [description]
         */
        $scope.changeapartmentMarkerColor = function(apartmentMarker, apartment, travelOptions){

            apartmentMarker.icon.options.iconUrl = L.Icon.Default.imagePath + 'marker-icon-grey.png';;
            apartmentMarker.setIcon(apartmentMarker.icon);
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

            $scope.likeCookie = $cookieStore.get($scope.cookieKeys.liked);
            // not liked yet, so go like it
            if ( !_.contains($scope.likeCookie, id) ) {

                $scope.apartment.liked = true;
                $scope.likeCookie.push(id);
            }
            // remove liking
            else {

                $scope.likeCookie = _.without($scope.likeCookie, id);
                $scope.apartment.liked = false;
            }
            // store add or delete in same cookie
            $cookieStore.put($scope.cookieKeys.liked, $scope.likeCookie);
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
         * [addAutoComplete description]
         *
         *
         * 
         */
        $scope.addAutoComplete = function(){

            // create a autocomplete
            var autoComplete = r360.placeAutoCompleteControl({ 
                country     : "Deutschland", 
                placeholder : 'Select start!', 
                reset       : true,
                reverse     : false,
                image       : L.Icon.Default.imagePath + 'marker-icon-' + $scope.markerColors[$scope.autoCompletes.length] + '.png',
                options     : { car : true, bike : true, walk : true, transit : true, init : 'transit' }
            });
            autoComplete.index = $scope.autoCompletes.length;

            var reset = function(){

                if ( autoComplete.getFieldValue() != '' ) {

                    autoComplete.reset();
                    $('#apartment-details').hide();
                    // redraw view
                    $scope.showApartments();
                }
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
        

        var timeoutPromise;
        $scope.$watch("search", function(newValue, oldValue) { 

            // first run on page load
            if ( newValue === oldValue ) return;

            $timeout.cancel(timeoutPromise);  //does nothing, if timeout alrdy done
            timeoutPromise = $timeout(function(){   //Set timeout

                $scope.priceError = false, $scope.areaError = false, $scope.roomsError = false;

                // check if lower is higher than upper
                if ( $scope.search.minPrice > $scope.search.maxPrice ) $scope.priceError = true;
                if ( $scope.search.minArea  > $scope.search.maxArea )  $scope.areaError  = true;
                if ( $scope.search.minRooms > $scope.search.maxRooms ) $scope.roomsError = true;

                // somebody has change the default date and time
                if ( oldValue.date.getTime() != newValue.date.getTime() || oldValue.time.getTime() != newValue.time.getTime() ) 
                    $scope.dateChange = true;

                // polygon intersection method changed or travel times changed
                if ( oldValue.intersection != newValue.intersection || oldValue.date.getTime() != newValue.date.getTime() || oldValue.time.getTime() != newValue.time.getTime() )
                    $scope.updatePolygons = true;
                else $scope.updatePolygons = false;

                // no errors -> show apartments
                if ( !$scope.roomsError && !$scope.areaError && !$scope.priceError )
                    $scope.showApartments();
                
            }, 2000);
        }, true);

        // make the expose closeable
        $('#close-expose').click(function(){ $('#apartment-details').hide(); });

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
        
        
        $scope.autoCompletes[1].setFieldValue("Invalidenstraße, Berlin");
        $scope.autoCompletes[1].setValue({
            firstRow    : "Invalidenstraße, Berlin",
            getLatLng   : function (){ return this.latlng; },
            id          : "52.52795313.374074",
            label       : "Invalidenstraße, Berlin",
            latlng      : L.latLng(52.527953, 13.374074),
            secondRow   : "Invalidenstraße 10557 Berlin",
            term        : "Invalidenstraße",
            value       : "Invalidenstraße, Berlin"
        });

        $scope.showApartments();
        $scope.autoCompletes[0].marker.bindPopup('<p>Verschiebe den Marker für<br/> präzisere Auskünfte!</p>').openPopup();

        $('#apartment-details').css('max-height',  ($('#map-apartment').height() -  (53 * $scope.autoCompletes.length) - 20) + 'px');
    });