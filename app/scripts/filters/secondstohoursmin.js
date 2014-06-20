'use strict';

/**
 * @ngdoc filter
 * @name route360DemoApp.filter:secondsToHoursMin
 * @function
 * @description
 * # secondsToHoursMin
 * Filter in the route360DemoApp.
 */
angular.module('route360DemoApp')
  .filter('secondsToHoursMin', function () {
    return function (seconds) {
      return r360.Util.secondsToHoursAndMinutes(seconds);
    };
  });
