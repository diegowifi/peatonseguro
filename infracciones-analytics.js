$(function () {
    $(document).ready(function () {
        var charts = function(dataset) {

            var enero = 0;
            var febrero = 0;
            var marzo = 0;
            var abril = 0;
            var mayo = 0;
            var junio = 0;
            var julio = 0;
            var agosto = 0;
            var septiembre = 0;
            var octubre = 0;
            var noviembre = 0;
            var diciembre = 0;


            for (var i=0; i<dataset.length; i++){
                var month = dataset[i].fecha.slice(4,7);
                
                switch(month){
                    case 'ene':
                        enero++;
                        break;
                    case'feb':
                        febrero++;
                        break;
                    case 'mar':
                        marzo++;
                        break;
                    case 'abr':
                        abril++;
                        break;
                    case 'may':
                        mayo++;
                        break;
                    case "jun":
                        junio++;
                        break;
                    case 'jul':
                        julio++;
                        break;
                    case 'ago':
                        agosto++;
                        break;
                    case 'sep':
                        septiembre++;
                        break;
                    case 'oct':
                        octubre++;
                        break;
                    case 'nov':
                        noviembre++;
                        break;
                    case 'dic':
                        diciembre++;
                        break;
                    default:
                        break; 
                }
            }



            $('#container').highcharts({
                title: {
                    text: 'Monthly Average Temperature',
                    x: -20 //center
                },
                subtitle: {
                    text: 'Source: WorldClimate.com',
                    x: -20
                },
                xAxis: {
                    categories: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
                },
                yAxis: {
                    title: {
                        text: 'Temperature (°C)'
                    },
                    plotLines: [{
                        value: 0,
                        width: 1,
                        color: '#808080'
                    }]
                },
                tooltip: {
                    valueSuffix: '°C'
                },
                legend: {
                    layout: 'vertical',
                    align: 'right',
                    verticalAlign: 'middle',
                    borderWidth: 0
                },
                series: [ {
                    name: 'Berlin',
                    data: [enero, febrero, marzo, abril, mayo, junio, julio, agosto, septiembre, octubre, noviembre, diciembre]
                }]
            });
        }
         var m2x = new M2XExample(charts);
    })
});