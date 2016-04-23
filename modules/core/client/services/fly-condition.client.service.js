(function () {
  'use strict';

  angular
    .module('core')
    .factory('FlyConditionService', FlyConditionService);

  FlyConditionService.$inject = ['$http', '$q'];

  function FlyConditionService($http, $q) {
    var service = {
      getFlyCondition: getFlyCondition
    };

    return service;
    /////////////////////

    function getFlyCondition(lat, lng) {
      console.log("GET /api/flyCondition/" + lat + '/' + lng);
      return $http({
        url: "/api/flyCondition/" + lat + '/' + lng,
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
