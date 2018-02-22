NodeHttpCodeGenerator = function() {
  var self;
  self = this;
  this.parseURL = function(url) {
    var schema = 'http';
    var host = 'localhost';
    var port = 80;
    var path = '/';
    var regexp = /(https?):\/\/([^\/:]+):?(\d*)(\/?.*)/;
    var match = url.match(regexp);
    if (match) {
      schema = match[1];
      host = match[2];
      port = match[3].length > 0 ? +match[3] : (function () {
          if (schema == 'https')
              return 443;
          return 80;
      })();
      path = match[4];
    }
    return {
      schema: schema,
      host: host,
      port: port,
      path: path,
    }
  }
  this.multipleRequestNotice = function (request) {
    if (request.length > 1) {
      return "// Warning: requests below are going to be executed in parallel\n\n";
    }
    return '';
  }
  this.generateRequest = function (request) {
    var headers = request.headers;
    for (var key in headers) {
      headers[key] = headers[key].trim();
    }
    var parsedUrl = self.parseURL(request.url)
    return "// request " + request.name + " \n(function(callback) {\n    'use strict';\n        \n    const httpTransport = require('" + parsedUrl.schema + "');\n    const responseEncoding = 'utf8';\n    const httpOptions = {\n        hostname: '" + parsedUrl.host + "',\n        port: '" + parsedUrl.port + "',\n        path: '" + parsedUrl.path + "',\n        method: '" + request.method + "',\n        headers: " + JSON.stringify(headers) + "\n    };\n    httpOptions.headers['User-Agent'] = 'node ' + process.version;\n \n" + ((request.httpBasicAuth ? '    // Using Basic Auth ' + JSON.stringify(request.httpBasicAuth) + "\n" : '') +
      (request.followRedirects ? "    // Paw Follow Redirects option is not supported\n" : '') +
      (request.storeCookies ? "    // Paw Store Cookies option is not supported\n" : '')) + "\n    const request = httpTransport.request(httpOptions, (res) => {\n        let responseBufs = [];\n        let responseStr = '';\n        \n        res.on('data', (chunk) => {\n            if (Buffer.isBuffer(chunk)) {\n                responseBufs.push(chunk);\n            }\n            else {\n                responseStr = responseStr + chunk;            \n            }\n        }).on('end', () => {\n            responseStr = responseBufs.length > 0 ? \n                Buffer.concat(responseBufs).toString(responseEncoding) : responseStr;\n            \n            callback(null, res.statusCode, res.headers, responseStr);\n        });\n        \n    })\n    .setTimeout(" + request.timeout + ")\n    .on('error', (error) => {\n        callback(error);\n    });\n    request.write(" + JSON.stringify(request.body) + ")\n    request.end();\n    \n\n})((error, statusCode, headers, body) => {\n    console.log('ERROR:', error); \n    console.log('STATUS:', statusCode);\n    console.log('HEADERS:', JSON.stringify(headers));\n    console.log('BODY:', body);\n});\n";
  }
  this.generate = function (requests) {
    return self.multipleRequestNotice(requests) + requests.map(self.generateRequest).join("\n");
  }
  return this.generate
}
module.exports = new NodeHttpCodeGenerator()
