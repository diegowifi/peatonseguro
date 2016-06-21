define(["charts", "client", "collections", "commands", "devices", "distributions", "jobs", "keys", "metadata"],
function(Charts, Client, Collections, Commands, Devices, Distributions, Jobs, Keys, Metadata) {
    var M2X = function(apiKey, apiBase) {
        this.client = new Client(apiKey, apiBase);

        this.metadata = new Metadata(this.client);
        this.keys = new Keys(this.client);
        this.charts = new Charts(this.client);
        this.collections = new Collections(this.client, this.metadata);
        this.devices = new Devices(this.client, this.keys, this.metadata);
        this.distributions = new Distributions(this.client, this.metadata);
        this.commands = new Commands(this.client);
        this.jobs = new Jobs(this.client);
    };

    M2X.prototype.status = function(callback, errorCallback) {
        return this.client.get("/status", callback, errorCallback);
    };

    return M2X;
});
