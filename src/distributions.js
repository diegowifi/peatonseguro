define(["helpers"], function(helpers) {
    // Wrapper for AT&T M2X Distribution API
    //
    // https://m2x.att.com/developer/documentation/distribution
    var Distributions = function(client, metadata) {
        this.client = client;
        this.metadata = metadata;
    };

    // Retrieve a list of device distributions
    //
    // https://m2x.att.com/developer/documentation/v2/distribution#List-Distributions
    Distributions.prototype.list = function(params, callback, errorCallback) {
        if (typeof params === "function") {
            callback = params;
            errorCallback = callback;
            params = {};
        }
        return this.client.get("/distributions", { qs: params || {} }, callback, errorCallback);
    };

    // Create a new device distribution
    //
    // https://m2x.att.com/developer/documentation/v2/distribution#Create-Distribution
    Distributions.prototype.create = function(params, callback, errorCallback) {
        return this.client.post("/distributions", { params: params }, callback, errorCallback);
    };

    // Retrieve information about an existing device distribution
    //
    // https://m2x.att.com/developer/documentation/v2/distribution#View-Distribution-Details
    Distributions.prototype.view = function(id, callback, errorCallback) {
        return this.client.get(helpers.url("/distributions/{0}", id), callback, errorCallback);
    };

    // Update an existing device distribution
    //
    // https://m2x.att.com/developer/documentation/v2/distribution#Update-Distribution-Details
    Distributions.prototype.update = function(id, params, callback, errorCallback) {
        return this.client.put(
            helpers.url("/distributions/{0}", id),
            { params: params },
            callback, errorCallback
        );
    };

    // Retrieve a list of devices added to the a device distribution
    //
    // https://m2x.att.com/developer/documentation/v2/distribution#List-Devices-from-an-existing-Distribution
    Distributions.prototype.devices = function(id, callback, errorCallback) {
        return this.client.get(
            helpers.url("/distributions/{0}/devices", id),
            callback, errorCallback
        );
    };

    // Add a new device to an existing device distribution
    //
    // https://m2x.att.com/developer/documentation/v2/distribution#Add-Device-to-an-existing-Distribution
    Distributions.prototype.addDevice = function(id, serial, callback, errorCallback) {
        return this.client.post(helpers.url("/distributions/{0}/devices", id), {
            headers: { "Content-Type": "application/json" },
            params: { serial: serial }
        }, callback, errorCallback);
    };

    // Delete an existing device distribution
    //
    // https://m2x.att.com/developer/documentation/v2/distribution#Delete-Distribution
    Distributions.prototype.deleteDistribution = function(id, callback, errorCallback) {
        return this.client.del(helpers.url("/distributions/{0}", id), callback, errorCallback);
    };

    // Retrieve a list of data streams associated with the distribution
    //
    // https://m2x.att.com/developer/documentation/v2/distribution#List-Data-Streams
    Distributions.prototype.dataStreams = function(id, callback, errorCallback) {
        return this.client.get(
            helpers.url("/distributions/{0}/streams", id),
            callback, errorCallback
        );
    };

    // Create/Update a data stream associated with the distribution
    //
    // https://m2x.att.com/developer/documentation/v2/distribution#Create-Update-Data-Stream
    Distributions.prototype.updateDataStream = function(id, name, params, callback, errorCallback) {
        return this.client.put(
            helpers.url("/distributions/{0}/streams/{1}", id, name),
            {
                headers: { "Content-Type": "application/json" },
                params: params
            },
            callback, errorCallback
        );
    };

    // View information about a stream associated to the distribution
    //
    // https://m2x.att.com/developer/documentation/v2/distribution#View-Data-Stream
    Distributions.prototype.dataStream = function(id, name, callback, errorCallback) {
        return this.client.get(
            helpers.url("/distributions/{0}/streams/{1}", id, name),
            callback, errorCallback
        );
    };

    // Delete an existing data stream associated to distribution
    //
    // https://m2x.att.com/developer/documentation/v2/distribution#Delete-Data-Stream
    Distributions.prototype.deleteDataStream = function(id, name, callback, errorCallback) {
        return this.client.del(
            helpers.url("/distributions/{0}/streams/{1}", id, name),
            callback, errorCallback
        );
    };

    // Read distribution metadata
    //
    // https://m2x.att.com/developer/documentation/v2/distribution#Read-Device-Metadata
    Distributions.prototype.readMetadata = function(id, callback, errorCallback) {
        this.metadata.read("distributions", id, callback, errorCallback);
    };

    // Update distribution metadata
    //
    // https://m2x.att.com/developer/documentation/v2/distribution#Update-Device-Metadata
    Distributions.prototype.updateMetadata = function(id, params, callback, errorCallback) {
        this.metadata.update("distributions", id, params, callback, errorCallback);
    };

    // Read distribution metadata field
    //
    // https://m2x.att.com/developer/documentation/v2/distribution#Read-Device-Metadata-Field
    Distributions.prototype.readMetadataField = function(id, field, callback, errorCallback) {
        this.metadata.readField("distributions", id, field, callback, errorCallback);
    };

    // Update distribution metadata field
    //
    // https://m2x.att.com/developer/documentation/v2/distribution#Update-Device-Metadata-Field
    Distributions.prototype.updateMetadataField = function(id, field, value, callback, errorCallback) {
        this.metadata.updateField("distributions", id, field, value, callback, errorCallback);
    };

    return Distributions;
});
