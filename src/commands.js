define(["helpers"], function(helpers) {
    // Wrapper for AT&T M2X Commands API
    //
    // https://m2x.att.com/developer/documentation/v2/commands
    var Commands = function(client) {
        this.client = client;
    };

    // Retrieve the list of sent commands accessible by the authenticated API key that
    // meet the search criteria
    //
    // https://m2x.att.com/developer/documentation/v2/commands#List-Sent-Commands
    Commands.prototype.list = function(params, callback, errorCallback) {
        if (typeof params === "function") {
            callback = params;
            errorCallback = callback;
            params = {};
        }

        return this.client.get("/commands", { qs: params || {} }, callback, errorCallback);
    };

    // Send a command
    //
    // https://m2x.att.com/developer/documentation/v2/commands#Send-Command
    Commands.prototype.send = function(params, callback, errorCallback) {
        return this.client.post("/commands", {
            headers: { "Content-Type": "application/json" },
            params: params
        }, callback, errorCallback);
    };

    // View command details
    //
    // https://m2x.att.com/developer/documentation/v2/commands#View-Command-Details
    Commands.prototype.view = function(id, callback, errorCallback) {
        return this.client.get(helpers.url("/commands/{0}", id), callback, errorCallback);
    };

    return Commands;
});
