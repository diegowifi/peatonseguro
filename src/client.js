/*globals XMLHttpRequest,XDomainRequest*/

define(["helpers", "response"], function(helpers, Response) {
    var API_BASE = "https://api-m2x.att.com/v2";

    function encodeParams(params) {
        var param;
        var result;

        for (param in params) {
            var value = params[param];
            result = result ? result + "&" : "";
            result += encodeURIComponent(param) + "=" + encodeURIComponent(value);
        }

        return result;
    };

    function request(options, onSuccess, onError) {
        var xhr = new XMLHttpRequest();
        var querystring = encodeParams(options.qs);
        var path = querystring ? options.path + "?" + querystring : options.path;
        var response;

        if ("withCredentials" in xhr) {
            // Check if the XMLHttpRequest object has a "withCredentials" property.
            // "withCredentials" only exists on XMLHTTPRequest2 objects.
            xhr.open(options.verb, path, true);

        } else if (typeof XDomainRequest !== "undefined") {
            // Otherwise, check if XDomainRequest.
            // XDomainRequest only exists in IE, and is IE's (8 & 9) way of making CORS requests.
            xhr = new XDomainRequest();
            xhr.open(options.verb, path);

        } else {
            // Otherwise, CORS is not supported by the browser.
            throw "CORS is not supported by this browser.";
        }

        for (var header in options.headers) {
            xhr.setRequestHeader(header, options.headers[header]);
        }

        xhr.onerror = function() {
            if (onError) {
                response = new Response(xhr);

                onError(response.error());
            }
        };
        xhr.onload = function() {
            var response;

            if (!onSuccess) {
                return;
            }

            response = new Response(xhr);

            if (response.isError()) {
                if (onError) {
                    onError(response.error());
                }
            } else {
                onSuccess(response.json);
            }
        };

        xhr.send(options.body);

        return xhr;
    }


    var Client = function(apiKey, apiBase) {
        var createVerb = function(object, verb, methodName) {
                object[methodName] = function(path, options, callback, errorCallback) {
                    return this.request(verb, path, options, callback, errorCallback);
                };
        };

        this.apiKey = apiKey;
        this.apiBase = apiBase || API_BASE;
        this.defaultHeaders = {
            "X-M2X-KEY": this.apiKey
        };

        var verbs = ["get", "post", "put", "head", "options", "patch"];
        for (var vi = 0; vi < verbs.length; vi++) {
            createVerb(this, verbs[vi], verbs[vi]);
        }
        createVerb(this, "delete", "del");
    };

    Client.prototype.request = function(verb, path, options, callback, errorCallback) {
        var body;
        var headers;

        if (typeof options === "function") {
            // callback was sent in place of options
            errorCallback = callback;
            callback = options;
            options = {};
        }

        headers = helpers.extend(this.defaultHeaders, options.headers || {});

        if (options.params) {
            if (! headers["Content-Type"]) {
                headers["Content-Type"] = "application/x-www-form-urlencoded";
            }

            switch (headers["Content-Type"]) {
            case "application/json":
                body = JSON.stringify(options.params);
                break;

            case "application/x-www-form-urlencoded":
                body = encodeParams(options.params);
                break;

            default:
                throw "Unrecognized Content-Type `" + headers["Content-Type"] + "`";
            }
        }

        return request({
            path: this.apiBase + path,
            qs: options.qs,
            verb: verb,
            headers: headers,
            body: body
        }, callback, errorCallback);
    };

    return Client;
});
