/*globals jQuery,localStorage,alert,M2X*/
(function($) {
    function M2XExample() {
        this.$apiKey = "a0a629ceabecd85f7f0054b99f707fc1";;
        this.$deviceID = "7bfae96a3dbaa059e7c0daa5e607fed6";;
        this.$streamName = "numero";
        this.m2x = new M2X(this.$apiKey);

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

            console.log("Timestamp: " + date + " Value: " + values[i].value);

        }
    };

    function fetch() {
        var streamName = this.$streamName;

       
        this.m2x.devices.streamValues(this.$deviceID, streamName,
            $.proxy(this, "onReceiveStreamValues"),
            $.proxy(this, "handleError")
        );
            
    }

    $(function() {
        new M2XExample();
    });
}(jQuery));
