if (typeof define !== 'function') { var define = (require('amdefine'))(module); }

/**
* node-http-server
*
* Provides a JSGI-like, promise-based HTTP server.
**/
define([
  "./_errors",
  "./Server"
], function(errors, Server){
  "use strict";

  return {
    SocketClosedError: errors.SocketClosedError,
    Server: Server
  };
});
