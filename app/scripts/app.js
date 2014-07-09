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
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'cfg',
    'ui.checkbox',
    'pascalprecht.translate',
    'ngTable'
    // 'PubService'
  ])
  .config(function ($routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'views/home.html',
            controller: 'HomeCtrl'
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
    APPARTMENTS: 'Appartments',
    MUSEUMS: 'Museums',
    BARS: 'Bars & Pubs',
    PUBLIC_TOILETS: 'Public toilets',
    WHERE_ARE_YOU : 'Where are you?',
    FIND_BEER : 'Find your nearest Bar or Pub'
  });
  
  $translateProvider.translations('de', {
    APPARTMENTS: 'Wohnungen',
    MUSEUMS: 'Museen',
    BARS: 'Bars & Pubs',
    PUBLIC_TOILETS: 'Öffentliche Toiletten',
    WHERE_ARE_YOU : 'Wo bist du?',
    FIND_BEER : 'Wo geht\'s zum nächsten Pub',
    FILTER_COURTAGE : 'Courtage',
    FILTER_BALCONY: 'Balkon',
    FILTER_GARDEN: 'Garten',
    FILTER_KITCHEN: 'Einbauküche',
    SELECT_ROOMS: 'Zimmer',
    SELECT_AREA: 'Wohnfläche',
    SELECT_PRICE: 'Preis',
    FIND_APARTMENT : 'Finde deine Traumwohnung!'
  });

  $translateProvider.preferredLanguage('de');
});
