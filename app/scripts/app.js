'use strict';

/**
 * @ngdoc overview
 * @name route360DemoApp
 * @description
 * # route360DemoApp
 *
 * Main module of the application.
 */
angular
  .module('route360DemoApp', [
    'ngCookies',
    'ngRoute',
    'ngTouch',
    'cfg',
    'ui.checkbox',
    'pascalprecht.translate',
    'ngTable',
    'ui.bootstrap',
    'ngCookies'
  ])
  .config(function ($routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'views/apartment.html',
            controller: 'ApartmentCtrl'
        })
        .when('/contact', {
            templateUrl: 'views/contact.html',
            controller: 'ContactCtrl'
        })
        .when('/about', {
            templateUrl: 'views/about.html',
            controller: 'AboutCtrl'
        })
        .when('/beer', {
          templateUrl: 'views/beer.html',
          controller: 'BeerCtrl'
        })
        .when('/apartment', {
          templateUrl: 'views/apartment.html',
          controller: 'ApartmentCtrl'
        })
        .otherwise({
            redirectTo: '/'
        });
    })
  .config(function ($translateProvider) {

  $translateProvider.translations('en', {
    YES: 'Yes',
    NO : 'No',
    BIKE: 'Bike',
    WALK: 'Walk',
    TRANSIT: 'Transit',
    CAR: 'Car',
    APARTMENTS: 'Apartments',
    MUSEUMS: 'Museums',
    FROM : 'from',
    TO : 'to',
    BARS: 'Bars & Pubs',
    COLD_RENT: 'Cold rent (€)',
    AREA: 'Area (m²)',
    ROOMS: 'Rooms',
    EXPOSE: 'Expose',
    COLD: '(cold)',
    TRAVELTIME: 'Travel time',
    REACHABILITY: 'Reachability',
    NO_INTERSECTION: 'No intersection',
    NO_INTERSECTION_HELP: 'For option "no intersection" you will see the reachable areas for each starting point on the map independently. This means, each point has 10 minutes, 20 minutes, 30 minutes etc. reachable areas.',
    INTERSECT_INTERSECTION: 'Intersection',
    INTERSECT_INTERSECTION_HELP: 'For option "intersection" you will see (assumed you start from 2 starting points) the areas which are reachable from both points in a given travel time (10 minutes, 20 minutes, etc) on the map.',
    AVERAGE_INTERSECTION: 'Average',
    AVERAGE_INTERSECTION_HELP: 'For option "average" you will see (assumed you start from 2 starting points) the areas, which are reachable from both points in an average travel time of 10 minutes, 20 minutes, etc. This means, a place reachable from point A in 2 minutes and from point b in 14 minutes is reachable in an average time of (2 + 14) / 2 = 8 minutes.',
    SHOW_HELP: 'Show help!',
    MAP_VIEW: 'Map view',
    RESULT_VIEW: 'Result list',
    PUBLIC_TOILETS: 'Public toilets',
    WHERE_ARE_YOU : 'Where are you?',
    FIND_BEER : 'Where\'s the next Pub?',
    FILTER_COURTAGE : 'No courtage',
    FILTER_BALCONY: 'Balcony',
    FILTER_GARDEN: 'Garden',
    FILTER_KITCHEN: 'Kitchen',
    SELECT_ROOMS: 'Rooms',
    SELECT_AREA: 'Area',
    SELECT_PRICE: 'Price',
    FIND_APARTMENT : 'Find your dream apartment!',
    EDIT_SEARCH : 'Edit search',
    LIKE: 'Save',
    LIKED: 'Saved',
    HIDE: 'Hide',
    WAYS: 'Routes to this apartment:',
    DEPARTURE: 'Departure:',
    ARRIVAL: 'Arrival:',
    DIRECTION: 'Direction:',
    COMPLETE_TRAVELTIME: 'Total travel time',
    DOCUMENTATION: 'Documentation',
    CONTACT: 'Contact',
    ABOUT: 'About',
    FAVOURITES : 'Favourits',
    SELECT_START : 'Starting point',
    TRANSFER : 'Transfer',
    ÖPNV : 'Public transportation',
    INPUT_ERROR : 'Please check inputs!',
    NO_FAVOURITES : 'There are no favourite apartments so far!',
    NOT_REACHABLE: 'not reachable',
    NO_AREA_WITHIN_TRAVELTIME : 'There are no areas with the given travel time that can be reached from all given points.',
    NO_APARTMENTS_IN_REACHABLE_AREA : 'There are no apartements matching your search criteria in the reachable area.',
    INCREASE_TRAVELTIME : 'Do you want to increase travel time?',
    MOVE_MARKER : '<span lang="en">You can drag the marker!</span><span lang="de">Du kannst den Marker verschieben!</span>',
    NO_APARTMENTS_FOUND: 'No apartments found that match the search criteria.',
    HELP : 'Help',
    MARKER_SIZE : 'Larger markers indicate smaller travel times.',
    POLYGON_HELP : 'The colored markings on the map symbolize the area which is reachable in the given travel time.'
  });
  
  $translateProvider.translations('de', {
    YES: 'Ja',
    NO : 'Nein',
    BIKE: 'Fahrrad',
    WALK: 'zu Fuß',
    TRANSIT: 'ÖPNV',
    CAR: 'Auto',
    APARTMENTS: 'Wohnungen',
    MUSEUMS: 'Museen',
    FROM : 'von',
    TO : 'bis',
    BARS: 'Bars & Pubs',
    COLD_RENT: 'Kaltmiete (€)',
    AREA: 'Fläche (m²)',
    ROOMS: 'Zimmer',
    EXPOSE: 'Expose',
    COLD: '(kalt)',
    TRAVELTIME: 'Reisezeit',
    REACHABILITY: 'Erreichbarkeiten',
    NO_INTERSECTION: 'Keine Verschneidung',
    NO_INTERSECTION_HELP: 'Bei der Option "keine Verschneidung" siehst du auf der Karte die jeweiligen erreichbaren Gebiete für jeden Ausgangspunkt. Das heißt, jeder Punkt hat 10 Minuten, 20 Minuten, 30 Minuten etc. Erreichbarkeitsgebiete.',
    INTERSECT_INTERSECTION: 'Schnittmenge',
    INTERSECT_INTERSECTION_HELP: 'Bei der Option "Schnittmenge" siehst du auf der Karte (angenommen man startet von zwei Ausgangspunkten) die Erreichbarkeitsgebiete, die von beiden Punkten innerhalb von der jeweiligen Reisezeit, also 10 Minuten, 20 Minuten etc. erreichbar sind.',
    AVERAGE_INTERSECTION: 'Durchschnitt',
    AVERAGE_INTERSECTION_HELP: 'Bei der Option "Durchschnitt" siehst du auf der Karte (angenommen man startet von zwei Ausgangspunkten) die Erreichbarkeitsgebiete, die von beiden Punkten innerhalb einer durschnittlichen Reisezeit von 10 Minuten, 20 Minuten etc. erreichbar sind. Das heißt, ein Ort der von Punkt A 2 Minuten und von Punkt B 14 Minuten entfernt ist, ist in durchschnittlich (2 + 14) / 2 = 8 Minuten erreichbar. ',
    SHOW_HELP: 'Hilfe anzeigen!',
    MAP_VIEW: 'Kartenansicht',
    RESULT_VIEW: 'Wohnungen',
    PUBLIC_TOILETS: 'Öffentliche Toiletten',
    WHERE_ARE_YOU : 'Wo bist du?',
    FIND_BEER : 'Wo geht\'s zum nächsten Pub',
    FILTER_COURTAGE : 'Courtagefrei',
    FILTER_BALCONY: 'Balkon',
    FILTER_GARDEN: 'Garten',
    FILTER_KITCHEN: 'EBK',
    SELECT_ROOMS: 'Zimmer',
    SELECT_AREA: 'Wohnfläche',
    SELECT_PRICE: 'Preis',
    FIND_APARTMENT : 'Finde deine Traumwohnung!',
    EDIT_SEARCH : 'Suche anpassen',
    LIKE: 'Merken',
    LIKED: 'Gemerkt',
    HIDE: 'Ausblenden',
    WAYS: 'Wege zu dieser Wohnung:',
    DEPARTURE: 'Abfahrt:',
    ARRIVAL: 'Ankunft:',
    DIRECTION: 'Richtung:',
    COMPLETE_TRAVELTIME: 'Gesamtreisedauer',
    DOCUMENTATION: 'Dokumentation',
    CONTACT: 'Kontakt',
    ABOUT: 'Impressum',
    FAVOURITES : 'Favoriten',
    SELECT_START : 'Ausgangspunkt',
    TRANSFER : 'Umsteigen',
    ÖPNV : 'Öffentlicher Nahverkehr',
    INPUT_ERROR : 'Bitte Eingaben überprüfen!',
    NO_FAVOURITES : 'Es wurden bis jetzt noch keine Apartments gemerkt!',
    NOT_REACHABLE: 'nicht erreichbar',
    NO_AREA_WITHIN_TRAVELTIME : 'Es gibt keine Gebiete die in der angegebene Reisezeit von allen Orten aus erreichbar sind.',
    NO_APARTMENTS_IN_REACHABLE_AREA : 'Es gibt in den erreichbaren Gebieten keine Wohungen die den Suchkriterien entsprechen.',
    INCREASE_TRAVELTIME : 'Möchtest du die Reisezeit erhöhen?',
    MOVE_MARKER : '<span lang="en">You can drag the marker!</span><span lang="de">Du kannst den Marker verschieben!</span>',
    NO_APARTMENTS_FOUND: 'Es wurden keine Wohnungen für die angegebenen Suchkriterien gefunden.',
    HELP : 'Hilfe',
    MARKER_SIZE : 'Größere Marker symbolisieren kürzere Reisezeiten.',
    POLYGON_HELP : 'Die farbigen Markierungen auf der Karte entsprechen den Gebieten die in der angegebenen Reisezeit erreichbar sind.'
  });

  $translateProvider.preferredLanguage('de');
});
