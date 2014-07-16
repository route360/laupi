'use strict';

describe('Directive: ApartmentDetails', function () {

  // load the directive's module
  beforeEach(module('route360DemoApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<-apartment-details></-apartment-details>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the ApartmentDetails directive');
  }));
});
