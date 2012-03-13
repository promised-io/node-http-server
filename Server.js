if (typeof define !== 'function') { var define = (require('amdefine'))(module); }

/**
* class node-http-server.Server
*
* A promise-based HTTP server.
**/
define([
  "compose",
  "http",
  "events",
  "./_requestHandler",
  "promised-io/promise/node-style/apply"
], function(Compose, http, events, requestHandler, applyAsync){
  "use strict";

  /**
  * new node-http-server.Server(app[, options])
  * - app (Function): Function to handle incoming requests. Must return a response object or a promise for one.
  * - options (Object): If `autoContinue` is `false`, requests with `Expect: 100-continue` need to be manually continued.
  *
  * Creates a server instance.
  **/
  return Compose(events.EventEmitter, function(app, options){
    options = options || {};
    app = requestHandler(app, options, this.emit.bind(this, "reportError"));

    this._server = http.createServer();
    this._server.on("close", this.emit.bind(this, "close"));
    this._server.on("request", app);
    if(options.autoContinue === false){
      this._server.on("checkContinue", app);
    }
  }, {
    /**
    * node-http-server.Server@close()
    *
    * Emitted when the server is closed.
    **/

    /**
    * node-http-server.Server@reportError(error)
    *
    * Emitted when an error was returned by the application, or the response
    * could not be sent.
    **/

    /**
    * node-http-server.Server#listen(port[, hostname])
    * - port (String | Number)
    * - hostname (String)
    *
    * Start listening.
    **/
    /**
    * node-http-server.Server#listen(path)
    * - path (String)
    *
    * Start listening.
    **/
    listen: function(){
      return applyAsync(this._server.listen, this._server, arguments);
    },

    /**
    * node-http-server.Server#close()
    *
    * Close the server.
    **/
    close: function(){
      this._server.close();
    }
  });
});
