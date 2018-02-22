(function(root) {
  var ref;
  if ((ref = root.bundle) != null ? ref.minApiVersion('0.2.0') : void 0) {
    root.URI = root.URI || require("./included_extensions/com.luckymarmot.PawExtensions.PythonRequestsCodeGenerator/URI");
    return root.Mustache = root.Mustache || require("./mustache");
  } else {
    root.URI = root.URI || require("./included_extensions/com.luckymarmot.PawExtensions.PythonRequestsCodeGenerator/URI.js");
    return root.Mustache = root.Mustache || require("mustache.js");
  }
})(this);

addslashes = function(str) {
  return ("" + str).replace(/[\\"]/g, '\\$&');
};

PythonRequestsCodeGenerator = function() {
  var self;
  self = this;
  this.url = function(request) {
    var name, url_params, url_params_object, value;
    url_params_object = (function() {
      var _uri;
      _uri = URI(request.url);
      return _uri.search(true);
    })();
    url_params = (function() {
      var results;
      results = [];
      for (name in url_params_object) {
        value = url_params_object[name];
        results.push({
          "name": addslashes(name),
          "value": addslashes(value)
        });
      }
      return results;
    })();
    return {
      "base": addslashes((function() {
        var _uri;
        _uri = URI(request.url);
        _uri.search("");
        return _uri;
      })()),
      "params": url_params,
      "has_params": url_params.length > 0
    };
  };
  this.headers = function(request) {
    var header_name, header_value, headers;
    headers = request.headers;
    return {
      "has_headers": Object.keys(headers).length > 0,
      "header_list": (function() {
        var results;
        results = [];
        for (header_name in headers) {
          header_value = headers[header_name];
          results.push({
            "header_name": addslashes(header_name),
            "header_value": addslashes(header_value)
          });
        }
        return results;
      })()
    };
  };
  this.body = function(request) {
    var json_body, multipart_body, name, raw_body, url_encoded_body, value;
    json_body = request.jsonBody;
    if (json_body) {
      return {
        "has_json_body": true,
        "json_body_object": this.json_body_object(json_body, 2)
      };
    }
    url_encoded_body = request.urlEncodedBody;
    if (url_encoded_body) {
      return {
        "has_url_encoded_body": true,
        "url_encoded_body": (function() {
          var results;
          results = [];
          for (name in url_encoded_body) {
            value = url_encoded_body[name];
            results.push({
              "name": addslashes(name),
              "value": addslashes(value)
            });
          }
          return results;
        })()
      };
    }
    multipart_body = request.multipartBody;
    if (multipart_body) {
      return {
        "has_multipart_body": true,
        "multipart_body": (function() {
          var results;
          results = [];
          for (name in multipart_body) {
            value = multipart_body[name];
            results.push({
              "name": addslashes(name),
              "value": addslashes(value)
            });
          }
          return results;
        })()
      };
    }
    raw_body = request.body;
    if (raw_body) {
      if (raw_body.length < 5000) {
        return {
          "has_raw_body": true,
          "raw_body": addslashes(raw_body)
        };
      } else {
        return {
          "has_long_body": true
        };
      }
    }
  };
  this.json_body_object = function(object, indent) {
    var indent_str, indent_str_children, key, s, value;
    if (indent == null) {
      indent = 0;
    }
    if (object === null) {
      s = "None";
    } else if (typeof object === 'string') {
      s = "\"" + (addslashes(object)) + "\"";
    } else if (typeof object === 'number') {
      s = "" + object;
    } else if (typeof object === 'boolean') {
      s = "" + (object ? "True" : "False");
    } else if (typeof object === 'object') {
      indent_str = Array(indent + 2).join('    ');
      indent_str_children = Array(indent + 3).join('    ');
      if (object.length != null) {
        s = "[\n" + ((function() {
          var i, len, results;
          results = [];
          for (i = 0, len = object.length; i < len; i++) {
            value = object[i];
            results.push("" + indent_str_children + (this.json_body_object(value, indent + 1)));
          }
          return results;
        }).call(this)).join(',\n') + ("\n" + indent_str + "]");
      } else {
        s = "{\n" + ((function() {
          var results;
          results = [];
          for (key in object) {
            value = object[key];
            results.push(indent_str_children + "\"" + (addslashes(key)) + "\": " + (this.json_body_object(value, indent + 1)));
          }
          return results;
        }).call(this)).join(',\n') + ("\n" + indent_str + "}");
      }
    }
    return s;
  };
  this.multipleRequestNotice = function (request) {
    if (request.length > 1) {
      return "# Warning: requests below are going to be executed in consecutively\n\n";
    }
    return '';
  }
  this.generateRequest = function(request) {
    var template, view;
    view = {
      "request": request,
      "method": request.method.toLowerCase(),
      "url": this.url(request),
      "headers": this.headers(request),
      "body": this.body(request)
    };
    template = readFile("included_extensions/com.luckymarmot.PawExtensions.PythonRequestsCodeGenerator/python.mustache");
    return Mustache.render(template, view);
  };
  this.generate = function (requests) {
    return self.multipleRequestNotice(requests) + requests.map(self.generateRequest).join("\n");
  }
  return this.generate
};
module.exports = new PythonRequestsCodeGenerator()
