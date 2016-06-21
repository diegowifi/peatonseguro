define(["helpers"], function(helpers) {
    // Generic Metadata methods for M2X resources
    var Metadata = function(client) {
        this.client = client;
    };

    // Read resource's metadata
    //
    // https://m2x.att.com/developer/documentation/v2/device#Read-Device-Metadata
    // https://m2x.att.com/developer/documentation/v2/distribution#Read-Distribution-Metadata
    // https://m2x.att.com/developer/documentation/v2/collections#Read-Collection-Metadata
    Metadata.prototype.read = function(resource, id, callback, errorCallback) {
        return this.client.get(helpers.url("/{0}/{1}/metadata", resource, id), callback, errorCallback);
    };

    // Update resource's metadata
    //
    // https://m2x.att.com/developer/documentation/v2/device#Update-Device-Metadata
    // https://m2x.att.com/developer/documentation/v2/distribution#Update-Distribution-Metadata
    // https://m2x.att.com/developer/documentation/v2/collections#Update-Collection-Metadata
    Metadata.prototype.update = function(resource, id, params, callback, errorCallback) {
        return this.client.put(helpers.url("/{0}/{1}/metadata", resource, id), {
            headers: { "Content-Type": "application/json" },
            params: params
        }, callback, errorCallback);
    };

    // Read resource's metadata field
    //
    // https://m2x.att.com/developer/documentation/v2/device#Read-Device-Metadata-Field
    // https://m2x.att.com/developer/documentation/v2/distribution#Read-Distribution-Metadata-Field
    // https://m2x.att.com/developer/documentation/v2/collections#Read-Collection-Metadata-Field
    Metadata.prototype.readField = function(resource, id, field, callback, errorCallback) {
        return this.client.get(helpers.url("/{0}/{1}/metadata/{2}", resource, id, field), callback, errorCallback);
    };

    // Update resource's metadata field
    //
    // https://m2x.att.com/developer/documentation/v2/device#Update-Device-Metadata-Field
    // https://m2x.att.com/developer/documentation/v2/distribution#Update-Distribution-Metadata-Field
    // https://m2x.att.com/developer/documentation/v2/collections#Update-Collection-Metadata-Field
    Metadata.prototype.updateField = function(resource, id, field, fieldValue, callback, errorCallback) {
        return this.client.put(helpers.url("/{0}/{1}/metadata/{2}", resource, id, field), {
            headers: { "Content-Type": "application/json" },
            params: { value: fieldValue }
        }, callback, errorCallback);
    };

    return Metadata;
});
