var app = angular.module('app', []);
//var year = new Date().getFullYear();
app.config(function ($interpolateProvider) {
    $interpolateProvider.startSymbol('[[');
    $interpolateProvider.endSymbol(']]');
});