'use strict';

/**
 * @ngdoc function
 * @name route360DemoApp.controller:ApartmentCtrl
 * @description
 * # ApartmentCtrl
 * Controller of the route360DemoApp
 */
angular.module('route360DemoApp')
    .controller('MapCtrl', function ($window, $http, $scope, $config, ngTableParams, $timeout, TableParamFactory, PolygonService) {

        $scope.travelDate = '20150717';
        // $scope.travelDate = '20150713';
        $scope.travelTime = (3600 * 17) + '';
        // $scope.travelTime = (3600 * 11) + '';

        // das ist der startmarker
        $scope.source           = undefined;
        // verschieden farben für verschiedene marker icons 
        $scope.markerColorsHex  = [ '#338433', '#BC5A1D', '#B71632', '#226CBE', '#4F2474', '#656565' ];
        $scope.markerColors     = [ 'green', 'orange', 'red', 'blue', 'purple', 'grey' ];

        // das symbolisiert die laupi datenbank
        $scope.laupisDatabase = [{"uriident":"kleingarten-nahe-bad-doberan-8-km-bis-zur-ostsee-p-81","css-filter-class-string":"estate flaechen-gesamtflaeche-400-500 laupi-hausart-steinhaus laupi-hausflaeche-20-30 laupi-eigentumsart-teileigentum preise-kaufpreisbrutto-10000-20000","freitexte-objekttitel":"Kleingarten nahe Bad Doberan, 8 km bis zur Ostsee","anhaenge-anhang-#1-@gruppe":"BILD","anhaenge-anhang-#1-daten-pfad":"assets\/images\/c\/P-81_10_%20Kleingarten_Wochenendgrundstueck_Bad_Doberan_Laupi_Berlin-1731127c.jpg","anhaenge-anhang-#1-format":".jpg","anhaenge-anhang-#1-anhangtitel":"10__Kleingarten_Wochenendgrundstueck_Bad_Doberan_Laupi_Berlin.jpg","geo-plz":"18209","geo-ort":"Bad Doberan","flaechen-gesamtflaeche":"400.00","laupi-hausart":"Steinhaus","laupi-hausflaeche":"24.00","laupi-eigentumsart":"Teileigentum","preise-kaufpreisbrutto":"10292.00","laupi-objektart":"Kleingarten","geo-lat":"54.0900000","geo-lon":"11.9300000","geo-lat_forged":"54.0900000","geo-lon_forged":"11.9300000"},{"uriident":"wochenendgrundstueck-in-beelitz-nahe-bei-potsdam-und-berlin-p-246","css-filter-class-string":"estate flaechen-gesamtflaeche-400-500 laupi-hausart-blockbohlenhaus laupi-hausflaeche-20-30 laupi-eigentumsart-pacht preise-kaufpreisbrutto-1-10000","freitexte-objekttitel":"Wochenendgrundst\u00fcck in Beelitz, nahe bei Potsdam und Berlin","anhaenge-anhang-#1-@gruppe":null,"anhaenge-anhang-#1-daten-pfad":null,"anhaenge-anhang-#1-format":null,"anhaenge-anhang-#1-anhangtitel":null,"geo-plz":"14547","geo-ort":"Beelitz","flaechen-gesamtflaeche":"467.00","laupi-hausart":"Blockbohlenhaus","laupi-hausflaeche":"24.00","laupi-eigentumsart":"Pacht","preise-kaufpreisbrutto":"8667.00","laupi-objektart":"Wochenendgrundst\u00fcck","geo-lat":"52.2200000","geo-lon":"12.9700000","geo-lat_forged":"52.2200000","geo-lon_forged":"12.9700000"},{"uriident":"kleingarten-in-templin-in-seenreicher-umgebung-75-km-von-berlin-p-205","css-filter-class-string":"estate flaechen-gesamtflaeche-400-500 laupi-hausart-steinhaus laupi-hausflaeche-20-30 laupi-eigentumsart-pacht preise-kaufpreisbrutto-20000-30000","freitexte-objekttitel":"Kleingarten in Templin, in seenreicher Umgebung, 75 km von Berlin","anhaenge-anhang-#1-@gruppe":"BILD","anhaenge-anhang-#1-daten-pfad":"assets\/images\/2\/P-205_10_Kleingarten_Wochenendhaus_Templin_Laupi_Berlin-aff86632.jpg","anhaenge-anhang-#1-format":".jpg","anhaenge-anhang-#1-anhangtitel":"10_Kleingarten_Wochenendhaus_Templin_Laupi_Berlin.jpg","geo-plz":"","geo-ort":"Templin","flaechen-gesamtflaeche":"400.00","laupi-hausart":"Steinhaus","laupi-hausflaeche":"28.00","laupi-eigentumsart":"Pacht","preise-kaufpreisbrutto":"21666.00","laupi-objektart":"Kleingarten","geo-lat":"53.1200000","geo-lon":"13.5000000","geo-lat_forged":"53.1200000","geo-lon_forged":"13.5000000"},{"uriident":"wochendendhaus-am-schervenzsee-im-schlaubetal-nicht-weit-bis-frankfurtioder-p-244","css-filter-class-string":"estate flaechen-gesamtflaeche-200-300 laupi-hausart-ddr-bungalow laupi-hausflaeche-30-40 laupi-eigentumsart-pacht preise-kaufpreisbrutto-1-10000","freitexte-objekttitel":"Wochendendhaus am Schervenzsee im Schlaubetal, nicht weit bis Frankfurt\/IOder","anhaenge-anhang-#1-@gruppe":"BILD","anhaenge-anhang-#1-daten-pfad":"","anhaenge-anhang-#1-format":".jpg","anhaenge-anhang-#1-anhangtitel":"10_Wochenendgrundst\u00c3\u00bcck_Schervenzsee_Laupi_Berlin.jpg","geo-plz":"15890","geo-ort":"Schernsdorf","flaechen-gesamtflaeche":"250.00","laupi-hausart":"DDR-Bungalow","laupi-hausflaeche":"34.00","laupi-eigentumsart":"Pacht","preise-kaufpreisbrutto":"5595.00","laupi-objektart":"Wochenendgrundst\u00fcck","geo-lat":"52.1800000","geo-lon":"14.4400000","geo-lat_forged":"52.1900000","geo-lon_forged":"14.4600000"},{"uriident":"grosses-wochenendgrundstueck-in-golssen-am-rande-des-spreewalds-p-150","css-filter-class-string":"estate flaechen-gesamtflaeche-1400-1500 laupi-hausart-holzhaus laupi-hausflaeche-10-20 laupi-eigentumsart-eigentum preise-kaufpreisbrutto-10000-20000","freitexte-objekttitel":"Gro\u00dfes Wochenendgrundst\u00fcck in Gol\u00dfen am Rande des Spreewalds","anhaenge-anhang-#1-@gruppe":"BILD","anhaenge-anhang-#1-daten-pfad":"assets\/images\/5\/P-150_2_Wochenendgrundstueck_Gartengrundstueck_Golssen_Spreewald_Laupi_Berlin-10a102d5.jpg","anhaenge-anhang-#1-format":".jpg","anhaenge-anhang-#1-anhangtitel":"2_Wochenendgrundstueck_Gartengrundstueck_Golssen_Spreewald_Laupi_Berlin.jpg","geo-plz":"15938","geo-ort":"Gol\u00dfen","flaechen-gesamtflaeche":"1400.00","laupi-hausart":"Holzhaus","laupi-hausflaeche":"12.00","laupi-eigentumsart":"Eigentum","preise-kaufpreisbrutto":"16250.00","laupi-objektart":"Wochenendgrundst\u00fcck","geo-lat":"0.0000000","geo-lon":"0.0000000","geo-lat_forged":"51.9700000","geo-lon_forged":"13.6000000"},{"uriident":"romantische-scheune-mit-garten-in-seenaehe-180-km-von-berlin-20-km-bis-guestrow-p-126","css-filter-class-string":"estate flaechen-gesamtflaeche-700-800 laupi-hausart-steinhaus laupi-hausflaeche-60-70 laupi-eigentumsart-eigentum preise-kaufpreisbrutto-40000-50000","freitexte-objekttitel":"Romantische Scheune mit Garten in Seen\u00e4he, 180 km von Berlin, 20 km bis G\u00fcstrow","anhaenge-anhang-#1-@gruppe":null,"anhaenge-anhang-#1-daten-pfad":null,"anhaenge-anhang-#1-format":null,"anhaenge-anhang-#1-anhangtitel":null,"geo-plz":"18292","geo-ort":"Koppelow","flaechen-gesamtflaeche":"717.00","laupi-hausart":"Steinhaus","laupi-hausflaeche":"60.00","laupi-eigentumsart":"Eigentum","preise-kaufpreisbrutto":"43332.00","laupi-objektart":"Wochenendgrundst\u00fcck","geo-lat":"53.7000000","geo-lon":"12.3100000","geo-lat_forged":"53.6900000","geo-lon_forged":"12.3100000"},{"uriident":"bungalow-zaue-am-schwielochsee-seenaehe-45-km-von-cottbus-p-158","css-filter-class-string":"estate flaechen-gesamtflaeche-200-300 laupi-hausart-steinhaus laupi-hausflaeche-30-40 laupi-eigentumsart-teileigentum preise-kaufpreisbrutto-20000-30000","freitexte-objekttitel":"Bungalow Zaue am Schwielochsee, Seen\u00e4he, 45 km von Cottbus","anhaenge-anhang-#1-@gruppe":"BILD","anhaenge-anhang-#1-daten-pfad":"assets\/images\/3\/P-158_3_Wochenendgrundstueck_Wochenendhaus_Schlaubetal_See_Laupi_Berlin-153fae33.jpg","anhaenge-anhang-#1-format":".jpg","anhaenge-anhang-#1-anhangtitel":"3_Wochenendgrundstueck_Wochenendhaus_Schlaubetal_See_Laupi_Berlin.jpg","geo-plz":"15913","geo-ort":"Zaue am Schwielochsee","flaechen-gesamtflaeche":"250.00","laupi-hausart":"Steinhaus","laupi-hausflaeche":"38.00","laupi-eigentumsart":"Teileigentum","preise-kaufpreisbrutto":"21666.00","laupi-objektart":"Wochenendgrundst\u00fcck","geo-lat":"52.0500000","geo-lon":"14.1900000","geo-lat_forged":"52.0600000","geo-lon_forged":"14.1900000"},{"uriident":"wochenendhaus-in-berlin-nikolassee-nahe-wannsee-p-252","css-filter-class-string":"estate flaechen-gesamtflaeche-100-200 laupi-hausart-gartenhaus laupi-hausflaeche-20-30 laupi-eigentumsart-pacht preise-kaufpreisbrutto-20000-30000","freitexte-objekttitel":"Wochenendhaus in Berlin-Nikolassee, nahe Wannsee","anhaenge-anhang-#1-@gruppe":"BILD","anhaenge-anhang-#1-daten-pfad":"assets\/images\/e\/P-252_01_Wochenendhaus_Berlin_Laupi-86a6af4e.jpg","anhaenge-anhang-#1-format":".jpg","anhaenge-anhang-#1-anhangtitel":"01_Wochenendhaus_Berlin_Laupi.jpg","geo-plz":"14109","geo-ort":"Berlin","flaechen-gesamtflaeche":"144.00","laupi-hausart":"Gartenhaus","laupi-hausflaeche":"21.00","laupi-eigentumsart":"Pacht","preise-kaufpreisbrutto":"22500.00","laupi-objektart":"Wochenendgrundst\u00fcck","geo-lat":"52.4200000","geo-lon":"13.1900000","geo-lat_forged":"52.4200000","geo-lon_forged":"13.1900000"},{"uriident":"kleingarten-in-fuerstenwalde-an-der-spree-30-km-bis-berlin-erkner-p-211","css-filter-class-string":"estate flaechen-gesamtflaeche-300-400 laupi-hausart-ddr-bungalow laupi-hausflaeche-30-40 laupi-eigentumsart-pacht preise-kaufpreisbrutto-10000-20000","freitexte-objekttitel":"Kleingarten in F\u00fcrstenwalde an der Spree, 30 km bis Berlin \/ Erkner","anhaenge-anhang-#1-@gruppe":null,"anhaenge-anhang-#1-daten-pfad":null,"anhaenge-anhang-#1-format":null,"anhaenge-anhang-#1-anhangtitel":null,"geo-plz":"15517","geo-ort":"F\u00fcrstenwalde","flaechen-gesamtflaeche":"386.00","laupi-hausart":"DDR-Bungalow","laupi-hausflaeche":"30.00","laupi-eigentumsart":"Pacht","preise-kaufpreisbrutto":"17333.00","laupi-objektart":"Kleingarten","geo-lat":"52.3400000","geo-lon":"14.0600000","geo-lat_forged":"52.3400000","geo-lon_forged":"14.0600000"},{"uriident":"finnhuette-wochenendgrundstueck-niederlausitz-32-km-von-cottbus-p-206","css-filter-class-string":"estate flaechen-gesamtflaeche-400-500 laupi-hausart-finnhuette laupi-hausflaeche-40-50 laupi-eigentumsart-eigentum preise-kaufpreisbrutto-10000-20000","freitexte-objekttitel":"Finnh\u00fctte, Wochenendgrundst\u00fcck Niederlausitz, 32 km von Cottbus","anhaenge-anhang-#1-@gruppe":null,"anhaenge-anhang-#1-daten-pfad":null,"anhaenge-anhang-#1-format":null,"anhaenge-anhang-#1-anhangtitel":null,"geo-plz":"02959","geo-ort":"Gro\u00df D\u00fcben","flaechen-gesamtflaeche":"487.00","laupi-hausart":"Finnh\u00fctte","laupi-hausflaeche":"42.00","laupi-eigentumsart":"Eigentum","preise-kaufpreisbrutto":"10833.00","laupi-objektart":"Wochenendgrundst\u00fcck","geo-lat":"51.5800000","geo-lon":"14.5700000","geo-lat_forged":"51.5700000","geo-lon_forged":"14.5700000"},{"uriident":"gartenhaus-keingarten-in-prenzlau-ganz-nah-am-unteruckersee-p-157","css-filter-class-string":"estate flaechen-gesamtflaeche-300-400 laupi-hausart-steinhaus laupi-hausflaeche-30-40 laupi-eigentumsart-pacht preise-kaufpreisbrutto-10000-20000","freitexte-objekttitel":"Gartenhaus \/ Keingarten in Prenzlau,  ganz nah am Unteruckersee","anhaenge-anhang-#1-@gruppe":null,"anhaenge-anhang-#1-daten-pfad":null,"anhaenge-anhang-#1-format":null,"anhaenge-anhang-#1-anhangtitel":null,"geo-plz":"17291","geo-ort":"Prenzlau","flaechen-gesamtflaeche":"300.00","laupi-hausart":"Steinhaus","laupi-hausflaeche":"38.00","laupi-eigentumsart":"Pacht","preise-kaufpreisbrutto":"10292.00","laupi-objektart":"Kleingarten","geo-lat":"53.3100000","geo-lon":"13.8600000","geo-lat_forged":"53.3100000","geo-lon_forged":"13.8500000"},{"uriident":"kleingarten-in-eberswalde-seenaehe-schorfheide-p-249","css-filter-class-string":"estate flaechen-gesamtflaeche-300-400 laupi-hausart-steinhaus laupi-hausflaeche-20-30 laupi-eigentumsart-pacht preise-kaufpreisbrutto-1-10000","freitexte-objekttitel":"Kleingarten in Eberswalde, Seen\u00e4he, Schorfheide","anhaenge-anhang-#1-@gruppe":"BILD","anhaenge-anhang-#1-daten-pfad":"assets\/images\/6\/P-249_10_Kleingarten_Eberswalde_Laupi_Berlin-02791296.jpg","anhaenge-anhang-#1-format":".jpg","anhaenge-anhang-#1-anhangtitel":"10_Kleingarten_Eberswalde_Laupi_Berlin.jpg","geo-plz":"16227","geo-ort":"Eberswalde","flaechen-gesamtflaeche":"300.00","laupi-hausart":"Steinhaus","laupi-hausflaeche":"25.00","laupi-eigentumsart":"Pacht","preise-kaufpreisbrutto":"8000.00","laupi-objektart":"Kleingarten","geo-lat":"52.8500000","geo-lon":"13.7300000","geo-lat_forged":"52.8500000","geo-lon_forged":"13.7300000"},{"uriident":"wochenendhaus-rangsdorf-bauland-30-km-von-berlin-p-151","css-filter-class-string":"estate flaechen-gesamtflaeche-1200-1300 laupi-hausart-steinhaus laupi-hausflaeche-20-30 laupi-eigentumsart-pacht-ueber-bufim preise-kaufpreisbrutto-10000-20000","freitexte-objekttitel":"Wochenendhaus Rangsdorf, Bauland, 30 km von Berlin","anhaenge-anhang-#1-@gruppe":null,"anhaenge-anhang-#1-daten-pfad":null,"anhaenge-anhang-#1-format":null,"anhaenge-anhang-#1-anhangtitel":null,"geo-plz":"15834","geo-ort":"Rangsdorf","flaechen-gesamtflaeche":"1200.00","laupi-hausart":"Steinhaus","laupi-hausflaeche":"25.00","laupi-eigentumsart":"Pacht \u00fcber BufIM","preise-kaufpreisbrutto":"12500.00","laupi-objektart":"Wochenendgrundst\u00fcck","geo-lat":"52.2900000","geo-lon":"13.4500000","geo-lat_forged":"52.2900000","geo-lon_forged":"13.4600000"}];
        _.each($scope.laupisDatabase, function(laupi){
            laupi.lat = laupi['geo-lat'];
            laupi.lng = laupi['geo-lon'];
            laupi.id = laupi.uriident;
        });
        // das sind die laupis die den suckriterien entsprechen
        $scope.laupis = angular.copy($scope.laupisDatabase);
        $scope.laupis = _.reject($scope.laupis, function(laupi){ return laupi.lat == 0 });

        // die verschiedenen suchkriterien, alles wo 'ticked: true' steht sind die standardvorgaben
        $scope.kaufpreis = [
            {  value: 10000, name : 'bis 10.000 €', ticked : false }, {  value: 20000, name : 'bis 20.000 €', ticked : false },
            {  value: 30000, name : 'bis 30.000 €', ticked : true  }, {  value: 40000, name : 'bis 40.000 €', ticked : false },
            {  value: 50000, name : 'bis 50.000 €', ticked : false }, {  value: 60000, name : 'bis 60.000 €', ticked : false }
        ];

        $scope.eigentumsArt = [ 
            {  value: 'Eigentum',         ticked : true  , name : 'Eigentum'},          {  value: 'Pacht',            ticked : true  , name : 'Pacht'},
            {  value: 'Pacht über BufIM', ticked : true  , name : 'Pacht über BufIM'},  {  value: 'Teileigentum',     ticked : true  , name : 'Teileigentum'}
        ];

        $scope.grundstuecksFlaeche = [
            {  value: 200, ticked : false , name : 'bis 200 m²'},    {  value: 300, ticked : false , name : 'bis 300 m²'},
            {  value: 400, ticked : false , name : 'bis 400 m²'},    {  value: 500, ticked : true , name : 'bis 500 m²'},
            {  value: 800, ticked : false , name : 'bis 800 m²'},    {  value: 1100, ticked : false , name : 'bis 1.100 m²'},
            {  value: 1300, ticked : false , name : 'bis 1.300 m²'}, {  value: 1500, ticked : false , name : 'bis 1.500 m²'}
        ];

        $scope.hausArt = [
            {  ticked : true , value: 'Blockbohlenhaus', name : 'Blockbohlenhaus'}, {  ticked : true , value: 'DDR-Bungalow', name : 'DDR-Bungalow'},
            {  ticked : true , value: 'Finnhütte', name : 'Finnhütte'},             {  ticked : true ,  value: 'Gartenhaus', name : 'Gartenhaus'},
            {  ticked : true , value: 'Holzhaus', name : 'Holzhaus'},               {  ticked : true , value: 'Steinhaus', name : 'Steinhaus'}
        ];

        $scope.hausFlaeche = [
            {  ticked : false , value: '20', name : 'bis 20 m²'}, {  ticked : false , value: '30', name : 'bis 30 m²'},
            {  ticked : false , value: '40', name : 'bis 40 m²'}, {  ticked : true , value: '50', name : 'bis 50 m²'},
            {  ticked : false , value: '60', name : 'bis 60 m²'}, {  ticked : false , value: '70', name : 'bis 70 m²'}
        ];

        // das öffnet das modal fenster für die bearbeitung der suche
        $("#laupi-search-edit").show();
        $("#laupi-search-edit").on('click', function(){ $("#laupi-search-edit-modal").modal('show'); });
        
        // öffnet die ergebnissliste
        $("#laupi-results").show();
        $("#laupi-results").on('click', function(){ 

            // baut das datenmodell für die tabelle
            $scope.laupisTableParams = TableParamFactory.create($scope.laupis);
            $scope.$apply();
            $("#laupi-results-modal").modal('show'); 
        });
        
        // leaflet complains if project is build/minimized if this is not present
        L.Icon.Default.imagePath = 'images/marker/';

        // add the map and set the initial center to berlin
        $scope.map = L.map('map-laupi', {zoomControl : false, scrollWheelZoom : true }).setView([52.516389, 13.377778], 13);
        // attribution to give credit to OSM map data and VBB for public transportation 
        var attribution ="<a href='https://www.mapbox.com/about/maps/' target='_blank'>© Mapbox © OpenStreetMap</a> | ÖPNV Daten © <a href='http://www.vbb.de/de/index.html' target='_blank'>VBB</a> | developed by <a href='http://www.route360.net/de/' target='_blank'>Route360°</a>";
        // initialising the base map. To change the base map just change following lines as described by cloudmade, mapbox etc..
        L.tileLayer('http://a.tiles.mapbox.com/v3/' + $config.mapboxId + '/{z}/{x}/{y}.png', { maxZoom: 18, attribution: attribution }).addTo($scope.map);
        L.control.scale({ metric : true, imperial : false }).addTo($scope.map);

        // der reisezeit slider mit werten von 20 bis 120 minuten in 20 minuten abständen
        r360.config.defaultTravelTimeControlOptions.travelTimes = [
            { time : 60 * 20   , color : "#006837" , opacity : 1.0 },
            { time : 60 * 40   , color : "#39B54A" , opacity : 1.0 },
            { time : 60 * 60   , color : "#8CC63F" , opacity : 1.0 },
            { time : 60 * 80   , color : "#F7931E" , opacity : 1.0 },
            { time : 60 * 100  , color : "#F15A24" , opacity : 1.0 },
            { time : 60 * 120  , color : "#C1272D" , opacity : 1.0 }
        ];

        $scope.travelTimeControl = r360.travelTimeControl({
            travelTimes : r360.config.defaultTravelTimeControlOptions.travelTimes,
            position    : 'topright', // this is the position in the map
            label       : 'Reisezeit', // the label, customize for i18n
            unit        : 'min', // nur ein display wert
            initValue   : 60 // the inital value has to match a time from travelTimes, e.g.: 40m == 2400s
        });

        // map control zum verändern der polygon darstellung
        $scope.map.addControl($scope.travelTimeControl);
        $scope.polygonButtons = r360.radioButtonControl({
            buttons : [
                // each button has a label which is displayed, a key, a tooltip for mouseover events 
                // and a boolean which indicates if the button is selected by default
                // labels may contain html
                { label: '<span class=""></span> Farbig',         key: 'color',   checked : false  },
                { label: '<span class=""></span> Schwarz/Weiß',   key: 'inverse', checked : true }
            ]
        });

        // umstellen der polygone
        $scope.polygonButtons.onChange(function(){ 
            $scope.polygonLayer.setInverse($scope.polygonButtons.getValue() == 'color' ? false : true);
            $scope.showLaupis();
        });

        // zur karte hinzufügen
        $scope.polygonButtons.addTo($scope.map);
        L.control.zoom({position : 'topright'}).addTo($scope.map);
        // der kleine text der anzeigt wird während der request ausgeführt
        $scope.waitControl = r360.waitControl({ position : 'bottomright' });
        $scope.map.addControl($scope.waitControl);
        $scope.travelTimeControl.onSlideStop(function() { $scope.showLaupis(); $scope.$apply(); });

        // create and add the layers to the map
        $scope.laupiLayer      = L.featureGroup().addTo($scope.map);
        $scope.sourceLayer     = L.featureGroup().addTo($scope.map);
        $scope.routesLayer     = L.featureGroup().addTo($scope.map);
        $scope.polygonLayer    = r360.leafletPolygonLayer({ 
            inverse : true,
            extendWidthX: 500,
            extendWidthY: 500
        });
        $scope.map.addLayer($scope.polygonLayer);

        /**
         * holt sich die lat/lng coordinate von dem autovervollständigungsmodul
         */
        $scope.getPlaces = function(){

            // alten start entfernen
            $scope.sourceLayer.clearLayers();

            // roten marker einfügen
            var icon = L.icon({ 
                iconSize     : [25, 41], iconAnchor   : [12, 41],
                iconUrl      : L.Icon.Default.imagePath + 'marker-icon-' + $scope.markerColors[2] + '.png', 
                shadowUrl    : L.Icon.Default.imagePath + 'marker-shadow.png'
            });
            $scope.source = L.marker($scope.autoComplete.getValue().latlng, {icon : icon, draggable : true }).addTo($scope.sourceLayer);
            $scope.source.travelType = $scope.autoComplete.getTravelType();

            // wenn man den marker verschiebt, muss das autocomplete geupdated werden
            // und ein neuer route360 request gemacht werden
            $scope.source.on("dragend", function(event){

                // ask the service for a proper name 
                r360.Util.getAddressByCoordinates($scope.source.getLatLng(), 'de', function(json){
                    
                    // udpate the values in the auto complete
                    $scope.autoComplete.update($scope.source.getLatLng(), r360.Util.formatReverseGeocoding(json));
                    // rerender view
                    $scope.showLaupis();
                });
            });
        };

        // wird nur gebraucht um die position des exposes neu zu berechnen wenn man auf 
        // den travel mode einstellungs button klickt
        $scope.resize = function(){
            var height = $('.leaflet-top.leaflet-left').height();
            var pos = $('.leaflet-top.leaflet-left').offset();
            $('#laupi-details').animate({ top: ((height) + (pos.top) + 10) + 'px' }, 250, function() {
                $('#laupi-details').css('max-height',  ($('#map-laupi').height() -  (height) - 20) + 'px');    // Animation complete.
            });
        };

        // symbolisiert die abfrage an den webservice oder wie auch immer 
        // nach den suchkriterien gefiltert wird
        $scope.filterLaupis = function () { 

            $scope.laupis = [];
            _.each($scope.laupisDatabase, function(laupi){

                if ( laupi['flaechen-gesamtflaeche'] <= $scope.getSelection($scope.selectedGrundstuecksFlaeche)[0] && 
                     laupi['laupi-hausflaeche']      <= $scope.getSelection($scope.selectedHausFlaeche)[0] &&
                     laupi['preise-kaufpreisbrutto'] <= $scope.getSelection($scope.selectedKaufpreis)[0] && 
                     _.contains($scope.getSelection($scope.selectedEigentumsArt), laupi['laupi-eigentumsart'])  && 
                     _.contains($scope.getSelection($scope.selectedHausArt), laupi['laupi-hausart']) )  {

                    $scope.laupis.push(laupi);
                }
            });
        };

        // hilfsmethode um werte aus den suchmasken auszulesen
        $scope.getSelection = function(field) {
            
            var selection = [];
            angular.forEach(field, function(value) { if ( value.ticked === true ) selection.push(value.value); });
            return selection;
        }

        /**
         * [showLaupis description]
         * @return {[type]} [description]
         */
        $scope.showLaupis = function(){

            // alle layer werden auf den ausgangszustand gesetzt
            $scope.waitControl.show();
            $scope.laupiLayer.clearLayers();   
            $scope.routesLayer.clearLayers();
            $('#laupi-details').hide();
            $scope.getPlaces();
            $scope.noApartmentsInTravelTimeFound = true;

            $scope.maxTime = $scope.travelTimeControl.getMaxValue();

            var travelOptions = r360.travelOptions();
            travelOptions.addSource($scope.source); // die quelle ist der rote marker
            travelOptions.setTravelTimes($scope.travelTimeControl.getValues()); // reisezeiten vom slider holen
            travelOptions.setDate($scope.travelDate); // beliebigen festen freitag wählen
            travelOptions.setTime($scope.travelTime); //  feste urhzeit 17:00 wählen

            // call the service
            r360.PolygonService.getTravelTimePolygons(travelOptions, function(polygons){

                // die polygone zum layer hinzufügen und die karten so ausrichten
                // das die polygone komplett zu sehen sind
                $scope.polygonLayer.clearAndAddLayers(polygons, true);

                // do not query server if no laupis found
                if ( $scope.laupis.length == 0 ) {
                    $scope.waitControl.hide();
                    var error = noty({text: 'Keine Objekte gefunden.', layout : $config.notyLayout, type : 'error', timeout : 2000 });
                    return;
                }
                
                // service configuration
                var travelOptions = r360.travelOptions();
                travelOptions.addSource($scope.source); // quelle ist der rote marker
                travelOptions.setTargets($scope.laupis); // ziel sind all laupis die den suchkriterien entsprechen
                travelOptions.setTravelTimes($scope.travelTimeControl.getValues()); // reisezeit festlegen
                travelOptions.setMaxRoutingTime($scope.travelTimeControl.getMaxValue()); // bis hirerhin wird geroutet 
                // zwingend für polygone und routen den selben tag/zeit auswählen
                travelOptions.setDate($scope.travelDate); // beliebigen festen freitag wählen
                travelOptions.setTime($scope.travelTime); //  feste urhzeit 17:00 wählen

                // // call the time service to get the travel times
                r360.TimeService.getRouteTime(travelOptions, function(sources){
                    _.each(sources[0].targets, function(target){

                        // wir müssen aus dem request die laupi wiederfinden
                        var laupi = _.find($scope.laupis, function(laupi){ return laupi.uriident == target.id; });
                        // reiszeit zu laupi hinzufügen
                        laupi.travelTime = target.travelTime;
                        // wir machen das hier nur damit wir normal sortieren können
                        if ( laupi.travelTime == -1 ) laupi.travelTime = 10000000;
                        
                        // create a marker which represents good or bad reachability
                        var laupiMarker = $scope.createlaupiMarker(laupi, travelOptions);

                        // show the info window on mouseover and click
                        laupiMarker.on('click', $scope.clickMarker(laupiMarker, laupi, travelOptions));
                    });
                    // noch nach den reisezeiten sortieren
                    $scope.laupis.sort(function(a, b){ return a.travelTime - b.travelTime; });

                    // ergebnisstabelle updaten
                    $scope.tableParams = TableParamFactory.create($scope.laupis);

                    // 'bitte warten' entfernen
                    $scope.waitControl.hide();

                    // falls keine laupis gefunden worden hinweis anzeigen
                    if ( $scope.noApartmentsInTravelTimeFound ) 
                        var error = noty({text: 'Es gibt in den erreichbaren Gebieten keine Laupis die den Suchkriterien entsprechen.', timeout: 3000, layout : $config.notyLayout, type : 'error' });
                });
            });
        };

        // löst ein erhoehen der reisezeit aus falls limit noch nicht erreicht ist.
        $scope.showIncreaseTravelTimeQuestion = function(error){

            if ( $scope.travelTimeControl.getMaxValue() / 60 < 120 ) {

                noty({
                    text: 'Reisezeit erhöhen?',
                    layout : $config.notyLayout, 
                    buttons: [ 
                        { addClass: 'btn btn-primary', text:  'Ja', onClick: function($noty) {

                            $scope.travelTimeControl.setValue(Math.min($scope.travelTimeControl.getMaxValue() / 60 + 20, 60));
                            $scope.showLaupis();
                            $noty.close(); error.close();
                        }},
                        { addClass: 'btn btn-danger', text:  'Nein', onClick: function($noty) {
                            $noty.close(); error.close();
                    }}]
                });
            }
        };

        /**
         * erzeugt speziellen marker nach erreichbarkeit
         */
        $scope.createlaupiMarker = function(laupi, travelOptions){

            var laupiMarker, icon;

            // marker die erreicht werden können sind grün
            if ( laupi.travelTime != -1 && laupi.travelTime != undefined && laupi.travelTime <= $scope.travelTimeControl.getMaxValue() &&
                    PolygonService.pointInPolygon([laupi.lat, laupi.lng]) ) {

                icon = L.icon({ 
                    iconSize     : [25, 41], iconAnchor   : [12, 41],
                    iconUrl      : L.Icon.Default.imagePath + 'marker-icon-' + $scope.markerColors[0] + '.png', 
                    shadowUrl    : L.Icon.Default.imagePath + 'marker-shadow.png'
                });

                $scope.noApartmentsInTravelTimeFound = false;
            }
            // marker die NICHT erreicht werden können sind grau
            else {

                icon = L.icon({ 
                    iconSize     : [25, 41], iconAnchor   : [12, 41],
                    iconUrl      : L.Icon.Default.imagePath + 'marker-icon-' + $scope.markerColors[5] + '.png', 
                    shadowUrl    : L.Icon.Default.imagePath + 'marker-shadow.png'
                });
            }

            // add the laupi to the map
            laupiMarker = L.marker([laupi.lat, laupi.lng], {icon : icon, draggable : false }).addTo($scope.laupiLayer);

            return laupiMarker;   
        }

        /**
         * [clickMarker description]
         * @param  {[type]} laupiMarker [description]
         * @param  {[type]} laupi       [description]
         * @param  {[type]} travelOptions   [description]
         * @return {[type]}                 [description]
         */
        $scope.clickMarker = function(laupiMarker, laupi, travelOptions){

            return function() {

                $scope.laupi = laupi;
                $scope.routesLayer.clearLayers();
                $scope.resize();
                $('#laupi-details').show();

                // define source and target
                travelOptions.addSource($scope.source);
                travelOptions.setTargets([laupiMarker]);

                // route vom serverholen
                r360.RouteService.getRoutes(travelOptions, function(routes){

                    $scope.laupi.travelTime = routes[0].travelTime;
                    $scope.laupi.route      = routes[0];
                    r360.LeafletUtil.fadeIn($scope.routesLayer, $scope.laupi.route, 1000, 'travelDistance', { 
                            transferColor       : '#659742',
                            transferHaloColor   : '#4B7C27',
                            transferFillOpacity : 1,
                            transferOpacity     : 1,
                            transferStroke      : true,
                            transferWeight      : 7,
                            transferRadius      : 7 
                    });
                    
                    // angular spezifisch
                    $scope.$apply(); // update view because of out of angular call
                });
            };
        }

        /**
         */
        $scope.addAutoComplete = function(){

            // create a autocomplete
            $scope.autoComplete = r360.placeAutoCompleteControl({ 
                country     : 'Deutschland', 
                placeholder : 'Startpunkt', 
                reset       : false,
                reverse     : false,
                image       : L.Icon.Default.imagePath + 'marker-icon-' + $scope.markerColors[2] + '.png',
                options     : { car : true, bike : true, walk : true, transit : true, biketransit : true, init : 'transit', labels : {
                    bike : '<span class="fa fa-bicycle travel-type-icon"></span>',
                    walk : '<span class="fa fa-male travel-type-icon"></span>',
                    car : '<span class="fa fa-car travel-type-icon"></span>',
                    transit : '<span class="fa fa-bus travel-type-icon"></span>',
                    biketransit : '<span class="fa fa-bicycle travel-type-icon"></span> + <span class="fa fa-bus travel-type-icon"></span>',
                }},
                width : 400
            });

            // alle inhalte löschen
            var reset = function(){

                if ( $scope.autoComplete.getFieldValue() != '' ) {
                    $scope.autoComplete.reset();
                    $scope.polygonLayer.clearLayers();
                    $scope.routesLayer.clearLayers();
                    $scope.sourceLayer.clearLayers();
                    $('#laupi-details').hide();
                }
            };

            // laupis anzeigen
            var select = function() { $scope.showLaupis(); };

            // laupis anzeigen
            var onTravelTypeChange = function(){

                // we have to wait since this is the time it takes for the slide-in to slide in
                $timeout(function(){ $scope.resize(); }, 320);
                $scope.showLaupis();
            };

            // define what is happing on select
            $scope.autoComplete.onSelect(select);
            $scope.autoComplete.onReset(reset);
            $scope.autoComplete.onTravelTypeChange(onTravelTypeChange);
            $scope.map.addControl($scope.autoComplete);
            $scope.resize();
        }();

        $('#laupi-details').css('top',  (117) + 'px');
        $('#laupi-details').on('mouseover', function(){ $scope.map.scrollWheelZoom.disable(); });
        $('#laupi-details').on('mouseout' , function(){ $scope.map.scrollWheelZoom.enable(); });      

        // methoden die im html aufgerufen werden
        $scope.showResultView       = function(){
            $scope.laupisTableParams = TableParamFactory.create($scope.laupis);
            $('#laupi-results-modal').modal('show'); 
        };
        $scope.showEditSearchView   = function(){ $('#laupi-search-edit-modal').modal('show'); };
        // end toggle modals

        // action listener für den schließen button im expose
        $('#close-expose').click(function(){ $('#laupi-details').hide(); });
        // recalculate the size of the laupi details after some one selects a travel type
        $('.travel-type-buttons').click(function(){ $timeout(function(){ $scope.resize(); }, 320); });
        // window is resized
        $scope.map.on('resize', function(){ $scope.resize(); });

        // set default values for debugging/developing
        $scope.autoComplete.setFieldValue("Berlin, Berlin");
        $scope.autoComplete.setValue({
            firstRow    : "Berlin, Berlin",
            getLatLng   : function (){ return this.latlng; },
            label       : "Berlin, Berlin",
            latlng      : L.latLng(52.517037, 13.38886),
            secondRow   : "Berlin",
            term        : "Berlin",
            value       : "Berlin, Berlin"
        });

        // defaultmäßiges aufrufen zu begin des website ladens
        $scope.showLaupis();
        noty({text: 'Man kann den Marker verscchieben', layout : $config.notyLayout, type : 'success', timeout : 3000 });
        // $timeout(function(){ noty({text: 'Größere Marker symbolisieren kürzere Reisezeiten.', layout : $config.notyLayout, type : 'success', timeout : 3000 }); }, 4000);
        // $timeout(function(){ noty({text: 'Die farbigen Markierungen auf der Karte entsprechen den Gebieten die in der angegebenen Reisezeit erreichbar sind.', layout : $config.notyLayout, type : 'success', timeout : 3000 }); }, 8000);
        $scope.resize();
        // select language
        $("[lang='en']").hide();
        $("[lang='no']").hide();
    });