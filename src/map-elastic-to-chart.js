function ElasticToChartsMapper($scope) {
    this.$scope = $scope;
}

function ElasticToChartsMapper($scope, alias, clickHandler) {
    return {
        createMapper: function(config) {
            $scope.$apply(function() {
                $scope.type = 'StackedBar';
                $scope['series'+alias] = ['Opened', 'Merged', 'Rejected', 'By Maintainers'];
                
                $scope['options'+alias] = {
                    responsive: true,
                    legend: {
                        display: true,
                        // labels: {
                        //     fontColor: 'rgb(255, 99, 132)'
                        // }
                    },
                    onClick: clickHandler,
                };
                
                var mergedPRs = {};
                var closedPrs = {};
                var chartData = {
                    labels: config.aggregations.opened_per_month.opened_per_month.buckets.map(function(a) {return a.key_as_string;}),
                    opened: config.aggregations.opened_per_month.opened_per_month.buckets.map(function(a) {return a.doc_count;}),
                    merged: config.aggregations.merged_per_month.merged_per_month.buckets.map(function(a) {mergedPRs[a.key_as_string] = a.doc_count; return a.doc_count;}),
                    closed: config.aggregations.closed_per_month.closed_per_month.buckets.map(function(a) {return a.doc_count - mergedPRs[a.key_as_string];}),
                    community: []
                }
                var community = {}
                config.aggregations.community_closed_per_month.numbers.buckets.map(function(a) {
                    community[a.key_as_string] = a.doc_count;
                });
                console.log(community);
                console.log(chartData);
                function cut(obj, count) {
                    return {
                        labels: obj.labels.slice(Math.max(obj.labels.length - count, 1)),
                        opened: obj.opened.slice(Math.max(obj.opened.length - count, 1)),
                        merged: obj.merged.slice(Math.max(obj.merged.length - count, 1)),
                        closed: obj.closed.slice(Math.max(obj.closed.length - count, 1)),
                        community: []
                    }
                }
                var cutData = cut(chartData, 8);
                cutData.labels.map(function(a) {
                    if (a in community) {
                        cutData.community.push(community[a])
                    } else {
                        cutData.community.push(0)
                    }
                });
                $scope['labels'+alias] = cutData.labels
                $scope['data'+alias] = [cutData.opened,cutData.merged,cutData.closed,cutData.community];
            });
        },
        contributorsMapper: function(config) {
            $scope.$apply(function() {
                $scope.type = 'StackedBar';
                $scope['series'+alias] = ['1st', '2nd', '3d'];
                
                $scope['options'+alias] = {
                    onClick: clickHandler,
                    multiTooltipTemplate: "<%= datasetLabel %> - <%= value %>",
                    tooltips: {
                        callbacks: {
                            beforeLabel: function(tooltipItem, data) {
                                console.log(data);
                                //console.log(tooltipItem);
                                return contributors[tooltipItem.xLabel][tooltipItem.datasetIndex];
                            }
                        }
                    }
                };
                
                var chartData = {
                    labels: config.aggregations.contributor_per_month.buckets.map(function(a) {return a.key_as_string;}),
                    top0: [],
                    top1: [],
                    top2: []
                    //top2: config.aggregations.merged_per_month.buckets.map(function(a) {return a.doc_count;}),
                    //top3: config.aggregations.closed_per_month.buckets.map(function(a) {return a.doc_count;}),
                    
                }
                var contributors = {};
                config.aggregations.contributor_per_month.buckets.map(function(a) {
                    var obj = {};
                    contributors[a.key_as_string] = [];
                    for (i = 0; i < 3; i++) {
                        if (i > a.user.buckets.length -1) {
                            chartData["top" + i].push(0);
                            contributors[a.key_as_string].push("NaN");
                        } else {
                            chartData["top" + i].push(a.user.buckets[i].doc_count);
                            contributors[a.key_as_string].push(a.user.buckets[i].key);
                        }
                        
                        //obj[a.user.buckets[i].key] = a.user.buckets[i].doc_count;
                    }    
                    //return obj;
                });

                function cut(obj, count) {
                    return {
                        labels: obj.labels.slice(Math.max(obj.labels.length - count, 1)),
                        top0: obj.top0.slice(Math.max(obj.top0.length - count, 1)),
                        top1: obj.top1.slice(Math.max(obj.top1.length - count, 1)),
                        top2: obj.top2.slice(Math.max(obj.top2.length - count, 1)),
                    }
                }
                var cutData = cut(chartData, 8)
                $scope['labels'+alias] = cutData.labels
                $scope['data'+alias] = [cutData.top0, cutData.top1, cutData.top2];

                console.log($scope);
            })    
        }   
    }
}



module.exports = ElasticToChartsMapper;