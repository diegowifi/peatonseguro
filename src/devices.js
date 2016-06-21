define(["helpers"], function(helpers) {
    // Wrapper for AT&T M2X Device API
    //
    // https://m2x.att.com/developer/documentation/device
    var Devices = function(client, keysAPI, metadata) {
        this.client = client;
        this.keysAPI = keysAPI;
        this.metadata = metadata;
    };

    // List/search the catalog of public devices
    //
    // This allows unauthenticated users to search Devices from other users
    // that have been marked as public, allowing them to read public Device
    // metadata, locations, streams list, and view each Devices' stream metadata
    // and its values.
    //
    // https://m2x.att.com/developer/documentation/v2/device#List-Search-Public-Devices-Catalog
    Devices.prototype.catalog = function(params, callback, errorCallback) {
        if (typeof params === "function") {
            callback = params;
            errorCallback = callback;
            params = {};
        }
        return this.client.get("/devices/catalog", { qs: params || {} }, callback, errorCallback);
    };

    // Retrieve the list of devices accessible by the authenticated API key that
    // meet the search criteria
    //
    // https://m2x.att.com/developer/documentation/v2/device#Search-Devices
    Devices.prototype.search = function(params, callback, errorCallback) {
        return this.client.post("/devices/search", {
            headers: { "Content-Type": "application/json" },
            params:  params || {}
        }, callback, errorCallback);
    };

    // Retrieve the list of devices accessible by the authenticated API key
    //
    // https://m2x.att.com/developer/documentation/v2/device#List-Devices
    Devices.prototype.list = function(params, callback, errorCallback) {
        return this.client.get("/devices", { qs: params || {} }, callback, errorCallback);
    };

    // List the devices tags for the authenticated user
    //
    // https://m2x.att.com/developer/documentation/v2/device#List-Device-Tags
    Devices.prototype.tags = function(callback, errorCallback) {
        return this.client.get("/devices/tags", callback, errorCallback);
    };

    // Create a new device
    //
    // https://m2x.att.com/developer/documentation/v2/device#Create-Device
    Devices.prototype.create = function(params, callback, errorCallback) {
        return this.client.post("/devices", { params: params }, callback, errorCallback);
    };

    // Update a device
    //
    // https://m2x.att.com/developer/documentation/v2/device#Update-Device-Details
    Devices.prototype.update = function(id, params, callback, errorCallback) {
        return this.client.put( helpers.url("/devices/{0}", id), {
            headers: { "Content-Type": "application/json" },
            params: params
        }, callback, errorCallback);
    };

    // Return the details of the supplied device
    //
    // https://m2x.att.com/developer/documentation/v2/device#View-Device-Details
    Devices.prototype.view = function(id, callback, errorCallback) {
        return this.client.get(helpers.url("/devices/{0}", id), callback, errorCallback);
    };

    // Return the current location of the supplied device
    //
    // Note that this method can return an empty value (response status
    // of 204) if the device has no location defined.
    //
    // https://m2x.att.com/developer/documentation/v2/device#Read-Device-Location
    Devices.prototype.location = function(id, callback, errorCallback) {
        return this.client.get(helpers.url("/devices/{0}/location", id), callback, errorCallback);
    };
    
    // Return the location history of the supplied device.
    //
    // https://m2x.att.com/developer/documentation/v2/device#Read-Device-Location-History
    Devices.prototype.locationHistory = function(id, params, callback, errorCallback) {
        if (typeof params === "function") {
            errorCallback = callback;
            callback = params;
            params = {};
        }

        return this.client.get(helpers.url("/devices/{0}/location/waypoints", id), { qs: params }, callback, errorCallback);
    };

    // Update the current location of the device
    //
    // https://m2x.att.com/developer/documentation/v2/device#Update-Device-Location
    Devices.prototype.updateLocation = function(id, params, callback, errorCallback) {
        return this.client.put(
            helpers.url("/devices/{0}/location", id),
            { params: params },
            callback, errorCallback
        );
    };

    // Return a list of the associated streams for the supplied device
    //
    // https://m2x.att.com/developer/documentation/v2/device#List-Data-Streams
    Devices.prototype.streams = function(id, callback, errorCallback) {
        return this.client.get(helpers.url("/devices/{0}/streams", id), callback, errorCallback);
    };

    // Update stream's properties
    //
    // If the stream doesn't exist it will create it. See
    // https://m2x.att.com/developer/documentation/device#Create-Update-Data-Stream
    // for details.
    //
    // https://m2x.att.com/developer/documentation/v2/device#Create-Update-Data-Stream
    Devices.prototype.updateStream = function(id, name, params, callback, errorCallback) {
        return this.client.put(
            helpers.url("/devices/{0}/streams/{1}", id, name),
            { params: params },
            callback, errorCallback
        );
    };

    // Set the stream value
    //
    // https://m2x.att.com/developer/documentation/v2/device#Update-Data-Stream-Value
    Devices.prototype.setStreamValue = function(id, name, params, callback, errorCallback) {
        return this.client.put(
            helpers.url("/devices/{0}/streams/{1}/value", id, name),
            { params: params },
            callback, errorCallback
        );
    };

    // Return the details of the supplied stream
    //
    // https://m2x.att.com/developer/documentation/v2/device#View-Data-Stream
    Devices.prototype.stream = function(id, name, callback, errorCallback) {
        return this.client.get(
            helpers.url("/devices/{0}/streams/{1}", id, name),
            callback, errorCallback
        );
    };

    // List values from an existing data stream associated with a
    // specific device, sorted in reverse chronological order (most
    // recent values first).
    //
    // https://m2x.att.com/developer/documentation/v2/device#List-Data-Stream-Values
    Devices.prototype.streamValues = function(id, name, params, callback, errorCallback) {
        var url = helpers.url("/devices/{0}/streams/{1}/values", id, name);

        if (typeof params === "function") {
            errorCallback = callback;
            callback = params;
            params = {};
        }

        return this.client.get(url, { qs: params }, callback, errorCallback);
    };

    // Sample values from an existing stream
    //
    // https://m2x.att.com/developer/documentation/v2/device#Data-Stream-Sampling
    Devices.prototype.sampleStreamValues = function(id, name, params, callback, errorCallback) {
        return this.client.get(
            helpers.url("/devices/{0}/streams/{1}/sampling", id, name),
            { qs: params },
            callback, errorCallback
        );
    };

    // Return the stream stats
    //
    // https://m2x.att.com/developer/documentation/v2/device#Data-Stream-Stats
    Devices.prototype.streamStats = function(id, name, params, callback, errorCallback) {
        return this.client.get(
            helpers.url("/devices/{0}/streams/{1}/stats", id, name),
            { qs: params },
            callback, errorCallback
        );
    };

    // List values from all data stream associated with a specific device
    //
    // https://m2x.att.com/developer/documentation/v2/device#List-Values-from-all-Data-Streams-of-a-Device
    Devices.prototype.values = function(id, params, callback, errorCallback) {
        var url = helpers.url("/devices/{0}/values", id);

        if (typeof params === "function") {
            errorCallback = callback;
            callback = params;
            params = {};
        }

        return this.client.get(url, { qs: params }, callback, errorCallback);
    };

    // Search Values from all Data Streams of a Device
    //
    // https://m2x.att.com/developer/documentation/v2/device#Search-Values-from-all-Data-Streams-of-a-Device
    Devices.prototype.valuesSearch = function(id, params, callback, errorCallback) {
        return this.client.post(
            helpers.url("/devices/{0}/values/search", id),
            {
                headers: { "Content-Type": "application/json" },
                params:  params
            },
            callback,
            errorCallback
        );
    };

    // Export Values from all Data Streams of a Device
    //
    // https://m2x.att.com/developer/documentation/v2/device#Export-Values-from-all-Data-Streams-of-a-Device
    Devices.prototype.valuesExport = function(id, params, callback, errorCallback) {
        if (typeof params === "function") {
            errorCallback = callback;
            callback = params;
            params = {};
        }

        return this.client.get(
            helpers.url("/devices/{0}/values/export.csv", id),
            { qs: params },
            callback,
            errorCallback
        );
    };

    // Post timestamped values to an existing stream
    //
    // https://m2x.att.com/developer/documentation/v2/device#Post-Data-Stream-Values
    Devices.prototype.postValues = function(id, name, values, callback, errorCallback) {
        return this.client.post(
            helpers.url("/devices/{0}/streams/{1}/values", id, name),
            { params: { values: values } },
            callback, errorCallback
        );
    };

    // Delete values from a stream by a date range
    //
    // https://m2x.att.com/developer/documentation/v2/device#Delete-Data-Stream-Values
    Devices.prototype.deleteStreamValues = function(id, name, params, callback, errorCallback) {
        return this.client.del(
            helpers.url("/devices/{0}/streams/{1}/values", id, name),
            { params: params },
            callback, errorCallback
        );
    };

    // Delete the stream (and all its values) from the device
    //
    // https://m2x.att.com/developer/documentation/v2/device#Delete-Data-Stream
    Devices.prototype.deleteStream = function(id, name, callback, errorCallback) {
        return this.client.del(helpers.url("/devices/{0}/streams/{1}", id, name), callback, errorCallback);
    };

    // Post Device Updates (Multiple Values to Multiple Streams)
    //
    // This method allows posting multiple values to multiple streams
    // belonging to a device and optionally, the device location.
    //
    // All the streams should be created before posting values using this method.
    //
    // The `values` parameter contains an object with one attribute per each stream to be updated.
    // The value of each one of these attributes is an array of timestamped values.
    //
    //     {
    //         temperature: [
    //             { "timestamp": <Time in ISO8601>, "value": x },
    //             { "timestamp": <Time in ISO8601>, "value": y }
    //         ],
    //         humidity:    [
    //             { "timestamp": <Time in ISO8601>, "value": x },
    //             { "timestamp": <Time in ISO8601>, "value": y }
    //         ]
    //     }
    //
    // The optional `location` parameter can contain location information that will
    // be used to update the current location of the specified device
    //
    // https://m2x.att.com/developer/documentation/v2/device#Post-Device-Updates--Multiple-Values-to-Multiple-Streams-
    Devices.prototype.postUpdates = function(id, params, callback, errorCallback) {
        return this.client.post(helpers.url("/devices/{0}/updates", id), {
            headers: { "Content-Type": "application/json" },
            params:  params
        }, callback, errorCallback);
    };

    // Post Device Update (Single Value to Multiple Streams)
    //
    // This method allows posting a single value to multiple streams
    // belonging to a device and optionally, the device's location.
    //
    // All the streams should be created before posting values using this method.
    //
    // The `params` parameter accepts an object which can contain the following keys:
    //   - values:    An Object in which the keys are the stream names and the values
    //                hold the stream values.
    //   - location:  (optional) A hash with the current location of the specified
    //                device.
    //   - timestamp: (optional) The timestamp for all the passed values and
    //                location. If ommited, the M2X server's time will be used.
    //
    //      {
    //          values: {
    //              temperature: 30,
    //              humidity:    80
    //          },
    //          location: {
    //              name:      "Storage Room",
    //              latitude:  -37.9788423562422,
    //              longitude: -57.5478776916862,
    //              elevation: 5
    //         }
    //      }
    //
    // https://m2x.att.com/developer/documentation/v2/device#Post-Device-Update--Single-Values-to-Multiple-Streams-
    Devices.prototype.postUpdate = function(id, params, callback, errorCallback) {
        return this.client.post(helpers.url("/devices/{0}/update", id), {
            headers: { "Content-Type": "application/json" },
            params:  params
        }, callback, errorCallback);
    };

    // Return a list of access log to the supplied device
    //
    // https://m2x.att.com/developer/documentation/v2/device#View-Request-Log
    Devices.prototype.log = function(id, callback, errorCallback) {
        return this.client.get(helpers.url("/devices/{0}/log", id), callback, errorCallback);
    };

    // Delete an existing device
    //
    // https://m2x.att.com/developer/documentation/v2/device#Delete-Device
    Devices.prototype.deleteDevice = function(id, callback, errorCallback) {
        return this.client.del(helpers.url("/devices/{0}", id), callback, errorCallback);
    };

    // Returns a list of API keys associated with the device
    Devices.prototype.keys = function(id, callback, errorCallback) {
        return this.client.get("/keys", { qs: { device: id } }, callback, errorCallback);
    };

    // Creates a new API key associated to the device
    //
    // If a parameter named `stream` is supplied with a stream name, it
    // will create an API key associated with that stream only.
    Devices.prototype.createKey = function(id, params, callback, errorCallback) {
        this.keysAPI.create(helpers.extend(params, { device: id }), callback, errorCallback);
    };

    // Updates an API key properties
    Devices.prototype.updateKey = function(id, key, params, callback, errorCallback) {
        this.keysAPI.update(key, helpers.extend(params, { device: id }), callback, errorCallback);
    };

    // Read device metadata
    //
    // https://m2x.att.com/developer/documentation/v2/device#Read-Device-Metadata
    Devices.prototype.readMetadata = function(id, callback, errorCallback) {
        this.metadata.read("devices", id, callback, errorCallback);
    };

    // Update device metadata
    //
    // https://m2x.att.com/developer/documentation/v2/device#Update-Device-Metadata
    Devices.prototype.updateMetadata = function(id, params, callback, errorCallback) {
        this.metadata.update("devices", id, params, callback, errorCallback);
    };

    // Read device metadata field
    //
    // https://m2x.att.com/developer/documentation/v2/device#Read-Device-Metadata-Field
    Devices.prototype.readMetadataField = function(id, field, callback, errorCallback) {
        this.metadata.readField("devices", id, field, callback, errorCallback);
    };

    // Update device metadata field
    //
    // https://m2x.att.com/developer/documentation/v2/device#Update-Device-Metadata-Field
    Devices.prototype.updateMetadataField = function(id, field, value, callback, errorCallback) {
        this.metadata.updateField("devices", id, field, value, callback, errorCallback);
    };

    // Get device's list of received commands
    //
    // https://m2x.att.com/developer/documentation/v2/commands#Device-s-List-of-Received-Commands
    Devices.prototype.commands = function(id, params, callback, errorCallback) {
        if (typeof params === "function") {
            errorCallback = callback;
            callback = params;
            params = {};
        }

        return this.client.get(
            helpers.url("/devices/{0}/commands", id),
            { qs: params },
            callback,
            errorCallback
        );
    };

    // Get device's view of command details
    //
    // https://m2x.att.com/developer/documentation/v2/commands#Device-s-View-of-Command-Details
    Devices.prototype.command = function(deviceId, commandId, callback, errorCallback) {
        return this.client.get(helpers.url("/devices/{0}/commands/{1}", deviceId, commandId), callback, errorCallback);
    };

    // Mark command as processed
    //
    // https://m2x.att.com/developer/documentation/v2/commands#Device-Marks-a-Command-as-Processed
    Devices.prototype.processCommand = function(deviceId, commandId, params, callback, errorCallback) {
        if (typeof params === "function") {
            errorCallback = callback;
            callback = params;
            params = {};
        }

        return this.client.post(helpers.url("/devices/{0}/commands/{1}/process", deviceId, commandId), {
            headers: { "Content-Type": "application/json" },
            params:  params || {}
        }, callback, errorCallback);
    };

    // Mark command as rejected
    //
    // https://m2x.att.com/developer/documentation/v2/commands#Device-Marks-a-Command-as-Rejected
    Devices.prototype.rejectCommand = function(deviceId, commandId, params, callback, errorCallback) {
        if (typeof params === "function") {
            errorCallback = callback;
            callback = params;
            params = {};
        }

        return this.client.post(helpers.url("/devices/{0}/commands/{1}/reject", deviceId, commandId), {
            headers: { "Content-Type": "application/json" },
            params:  params || {}
        }, callback, errorCallback);
    };

    return Devices;
});
