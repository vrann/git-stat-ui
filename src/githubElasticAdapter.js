const elasticsearch = require ('elasticsearch-browser');

function esFactory(host, index, $scope) {
    var client = elasticsearch.Client({
        host: host
    });
    client.ping({
        // ping usually has a 3000ms timeout
        requestTimeout: Infinity
    }, function (error) {
        if (error) {
            console.trace('elasticsearch cluster is down!');
        } else {
            //console.log('All is well');
        }
    });

    return githubElasticAdapter(index, client);
}

function githubElasticAdapter (index, connection) {

    return {
        loadPullRequests: function (handler, interval, intervalValue) {
            console.log(interval);
            var aggregateInterval = "month";
            var aggregateFormat = "yyyy-MM";
            var filter = {"match_all":{}};
            if (interval === "week") {
                aggregateInterval = "week";
                aggregateFormat = "yyyy-MM w";
                filter = {
                    "range" : {
                        "closed_at" : {
                            "gte" : intervalValue,
                            "lt" :  intervalValue+"||+1M/d"
                        }
                    }
                }
            } else if (interval === "day") {
                aggregateInterval = "day";
                aggregateFormat = "yyyy-MM-dd";
                filter = {
                    "range" : {
                        "closed_at" : {
                            "gte" : intervalValue,
                            "lt" :  intervalValue+"||+1w/d"
                        }
                    }
                }
            }
            filter["byField"] = function(field) {
                if (this.range) {
                    var newFilter = {
                        "range": {}
                    };
                    newFilter.range[field] = this.range.closed_at;
                    return newFilter;
                } else {
                    return this;
                }
            }
            connection.search({
                index: index,
                body: {
                    "query":
                    {
                        "match_all":{}
                    },
                    "aggs" : {
                        "community_closed_per_month" : {
                            "filter" : {
                                "bool": {
                                    "should": [
                                        { "term": { "assignee.login": "davidalger" }},
                                        { "term": { "assignee.login": "orlangur" }},
                                        { "term": { "assignee.login": "miguelbalparda" }},
                                        { "term": { "assignee.login": "avoelkl" }},
                                        { "term": { "assignee.login": "fooman" }},
                                        { "term": { "assignee.login": "mzeis" }},
                                        { "term": { "assignee.login": "schmengler" }},
                                        { "term": { "assignee.login": "vinai" }},
                                        { "term": { "assignee.login": "schmengler" }},
                                        { "term": { "assignee.login": "dmanners" }}
                                    ],
                                    "must": [
                                        filter.byField("closed_at")
                                    ]
                                }
                            },
                            "aggs": {
                                "numbers": {
                                    "date_histogram" : {
                                        "field" : "closed_at",
                                        "interval" : aggregateInterval,
                                        "format" : aggregateFormat
                                    }
                                }
                            }       
                        },
                        "closed_per_month" : {
                            "filter" : filter.byField("closed_at"),
                            "aggs": {
                                "closed_per_month": {
                                    "date_histogram" : {
                                        "field" : "closed_at",
                                        "interval" : aggregateInterval,
                                        "format" : aggregateFormat
                                    }
                                }    
                            }  
                        },
                        "merged_per_month" : {
                            "filter" : filter.byField("merged_at"),
                            "aggs": {
                                "merged_per_month": {
                                    "date_histogram" : {
                                        "field" : "merged_at",
                                        "interval" : aggregateInterval,
                                        "format" : aggregateFormat
                                    }
                                }
                            }       
                        },
                        "opened_per_month" : {
                            "filter" : filter.byField("created_at"),
                            "aggs": {
                                "opened_per_month": {
                                    "date_histogram" : {
                                        "field" : "created_at",
                                        "interval" : aggregateInterval,
                                        "format" : aggregateFormat
                                    }
                                }    
                            }    
                        }
                    }
                }
            }).then(function (response) {
                console.log(response);
                handler(response);
            }).catch(function(e) {
                console.log(e);
            })
        },
        loadContributors: function(handler) {
            connection.search({
                index: index,
                size: 0,
                body: {
                    "query":
                    {
                        "match_all":{}
                    },
                    "aggs" : {
                        "contributor_per_month": {
                            "date_histogram" : {
                                "field" : "merged_at",
                                "interval" : "month",
                                "format" : "yyyy-MM"
                            },
                            "aggs": {
                                "user" : {
                                    "terms" : { "field" : "user.login", "size": 100},
                                }
                            }
                        },
                    }
                }
            }).then(function (response) {
                console.log(response);
                handler(response);
            }).catch(function(e) {
                console.log(e);
            })
        }
    }   
}
module.exports = esFactory;