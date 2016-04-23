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
    vm.customSectors = [
      {
        color: "#a9d70b",
        lo: 0,
        hi: 69
      },
      {
        color: "#f9c802",
        lo: 70,
        hi: 89
      },
      {
        color: "#ff0000",
        lo: 90,
        hi: 100
      }
    ];

    vm.search = search;
    vm.clearAddress = clearAddress;
    vm.showInfoWindow = function(evt) {
      var newPos = {lat: vm.pos.lat() - 0.1, lng: vm.pos.lng()};
      vm.map.setCenter(newPos);
      vm.map.markers.focus.setVisible(true);
      vm.map.showInfoWindow('info', vm.map.markers.focus);
    };

    NgMap.getMap().then(function(map) {
      vm.map = map;
    });

    function search() {
      vm.pos = this.getPlace().geometry.location;
      var lat = vm.pos ? vm.pos.lat() : 0;
      var lng = vm.pos ? vm.pos.lng() : 0;
      FlyConditionService.getFlyCondition(lat, lng).then(getFlyConditionSuccess, getFlyConditionFailed);

      function getFlyConditionSuccess(result) {
        console.log(result);
        vm.flyCondition = result[0];
        vm.showInfoWindow();
      }

      function getFlyConditionFailed(error) {
        console.error(error);
      }
    }

    function clearAddress() {
      vm.address = "";
    }
  }

})();
