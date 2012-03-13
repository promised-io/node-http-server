if (typeof define !== 'function') { var define = (require('amdefine'))(module); }

define([
  "exports",
  "promised-io/lib/errorFactory"
], function(exports, errorFactory){
  /**
  * class node-http-server.SocketClosedError
  *
  * The request socket was unexpectedly closed.
  **/
  exports.SocketClosedError = errorFactory("SocketClosedError", "Request socket closed.");
});
