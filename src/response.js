define(function() {
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
