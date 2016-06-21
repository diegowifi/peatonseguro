$(function () {

    $(document).ready(function () {

        // Build the chart
        var charts = function(dataset) {

            var auto = 0;
            var autobus = 0;
            var trailer = 0;
            var camioneta = 0;
            var motocicleta = 0;
            var taxi = 0;

            for (var i=0; i<dataset.length; i++){
                switch(dataset[i].placas[0]){
                    case 'S':
                        auto++;
                        break;
                    case'Z':
                        autobus++;
                        break;
                    case 'C':
                        camioneta++;
                        break;
                    case 'B':
                        trailer++;
                        break;
                    case 'M':
                        motocicleta++;
                        break;
                    case 'T':
                        taxi++;
                        break;
                    default:
                        break; 
                }
            }

            auto = auto * 100 / dataset.length;
            autobus = autobus * 100 / dataset.length;
            camioneta = camioneta * 100 / dataset.length;
            trailer = trailer * 100 / dataset.length;
            motocicleta = motocicleta * 100 / dataset.length;
            taxi = taxi * 100 / dataset.length;

            
            $('#vehiculo').highcharts({
                chart: {
                    plotBackgroundColor: null,
                    plotBorderWidth: null,
                    plotShadow: false,
                    type: 'pie'
                },
                title: {
                    text: 'Tipo de auto que infracciona'
                },
                tooltip: {
                    pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
                },
                plotOptions: {
                    pie: {
                        allowPointSelect: true,
                        cursor: 'pointer',
                        dataLabels: {
                            enabled: false
                        },
                        showInLegend: true
                    }
                },
                series: [{
                    name: 'Brands',
                    colorByPoint: true,
                    data: [{
                        name: 'Auto',
                        y: auto
                    }, {
                        name: 'Camioneta',
                        y: camioneta,
                        sliced: true,
                        selected: true
                    }, {
                        name: 'Autobus',
                        y: autobus
                    }, {
                        name: 'Motocicleta',
                        y: motocicleta
                    }, {
                        name: 'Trailer',
                        y: trailer
                    }, {
                        name: 'Taxi',
                        y: taxi
                    }]
                }]
            });
        };

        var m2x = new M2XExample(charts);
        
    });
});