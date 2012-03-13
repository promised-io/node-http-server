if (typeof define !== 'function') { var define = (require('amdefine'))(module); }

define([
  "./_errors",
  "./Request",
  "promised-io/promise/call"
], function(errors, Request, call){
  "use strict";

  function sendResponse(response){
    if(!response || !("status" in response) || !("headers" in response)){
      throw new TypeError("Missing status and/or headers");
    }

    // Set implicit headers so we can back out if sending the body fails
    this.statuscode = response.status;
    Object.keys(response.headers).forEach(function(name){
      this.setHeader(name, response.headers[name]);
    }, this);
    if("body" in response){
      return sendBody(response.body, this);
    }else{
      return this.end();
    }
  }

  function handleFailure(reportError, error){
    reportError(error);
    try{
      this.writeHead(500);
      this.end("An unknown error occured.");
    }catch(error){
      reportError(error);
    }
  }

  function sendBody(body, res){
    var promise;
    if(typeof body.pipe === "function"){
      promise = call(body.pipe, body, res);
    }else if(typeof body.forEach === "function"){
      promise = call(body.forEach, body, function(chunk){ res.write(chunk); });
    }else if(typeof body.join === "function"){
      promise = call(body.join, body, "").then(res.write.bind(res));
    }
    return promise.then(function(){ res.end(); });
  }

  return function(app, options, reportError){
    return function(req, res){
      var request = new Request(req, options.autoContinue === false);
      var promise;

      if(request.expectContinue){
        request.expectContinue.then(function(){
          !promise.isFulfilled() && res.writeContinue();
        }, function(){
          !promise.isFulfilled() && res.close();
        });
      }

      promise = call(app, null, request)
          .then(sendResponse.bind(res))
          .fail(handleFailure.bind(res, reportError));
      req.on("close", function(){
        promise.cancel(new errors.SocketClosedError);
      });
    };
  };
});
