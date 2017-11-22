app.controller('SalesPageController', ['$scope', '$http', '$q', function ($scope, $http, $q) {
    //    $scope.termcheck = false;
    $scope.day_list = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31];
    $scope.add_sales_start = new Date();
    $scope.add_sales_date = new Date();
    $scope.add_selected_day = new Date().getDate();
    $scope.ajax_get_customer = function () {
        var inserted_customer = "";

        if (location.href.indexOf('inserted_customer') != -1) {
            inserted_customer = location.href.split("inserted_customer=")[1].split("#")[0].split("&")[0];
            console.log(inserted_customer);
            $('#salesModal').modal();
            console.log(inserted_customer);
        }
        //        $scope.current_year = location.hash;
        var deferred = $q.defer();
        $http({
            method: 'GET',
            url: '/api/customer-list',
            params: {
                api_key: $scope.api_key
            }
        }).
        then(function onSuccess(response) {
            console.log(response.data)
            $scope.add_kokyaku_list = response.data;
            deferred.resolve(response.data);
            console.log(inserted_customer);
            if (inserted_customer != "") {
                $scope.add_kokyaku = inserted_customer;
            }
        }, function onError(response) {
            console.log("ajaxerror");
            deferred.reject(0);
        });
    }
    $scope.toggle_repeatcheck = function () {
        $scope.add_repeatcheck = $scope.add_repeatcheck == 'no' ? 'yes' : 'no';
    }

    $scope.toggle_termcheck = function () {
        $scope.add_termcheck = $scope.add_termcheck == 'no' ? 'yes' : 'no';
    }

}]);
