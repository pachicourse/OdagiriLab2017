app.controller('FixedPageController', ['$scope', function ($scope) {
    //    $scope.termcheck = false;
    $scope.fixed_start = new Date();
    $scope.fixed_date = new Date();
    $scope.selected_day = new Date().getDate();
    $scope.day_list = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31]
    $scope.toggle_repeatcheck = function () {
        $scope.add_repeatcheck = $scope.add_repeatcheck=='no'?'yes':'no';
    }
    
        $scope.toggle_termcheck = function () {
        $scope.add_termcheck = $scope.add_termcheck=='no'?'yes':'no';
    }


}]);
