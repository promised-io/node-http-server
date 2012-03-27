if (typeof define !== "function") { var define = (require("amdefine"))(module); }

define([
  "util",
  "stream",
  "promised-io/test/test-case",
  "promised-io/test/test-case/assert",
  "promised-io/test/test-case/refute",
  "../Request"
], function(util, Stream, testCase, assert, refute, Request){

  function FakeRequest(){
    Stream.call(this);

    this.httpVersion = "1.1";
    this.complete = false;
    this.headers = {
      "host": "localhost:8080",
      "connection": "keep-alive",
      "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_8) AppleWebKit/535.11 (KHTML, like Gecko) Chrome/17.0.963.83 Safari/535.11",
      "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "accept-encoding": "gzip,deflate,sdch",
      "accept-language": "en-US,en;q=0.8,en-GB;q=0.6",
      "accept-charset": "ISO-8859-1,utf-8;q=0.7,*;q=0.3"
    };
    this.trailers = {};
    this.readable = true;
    this.url = "/foo/bar?quux=qoo";
    this.method = "GET";
    this.statusCode = null;
    this.httpVersionMajor = 1;
    this.httpVersionMinor = 1;
    this.upgrade = false;
  };

  util.inherits(FakeRequest, Stream);

  FakeRequest.prototype.destroy = function(){};
  FakeRequest.prototype.pause = function(){};
  FakeRequest.prototype.resume = function(){};


  return testCase("node-http-server/Request", {
    beforeEach: function(){
      this.fakeRequest = new FakeRequest();
    },

    "Parsing Request": function(){
      var req = this.fakeRequest;
      var request = new Request(req);

      assert.equal(request.path, req.url);
      assert.equal(request.method, req.method);
      assert.deepEqual(request.headers, req.headers);

      assert.equal(request.pathname, "/foo/bar");
      assert.equal(request.query, "quux=qoo");
      assert.deepEqual(request.queryObject, {"quux": "qoo"});

      // GET, DELETE, and HEAD requests should not have a body:
      refute(request.body);
      refute(request.expectContinue);
    },

    "request with body": function(){
      var req = this.fakeRequest;
      req.method = "POST";

      var request = new Request(req);

      assert(request.body);
      refute(request.expectContinue);

      var counter = 0;
      req.emit("data", "test0");

      return request.body.forEach(function(chunk, index){
        assert.equal(chunk, "test" + counter);
        assert.equal(index, counter);

        counter++;

        if(counter < 3){
          req.emit("data", "test" + counter);
        }else if(counter === 3){
          req.emit("end");
        }
      });
    },

    "Expect-Continue": {
      "header & manual continue": function(){
        var req = this.fakeRequest;
        req.headers.expect = "100-continue";

        var request = new Request(req, true);

        assert(request.expectContinue);
      },

      "missing header": function(){
        var req = this.fakeRequest;
        var request = new Request(req, true);

        refute(request.expectContinue);
      },
      
      "not manual continue": function(){
        var req = this.fakeRequest;
        req.headers.expect = "100-continue";

        var request = new Request(req, false);

        refute(request.expectContinue);
      }
    }
  });
});
