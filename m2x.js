/*globals jQuery,localStorage,alert,M2X*/
(function() {
    function M2XExample(callback) {
        this.callback = callback;
        this.$apiKey = "a0a629ceabecd85f7f0054b99f707fc1";;
        this.$deviceID = "7bfae96a3dbaa059e7c0daa5e607fed6";;
        this.$streamName = "placas";
        this.m2x = new M2X(this.$apiKey);
        this.$dataSet = [];

        fetch.call(this);
    }

    M2XExample.prototype.handleError = function(error) {
        var text = error.message;

        if (error.responseJSON) {
            console.log(error);
            text = JSON.stringify(error.responseJSON);
        } else {
            text = error.message;
        }
    };

    M2XExample.prototype.onReceiveStreamValues = function(data) {
      
        var values = data.values;

        for (var i = 0; i < values.length; i++){
            
            var date = moment(values[i].timestamp).format('Do MMMM YYYY, h:mm:ss a');
            var info = values[i].value.split(",");

            console.log("Timestamp: " + date + " Sensor: " + info[0] + " Placas: " +  info[1] + " Carril: " + info[2]);

            var dataSetAux = {};
            dataSetAux.fecha = date;
            dataSetAux.sensor = info[0];
            dataSetAux.placas = info[1];
            dataSetAux.carril = info[2];

            this.$dataSet.push(dataSetAux);
        }

        this.callback(this.$dataSet);
    };

    M2XExample.prototype.getDataSet = function() {
        return this.$dataSet;
    }

    function fetch() {
        var streamName = this.$streamName;

       
        this.m2x.devices.streamValues(this.$deviceID, streamName,
            $.proxy(this, "onReceiveStreamValues"),
            $.proxy(this, "handleError")
        );
            
    }

    this.M2XExample = M2XExample;

}).call(this);
