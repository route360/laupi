'use strict';

describe('Service: ApartmentFactory', function () {

  // load the service's module
  beforeEach(module('route360DemoApp'));

  // instantiate service
  var ApartmentFactory;
  beforeEach(inject(function (_ApartmentFactory_) {
    ApartmentFactory = _ApartmentFactory_;
  }));

  it('should do something', function () {
    expect(!!ApartmentFactory).toBe(true);
  });

});
