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
        // INVALID .... 21. PLZ only uncool -> tritt nur selten auf
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
        // DONE ....... 11a. Translations
        // DONE ....... Browserkompatibilität
        // NOT STARTED. 18. Bilder und ERklärungstexte für Verschneidung
        // DONE ....... 22. beim löschen von marker checken ob zwei leer sind und dann einen löschen
        // DONE........ 23. marker farben korrigieren
        // DONE ....... 26. selektierter marker andere farbe
        // DONE ....... 33. Optionsslide out für place autocomplete
        // DONE ....... 14. Cache aufwärmen
        // DONE ....... weißer rand um navbar
        // DONE ....... 'ausgangspunkt' für autocomplete
        // DONE ....... bitte warten balken
        // DONE ....... routen umdrehen 
        // DONE ....... timout für date und time setzen  
        // DONE ....... map-icons css marker für routen
        // DONE ....... label für halte stelle vertikal zentrieren
        // NOT STARTED. hinweis für neue reisezeiten, übersetzung
        // kein scrollrad zoom
        // start marker shadwo
        // route colors fur not_reachable
        $scope.places           = [];
        $scope.autoCompletes    = [];
        $scope.updatePolygons   = true;
        // $scope.markerColorsHex  = [ '#338433', '#BC5A1D', '#4F2474', '#226CBE', '#B71632', '#656565' ];
        // $scope.markerColors     = [ 'green', 'orange', 'purple', 'blue', 'red', 'grey' ];
        $scope.markerColorsHex  = [ '#338433', '#BC5A1D', '#B71632', '#226CBE', '#4F2474', '#656565' ];
        $scope.markerColors     = [ 'green', 'orange', 'red', 'blue', 'purple', 'grey' ];

        // cookie stuff
        $scope.cookieKeys       = { visited : 'clickedApartments', hidden : 'hiddenApartments', liked : 'likedApartments' };
        // remove this for production
        if ( !$config.isProduction ) $cookieStore.remove($scope.cookieKeys.visited);
        if ( !$config.isProduction ) $cookieStore.remove($scope.cookieKeys.hidden);
        if ( !$config.isProduction ) $cookieStore.remove($scope.cookieKeys.liked);
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
                    if ( !$scope.$$phase ) $scope.$apply();
                });    
            }
            else $scope.likedTableParams = TableParamFactory.create([]);    
        });
        // modal stuff end

        $scope.hideHelp = true;
        $scope.status   = { isFirstOpen: true, oneAtATime : true };

        // default search parameters
        $scope.search = { 
            apartment : {
                minPrice : 300, maxPrice : 800, 
                minArea : 70, maxArea : 80, 
                minRooms : 3, maxRooms : 3, 
                kitchen : false, garden : false, courtage : false, balcony : true,
                callback : 'JSON_CALLBACK'
            },
            r360 : {

                instant : {

                    intersection : 'average',    
                    travelTime : 20
                },
                timeout : {

                    time : new Date(),
                    date : new Date()
                }
            }
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
        $scope.map = L.map('map-apartment', {zoomControl : false, scrollWheelZoom : true }).setView([52.516389, 13.377778], 13);
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
            label       : $translate.instant('TRAVELTIME') + ': ', // the label, customize for i18n
            initValue   : $scope.search.r360.instant.travelTime // the inital value has to match a time from travelTimes, e.g.: 40m == 2400s
        });

        // add the newly created control to the map
        $scope.map.addControl($scope.travelTimeControl);
        L.control.zoom({position : 'topright'}).addTo($scope.map);
        $scope.waitControl = r360.waitControl({ position : 'bottomright' });
        $scope.map.addControl($scope.waitControl);
        $scope.travelTimeControl.onSlideStop(function() { $scope.search.r360.instant.travelTime = $scope.travelTimeControl.getMaxValue(); $scope.$apply(); });

        // create and add the layers to the map
        $scope.apartmentLayer  = L.featureGroup().addTo($scope.map);
        $scope.placesLayer     = L.featureGroup().addTo($scope.map);
        $scope.routesLayer     = L.featureGroup().addTo($scope.map);
        $scope.currentMarker   = L.featureGroup().addTo($scope.map);
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
                    item.lat        = item.latlng.lat;
                    item.lon        = item.latlng.lng;
                    item.id         = item.lat + ';' + item.lon;
                    item.travelType = autoComplete.getTravelType();
                    $scope.places.push(item);

                    var icon = L.icon({ 
                        iconSize     : [25, 41], 
                        iconUrl      : L.Icon.Default.imagePath + 'marker-icon-' + $scope.markerColors[index] + '.png', 
                        iconAnchor   : [12, 41],
                        shadowUrl    : L.Icon.Default.imagePath + 'marker-shadow.png'
                    });
                    var marker = L.marker(item.latlng, {icon : icon, draggable : true }).addTo($scope.placesLayer);

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

        $scope.resize = function(){

            var height = $('.leaflet-top.leaflet-left').height();

            $('#apartment-details').animate({
                top: ((height) + 10) + 'px',
            }, 250, function() {
                $('#apartment-details').css('max-height',  ($('#map-apartment').height() -  (height) - 20) + 'px');    // Animation complete.
            });
        };

        /**
         * [getDate description]
         * @return {[type]} [description]
         */
        $scope.getDate = function(){

            var month = ($scope.search.r360.timeout.date.getMonth() + 1) < 10 ? "0" + ($scope.search.r360.timeout.date.getMonth() + 1) : ($scope.search.r360.timeout.date.getMonth() + 1); 
            var date  = $scope.search.r360.timeout.date.getDate() < 10        ? "0" + $scope.search.r360.timeout.date.getDate()        : $scope.search.r360.timeout.date.getDate(); 
            var year  = $scope.search.r360.timeout.date.getFullYear()
            
            return year + '' + month + '' + date;
        };

        /**
         * [getTime description]
         * @return {[type]} [description]
         */
        $scope.getTime = function(){

            return (($scope.search.r360.timeout.time.getHours() * 3600) + $scope.search.r360.timeout.time.getMinutes() * 60);
        };

        /**
         * [showApartments description]
         * @return {[type]} [description]
         */
        $scope.showApartments = function(){

            $scope.waitControl.show();
            $scope.apartmentLayer.clearLayers();   
            $scope.apartmentLayer.clearLayers();
            $scope.currentMarker.clearLayers();
            $scope.routesLayer.clearLayers();
            $('#apartment-details').hide();
            $scope.getPlaces();
            $scope.noApartmentsInTravelTimeFound = true;

            var travelOptions = r360.travelOptions();

            if ( $scope.places.length > 0 ) {

                travelOptions.setSources($scope.places);
                travelOptions.setTravelTimes($scope.travelTimeControl.getValues());
                travelOptions.setMaxRoutingTime(_.max($scope.travelTimeControl.getValues()));
                travelOptions.setIntersectionMode($scope.search.r360.instant.intersection);
                travelOptions.setDate($scope.getDate());
                travelOptions.setTime($scope.getTime());

                $scope.paintTravelTimePolygons(travelOptions);

                $scope.getApartments(function(apartments){

                    // get the apartments 
                    $scope.apartments  = apartments; 
                    // and update the result list modal view
                    $scope.tableParams = TableParamFactory.create($scope.apartments);
                    // do not query server if no apartments found
                    if ( apartments.length == 0 ) {

                        $scope.waitControl.hide();
                        var error = noty({text: $translate.instant('NO_APARTMENTS_FOUND'), layout : $config.notyLayout, type : 'error' });
                        return;
                    }
                    
                    // service configuration
                    var travelOptions = r360.travelOptions();
                    travelOptions.setSources($scope.places);
                    travelOptions.setTargets($scope.apartments);
                    travelOptions.setTravelTimes($scope.travelTimeControl.getValues());
                    travelOptions.setMaxRoutingTime($scope.search.r360.instant.intersection == 'average' ? $scope.places.length * $scope.travelTimeControl.getMaxValue() : $scope.travelTimeControl.getMaxValue());
                    travelOptions.setIntersectionMode($scope.search.r360.instant.intersection);
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

                        $scope.waitControl.hide();

                        if ($scope.noApartmentsInTravelTimeFound && 
                            !$scope.polygonLayer.getBoundingBox().equals(L.latLngBounds(L.latLng(-90, -180), L.latLng(90, 180))) ) {

                            var error = noty({text: $translate.instant('NO_APARTMENTS_IN_REACHABLE_AREA'), layout : $config.notyLayout, type : 'error' });
                            $scope.showIncreaseTravelTimeQuestion(error);
                            $scope.map.fitBounds($scope.placesLayer.getBounds());
                        }
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

                        var error = noty({text: $translate.instant('NO_AREA_WITHIN_TRAVELTIME'), layout : $config.notyLayout, type : 'error' });
                        $scope.showIncreaseTravelTimeQuestion(error);
                        $scope.map.fitBounds($scope.placesLayer.getBounds());
                    }
                    else {

                        $scope.map.fitBounds($scope.polygonLayer.getBoundingBox());
                    }
                });
            }
        };

        $scope.showIncreaseTravelTimeQuestion = function(error){

            if ( $scope.travelTimeControl.getMaxValue() / 60 < 60 ) {

                noty({
                    text: $translate.instant('INCREASE_TRAVELTIME'),
                    layout : $config.notyLayout, 
                    buttons: [ 
                        { addClass: 'btn btn-primary', text:  $translate.instant('YES'), onClick: function($noty) {

                            $scope.travelTimeControl.setValue(Math.min($scope.travelTimeControl.getMaxValue() / 60 + 10, 60));
                            $scope.showApartments();
                            $noty.close();
                            error.close();
                        }},
                        { addClass: 'btn btn-danger', text:  $translate.instant('NO'), onClick: function($noty) {
                            $noty.close();
                            error.close();
                    }}]
                });
            }
        };

        /**
         * [getApartments description]
         * @param  {Function} callback [description]
         * @return {[type]}            [description]
         */
        $scope.getApartments = function(callback) {

            $http.jsonp($config.serviceUrl + 'apartments/all?' + $.param($scope.search.apartment))
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
            var travelTime = $scope.search.r360.instant.intersection == 'average' ? travelOptions.getMaxRoutingTime() / $scope.places.length : $scope.travelTimeControl.getMaxValue();

            // the travel time to these apartment is shorter then the maximum travel width
            // all other apartment will remain with the circle marker
            if ( apartment.averageTravelTime != undefined && apartment.averageTravelTime <= travelTime ) {

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

                $scope.noApartmentsInTravelTimeFound = false;
            }
            else {

                apartment.averageTravelTime = 10000000;
                icon                 = $scope.buildIcon(apartment, $config.markerMinPercent - .2);
                apartmentMarker      = L.marker([apartment.lat, apartment.lon], { icon : icon });
                apartmentMarker.icon = icon;
            }

            // add the apartment to the map
            apartmentMarker.id  = apartment.id;
            apartmentMarker.lat = apartment.lat;
            apartmentMarker.lon = apartment.lon;
            apartmentMarker.addTo($scope.apartmentLayer);

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

            var iconUrl   = 'images/marker/pin-purple.png';
            if (_.contains($cookieStore.get($scope.cookieKeys.visited), apartment.id) ) 
                iconUrl = 'images/marker/pin-grey.png';

            var iconSize    = { width : 48 * scale, height : 48 * scale };
            // var shadowSize  = { width : 41 * scale, height : 41 * scale };

            // create the icon with the calculated scaled width and height
            return L.icon({ 
                iconUrl:        iconUrl, 
                iconAnchor:     [iconSize.width / 2,   iconSize.height], 
                iconSize:       [iconSize.width,   iconSize.height],

                // shadowUrl:      'images/marker/marker-shadow.png',
                // shadowAnchor:   [shadowSize.width / 3,   shadowSize.height], 
                // shadowSize:     [shadowSize.width,       shadowSize.height]
                // popupAnchor:    [-15,  - iconSize.height * scale + 5]
            });
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

                // $scope.currentMarker.clearLayers();

                // define source and target
                travelOptions.setSources($scope.places);
                travelOptions.setTargets([apartmentMarker]);

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

                // $scope.paintCircleMarker(apartment.lat, apartment.lon);
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

                $scope.currentMarker.clearLayers();

                // mark the apartment as visited
                var cookie = $cookieStore.get($scope.cookieKeys.visited);
                if (!_.contains(cookie, apartmentMarker.id)) cookie.push(apartmentMarker.id);
                $cookieStore.put($scope.cookieKeys.visited, cookie);

                // get the apartment details from the server
                ApartmentFactory.getApartment(apartmentMarker.id, function (apartment) { 

                    $scope.changeapartmentMarkerColor(apartmentMarker, apartment, travelOptions);

                    $scope.apartment = apartment;
                    $scope.routesLayer.clearLayers();
                    $scope.resize();
                    $('#apartment-details').show();

                    // display the liked button
                    if ( _.contains($cookieStore.get($scope.cookieKeys.liked), $scope.apartment.id) ) $scope.apartment.liked = true;

                    // define source and target
                    travelOptions.setSources($scope.places);
                    travelOptions.setTargets([apartmentMarker]);

                    // query the server
                    r360.RouteService.getRoutes(travelOptions, function(routes){

                        $scope.apartment.averageTravelTime = _.reduce(routes, function(sum, route){ return route.getTravelTime() + sum; }, 0) / routes.length;
                        $scope.apartment.routes = routes;

                        // one route for each source and target combination
                        _.each(routes, function(route, index){

                            route.icon = L.Icon.Default.imagePath + 'marker-icon-' + $scope.markerColors[index] + '.png';
                            route.end  = $scope.places[index].firstRow;
                            // $scope.$apply(); // update view because of out of angular call

                            $scope.paintPolylines(route, $scope.markerColors[index]);
                        });
                    });

                    $scope.paintCircleMarker(apartment.lat, apartment.lon);
                });
            };
        }

        $scope.paintCircleMarker = function(lat, lon){

            L.circleMarker([lat, lon], { color: 'white', 
                fillColor: 'white', fillOpacity: 1.0, stroke : true, radius : 13, weight : 4 }).addTo($scope.currentMarker);
            L.circleMarker([lat, lon], { color: '#B9223E', 
                fillColor: 'white', fillOpacity: 1.0, stroke : true, radius : 10, weight : 5 }).addTo($scope.currentMarker);
        }

        /**
         * [changeapartmentMarkerColor description]
         * @param  {[type]} apartmentMarker [description]
         * @param  {[type]} apartment       [description]
         * @param  {[type]} travelOptions   [description]
         * @return {[type]}                 [description]
         */
        $scope.changeapartmentMarkerColor = function(apartmentMarker, apartment, travelOptions){

            apartmentMarker.icon.options.iconUrl = L.Icon.Default.imagePath + 'pin-grey.png';;
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
                    $scope.currentMarker.clearLayers();
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

                    var transfer = L.circleMarker(_.last(route.getSegments()[index - 1].getPoints()), { color: "white", 
                        fillColor: color, fillOpacity: 1.0, stroke : true, radius : 7 }).addTo($scope.routesLayer);

                    transfer.bindPopup(route.getSegments()[index - 1].getStartName());

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
                placeholder : $translate.instant('SELECT_START'), 
                reset       : true,
                reverse     : false,
                image       : L.Icon.Default.imagePath + 'marker-icon-' + $scope.markerColors[$scope.autoCompletes.length] + '.png',
                options     : { car : true, bike : true, walk : true, transit : true, init : 'transit' }
            });
            autoComplete.index = $scope.autoCompletes.length;

            var reset = function(){

                if ( autoComplete.getFieldValue() != '' ) {

                    autoComplete.reset();

                    if ( $scope.autoCompletes.length == 3 && $scope.autoCompletes[1].getFieldValue() == '' && $scope.autoCompletes[2].getFieldValue() == '' ) {

                        $scope.map.removeControl($scope.autoCompletes[2]);
                        $scope.autoCompletes.splice(2, 1);
                    }

                    if ( $scope.autoCompletes.length == 2 && $scope.autoCompletes[0].getFieldValue() == '' && $scope.autoCompletes[1].getFieldValue() == '' ) {

                        $scope.map.removeControl($scope.autoCompletes[1]);
                        $scope.autoCompletes.splice(1, 1);
                    }
                    
                    $scope.polygonLayer.clearLayers();
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
            };

            var onTravelTypeChange = function(){

                // we have to wait since this is the time it takes for the slide-in to slide in
                $timeout(function(){ $scope.resize(); }, 320);
                $scope.showApartments();
            };

            // define what is happing on select
            autoComplete.onSelect(select);
            autoComplete.onReset(reset);
            autoComplete.onTravelTypeChange(onTravelTypeChange);

            $scope.autoCompletes.push(autoComplete);
            $scope.map.addControl(autoComplete);

            $scope.resize();
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
        $scope.$watch("search.apartment", function(newValue, oldValue) { 

            // first run on page load
            if ( newValue === oldValue ) return;

            $timeout.cancel(timeoutPromise);  //does nothing, if timeout alrdy done
            timeoutPromise = $timeout(function(){   //Set timeout

                $scope.priceError = false, $scope.areaError = false, $scope.roomsError = false;

                // check if lower is higher than upper
                if ( $scope.search.apartment.minPrice > $scope.search.apartment.maxPrice ) $scope.priceError = true;
                if ( $scope.search.apartment.minArea  > $scope.search.apartment.maxArea )  $scope.areaError  = true;
                if ( $scope.search.apartment.minRooms > $scope.search.apartment.maxRooms ) $scope.roomsError = true;

                // no errors -> show apartments
                if ( !$scope.roomsError && !$scope.areaError && !$scope.priceError )
                    $scope.showApartments();
                
            }, 2000);
        }, true);

        var timeoutPromiseR360;
        $scope.$watch("search.r360.timeout", function(newValue, oldValue) { 

            // first run on page load
            if ( newValue === oldValue ) return;

            $timeout.cancel(timeoutPromiseR360);  //does nothing, if timeout alrdy done
            timeoutPromiseR360 = $timeout(function(){   //Set timeout

                // somebody has change the default date and time
                if ( oldValue.date.getTime() != newValue.date.getTime() || oldValue.time.getTime() != newValue.time.getTime() ) 
                    $scope.dateChange = true;

                $scope.showApartments();
            }, 2000);
        }, true);

        $scope.$watch("search.r360.instant", function(newValue, oldValue) { 

            // first run on page load
            if ( newValue === oldValue ) return;

            // polygon intersection method changed or travel times changed
            if ( oldValue.intersection   != newValue.intersection || oldValue.travelTime     != newValue.travelTime )
                $scope.updatePolygons = true;
            else 
                $scope.updatePolygons = false;

            $scope.showApartments();
        }, true);

        /**
         * [translateR360 description]
         * @param  {[type]} language [description]
         * @return {[type]}          [description]
         */
        $scope.translateR360 = function(language){

            if ( language == 'de' ) {

                $('span[lang="en"]').hide();
                $('span[lang="de"]').show();
                r360.config.i18n.language = 'de';
                $('.r360-autocomplete').attr('placeholder', $translate.instant('SELECT_START'));
            }
            else {
                
                $('span[lang="de"]').hide();
                $('span[lang="en"]').show();   
                r360.config.i18n.language = 'en';
                $('.r360-autocomplete').attr('placeholder', $translate.instant('SELECT_START'));
            }
        };


        // make the expose closeable
        $('#close-expose').click(function(){ $('#apartment-details').hide(); });
        // recalculate the size of the apartment details after some one selects a travel type
        $('.travel-type-buttons').click(function(){ $timeout(function(){ $scope.resize(); }, 320); });
        // window is resized
        $scope.map.on('resize', function(){ $scope.resize(); });

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

        $scope.showApartments();
        noty({text: $translate.instant('MOVE_MARKER'), layout : $config.notyLayout, type : 'success', timeout : 5000 });
        $timeout(function(){ noty({text: $translate.instant('MARKER_SIZE'), layout : $config.notyLayout, type : 'success', timeout : 5000 }); }, 4000);
        $timeout(function(){ noty({text: $translate.instant('POLYGON_HELP'), layout : $config.notyLayout, type : 'success', timeout : 6000 }); }, 8000);
        $scope.translateR360($translate.preferredLanguage());
        $scope.resize();
        // $('#apartment-details').css('max-height',  ($('#map-apartment').height() -  (53 * $scope.autoCompletes.length) - 20) + 'px');
    });