var app = angular.module('app', []);
//var year = new Date().getFullYear();
app.config(function ($interpolateProvider) {
    $interpolateProvider.startSymbol('[[');
    $interpolateProvider.endSymbol(']]');
});
app.controller('PageController', ['$scope', '$http', '$q', function ($scope, $http, $q) {
    var current_month;
    //    var bottom_month;
    $scope.check_date_format = function (check_date) {
//        console.log("hoge")
        if (check_date == undefined) {
            return true;
        }
        return false;
    }

    $scope.tableInit = function () {
        console.log("table init");
        TableRenderer("table").setScopeElementId('list_ctrl');
        current_month = $scope.month;
        $scope.current = current_month;
        $http({
            method: 'GET',
            url: '../api/all-user',
            params: {
                api_key: $scope.api_key,
                month: $scope.month,
            }
        }).
        then(function onSuccess(response) {
            console.log("ajax");
            var json = JSON.stringify(response.data);
            console.log(json);
            TableRenderer("table").setData(json);
        }, function onError(response) {
            //通信に失敗
            console.log("ajax error");
            deferred.reject(0);
        });
    }
}]);