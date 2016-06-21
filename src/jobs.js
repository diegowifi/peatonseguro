define(["helpers"], function(helpers) {
  // Wrapper for AT&T M2X Jobs API
  //
  // https://m2x.att.com/developer/documentation/v2/jobs
    var Jobs = function(client) {
        this.client = client;
    };

    // Return the details of the supplied device
    //
    // https://m2x.att.com/developer/documentation/v2/jobs#View-Job-Details
    Jobs.prototype.view = function(id, callback, errorCallback) {
        return this.client.get(helpers.url("/jobs/{0}", id), callback, errorCallback);
    };

    return Jobs;
});
