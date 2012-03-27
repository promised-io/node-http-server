if (typeof define !== 'function') { var define = (require('amdefine'))(module); }

/**
* class node-http-server.Request
*
* Request object. This is not the raw Node request, it has been normalized.
**/
define([
  "compose",
  "url",
  "querystring",
  "promised-io/promise/defer",
  "promised-io/node-stream/Stream"
], function(Compose, url, querystring, defer, Stream){
  var EXPECT_CONTINUE = /^100-continue(;|$)/;

  /**
  * new node-http-server.Request(req, manualContinue)
  * - req (http.ServerRequest): Node's request object
  * - manualContinue (Boolean): Whether `Expect: 100-continue` needs to be continued manually.
  *
  * Create a new request instance.
  **/
  return Compose(function(req, manualContinue){
    Object.defineProperties(this, {
      _rawRequest: {
        value: req
      },

      /**
      * node-http-server.Request#headers -> Object
      *
      * Request headers.
      **/
      headers: {
        enumerable: true,
        value: req.headers
      },

      _parsedPathValue: {
        configurable: true,
        enumerable: false,
        writable: true,
        value: undefined
      },

      _parsePath: {
        enumerable: false,
        get: function(){
          return this._parsedPathValue || (this._parsedPathValue = url.parse("http://" + this.headers.host + this.path));
        }
      },

      /**
      * node-http-server.Request#method -> String
      *
      * Request method.
      **/
      method: {
        enumerable: true,
        value: req.method
      },

      /**
      * node-http-server.Request#path -> String
      *
      * Request path, including query component.
      **/
      path: {
        enumerable: true,
        value: req.url
      },

      /**
      * node-http-server.Request#pathname -> String
      *
      * Request pathname, excluding query component.
      **/
      pathname: {
        enumerable: true,
        get: function(){
          return this._parsePath.pathname;
        }
      },

      /**
      * node-http-server.Request#query -> String
      *
      * Query component from path.
      **/
      query: {
        enumerable: true,
        get: function(){
          return this._parsePath.query;
        }
      },

      /**
      * node-http-server.Request#query -> Object
      *
      * The query component from the path, parsed into a frozen object.
      **/
      _queryObject: {
        configurable: true,
        enumerable: false,
        writable: true,
        value: undefined
      },

      queryObject: {
        enumerable: true,
        get: function(){
          return this._queryObject || (this._queryObject = Object.freeze(querystring.parse(this.query)));
        }
      },

      /**
      * node-http-server.Request#host -> String
      *
      * Request host, including port.
      **/
      host: {
        enumerable: true,
        value: req.headers.host
      },

      /**
      * node-http-server.Request#hostname -> String
      *
      * Request hostname, excluding port.
      **/
      hostname: {
        enumerable: true,
        get: function(){
          return this._parsePath.hostname;
        }
      },

      /**
      * node-http-server.Request#port -> String
      *
      * Port from request host.
      **/
      port: {
        enumerable: true,
        get: function(){
          return this._parsePath.port;
        }
      }
    });

    /**
    * node-http-server.Request#body -> node-stream.Stream
    *
    * A stream for the request body, unless the request method is GET, DELETE
    * or HEAD.
    **/
    if(req.method !== "GET" && req.method !== "DELETE" && req.method !== "HEAD"){
      Object.defineProperty(this, "body", {
        enumerable: true,
        value: new Stream(req)
      });
    }

    /**
    * node-http-server.Request#expectContinue -> promise.Deferred
    *
    * If the request needs to be continued manually, resolving this deferred
    * will do so.
    **/
    if(manualContinue && EXPECT_CONTINUE.test(this.headers.expect)){
      Object.defineProperty(this, "expectContinue", {
        enumerable: true,
        value: defer()
      });
    }
  });
});
