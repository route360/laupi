'use strict';

/**
 * @ngdoc service
 * @name route360DemoApp.pubService
 * @description
 * # pubService
 * Service in the route360DemoApp.
 */
angular.module('route360DemoApp')
    .service('PubService', function PubService() {

        /**
          *
          * @method getPubs
          * @async
          * 
          * @return {Array} a list of all pubs
          */
        this.getPubs = function() {

            _.each(pubs, function(pub){

                pub.getLatLng = function() {
                    return L.latLng([pub.lat, pub.lon]);
                };
            });

            return pubs;
        }; 
    });
