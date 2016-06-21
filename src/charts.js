define(["helpers"], function(helpers) {

    // Wrapper for AT&T M2X Charts API
    //
    // https://m2x.att.com/developer/documentation/charts
    var Charts = function(client) {
        this.client = client;
    };

    // Retrieve a list of charts that belongs to the user
    //
    // https://m2x.att.com/developer/documentation/v2/charts#List-Charts
    Charts.prototype.list = function(callback, errorCallback) {
        return this.client.get("/charts", callback, errorCallback);
    };

    // Create a new chart
    //
    // https://m2x.att.com/developer/documentation/v2/charts#Create-Chart
    Charts.prototype.create = function(params, callback, errorCallback) {
        return this.client.post("/charts", { params: params }, callback, errorCallback);
    };

    // Get details of a chart
    //
    // https://m2x.att.com/developer/documentation/v2/charts#View-Chart-Details
    Charts.prototype.view = function(id, callback, errorCallback) {
        return this.client.get(helpers.url("/charts/{0}", id), callback, errorCallback);
    };

    // Update an existing chart
    //
    // https://m2x.att.com/developer/documentation/v2/charts#Update-Chart
    Charts.prototype.update = function(id, params, callback, errorCallback) {
        return this.client.put(
            helpers.url("/charts/{0}", id),
            { params: params },
            callback, errorCallback
        );
    };

    // Delete an existing chart
    //
    // https://m2x.att.com/developer/documentation/v2/charts#Delete-Chart
    Charts.prototype.deleteChart = function(id, callback, errorCallback) {
        return this.client.del(helpers.url("/charts/{0}", id), callback, errorCallback);
    };

    // Render a chart into a png or svg image
    //
    // https://m2x.att.com/developer/documentation/v2/charts#Render-Chart
    Charts.prototype.render = function(id, format, params, callback, errorCallback) {
        return this.client.get(helpers.url("/charts/{0}.{1}", id, format), callback, errorCallback);
    };

    return Charts;
});
