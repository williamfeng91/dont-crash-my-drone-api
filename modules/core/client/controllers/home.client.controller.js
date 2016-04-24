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
    vm.showTooltip = showTooltip;
    vm.hideTooltip = hideTooltip;
    vm.showInfoWindow = function(evt) {
      var newPos = {lat: vm.pos.lat() - 0.1, lng: vm.pos.lng()};
      vm.map.setCenter(newPos);
      vm.map.markers.focus.setVisible(true);
      vm.map.shapes.focusCircle.setVisible(true);
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
        FlyConditionService.getBlacklist().then(getBlacklistSuccess, getBlacklistFailed);
        FlyConditionService.getUsers().then(
            function(result){
              vm.users = [];
              for (var i = 0; i < result.length; i++) {
                vm.users.push(result[i]);
              }
              console.log(vm.users);
            },
            function(error){
              console.error(error);
            }
        );
        function getBlacklistSuccess(result) {
          console.log(result);
          vm.airports = [];
          vm.popularAreas = [];
          for (var i = 0; i < result.length; i++) {
            if (result[i].type == 0) {
              result[i].color = '#ff0000';
              vm.airports.push(result[i]);
            } else {
              result[i].color = '#f9c802';
              vm.popularAreas.push(result[i]);
            }
          }
        }

        function getBlacklistFailed(error) {
          console.error(error);
        }
      }

      function getFlyConditionFailed(error) {
        console.error(error);
      }
    }

    function clearAddress() {
      vm.address = "";
    }

    function showTooltip(e, msg) {
      vm.map.getDiv().setAttribute('title', msg);
    }

    function hideTooltip(e) {
      vm.map.getDiv().removeAttribute('title');
    }
  }

})();
