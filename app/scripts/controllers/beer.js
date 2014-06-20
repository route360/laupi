'use strict';

/**
 * @ngdoc function
 * @name route360DemoApp.controller:BeerCtrl
 * @description
 * # BeerCtrl
 * Controller of the route360DemoApp
 */
angular.module('route360DemoApp')
    .controller('BeerCtrl', function ($scope, PubService, $translate) {

        // add the map and set the initial center to berlin
        var map = L.map('map-beer', {zoomControl : false}).setView([52.516389, 13.377778], 13);
        // attribution to give credit to OSM map data and VBB for public transportation 
        var attribution ="<a href='https://www.mapbox.com/about/maps/' target='_blank'>© Mapbox © OpenStreetMap</a> | ÖPNV Daten © <a href='http://www.vbb.de/de/index.html' target='_blank'>VBB</a> | developed by <a href='http://www.route360.net/de/' target='_blank'>Route360°</a>";

         // initialising the base map. To change the base map just change following lines as described by cloudmade, mapbox etc..
        L.tileLayer('http://a.tiles.mapbox.com/v3/mi.idl0m80i/{z}/{x}/{y}.png', {
            maxZoom: 18,
            attribution: attribution
        }).addTo(map);

        // create a marker and but dont add it to the map yet
        var sourceMarker;

        // add a layer in which we will paint the route
        var pubLayer = L.featureGroup().addTo(map);

        // create the layer to add the polygons
        var cpl = r360.route360PolygonLayer();
        // add it to the map
        map.addLayer(cpl);

        $scope.pubs = PubService.getPubs();

        // create an auto complete control and set it to return only german cities, streets etc. 
        var placeAutoComplete = r360.placeAutoCompleteControl({country : "Deutschland", placeholder : $translate.instant('WHERE_ARE_YOU') });
        map.addControl(placeAutoComplete);
        map.addControl(L.control.zoom({ position : 'topright' }));

        // define what happens if someone clicks an item in the autocomplete
        placeAutoComplete.onSelect(function(item){

            // if the source marker is on the map already, move it to the new position
            if ( map.hasLayer(sourceMarker) ) sourceMarker.setLatLng(item.latlng);
            // otherwise add it
            else sourceMarker = L.marker(item.latlng).addTo(map);
            
            // you need to define some options for the polygon service
            // for more travel options check out the other tutorials
            var travelOptions = r360.travelOptions();
            // we only have one source which is the marker we just added
            travelOptions.addSource(sourceMarker);
            // add all the museums to the options
            travelOptions.setTargets($scope.pubs);
            // set the travel type to transit
            travelOptions.setTravelType('transit');
            // set 
            travelOptions.setTravelTimes([300, 600, 900, 1200]);
            // for all museums which are not reachable within <maxRoutingTime>
            // no routing time will be returned 
            travelOptions.setMaxRoutingTime(1200);

            // call the service
            r360.PolygonService.getTravelTimePolygons(travelOptions, function(polygons){
                
                // in case there are already polygons on the map/layer
                cpl.clearLayers();

                // add the returned polygons to the polygon layer 
                cpl.addLayer(polygons);
                
                // zoom the map to fit the polygons perfectly
                map.fitBounds(cpl.getBoundingBox());
            });

            // call the service
            r360.TimeService.getRouteTime(travelOptions, function(sources){

                // get each target for the first source (only one source was supplied to the service)
                _.each(sources[0].targets, function(target){

                    // find the pubs in our "database"
                    var pub = _.find($scope.pubs, function(pub){ return pub.id == target.id ; });
                    // set the travel time for this pub
                    pub.travelTime = target.travelTime;

                    // the default marker is a plain circle marker
                    var poiSymbol = L.circleMarker([pub.lat, pub.lon], 
                        { color: "white", fillColor: 'red', fillOpacity: 1.0, stroke : true, radius : 5 });

                    // the travel time to these museums is shorter then the maximum travel width
                    // all other pub will remain with the circle marker
                    if ( pub.travelTime > 0 && pub.travelTime <= travelOptions.getMaxRoutingTime() ) {

                        // only a rule of three

                        // 1) set min und max percent of the marker
                        var maxPercent = 1.8;
                        var minPercent = 0.7;

                        // 2) calculate the distance
                        var frame = maxPercent - minPercent;

                        // 3) get maximum travel time
                        var maxTravelTime = travelOptions.maxRoutingTime;

                        // 4) how much percent of the frame equal one second
                        var percentPerSecond = frame / maxTravelTime;

                        // 5) scale factor for the marker
                        var scale = minPercent + (maxTravelTime - pub.travelTime) * percentPerSecond;

                        // lower bound
                        if ( scale < minPercent ) scale = minPercent;

                        // create the icon with the calculated scaled width and height
                        var iconSize = { width : 25, height : 41 };
                        var poiSymbol = L.marker([pub.lat, pub.lon], {icon : L.icon({ 
                            iconUrl :       "images/marker/marker-icon-red-2x.png", 
                            shadowUrl:      "images/marker/marker-shadow.png", 
                            iconAnchor:     [iconSize.width * scale,   iconSize.height * scale], 
                            shadowAnchor:   [iconSize.width * scale,   iconSize.height * scale], 
                            iconSize:       [iconSize.width * scale,   iconSize.height * scale],
                            shadowSize:     [iconSize.height * scale,  iconSize.height * scale],
                            popupAnchor:    [-15,  - iconSize.height * scale + 5]})});
                    }

                    // add the pub to the map, and add a popup
                    poiSymbol.bindPopup(
                        "<h2><a href='"+pub.url+"'>" + pub.name + "</a></h2>\
                        <p>" + r360.config.i18n.get('travelTime') + ": " + 
                        r360.Util.secondsToHoursAndMinutes(pub.travelTime) + "</p>");
                    poiSymbol.addTo(map);
                });

                map.setView(sourceMarker.getLatLng(), 15);
                $scope.$apply();
            });
        });
    });
