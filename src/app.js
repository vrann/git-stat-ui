
import 'angular';
import 'angular-ui-router';
import 'ui-router-extras';
import 'chart.js'
import 'angular-chart.js';
import elasticsearch from 'elasticsearch-browser';
import 'angular-ui-bootstrap';
import ElasticToChartsMapper from './map-elastic-to-chart.js'
import esFactory from './githubElasticAdapter.js'


'use strict';
var app = angular.module('gitStatUI', ['chart.js', 'ui.bootstrap']);

app.config(function (ChartJsProvider) {
        // Configure all charts
        ChartJsProvider.setOptions({
            colors: ['#97BBCD', '#DCDCDC', '#F7464A', '#46BFBD', '#FDB45C', '#949FB1', '#4D5360']
        });
    });

app.controller('OMCcontroller', ['$scope', function ($scope) {
    $scope.currentInterval = 'month';
    $scope.intervalValue = '';
    var clickHandler = function(event, chartData) {
        console.log(chartData[0]._model.label);
        $scope.intervalValue = chartData[0]._model.label;
        console.log($scope.currentInterval);
        if ($scope.currentInterval === 'month') {
            $scope.currentInterval = 'week'
        } else if ($scope.currentInterval === 'week') {
            $scope.currentInterval = 'day'
        }

        $scope.$apply(function() {
            if (chartData.length > 0) {
                esFactory('http://54.225.39.159:9200', 'get_pull_requests')
                    .loadPullRequests(ElasticToChartsMapper($scope, '', clickHandler).createMapper, $scope.currentInterval, $scope.intervalValue); 
            }
        });
    }
    esFactory('http://54.225.39.159:9200', 'get_pull_requests')
        .loadPullRequests(ElasticToChartsMapper($scope, '', clickHandler).createMapper);
}]);



app.controller('ContributorsController', ['$scope', function ($scope) {
    esFactory('http://54.225.39.159:9200', 'get_pull_requests')
        .loadContributors(ElasticToChartsMapper($scope, 'Contributors', console.log).contributorsMapper);  
}]);









//     'use strict';

// console.log("test")  


//   app.controller('StackedBarCtrl', ['$scope', 'esFactory', function ($scope, esFactory) {


//                 // var client = new elasticsearch.Client({
//                 //     host: 'deployment.vm:9200',
//                 //     log: 'trace'
//                 // });
//                 var client = esFactory({
//                     host: 'http://localhost:9200'
//                 });
//                 client.ping({
//                     // ping usually has a 3000ms timeout
//                     requestTimeout: Infinity
//                 }, function (error) {
//                     if (error) {
//                         console.trace('elasticsearch cluster is down!');
//                     } else {
//                         console.log('All is well');
//                     }
//                 });

//         // client.search({
//         //     index: 'get_pull_requests',
//         //     size: 50,
//         //     body: {
//         //         "query": {
//         //             "bool": {
//         //                 "must":     [
//         //                     { "match": {"state": "open"}},
//         //                     { "range": { "created_at": { "lte": "2016" }}}
//         //                 ]
//         //             }
//         //         }
//         //     }
//         // }).then(function (response) {
//         //     var urls = response.hits.hits.map(function(a) {return a._source.html_url;});
//         //     console.log(urls);
//         // });

//                 client.search({
//                     index: 'get_pull_requests',
//                     //size: 50,
//                     body: {
//                         "query":
//                         {
//                             // "match": {
//                             //     "title": "constructor"
//                             // }
//                             "match_all":{}
//                         },
//                         "aggs" : {
//                             "closed_per_month" : {
//                                 "date_histogram" : {
//                                     "field" : "closed_at",
//                                     "interval" : "month",
//                                     "format" : "yyyy-MM"
//                                 }
//                             },
//                             "merged_per_month" : {
//                                 "date_histogram" : {
//                                     "field" : "merged_at",
//                                     "interval" : "month",
//                                     "format" : "yyyy-MM"
//                                 }
//                             },
//                             "opened_per_month" : {
//                                 "date_histogram" : {
//                                     "field" : "created_at",
//                                     "interval" : "month",
//                                     "format" : "yyyy-MM"
//                                 }
//                             },
//                         }
//                     }
//                 }).then(function (response) {
//                     console.log(1);
//                     $scope.hits = response.hits.hits;
//                     $scope.aggs = response.aggregations;
//                     console.log($scope.aggs);
//                     $scope.type = 'StackedBar';
//                     $scope.series = ['Opened', 'Merged', 'Closed'];
//                     $scope.options = {
//                         scales: {
//                             xAxes: [{
//                                 stacked: true,
//                             }],
//                             yAxes: [{
//                                 stacked: true
//                             }]
//                         },
//                         onClick: handleClick
//                     };

//                     function handleClick (e) {
//                         var chart = $scope.$$childHead.chart;
//                         var activeElement = chart.getElementAtEvent(e);
//                         console.log(activeElement);
//                         if (activeElement.length > 0) {
//                             var slice = activeElement[0]._model.datasetLabel;
//                             var range = activeElement[0]._model.label;
//                             console.log(slice, range);
//                             //$window.location.href(' #' + slice + '-' + range);
//                             $scope.$apply(function() {
//                                 $scope.data = [
//                                     [65, 59, 80, 81, 56, 55, 40],
//                                     [28, 48, 40, 19, 86, 27, 90]
//                                 ];
//                             })
//                         }
//                     }

//                     // $scope.$apply(function($scope) {
//                     //     $scope.labels = $scope.aggs.opened_per_month.buckets.map(function(a) {return a[config.labelsFrom];});
//                     //     $scope.data = [];
//                     //     var obj = {};
//                     //     $scope.data[0] = $scope.aggs.opened_per_month.buckets.map(function(a) {obj[a.key_as_string] = a.doc_count; return a.doc_count;});
//                     //     console.log(obj);
//                     //     $scope.data[1] = $scope.aggs.merged_per_month.buckets.map(function(a) {return a.doc_count;});
//                     //     $scope.data[2] = $scope.aggs.closed_per_month.buckets.map(function(a) {return a.doc_count;});
//                     // })
//                     //$scope.$apply(mapElasticToCharts($scope, { labelsFrom: 'key_as_string' }))

//                     console.log($scope.data);

//                 });


//         // $scope.StackedBar.onClick = function (points, event) {
//         //     console.log(points);
//         //     var chart = points[0]._chart.controller;
//         //     var activeElement = chart.getElementAtEvent(e);
//         //     console.log(activeElement);
//         // }

//         //console.log($scope.aggs);
//         console.log(2);
//    }]);

