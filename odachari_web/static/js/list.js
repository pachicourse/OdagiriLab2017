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
        TableRenderer("table").setScopeElementId('list_ctrl');
        current_month = $scope.month;
        $scope.current = current_month;
        $http({
            method: 'GET',
            url: '../api/list',
            params: {
                api_key: $scope.api_key,
                month: $scope.month,
            }
        }).
        then(function onSuccess(response) {
            var json = JSON.stringify(response.data);
            console.log(json);
            TableRenderer("table").setData(json);
        }, function onError(response) {
            //通信に失敗
            deferred.reject(0);
        });
    }
    $scope.prev = function () {
        TableRenderer("table").setScopeElementId('list_ctrl');
        current_month = calc_last_month(current_month);
        $scope.current = current_month;
        $http({
            method: 'GET',
            url: '../api/list',
            params: {
                api_key: $scope.api_key,
                month: current_month,
            }
        }).
        then(function onSuccess(response) {
            var json = JSON.stringify(response.data);
            console.log(json);
            TableRenderer("table").setData(json);
        }, function onError(response) {
            //通信に失敗
            deferred.reject(0);
        });
    }
    $scope.next = function () {
        TableRenderer("table").setScopeElementId('list_ctrl');
        current_month = calc_next_month(current_month);
        $scope.current = current_month;
        $http({
            method: 'GET',
            url: '../api/list',
            params: {
                api_key: $scope.api_key,
                month: current_month,
            }
        }).
        then(function onSuccess(response) {
            var json = JSON.stringify(response.data);
            console.log(json);
            TableRenderer("table").setData(json);
        }, function onError(response) {
            //通信に失敗
            deferred.reject(0);
        });
    }
    $scope.method = 'openModal';
    
    $scope.openModal = function (type, id) {
        $scope.post_flag = true;

        //売上時のモーダル出現処理
        if (type == "sales") {
            $("#editSalesModal").modal();
            console.log($scope.api_key);
            $http({
                method: 'GET',
                url: '../api/detail',
                params: {
                    api_key: $scope.api_key,
                    type: "sales",
                    id: id
                }
            }).
            then(function onSuccess(response) {
                    var json = response.data;
                    console.log(json);
                    $scope.salesname = json['salesname'];
                    $scope.sales = json['sales'];
                    $scope.kokyaku = "";
                    $scope.sales_id = json['_id'];
                    $scope.term_on = false;
                    $scope.termcheck = "no";
                    $scope.repeatcheck = "no";
                    $scope.repeat_on = false;

                    if (Modernizr.inputtypes.date) {
                        $scope.start = new Date();
                        $scope.end = new Date();
                        $scope.date = new Date();
                    } else {
                        $scope.start = new Date().getFullYear() + '-' + ('00' + (Number(new Date().getMonth()) + 1)).slice(-2);
                        $scope.end = new Date().getFullYear() + '-' + ('00' + (Number(new Date().getMonth()) + 1)).slice(-2);
                        $scope.date = new Date().getFullYear() + '-' + ('00' + (Number(new Date().getMonth()) + 1)).slice(-2) + '-' + ('00' + (Number(new Date().getDate()))).slice(-2)
                    }
                    if ('date' in json) {
                        if (Modernizr.inputtypes.date) {
                            $scope.date = new Date(json['date']);
                        } else {
                            $scope.date = new Date(json['date']).getFullYear() + '-' + ('00' + (Number(new Date(json['date']).getMonth()) + 1)).slice(-2) + '-' + ('00' + (Number(new Date(json['date']).getDate()))).slice(-2);
                        }
                    } else if ('start' in json) {
                        $scope.repeatcheck = "yes";
                        $scope.repeat_on = true;

                        if (Modernizr.inputtypes.date) {
                            $scope.start = new Date(json['start']);
                        } else {
                            $scope.start = new Date(json['start']).getFullYear() + '-' + ('00' + (Number(new Date(json['start']).getMonth()) + 1)).slice(-2)
                        }
                        $scope.selected_day = json['uriagebi'];

                        if ('end' in json) {
                            $scope.termcheck = "yes";
                            $scope.repeat_on = true;
                            $scope.term_on = true;
                            if (Modernizr.inputtypes.date) {
                                $scope.end = new Date(json['end']);
                            } else {
                                $scope.end = new Date(json['end']).getFullYear() + '-' + ('00' + (Number(new Date(json['end']).getMonth()) + 1)).slice(-2)
                            }
                        }

                    }
                    if ('kokyaku_id' in json) {
                        $scope.kokyaku = json['kokyaku_id'];
                    }
                },
                function onError(response) {
                    //通信に失敗
                    deferred.reject(0);
                });

        }

        //        繰り返し支払うお金の処理
        if (type == "fixed") {
            $("#editFixedModal").modal();

            console.log($scope.api_key);
            $http({
                method: 'GET',
                url: '../api/detail',
                params: {
                    api_key: $scope.api_key,
                    type: "fixed",
                    id: id
                }
            }).
            then(function onSuccess(response) {
                    var json = response.data;
                    console.log(json);
                    $scope.costname = json['costname'];
                    $scope.cost = json['cost'];
                    $scope.cost_id = json['_id'];
                    $scope.term_on = false;
                    $scope.termcheck = "no";
                    $scope.repeatcheck = "no";
                    $scope.repeat_on = false;

                    if (Modernizr.inputtypes.date) {
                        $scope.start = new Date();
                        $scope.end = new Date();
                        $scope.date = new Date();
                    } else {
                        $scope.start = new Date().getFullYear() + '-' + ('00' + (Number(new Date().getMonth()) + 1)).slice(-2);
                        $scope.end = new Date().getFullYear() + '-' + ('00' + (Number(new Date().getMonth()) + 1)).slice(-2);
                        $scope.date = new Date().getFullYear() + '-' + ('00' + (Number(new Date().getMonth()) + 1)).slice(-2) + '-' + ('00' + (Number(new Date().getDate()))).slice(-2)
                    }
                    if ('date' in json) {
                        if (Modernizr.inputtypes.date) {
                            $scope.date = new Date(json['date']);
                        } else {
                            $scope.date = new Date(json['date']).getFullYear() + '-' + ('00' + (Number(new Date(json['date']).getMonth()) + 1)).slice(-2) + '-' + ('00' + (Number(new Date(json['date']).getDate()))).slice(-2);
                        }
                    } else if ('start' in json) {
                        $scope.repeatcheck = "yes";
                        $scope.repeat_on = true;

                        if (Modernizr.inputtypes.date) {
                            $scope.start = new Date(json['start']);
                        } else {
                            $scope.start = new Date(json['start']).getFullYear() + '-' + ('00' + (Number(new Date(json['start']).getMonth()) + 1)).slice(-2)
                        }
                        $scope.selected_day = json['shiharaibi'];

                        if ('end' in json) {
                            $scope.termcheck = "yes";
                            $scope.repeat_on = true;
                            $scope.term_on = true;
                            if (Modernizr.inputtypes.date) {
                                $scope.end = new Date(json['end']);
                            } else {
                                $scope.end = new Date(json['end']).getFullYear() + '-' + ('00' + (Number(new Date(json['end']).getMonth()) + 1)).slice(-2)
                            }
                        }
                    }
                },
                function onError(response) {
                    //通信に失敗
                    deferred.reject(0);
                });
        }
        if (type == "variable") {
            $("#editVariableModal").modal();
            console.log($scope.api_key);
            $http({
                method: 'GET',
                url: '../api/detail',
                params: {
                    api_key: $scope.api_key,
                    type: "fixed",
                    id: id
                }
            }).
            then(function onSuccess(response) {
                    var json = response.data;
                    console.log(json);
                    $scope.costname = json['costname'];
                    $scope.cost = json['cost'];
                    $scope.cost_id = json['_id'];
                    if (Modernizr.inputtypes.date) {
                        $scope.start = new Date();
                        $scope.date = new Date(json['date']);
                    } else {
                        $scope.start = new Date().getFullYear() + '-' + ('00' + (Number(new Date().getMonth()) + 1)).slice(-2) + '-' + ('00' + (Number(new Date().getDate()))).slice(-2);
                        $scope.start = new Date(json['start']).getFullYear() + '-' + ('00' + (Number(new Date(json['start']).getMonth()) + 1)).slice(-2) + '-' + ('00' + (Number(new Date(json['start']).getDate()))).slice(-2);

                    }

                    //                    $scope.date = new Date();
                    //                    $scope.date = new Date(json['date']);
                },
                function onError(response) {
                    //通信に失敗
                    deferred.reject(0);
                });
        }
        if (type == "money") {
            $("#editMoneyModal").modal();
            console.log($scope.api_key);
            $http({
                method: 'GET',
                url: '../api/detail',
                params: {
                    api_key: $scope.api_key,
                    type: "money",
                    id: id
                }
            }).
            then(function onSuccess(response) {
                    var json = response.data;
                    console.log(json);
                    $scope.money = json['money'];
                    $scope.money_id = json['_id'];
                    $scope.date = new Date();
                    $scope.date = new Date(json['date']);
                },
                function onError(response) {
                    //通信に失敗
                    deferred.reject(0);
                });
        }

    }
    $scope.ajax_get_customer = function () {
        var deferred = $q.defer();
        $http({
            method: 'GET',
            url: '/api/customer-list',
            params: {
                api_key: $scope.api_key
            }
        }).
        then(function onSuccess(response) {
            $scope.kokyaku_list = response.data;
            deferred.resolve(response.data);
        }, function onError(response) {
            //通信に失敗
            deferred.reject(0);
        });
    }
    $scope.day_list = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31];

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
    $scope.toggle_repeatcheck = function () {
        $scope.repeatcheck = $scope.repeatcheck == 'no' ? 'yes' : 'no';
    }

    $scope.toggle_termcheck = function () {
        $scope.termcheck = $scope.termcheck == 'no' ? 'yes' : 'no';
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
