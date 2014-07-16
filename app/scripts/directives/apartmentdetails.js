'use strict';

/**
 * @ngdoc directive
 * @name route360DemoApp.directive:ApartmentDetails
 * @description
 * # ApartmentDetails
 */
angular.module('route360DemoApp')
    .directive('apartmentdetails', function () {
        return {
            template:  '<ul class="nav nav-tabs" role="tablist"> \
                          <li class="active"><a href="#home" role="tab" data-toggle="tab">Home</a></li> \
                          <li><a href="#profile" role="tab" data-toggle="tab">Profile</a></li> \
                          <li><a href="#messages" role="tab" data-toggle="tab">Messages</a></li> \
                        </ul> \
                        <!-- Tab panes --> \
                        <div class="tab-content"> \
                          <div class="tab-pane active" id="home">...</div> \
                          <div class="tab-pane" id="profile">...</div> \
                          <div class="tab-pane" id="messages">...</div> \
                        </div>',
            restrict: 'E'
        };
  });
