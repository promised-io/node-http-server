if (typeof define !== 'function') { var define = (require('amdefine'))(module); }

/**
* class node-http-server.Request
*
* Request object. This is not the raw Node request, it has been normalized.
**/
define([
  "compose",
  "url",
  "promised-io/promise/defer",
  "promised-io/node-stream/Stream"
], function(Compose, url, defer, Stream){
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

      /**
      * node-http-server.Request#body -> node-stream.Stream
      *
      * A stream for the request body.
      **/
      body: {
        enumerable: true,
        value: new Stream(req)
      }
    });

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
  }, {
    _parsePath: function(){
      return this._parsed || url.parse("http://" + this.headers.host + this.path);
    },

    /**
    * node-http-server.Request#method -> String
    *
    * Request method.
    **/
    get method(){
      return this._rawRequest.method;
    },

    /**
    * node-http-server.Request#path -> String
    *
    * Request path, including query component.
    **/
    get path(){
      return this._rawRequest.url;
    },

    /**
    * node-http-server.Request#pathname -> String
    *
    * Request pathname, excluding query component.
    **/
    get pathname(){
      return this._parsePath().pathname;
    },

    /**
    * node-http-server.Request#query -> String
    *
    * Query component from path.
    **/
    get query(){
      return this._parsePath().query;
    },

    /**
    * node-http-server.Request#host -> String
    *
    * Request host, including port.
    **/
    get host(){
      return this.headers.host;
    },

    /**
    * node-http-server.Request#hostname -> String
    *
    * Request hostname, excluding port.
    **/
    get hostname(){
      return this._parsePath().hostname;
    },

    /**
    * node-http-server.Request#port -> String
    *
    * Port from request host.
    **/
    get port(){
      return this._parsePath().port;
    }
  });
});
