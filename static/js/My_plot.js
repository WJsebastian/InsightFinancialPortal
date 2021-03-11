function plot_stuff(company) {
    var html = 'http://3.83.182.118/'+company+'.csv' 
    // "/getTickers?company="+company
    Plotly.d3.csv(html, function (err, rows) {

        function unpack(rows, key) {
            return rows.map(function (row) { return row[key]; });
        }
        var d = new Date()
        var d1=d.getFullYear()+'-'+d.getMonth()+'-'+d.getDate()
        var d2=d.getFullYear()+'-'+d.getMonth()+'-'+(d.getDate()+4)

        var trace1 = {
            type: "scatter",
            mode: "lines",
            name: company+'.High',
            x: unpack(rows, 'Date'),
            y: unpack(rows, 'High'),
            line: { color: '#17BECF' }
        }

        var trace2 = {
            type: "scatter",
            mode: "lines",
            name: company+'.Low',
            x: unpack(rows, 'Date'),
            y: unpack(rows, 'Low'),
            line: { color: '#7F7F7F' }
        }
        var trace3 = {
            type: "scatter",
            mode: "lines",
            name: company+'.Close',
            x: unpack(rows, 'Date'),
            y: unpack(rows, 'Close'),
            line: { color: '#00FF00' }
        }
        var trace4 = {
            type: "scatter",
            mode: "lines",
            name: company+'.Open',
            x: unpack(rows, 'Date'),
            y: unpack(rows, 'Open'),
            line: { color: '#FF4500' }
        }
        var data = [trace1, trace2,trace3,trace4];

        var layout = {
            title: 'Stock price prediction of '+company,
            xaxis: {
                autorange: true,
                range: [d1, d2],
                rangeselector: {
                    buttons: [
                        {
                            count: 10,
                            label: '10h',
                            step: 'hour',
                            stepmode: 'backward'
                        },
                        {
                            count: 1,
                            label: '1d',
                            step: 'day',
                            stepmode: 'backward'
                        },
                        { step: 'all' }
                    ]
                },
                rangeslider: { range: [d1, d2] },
                type: 'date'
            },
            yaxis: {
                autorange: true,
                
                type: 'linear'
            }
        };
        Plotly.newPlot('plot_dynamic', data, layout);
    });
    
}