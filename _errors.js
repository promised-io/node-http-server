if (typeof define !== 'function') { var define = (require('amdefine'))(module); }

define([
  "exports",
  "promised-io/lib/errorFactory"
], function(exports, errorFactory){
  /**
  * class node-http-server.InboundSocketClosedError
  *
  * The inbound request socket was unexpectedly closed.
  **/
  exports.InboundSocketClosedError = errorFactory("InboundSocketClosedError", "Inbound request socket closed.");
});
