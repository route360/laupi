'use strict';

describe('Service: ApartmentService', function () {

  // load the service's module
  beforeEach(module('route360DemoApp'));

  // instantiate service
  var ApartmentService;
  beforeEach(inject(function (_ApartmentService_) {
    ApartmentService = _ApartmentService_;
  }));

  it('should do something', function () {
    expect(!!ApartmentService).toBe(true);
  });

});
