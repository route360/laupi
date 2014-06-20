'use strict';

describe('Filter: secondsToHoursMin', function () {

  // load the filter's module
  beforeEach(module('route360DemoApp'));

  // initialize a new instance of the filter before each test
  var secondsToHoursMin;
  beforeEach(inject(function ($filter) {
    secondsToHoursMin = $filter('secondsToHoursMin');
  }));

  it('should return the input prefixed with "secondsToHoursMin filter:"', function () {
    var text = 'angularjs';
    expect(secondsToHoursMin(text)).toBe('secondsToHoursMin filter: ' + text);
  });

});
