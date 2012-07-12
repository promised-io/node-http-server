if (typeof define !== 'function') { var define = (require('amdefine'))(module); }

define([
  "./_errors",
  "./Request",
  "promised-io/promise/call"
], function(errors, Request, call){
  "use strict";

  function noop(){}

  function endRequest(req){
    if(!req.complete){
      req.removeAllListeners("data");
      req.removeAllListeners("end");
      req.removeAllListeners("error");
      req.removeAllListeners("close");
      req.addListener("error", noop);
      req.resume();
    }
  }

  function sendResponse(req, res, response){
    if(!response || !response.hasOwnProperty("status") || !response.hasOwnProperty("headers")){
      throw new TypeError("Missing status and/or headers");
    }

    // Set implicit headers so we can back out if sending the body fails
    res.statusCode = response.status;
    Object.keys(response.headers).forEach(function(name){
      res.setHeader(name, response.headers[name]);
    });
    if(response.body){
      return sendBody(res, response.body).then(function(){
        endRequest(req);
      });
    }else{
      res.end();
      endRequest(req);
    }
  }

  function sendBody(res, body){
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
          if(!promise.isFulfilled()){
            res.writeContinue();
          }
        }, function(){
          if(!promise.isFulfilled()){
            res.close();
          }
        });
      }

      promise = call(app, null, request).then(function(response){
        return sendResponse(req, res, response);
      }).fail(function(error){
        reportError(error, request);
        if(!res.bytesWritten){
          try{
            res.writeHead(500);
            res.end("An unknown error occured.");
          }catch(error){
            reportError(error, request);
          }
        }
      });
      req.on("close", function(){
        promise.cancel(new errors.InboundSocketClosedError());
      });
    };
  };
});
