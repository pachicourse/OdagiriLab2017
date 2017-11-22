var config = {
    name1: "残高   ",
    name2: "予想残高   ",
    name3: "一回だけ支払うお金   ",
    name4: "繰り返し支払うお金   ",
    name5: "入ってくるお金   "
}
var charts = {};

function ChartRenderer(elementId) {
    var chart = charts[elementId];
    if (!chart) {
        chart = new _ChartRenderer(elementId);
        charts[elementId] = chart;
    }

    return chart;
}


function thousandsSeparator(value, index, values) {
    value = Math.floor(value * 10) / 10;
    if (value < 0) {
        var answer = (-1 * value).toString().split(/(?=(?:...)*$)/).join(',');
        answer = "-" + answer;
    } else {
        var answer = '¥' + value.toString().split(/(?=(?:...)*$)/).join(',');
    }
    return answer;
}

function _ChartRenderer(elementId) {
    this.elementId = elementId;
    this.element = document.getElementById(elementId);
    this.data = {};
    this.max_tick_bar = 0;
    this.max_tick_line = 0;
    this.onSelect = function () {};
    //------------------------------------------------------//
    // setData
    //------------------------------------------------------//
    this.setData = function (json) {
        //現金のメモリの最大値計算
        this.max_tick_line = Math.max.apply(null, JSON.parse(json)['money'].map(function (o) {
            return o.sum;
        }));
        this.max_tick_line*= this.max_tick_line>=0?1.1:0.9;

        //棒グラフののメモリの最大値計算
        this.max_tick_bar = Math.max.apply(null, JSON.parse(json)['sales'].map(function (o) {
            return o.sum;
        }));
        this.max_tick_bar = Math.max(this.max_tick_bar, Math.max.apply(null, JSON.parse(json)['cost']['fixed'].map(function (o) {
            return o.sum;
        })));
        this.max_tick_bar = Math.max(this.max_tick_bar, Math.max.apply(null, JSON.parse(json)['cost']['variable'].map(function (o) {
            return o.sum;
        })));
        this.max_tick_bar *= 1.1;
        console.log(this.max_tick_bar);
        this.element.innerHTML = "";
        var canvas = document.createElement('canvas');
        this.element.appendChild(canvas);
        this.data = this.generateDataFromJSON(json);
        this.chart = new Chart(canvas.getContext("2d"), {
            type: 'bar',
            data: this.data[0],
            options: this.data[1]
        });
        var onSelect = this._onSelect;
        var _this = this;
        canvas.addEventListener('click', function (e) {
            onSelect.call(_this, e);
        });

        var org = this.chart.tooltip.update;
        var tt = this.chart.tooltip;
        this.chart.tooltip.update = function (a1, a2, a3) {
            org.call(tt, a1);
            document.body.style.cursor = tt._active.length > 0 ? "pointer" : "default";
        }
    }
    this._onSelect = function (e) {
        var elems = this.chart.getElementAtEvent(e);
        if (!elems || !elems[0]) return;
        var date = this.data[0].labels[elems[0]._index];
        var ids = ["money", "money", "sales", "variable", "fixed"];
        var dataset = ids[elems[0]._datasetIndex];
        this.onSelect({
            date: date,
            type: dataset
        });
    }
    //------------------------------------------------------//
    // generateData
    //------------------------------------------------------//
    this.generateDataFromJSON = function (json) {
        var object = JSON.parse(json);

        var sales = [];
        var variables = [];
        var fixeds = [];
        var moneys = [];
        var fmoneys = [];
        var chartData = {
            labels: [],
            datasets: [
                {
                    type: 'line',
                    label: config.name1,
                    borderColor: window.chartColors.yellow,
                    borderWidth: 2,
                    fill: false,
                    data: moneys,
                    lineTension: 0,
                    yAxisID: "y-axis-2"
            },
                {
                    type: 'line',
                    label: config.name2,
                    borderColor: window.chartColors.yellow,
                    borderWidth: 2,
                    borderDash: [5, 5],
                    fill: false,
                    data: fmoneys,
                    lineTension: 0,
                    yAxisID: "y-axis-2"
            },
                {
                    type: 'bar',
                    label: config.name5,
                    backgroundColor: window.chartColors.blue,
                    data: sales
            }, {
                    type: 'bar',
                    stack: 's1',
                    label: config.name3,
                    backgroundColor: window.chartColors.red,
                    data: variables,
         }, {
                    type: 'bar',
                    stack: 's1',
                    label: config.name4,
                    backgroundColor: window.chartColors.pink,
                    data: fixeds
         }]
        };
        var cm = false;
        var today = new Date();
        today.setMonth(today.getMonth() - 1);
        for (var i = 0; i < object.cost.fixed.length; i++) {
            var date = object.cost.fixed[i].date;
            var fixed = object.cost.fixed[i].sum;
            var variable = object.cost.variable[i].sum;
            var sale = object.sales[i].sum;
            var money = object.money[i].sum;

            chartData.labels.push(date);
            fixeds.push(fixed);
            variables.push(variable);
            sales.push(sale);
            var td = new Date(date);
            if (date.split('-')[2] == undefined) {
                td = new Date(td.getFullYear(), td.getMonth() + 1, 0);
            } else {
                td = new Date(td.getFullYear(), td.getMonth() - 1, Number(date.split('-')[2])+1);
            }
            if (td.getTime() < today.getTime()) {
                moneys.push(money);
                fmoneys.push(NaN);
            } else {
                if (!cm) {
                    moneys.push(money);
                } else {
                    moneys.push(NaN);
                }
                cm = true;
                fmoneys.push(money);
            }
        }
        var option = {
            tooltips: {
                titleFontSize: 15,
                bodyFontSize: 20,
                callbacks: {
                    label: function (tooltipItem, data) {
                        return thousandsSeparator(data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index]);
                    }
                }
            },
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                yAxes: [{
                    id: "y-axis-1",
                    type: "linear",
                    position: "left",
                    ticks: {
                        max: Math.floor(this.max_tick_bar),
                        userCallback: thousandsSeparator
                    },
            }, {
                    id: "y-axis-2",
                    type: "linear",
                    position: "right",
                    ticks: {
                        max: Math.floor(this.max_tick_line),
                        userCallback: thousandsSeparator
                    },
                    gridLines: {
                        drawOnChartArea: false,
                    },
            }],
            }
        };
        return [chartData, option];
    }
}
var chartColors = {
    red: 'rgb(255, 43, 87)',
    pink: 'rgb(255, 130, 132)',
    orange: 'rgb(255, 159, 64)',
    yellow: 'rgb(255, 205, 86)',
    green: 'rgb(75, 192, 192)',
    blue: 'rgb(54, 162, 235)',
    purple: 'rgb(153, 102, 255)',
    grey: 'rgb(201, 203, 207)'
};
