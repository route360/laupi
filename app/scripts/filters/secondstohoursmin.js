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
    .filter('reverse', function() {
        return function(items) {
            return items.slice().reverse();
        };
    })
    .filter('secondsToHoursMin', function () {
        return function (seconds) {
          return r360.Util.secondsToHoursAndMinutes(seconds);
        };
    })
    .filter('formatMeter', function(){
        return function (kilometer) {

            var approxMeters = kilometer.toFixed(3);
            if ( approxMeters < 1000 ) return Math.round(approxMeters/10)*10 + "m";
            else {

                var approxKilometer = Math.round(approxMeters/10)*10;
                return approxKilometer / 1000 + "km";
            }
        };
    })
    .filter('secToHoursMin', function(){
        return function (seconds) {

            var minutes = (seconds / 60).toFixed(0);
            var hours = Math.floor(minutes / 60);

            minutes = minutes - hours * 60;
            var timeString = "";

            if (hours != 0){
                timeString += (hours + "h "); 
            }

            timeString += (minutes + "min");
            return timeString;
        };
    })
    .filter('cleanName', function () {
        return function (name) {

            name = name.trim().replace("(Berlin)", '');
            name = name.trim().replace("(Bln)", '');
            name = name.trim().replace(/\[.*\]$/g, '');
            name = name.trim().replace(/U{0-9}{1,2}$/g, '');

            return name;
        };
    })
    .filter('secToMin', function () {
        return function (seconds) {
            return Math.floor(seconds / 60);
        };
    })
    .filter('secToTime', function(){
        return function (seconds) {

            var minutes = (seconds / 60).toFixed(0);
            var hours   = Math.floor(minutes / 60);
            
            minutes = minutes - hours * 60;
            var timeString = "";

            if (hours != 0) timeString += (hours + ":"); 
            else timeString += ("00:"); 

            if ( minutes == 0 ) minutes = "00"
            else if ( minutes < 10 ) minutes = "0" + minutes;

            timeString += (minutes + " Uhr");

            return timeString;
        };
    })
    .filter('formatKilometer', function(){
        return function (kilometer) {

            var approxMeters = kilometer.toFixed(3) * 1000;
            if ( approxMeters < 1000 ) return Math.round(approxMeters/10)*10 + "m";
            else {

                var approxKilometer = Math.round(approxMeters/10)*10;
                return approxKilometer / 1000 + "km";
            }
        };
    })
    .filter('truncate', function () {
        return function (text, length, end) {
            
            // use default length if no usefull length is supplied
            if ( isNaN(length) ) length = 10;

            // use default end if no usefull length is supplied
            if (end === undefined) end = "...";

            // just return text if possible
            if (text.length <= length || text.length - end.length <= length)  return text;
            
            // cut text and append "end"
            else return String(text).substring(0, length-end.length) + end;
        };
    });
