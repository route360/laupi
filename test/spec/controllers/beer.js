'use strict';

describe('Controller: BeerCtrl', function () {

  // load the controller's module
  beforeEach(module('route360DemoApp'));

  var BeerCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    BeerCtrl = $controller('BeerCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
