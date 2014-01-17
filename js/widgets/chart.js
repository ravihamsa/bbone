define([
        'base/app',
        'base'
    ],
    function(app, Base) {
        'use strict';

        var gridLineWidth = 0.1;
        var defaultColors = ['#ffc42b', '#0fafe8', '#66bb10', '#89A54E', '#80699B', '#3D96AE', '#DB843D', '#92A8CD', '#A47D7C', '#B5CA92'];
        var fillOpacities = [0.8, 0.8];

        var seriesFillColors = [{
            linearGradient: [
                0, 0, 0, 300
            ],
            stops: [
                [
                    0, '#ffcc48'
                ],
                [
                    1, '#fff6cd'
                ]
            ]

        }, {
            linearGradient: [
                0, 0, 0, 300
            ],
            stops: [
                [
                    0, '#0db2e8'
                ],
                [
                    1, '#e1f7ff'
                ]
            ]

        }];

        var ChartView = Base.View.extend({
            template: '<h1>{{title}}</h1><div class="chart-body"> </div>',
            serialize: function() {
                return this.collection.getConfigs();
            },
            postRender: function() {
                this.renderChart();
            },
            renderChart: function() {
                //this.$('.chart-body').html(JSON.stringify(this.collection.toJSON()));
                var collection = this.collection;
                var chartConfigs = collection.getConfigs();

                var series = collection.getSeries();
                var categories = collection.getCategories();
                var step = Math.ceil(categories.length / chartConfigs.maxXticks);

                this.$('.chart-body').highcharts({
                    chart: {
                        type: chartConfigs.type,
                    },
                    colors: chartConfigs.chartColors || defaultColors,
                    symbols: ['circle', 'circle', 'circle', 'circle', 'circle'],
                    title: {
                        text: ''
                    },
                    credits: {
                        enabled: false
                    },
                    series: series,
                    legend: {
                        enabled: chartConfigs.showLegend,
                        margin: 30,
                        verticalAlign: "top",
                        borderWidth: 0,
                        useHTML: true,
                        symbolWidth: 0,
                        labelFormatter: function() {
                            return "<div class='checkboxwidget'> <div class='checkboxColor boxchecked jqSymbol" + this.index + "'><span style='background-color:" + this.color + ";'></span><label style='color:" + this.color + "'>" + this.name + "</label></div></div>";
                        }
                    },
                    xAxis: {
                        startOnTick: true,
                        endOnTick: true,
                        tickmarkPlacement: "on",
                        tickLength: 0,
                        title: {
                            text: chartConfigs.xAxis,
                        },
                        minPadding: 0,
                        maxPadding: 0,
                        labels: {
                            step: step,
                            style: {
                                "font-size": "11px",
                                "font-family": "Arial"
                            }
                        },
                        categories: categories
                    },
                    yAxis: {
                        lineWidth: 1,
                        allowDecimals: false,
                        min: 0,
                        title: {
                            text: chartConfigs.yAxis,
                            style: {
                                "font-size": "12px",
                                "font-family": "Arial"
                            }
                        },
                        minPadding: 0,
                        gridLineWidth: gridLineWidth,
                        labels: {
                            enabled: true
                        },
                        stackLabels: {
                            enabled: true,
                            style: {
                                fontWeight: 'bold',
                                color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray'
                            }
                        }
                    },
                    tooltip: {
                        enabled: true,
                        formatter: function() {
                            var tooltipStr = "";
                            if (!this.x) {
                                tooltipStr = '<b>' + this.key + '</b> : ' + this.y + " ( " + (this.percentage).toFixed(2) + "% )";
                            } else {
                                tooltipStr = '<b>' + this.series.name + '</b><br/>' + this.x + ' : ' + this.y;
                            }
                            return tooltipStr;
                        }
                    },
                    plotOptions: {
                        bar: {
                            pointWidth: 35,
                            dataLabels: {
                                enabled: true
                            }
                        },
                        column: {
                            stacking: 'normal',
                            pointWidth: chartConfigs.pointWidth,
                            dataLabels: {
                                enabled: true
                            }
                        },
                        pie: {
                            allowPointSelect: true,
                            cursor: 'pointer',
                            shadow: true,
                            innerSize: "40%",
                            dataLabels: {
                                enabled: true,
                                color: '#000000',
                                connectorColor: '#000000',
                                formatter: function() {
                                    return '<b>' + this.point.name + '</b>: ' + (this.percentage).toFixed(2) + ' %';
                                }
                            },
                            states: {
                                hover: {
                                    enabled: false
                                }
                            }
                        },
                        area: {
                            stacking: (chartConfigs.isStacked) ? "normal" : null,
                        },
                        series: {
                            stacking: (chartConfigs.isStacked) ? "normal" : null,
                            lineWidth: 2,
                            shadow: false,
                            marker: {
                                enabled: false,
                                fillColor: '#FFFFFF',
                                lineWidth: 1.5,
                                lineColor: null,
                                radius: 3,
                                states: {
                                    hover: {
                                        enabled: true
                                    }
                                }
                            },
                            events: {
                                legendItemClick: function(event) {
                                    /*
                                    if (this.visible) {
                                        $(chartConfig.chartingElement).find(".jqSymbol" + this.index).removeClass("boxchecked");
                                    } else {
                                        $(chartConfig.chartingElement).find(".jqSymbol" + this.index).addClass("boxchecked");
                                    }
                                    */
                                }
                            }
                        },
                        line: {
                            marker: {
                                enabled: false,
                                states: {
                                    hover: {
                                        enabled: true
                                    }
                                }
                            },
                            events: {
                                legendItemClick: function(event) {
                                    /*
                                    if (this.visible) {
                                        $(chartConfig.chartingElement).find(".jqSymbol" + this.index).removeClass("boxchecked");
                                    } else {
                                        $(chartConfig.chartingElement).find(".jqSymbol" + this.index).addClass("boxchecked");
                                    }
                                    */
                                }
                            }
                        }
                    },
                    scrollbar: {
                        enabled: true
                    },

                    exporting: {
                        enabled: false
                    }
                });
            }
        });


        var ChartCollection = Base.Collection.extend({
            configDefaults: {
                type: 'line',
                yAxis: 'count',
                xAxis: 'category',
                showLegend: false,
                title: 'Chart Title',
                pointWidth: 20,
                isStacked: false,
                maxXticks: 8,
                step: 1
            },
            getCategories: function() {
                var xAxis = this.getConfig('xAxis');
                var collection = this;
                return collection.map(function(model) {
                    return model.get(xAxis);
                });
            },
            getSeries: function() {
                var yAxis = this.getConfig('yAxis').split(',');
                var collection = this;
                return _.map(yAxis, function(axisId, index) {
                    return {
                        name: axisId,
                        data: collection.map(function(model) {
                            return model.get(axisId);
                        }),
                        fillColor:seriesFillColors[index],
                        fillOpacity:fillOpacities[index]
                    };
                });
            }
        });

        //TODO: Line Bar Stacked Bar Staked Area Bar with negative stack Dual Axis with line

        return {
            View: ChartView,
            Collection: ChartCollection
        };

    });