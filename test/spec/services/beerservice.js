'use strict';

describe('Service: beerService', function () {

  // load the service's module
  beforeEach(module('route360DemoApp'));

  // instantiate service
  var beerService;
  beforeEach(inject(function (_beerService_) {
    beerService = _beerService_;
  }));

  it('should do something', function () {
    expect(!!beerService).toBe(true);
  });

});
