(function () {
  'use strict';

  angular
    .module('core')
    .factory('FlyConditionService', FlyConditionService);

  FlyConditionService.$inject = ['$http', '$q'];

  function FlyConditionService($http, $q) {
    var service = {
      getFlyCondition: getFlyCondition,
      getBlacklist: getBlacklist,
    };

    return service;
    /////////////////////

    function getFlyCondition(lat, lng) {
      console.log("POST /api/flyCondition");
      return $http({
        url: "/api/flyCondition",
        method: 'POST',
        dataType: 'json',
        data: {
          lat: lat,
          lon: lng
        }
      }).then(handleSuccess, handleError);
    }

    function getBlacklist() {
      return $http({
        url: "/api/flyCondition/blacklist",
        method: 'GET',
        dataType: 'json'
      }).then(handleSuccess, handleError);
    }

    // private functions
    function handleSuccess(response) {
      return $q.resolve(response.data);
    }

    function handleError(response) {
      return $q.reject(response);
    }
  }
}());
