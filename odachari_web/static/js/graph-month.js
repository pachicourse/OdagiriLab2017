var app = angular.module('app', []);
//var year = new Date().getFullYear();
var current_month = new Date().getFullYear() + '-' + ("0" + (new Date().getMonth() + 1)).slice(-2);

//ハッシュに年がセットされているか見る。
//var set_year = location.href.split("#");
//set_year = set_year.length > 1 ? set_year[set_year.length - 1] : undefined;
//if (set_year != undefined) {
//    year = set_year;
//}
app.config(function ($interpolateProvider) {
    $interpolateProvider.startSymbol('[[');
    $interpolateProvider.endSymbol(']]');
});

app.controller('PageController', ['$scope', '$http', '$q', function ($scope, $http, $q) {
    $scope.current = current_month;
    $scope.check_date_format = function (check_date) {
        if (check_date == undefined) {
            return true;
        }
        return false;
    }

    $scope.GraphInit = function () {
        location.hash = "#" + current_month;
        $scope.current = current_month;
        $http({
            method: 'GET',
            url: '../api/graph-data-month',
            params: {
                api_key: $scope.api_key,
                start: current_month,
                end: current_month
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
    $scope.now = function () {
        //        year--;
        current_month = current_month = new Date().getFullYear() + '-' + ("0" + (new Date().getMonth() + 1)).slice(-2);
        location.hash = "#" + current_month;
        $scope.current = location.hash;
        $http({
            method: 'GET',
            url: '../api/graph-data-month',
            params: {
                api_key: $scope.api_key,
                start: current_month,
                end: current_month
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
    $scope.go = function () {
        console.log($scope.move_month);
        if (!Modernizr.inputtypes.date) {
            current_month = $scope.move_month;
        } else {
            $scope.date_is_enable = true;
            current_month = $scope.move_month.getFullYear() + '-' + ("0" + ($scope.move_month.getMonth() + 1)).slice(-2);
        }
        location.hash = "#" + current_month;
        $scope.current = location.hash;
        $http({
            method: 'GET',
            url: '../api/graph-data-month',
            params: {
                api_key: $scope.api_key,
                start: current_month,
                end: current_month
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
        //        year--;
        current_month = calc_last_month(current_month);
        location.hash = "#" + current_month;
        $scope.current = location.hash;
        $http({
            method: 'GET',
            url: '../api/graph-data-month',
            params: {
                api_key: $scope.api_key,
                start: current_month,
                end: current_month
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
        current_month = calc_next_month(current_month);
        location.hash = "#" + current_month;
        $scope.current = location.hash;
        $http({
            method: 'GET',
            url: '../api/graph-data-month',
            params: {
                api_key: $scope.api_key,
                start: current_month,
                end: current_month
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
    $scope.large_screen = function () {
        console.log(window.innerWidth);
        return window.innerWidth >= 768 ? true : false;
    }
    if (!Modernizr.inputtypes.date) {
        $scope.date_is_enable = false;
    } else {
        $scope.date_is_enable = true;
    }
    $scope.set_picker = function () {
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

function calc_last_month(month) {
    var calc_year = month.split('-')[0];
    var calc_month = month.split('-')[1];
    var calc_date = new Date(calc_year, calc_month - 2);
    return calc_date.getFullYear() + '-' +
        ("0" + (calc_date.getMonth() + 1)).slice(-2);
}

function calc_next_month(month) {
    var calc_year = month.split('-')[0];
    var calc_month = month.split('-')[1];
    var calc_date = new Date(calc_year, calc_month);
    return calc_date.getFullYear() + '-' +
        ("0" + (calc_date.getMonth() + 1)).slice(-2);

}
