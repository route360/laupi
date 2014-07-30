'use strict';

/**
 * @ngdoc function
 * @name route360DemoApp.controller:NavCtrl
 * @description
 * # NavCtrl
 * Controller of the route360DemoApp
 */
angular.module('route360DemoApp')
  .controller('NavCtrl', function ($scope, $location, $translate) {
    
    $scope.language = $translate.use();

    $scope.translateR360 = function(language){

        if ( language == 'de' ) {

            $('span[lang="en"]').hide();
            $('span[lang="de"]').show();
            $('.r360-autocomplete').attr('placeholder', $translate.instant('SELECT_START'));
            r360.config.i18n.language = 'de';
        }
        else {
            $('span[lang="de"]').hide();
            $('span[lang="en"]').show();
            $('.r360-autocomplete').attr('placeholder', $translate.instant('SELECT_START'));
            r360.config.i18n.language = 'en';
        }
    };

    $scope.translateR360($translate.preferredLanguage());

    $scope.navClass = function(page){

        var currentRoute = $location.path().substring(1) || 'home';
        return page === currentRoute ? 'active' : '';
    };  

    $scope.loadHome       = function(){ $location.url('/'); };
    $scope.loadContact    = function(){ $location.url('/contact'); };
    $scope.loadAbout      = function(){ $location.url('/about'); };
    $scope.loadTest       = function(){ $location.url('/test'); };

    $scope.changeLanguage = function(language){ 

        $translate.use(language); 
        $scope.language = language;
        $scope.translateR360(language);
    };

    
  });