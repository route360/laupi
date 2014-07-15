'use strict';

describe('Service: TableParamFactory', function () {

  // load the service's module
  beforeEach(module('route360DemoApp'));

  // instantiate service
  var TableParamFactory;
  beforeEach(inject(function (_TableParamFactory_) {
    TableParamFactory = _TableParamFactory_;
  }));

  it('should do something', function () {
    expect(!!TableParamFactory).toBe(true);
  });

});
