'use strict';

describe('Controller: ApartmentCtrl', function () {

  // load the controller's module
  beforeEach(module('route360DemoApp'));

  var ApartmentCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ApartmentCtrl = $controller('ApartmentCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
