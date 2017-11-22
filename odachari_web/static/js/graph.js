var app = angular.module('app', []);
var year = new Date().getFullYear();
//ハッシュに年がセットされているか見る。
var set_year = location.href.split("#");
set_year = set_year.length > 1 ? set_year[set_year.length - 1] : undefined;
if (set_year != undefined) {
    year = set_year;
}
app.config(function ($interpolateProvider) {
    $interpolateProvider.startSymbol('[[');
    $interpolateProvider.endSymbol(']]');
});

app.controller('PageController', ['$scope', '$http', '$q', function ($scope, $http, $q) {
    $scope.current = year;
    $scope.check_date_format = function (check_date) {
        if (check_date == undefined) {
            return true;
        }
        return false;
    }

    $scope.GraphInit = function () {
        location.hash = "#" + year;
        $scope.current = location.hash;
        $http({
            method: 'GET',
            url: '../api/graph-data',
            params: {
                api_key: $scope.api_key,
                start: year + "-01",
                end: year + "-12"
            }
        }).
        then(function onSuccess(response) {
            var json = JSON.stringify(response.data);
            console.log(json);
            ChartRenderer("chart").setData(json);

        }, function onError(response) {
            //通信に失敗
            deferred.reject(0);
        });
    }
    $scope.prev = function () {
        year--;
        location.hash = "#" + year;
        $scope.current = location.hash;
        $http({
            method: 'GET',
            url: '../api/graph-data',
            params: {
                api_key: $scope.api_key,
                start: year + "-01",
                end: year + "-12"
            }
        }).
        then(function onSuccess(response) {
            var json = JSON.stringify(response.data);
            console.log(json);
            ChartRenderer("chart").setData(json);

        }, function onError(response) {
            //通信に失敗
            deferred.reject(0);
        });
    }
    $scope.next = function () {
        year++;
        location.hash = "#" + year;
        $scope.current = location.hash;
        $http({
            method: 'GET',
            url: '../api/graph-data',
            params: {
                api_key: $scope.api_key,
                start: year + "-01",
                end: year + "-12"
            }
        }).
        then(function onSuccess(response) {
            var json = JSON.stringify(response.data);
            console.log(json);
            ChartRenderer("chart").setData(json);

        }, function onError(response) {
            //通信に失敗
            deferred.reject(0);
        });
        ChartRenderer("chart").onSelect = function (data) {
            console.log(data);
            //クリックイベント
        }

    }
    if (!Modernizr.inputtypes.date) {
        $scope.date_is_enable = false;
    } else {
        $scope.date_is_enable = true;
    }
//    $scope.check_date_enable(){
//            if (!Modernizr.inputtypes.date) {
//        $scope.date_is_enable = false;
//    } else {
//        $scope.date_is_enable = true;
//    }
//    }
    $scope.set_picker = function () {
            if (!Modernizr.inputtypes.date) {
        $scope.date_is_enable = false;
    } else {
        $scope.date_is_enable = true;
    }

            $(function () {
                $('.datepicker-default .date').datepicker({
                    format: "yyyy-mm-dd",
                    language: 'ja'
                });
                $('.datepicker-month .date').datepicker({
                    autoclose: true,
                    minViewMode: 1,
                    format: 'yyyy-mm',
                    language: 'ja'
                });
            });
    }
}]);

