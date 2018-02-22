var HTTPieCodeGenerator, addslashes;

(function(root) {
  var ref;
  if ((ref = root.bundle) != null ? ref.minApiVersion('0.2.0') : void 0) {
    root.URI = root.URI || require("./included_extensions/com.luckymarmot.PawExtensions.HTTPieCodeGenerator/URI");
    return root.Mustache = root.Mustache || require("./mustache");
  } else {
    root.URI = root.URI || require("./included_extensions/com.luckymarmot.PawExtensions.HTTPieCodeGenerator/URI.js");
    return root.Mustache = root.Mustache || require("mustache.js");
  }
})(this);

addslashes = function(str) {
  return ("" + str).replace(/[\\"]/g, '\\$&');
};

HTTPieCodeGenerator = function() {
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
    var has_tabs_or_new_lines, json_body, multipart_body, name, raw_body, url_encoded_body, value;
    json_body = request.jsonBody;
    if (json_body && !json_body.length) {
      return {
        "has_form_encoded": false,
        "has_json_encoded": true,
        "has_json_body": true,
        "json_body_object": this.json_body_object(json_body)
      };
    }
    url_encoded_body = request.urlEncodedBody;
    if (url_encoded_body) {
      return {
        "has_form_encoded": true,
        "has_json_encoded": false,
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
        "has_form_encoded": true,
        "has_json_encoded": false,
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
        has_tabs_or_new_lines = null !== /\r|\n|\t/.exec(raw_body);
        return {
          "has_form_encoded": true,
          "has_json_encoded": false,
          "has_raw_body_with_tabs_or_new_lines": has_tabs_or_new_lines,
          "has_raw_body_without_tabs_or_new_lines": !has_tabs_or_new_lines,
          "raw_body": addslashes(raw_body)
        };
      } else {
        return {
          "has_form_encoded": true,
          "has_json_encoded": false,
          "has_long_body": true
        };
      }
    }
  };
  this.json_body_object = function(object) {
    var key, s, value;
    if (object === null || !object || typeof object === 'undefined') {
      s = "null";
    } else if (typeof object === 'string') {
      s = "\"" + (addslashes(object)) + "\"";
    } else if (typeof object === 'number') {
      s = "" + object;
    } else if (typeof object === 'boolean') {
      s = "" + (object ? "true" : "false");
    } else {
      if (object.length != null) {
        s = "    \"" + (addslashes(JSON.stringify(object))) + "\"";
      } else {
        s = "";
        for (key in object) {
          value = object[key];
          if (s.length > 0) {
            s += ' \\\n';
          }
          if (typeof value === 'string') {
            s += "    " + (addslashes(key)) + "=\"" + (addslashes(value)) + "\"";
          } else if (typeof value === 'object' && value !== null) {
            s += "    " + (addslashes(key)) + ":=\"" + (addslashes(JSON.stringify(value, null, '  '))) + "\"";
          } else {
            s += "    " + (addslashes(key)) + ":=" + (addslashes(value));
          }
        }
      }
    }
    return s;
  };
  this.strip_last_backslash = function(string) {
    var i, j, lines, ref;
    lines = string.split("\n");
    for (i = j = ref = lines.length - 1; ref <= 0 ? j <= 0 : j >= 0; i = ref <= 0 ? ++j : --j) {
      lines[i] = lines[i].replace(/\s*\\\s*$/, "");
      if (!lines[i].match(/^\s*$/)) {
        break;
      }
    }
    return lines.join("\n");
  };
  this.multipleRequestNotice = function (request) {
    if (request.length > 1) {
      return "# Warning: requests below are going to be executed in consecutively\n\n";
    }
    return '';
  }
  this.generateRequest = function(request) {
    var rendered_code, template, view;
    view = {
      "request": request,
      "method": request.method.toUpperCase(),
      "url": this.url(request),
      "headers": this.headers(request),
      "body": this.body(request)
    };
    template = readFile("./included_extensions/com.luckymarmot.PawExtensions.HTTPieCodeGenerator/httpie.mustache");
    rendered_code = Mustache.render(template, view);
    return this.strip_last_backslash(rendered_code);
  };
  this.generate = function (requests) {
    return self.multipleRequestNotice(requests) + requests.map(self.generateRequest).join("\n");
  }
  return this.generate
}
module.exports = HTTPieCodeGenerator()
