'use strict';

/**
 * @ngdoc service
 * @name route360DemoApp.TableParamFactory
 * @description
 * # TableParamFactory
 * Factory in the route360DemoApp.
 */
angular.module('route360DemoApp')
  .factory('TableParamFactory', function ($filter, $timeout, ngTableParams) {

    // Public API here
    return {
        create : function (apartments) {

            var tableParams = new ngTableParams(
                { page : 1, count : 10, sorting: { averageTravelTime : 'asc' } }, 
                {
                    counts : [],
                    total: apartments.length,
                    getData: function($defer, params) {

                        $timeout(
                            function() {

                                var data = apartments;
                                var orderedData = params.sorting() ? $filter('orderBy')(data, params.orderBy()) : data;
                                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
                            },
                        400);
                    },
                    $scope: { $data: {} }
                });

            return tableParams;
        }
    };
  });
