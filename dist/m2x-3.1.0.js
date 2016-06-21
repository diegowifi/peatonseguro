(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        //Allow using this built library as an AMD module
        //in another project. That other project will only
        //see this AMD call, not the internal modules in
        //the closure below.
        define(factory);
    } else {
        //Browser globals case. Just assign the
        //result to a property on the global.
        root.M2X = factory();
    }
}(this, function () {
/**
 * almond 0.2.6 Copyright (c) 2011-2012, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/almond for details
 */
//Going sloppy to avoid 'use strict' string cost, but strict practices should
//be followed.
/*jslint sloppy: true */
/*global setTimeout: false */

var requirejs, require, define;
(function (undef) {
    var main, req, makeMap, handlers,
        defined = {},
        waiting = {},
        config = {},
        defining = {},
        hasOwn = Object.prototype.hasOwnProperty,
        aps = [].slice;

    function hasProp(obj, prop) {
        return hasOwn.call(obj, prop);
    }

    /**
     * Given a relative module name, like ./something, normalize it to
     * a real name that can be mapped to a path.
     * @param {String} name the relative name
     * @param {String} baseName a real name that the name arg is relative
     * to.
     * @returns {String} normalized name
     */
    function normalize(name, baseName) {
        var nameParts, nameSegment, mapValue, foundMap,
            foundI, foundStarMap, starI, i, j, part,
            baseParts = baseName && baseName.split("/"),
            map = config.map,
            starMap = (map && map['*']) || {};

        //Adjust any relative paths.
        if (name && name.charAt(0) === ".") {
            //If have a base name, try to normalize against it,
            //otherwise, assume it is a top-level require that will
            //be relative to baseUrl in the end.
            if (baseName) {
                //Convert baseName to array, and lop off the last part,
                //so that . matches that "directory" and not name of the baseName's
                //module. For instance, baseName of "one/two/three", maps to
                //"one/two/three.js", but we want the directory, "one/two" for
                //this normalization.
                baseParts = baseParts.slice(0, baseParts.length - 1);

                name = baseParts.concat(name.split("/"));

                //start trimDots
                for (i = 0; i < name.length; i += 1) {
                    part = name[i];
                    if (part === ".") {
                        name.splice(i, 1);
                        i -= 1;
                    } else if (part === "..") {
                        if (i === 1 && (name[2] === '..' || name[0] === '..')) {
                            //End of the line. Keep at least one non-dot
                            //path segment at the front so it can be mapped
                            //correctly to disk. Otherwise, there is likely
                            //no path mapping for a path starting with '..'.
                            //This can still fail, but catches the most reasonable
                            //uses of ..
                            break;
                        } else if (i > 0) {
                            name.splice(i - 1, 2);
                            i -= 2;
                        }
                    }
                }
                //end trimDots

                name = name.join("/");
            } else if (name.indexOf('./') === 0) {
                // No baseName, so this is ID is resolved relative
                // to baseUrl, pull off the leading dot.
                name = name.substring(2);
            }
        }

        //Apply map config if available.
        if ((baseParts || starMap) && map) {
            nameParts = name.split('/');

            for (i = nameParts.length; i > 0; i -= 1) {
                nameSegment = nameParts.slice(0, i).join("/");

                if (baseParts) {
                    //Find the longest baseName segment match in the config.
                    //So, do joins on the biggest to smallest lengths of baseParts.
                    for (j = baseParts.length; j > 0; j -= 1) {
                        mapValue = map[baseParts.slice(0, j).join('/')];

                        //baseName segment has  config, find if it has one for
                        //this name.
                        if (mapValue) {
                            mapValue = mapValue[nameSegment];
                            if (mapValue) {
                                //Match, update name to the new value.
                                foundMap = mapValue;
                                foundI = i;
                                break;
                            }
                        }
                    }
                }

                if (foundMap) {
                    break;
                }

                //Check for a star map match, but just hold on to it,
                //if there is a shorter segment match later in a matching
                //config, then favor over this star map.
                if (!foundStarMap && starMap && starMap[nameSegment]) {
                    foundStarMap = starMap[nameSegment];
                    starI = i;
                }
            }

            if (!foundMap && foundStarMap) {
                foundMap = foundStarMap;
                foundI = starI;
            }

            if (foundMap) {
                nameParts.splice(0, foundI, foundMap);
                name = nameParts.join('/');
            }
        }

        return name;
    }

    function makeRequire(relName, forceSync) {
        return function () {
            //A version of a require function that passes a moduleName
            //value for items that may need to
            //look up paths relative to the moduleName
            return req.apply(undef, aps.call(arguments, 0).concat([relName, forceSync]));
        };
    }

    function makeNormalize(relName) {
        return function (name) {
            return normalize(name, relName);
        };
    }

    function makeLoad(depName) {
        return function (value) {
            defined[depName] = value;
        };
    }

    function callDep(name) {
        if (hasProp(waiting, name)) {
            var args = waiting[name];
            delete waiting[name];
            defining[name] = true;
            main.apply(undef, args);
        }

        if (!hasProp(defined, name) && !hasProp(defining, name)) {
            throw new Error('No ' + name);
        }
        return defined[name];
    }

    //Turns a plugin!resource to [plugin, resource]
    //with the plugin being undefined if the name
    //did not have a plugin prefix.
    function splitPrefix(name) {
        var prefix,
            index = name ? name.indexOf('!') : -1;
        if (index > -1) {
            prefix = name.substring(0, index);
            name = name.substring(index + 1, name.length);
        }
        return [prefix, name];
    }

    /**
     * Makes a name map, normalizing the name, and using a plugin
     * for normalization if necessary. Grabs a ref to plugin
     * too, as an optimization.
     */
    makeMap = function (name, relName) {
        var plugin,
            parts = splitPrefix(name),
            prefix = parts[0];

        name = parts[1];

        if (prefix) {
            prefix = normalize(prefix, relName);
            plugin = callDep(prefix);
        }

        //Normalize according
        if (prefix) {
            if (plugin && plugin.normalize) {
                name = plugin.normalize(name, makeNormalize(relName));
            } else {
                name = normalize(name, relName);
            }
        } else {
            name = normalize(name, relName);
            parts = splitPrefix(name);
            prefix = parts[0];
            name = parts[1];
            if (prefix) {
                plugin = callDep(prefix);
            }
        }

        //Using ridiculous property names for space reasons
        return {
            f: prefix ? prefix + '!' + name : name, //fullName
            n: name,
            pr: prefix,
            p: plugin
        };
    };

    function makeConfig(name) {
        return function () {
            return (config && config.config && config.config[name]) || {};
        };
    }

    handlers = {
        require: function (name) {
            return makeRequire(name);
        },
        exports: function (name) {
            var e = defined[name];
            if (typeof e !== 'undefined') {
                return e;
            } else {
                return (defined[name] = {});
            }
        },
        module: function (name) {
            return {
                id: name,
                uri: '',
                exports: defined[name],
                config: makeConfig(name)
            };
        }
    };

    main = function (name, deps, callback, relName) {
        var cjsModule, depName, ret, map, i,
            args = [],
            usingExports;

        //Use name if no relName
        relName = relName || name;

        //Call the callback to define the module, if necessary.
        if (typeof callback === 'function') {

            //Pull out the defined dependencies and pass the ordered
            //values to the callback.
            //Default to [require, exports, module] if no deps
            deps = !deps.length && callback.length ? ['require', 'exports', 'module'] : deps;
            for (i = 0; i < deps.length; i += 1) {
                map = makeMap(deps[i], relName);
                depName = map.f;

                //Fast path CommonJS standard dependencies.
                if (depName === "require") {
                    args[i] = handlers.require(name);
                } else if (depName === "exports") {
                    //CommonJS module spec 1.1
                    args[i] = handlers.exports(name);
                    usingExports = true;
                } else if (depName === "module") {
                    //CommonJS module spec 1.1
                    cjsModule = args[i] = handlers.module(name);
                } else if (hasProp(defined, depName) ||
                           hasProp(waiting, depName) ||
                           hasProp(defining, depName)) {
                    args[i] = callDep(depName);
                } else if (map.p) {
                    map.p.load(map.n, makeRequire(relName, true), makeLoad(depName), {});
                    args[i] = defined[depName];
                } else {
                    throw new Error(name + ' missing ' + depName);
                }
            }

            ret = callback.apply(defined[name], args);

            if (name) {
                //If setting exports via "module" is in play,
                //favor that over return value and exports. After that,
                //favor a non-undefined return value over exports use.
                if (cjsModule && cjsModule.exports !== undef &&
                        cjsModule.exports !== defined[name]) {
                    defined[name] = cjsModule.exports;
                } else if (ret !== undef || !usingExports) {
                    //Use the return value from the function.
                    defined[name] = ret;
                }
            }
        } else if (name) {
            //May just be an object definition for the module. Only
            //worry about defining if have a module name.
            defined[name] = callback;
        }
    };

    requirejs = require = req = function (deps, callback, relName, forceSync, alt) {
        if (typeof deps === "string") {
            if (handlers[deps]) {
                //callback in this case is really relName
                return handlers[deps](callback);
            }
            //Just return the module wanted. In this scenario, the
            //deps arg is the module name, and second arg (if passed)
            //is just the relName.
            //Normalize module name, if it contains . or ..
            return callDep(makeMap(deps, callback).f);
        } else if (!deps.splice) {
            //deps is a config object, not an array.
            config = deps;
            if (callback.splice) {
                //callback is an array, which means it is a dependency list.
                //Adjust args if there are dependencies
                deps = callback;
                callback = relName;
                relName = null;
            } else {
                deps = undef;
            }
        }

        //Support require(['a'])
        callback = callback || function () {};

        //If relName is a function, it is an errback handler,
        //so remove it.
        if (typeof relName === 'function') {
            relName = forceSync;
            forceSync = alt;
        }

        //Simulate async callback;
        if (forceSync) {
            main(undef, deps, callback, relName);
        } else {
            //Using a non-zero value because of concern for what old browsers
            //do, and latest browsers "upgrade" to 4 if lower value is used:
            //http://www.whatwg.org/specs/web-apps/current-work/multipage/timers.html#dom-windowtimers-settimeout:
            //If want a value immediately, use require('id') instead -- something
            //that works in almond on the global level, but not guaranteed and
            //unlikely to work in other AMD implementations.
            setTimeout(function () {
                main(undef, deps, callback, relName);
            }, 4);
        }

        return req;
    };

    /**
     * Just drops the config on the floor, but returns req in case
     * the config return value is used.
     */
    req.config = function (cfg) {
        config = cfg;
        if (config.deps) {
            req(config.deps, config.callback);
        }
        return req;
    };

    /**
     * Expose module registry for debugging and tooling
     */
    requirejs._defined = defined;

    define = function (name, deps, callback) {

        //This module may not have dependencies
        if (!deps.splice) {
            //deps is not an array, so probably means
            //an object literal or factory function for
            //the value. Adjust args.
            callback = deps;
            deps = [];
        }

        if (!hasProp(defined, name) && !hasProp(waiting, name)) {
            waiting[name] = [name, deps, callback];
        }
    };

    define.amd = {
        jQuery: true
    };
}());

define("../dist/lib/almond", function(){});

define('helpers',[],function() {
    function extend(target) {
        var sources = [].slice.call(arguments, 1);
        var si;
        for (si = 0; si < sources.length; si++) {
            var source = sources[si], prop;
            for (prop in source) {
                target[prop] = source[prop];
            }
        }
        return target;
    }

    function format(s) {
        // String formatting function.
        // From http://stackoverflow.com/questions/1038746/equivalent-of-string-format-in-jquery
        var i = arguments.length;

        while (i--) {
            s = s.replace(new RegExp('\\{' + i + '\\}', 'gm'), arguments[i + 1]);
        }

        return s;
    }

    function url(f) {
        var params = Array.prototype.slice.call(arguments, 1).map(function(param) {
            return encodeURIComponent(param);
        });

        return format.apply(this, [f].concat(params));
    }


    return {
        extend: extend,
        format: format,
        url: url
    };
});

define('charts',["helpers"], function(helpers) {

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

define('response',[],function() {
  var Response = function(res) {
      this.raw = res.responseText;
      if ("getAllResponseHeaders" in res) {
          this.headers = res.getAllResponseHeaders();
      } else {
          this.headers = {};
      }
      this.status = res.status;

      try {
          this.json = this.raw ? JSON.parse(this.raw) : {};
      } catch (ex) {
          this._error = ex.toString();
      }
  };

  Response.prototype.error = function() {
      if (!this._error && this.isError()) {
          if (this.status === 0) { // The request could not be completed.
              this._error = new Error( "Can't reach the M2X API");
          } else {
              this._error = new Error(this.json && this.json.message);
              this._error.responseJSON = this.json;
              this._error.statusCode = this.status;
          }
      }
      return this._error;
  };

  Response.prototype.isError = function() {
      if (this.status === 0) {
          return true;
      }
      return (this._error || this.isClientError() || this.isServerError());
  };

  Response.prototype.isSuccess = function() {
      return !this.isError();
  };

  Response.prototype.isClientError = function() {
      return this.status >= 400 && this.status < 500;
  };

  Response.prototype.isServerError = function() {
      return this.status >= 500;
  };

  return Response;
});

/*globals XMLHttpRequest,XDomainRequest*/

define('client',["helpers", "response"], function(helpers, Response) {
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

define('collections',["helpers"], function(helpers) {
    // Wrapper for AT&T M2X Collections API
    //
    // https://m2x.att.com/developer/documentation/v2/collections
    var Collections = function(client, metadata) {
        this.client = client;
        this.metadata = metadata;
    };

    // Retrieve the list of collections accessible by the authenticated API key that
    // meet the search criteria
    //
    // https://m2x.att.com/developer/documentation/v2/collections#List-collections
    Collections.prototype.list = function(params, callback, errorCallback) {
        if (typeof params === "function") {
            callback = params;
            errorCallback = callback;
            params = {};
        }

        return this.client.get("/collections", { qs: params || {} }, callback, errorCallback);
    };

    // Create a new collection
    //
    // https://m2x.att.com/developer/documentation/v2/collections#Create-Collection
    Collections.prototype.create = function(params, callback, errorCallback) {
        return this.client.post("/collections", {
            headers: { "Content-Type": "application/json" },
            params: params
        }, callback, errorCallback);
    };

    // Update a collection
    //
    // https://m2x.att.com/developer/documentation/v2/collections#Update-Collection-Details
    Collections.prototype.update = function(id, params, callback, errorCallback) {
        return this.client.put(helpers.url("/collections/{0}", id), {
            headers: { "Content-Type": "application/json" },
            params:  params
        }, callback, errorCallback);
    };

    // Return the details of the supplied collection
    //
    // https://m2x.att.com/developer/documentation/v2/collections#View-Collection-Details
    Collections.prototype.view = function(id, callback, errorCallback) {
        return this.client.get(helpers.url("/collections/{0}", id), callback, errorCallback);
    };

    // Return the metadata of the supplied collection
    //
    // Note that this method can return an empty value (response status
    // of 204) if the collection has no metadata defined.
    //
    // https://m2x.att.com/developer/documentation/v2/collections#Read-Collection-Metadata
    Collections.prototype.metadata = function(id, callback, errorCallback) {
        return this.client.get(helpers.url("/collections/{0}/metadata", id), callback, errorCallback);
    };

    // Update the metadata of the collection
    //
    // https://m2x.att.com/developer/documentation/v2/collections#Update-Collection-Metadata
    Collections.prototype.updateMetadata = function(id, params, callback, errorCallback) {
        return this.client.put(helpers.url("/collections/{0}/metadata", id),
            { params: params }, callback, errorCallback);
    };

    // Delete an existing collection
    //
    // https://m2x.att.com/developer/documentation/v2/collections#Delete-Collection
    Collections.prototype.deleteCollection = function(id, callback, errorCallback) {
        return this.client.del(helpers.url("/collections/{0}", id), callback, errorCallback);
    };

    // Read collection metadata
    //
    // https://m2x.att.com/developer/documentation/v2/collections#Read-Device-Metadata
    Collections.prototype.readMetadata = function(id, callback, errorCallback) {
        this.metadata.read("collections", id, callback, errorCallback);
    };

    // Update collection metadata
    //
    // https://m2x.att.com/developer/documentation/v2/collections#Update-Device-Metadata
    Collections.prototype.updateMetadata = function(id, params, callback, errorCallback) {
        this.metadata.update("collections", id, params, callback, errorCallback);
    };

    // Read collection metadata field
    //
    // https://m2x.att.com/developer/documentation/v2/collections#Read-Device-Metadata-Field
    Collections.prototype.readMetadataField = function(id, field, callback, errorCallback) {
        this.metadata.readField("collections", id, field, callback, errorCallback);
    };

    // Update collection metadata field
    //
    // https://m2x.att.com/developer/documentation/v2/collections#Update-Device-Metadata-Field
    Collections.prototype.updateMetadataField = function(id, field, value, callback, errorCallback) {
        this.metadata.updateField("collections", id, field, value, callback, errorCallback);
    };

    return Collections;
});

define('commands',["helpers"], function(helpers) {
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

define('devices',["helpers"], function(helpers) {
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

define('distributions',["helpers"], function(helpers) {
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

define('jobs',["helpers"], function(helpers) {
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

define('keys',["helpers"], function(helpers) {
    // Wrapper for AT&T M2X Keys API
    //
    // https://m2x.att.com/developer/documentation/keys
    var Keys = function(client) {
        this.client = client;
    };

    // List all the Master API Keys that belongs to the authenticated user
    //
    // https://m2x.att.com/developer/documentation/v2/keys#List-Keys
    Keys.prototype.list = function(callback, errorCallback) {
        return this.client.get("/keys", callback, errorCallback);
    };

    // Create a new API Key
    //
    // https://m2x.att.com/developer/documentation/v2/keys#Create-Key
    Keys.prototype.create = function(params, callback, errorCallback) {
        return this.client.post("/keys", {
            headers: { "Content-Type": "application/json" },
            params: params
        }, callback, errorCallback);
    };

    // Return the details of the API Key supplied
    //
    // https://m2x.att.com/developer/documentation/v2/keys#View-Key-Details
    Keys.prototype.view = function(key, callback, errorCallback) {
        return this.client.get(helpers.url("/keys/{0}", key), callback, errorCallback);
    };

    // Update API Key properties
    //
    // https://m2x.att.com/developer/documentation/v2/keys#Update-Key
    Keys.prototype.update = function(key, params, callback, errorCallback) {
        return this.client.put(helpers.url("/keys/{0}", key), {
            headers: { "Content-Type": "application/json" },
            params: params
        }, callback, errorCallback);
    };

    // Regenerate an API Key token
    //
    // Note that if you regenerate the key that you're using for
    // authentication then you would need to change your scripts to
    // start using the new key token for all subsequent requests.
    //
    // https://m2x.att.com/developer/documentation/v2/keys#Regenerate-Key
    Keys.prototype.regenerate = function(key, callback, errorCallback) {
        return this.client.post(helpers.url("/keys/{0}/regenerate", key), callback, errorCallback);
    };

    // Delete the supplied API Key
    //
    // https://m2x.att.com/developer/documentation/v2/keys#Delete-Key
    Keys.prototype.del = function(key, callback, errorCallback) {
        return this.client.del(helpers.url("/keys/{0}", key), callback, errorCallback);
    };

    return Keys;
});

define('metadata',["helpers"], function(helpers) {
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

define('m2x',["charts", "client", "collections", "commands", "devices", "distributions", "jobs", "keys", "metadata"],
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

    return require("m2x");
}));
