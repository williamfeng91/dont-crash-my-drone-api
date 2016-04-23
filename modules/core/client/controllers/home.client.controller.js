(function() {
  'use strict';

  angular
    .module('core')
    .controller('HomeController', HomeController);

  HomeController.$inject = ['FlyConditionService', 'NgMap'];

  function HomeController(FlyConditionService, NgMap) {
    var vm = this;
    // vm.address = "current-location";
    vm.googleMapsUrl = "https://maps.googleapis.com/maps/api/js&key=AIzaSyAqv9zZxqC-ixUCGQ_61-sgFHyptQFpRKk";
    vm.search = search;

    NgMap.getMap().then(function(map) {
      vm.map = map;
      vm.showCustomMarker= function(evt) {
        map.customMarkers.focus.setVisible(true);
        map.customMarkers.focus.setPosition(this.getPosition());
      };
      vm.closeCustomMarker= function(evt) {
        this.style.display = 'none';
      };
    });

    function search() {
      vm.place = this.getPlace();
      vm.address = vm.place.geometry.location;
      // console.log(vm.place);
      vm.map.setCenter(vm.place.geometry.location);

      FlyConditionService.getFlyCondition(vm.address.lat(), vm.address.lng()).then(getFlyConditionSuccess, getFlyConditionFailed);

      function getFlyConditionSuccess(result) {
        console.log(result);
      }

      function getFlyConditionFailed(error) {
        console.error(error);
      }
    }
  }

})();
