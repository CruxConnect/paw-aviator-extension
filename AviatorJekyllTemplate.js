var AviatorJekyllTemplate

(function(root) { // Requires all our included modules
  var ref;
  if ((ref = root.bundle) != null ? ref.minApiVersion('0.2.0') : void 0) {
    root.curl =   require("./included_extensions/com.luckymarmot.PawExtensions.cURLCodeGenerator/cURLCodeGenerator")
    root.python = require("./included_extensions/com.luckymarmot.PawExtensions.PythonRequestsCodeGenerator/PythonRequestsCodeGenerator")
    root.node =   require("./included_extensions/io.andrian.PawExtensions.NodeHttpCodeGenerator/NodeHttpCodeGenerator")
    root.httpie = require("./included_extensions/com.luckymarmot.PawExtensions.HTTPieCodeGenerator/HTTPieCodeGenerator")
    return root.Mustache = require("./mustache");
  } else {
    require("included_extensions/com.luckymarmot.PawExtensions.cURLCodeGenerator/cURLCodeGenerator")
    require("included_extensions/com.luckymarmot.PawExtensions.PythonRequestsCodeGenerator/PythonRequestsCodeGenerator")
    require("included_extensions/io.andrian.PawExtensions.NodeHttpCodeGenerator/NodeHttpCodeGenerator")
    require("included_extensions/com.luckymarmot.PawExtensions.HTTPieCodeGenerator/HTTPieCodeGenerator")
    return require("mustache.js");
  }
})(this);

AviatorJekyllTemplate = function() {
  var self;
  self = this;
  this.path = function(url) {
    var path; path = url.replace(/^https?:\/\/[^\/]+/i, '');
    if (!path) {
      path = '/';
    }
    return path;
  };
  this.makeExchange = function(request) {
    const http_request = new NetworkHTTPRequest();
    http_request.requestUrl = request.url
    http_request.requestMethod = request.method
    http_request.requestBody = request.getBody()
    var headers = request.getHeaders()
    Object.keys(headers).forEach(key => {
      http_request.setRequestHeader(key, headers[key])
    })
    http_request.send()
    if (http_request.responseStatusCode === 200) {
      return http_request.responseBody
    }
    return null
  }
  this.getReponse = function(request) {
    var exchange = request.getLastExchange()
    if (!exchange) {
      return this.makeExchange(request)
    }
    return exchange.responseBody
  }
  this.prettify = function(object) {
    try{
      var body = JSON.stringify(JSON.parse(object), null, 2);
          // body = JSON.stringify(JSON.parse(body), null, 4);
      body_indentation = '  ';
      body = body.replace(/^/gm, body_indentation);
      return body
    } catch (error) {
      return null
    }
  }
  this.multipleRequestNotice = function (requests) {
    if (requests.length > 1) {
      return "# Warning: this file contains documentation for " + requests.length + " api calls\n\n";
    }
    return '';
  }
  this.getGroup = function(parent) {
    var name = parent.name || ''
    return (parent.parent ? self.getGroup(parent.parent) + ' ⇾ ' : '') + name
  }
  this.generateRequest = function(request) {
    var template = readFile("aviatorjekylltemplate.mustache");
    // console.log('python_request', python(context, [request], options))
    // console.log('httpie_request', httpie(context, [request], options))
    // console.log('node_request', node(context, [request], options))
    // console.log('curl_request', curl(context, [request], options))

    // Parse the body for the different description parts
    var body = request.body.replace(/\n/g, "\n  ")
    var short_description = request.description.split('# Short Description').pop().split('# Long Description').shift().trim("\n")
    var long_description = request.description.split('# Long Description').pop().split('# Response Codes').shift().trim("\n")
    var response_codes = request.description.split('# Response Codes').pop().split('# Error Response').shift().trim("\n")
    // var error = request.description.split('# Error Response').pop().trim("\n")
    var error = undefined // TODO: errors aren't yet defined.

    return Mustache.render(template, {
      group: self.getGroup(request.parent),
      name: request.name,
      title: self.path(request.urlBase),
      position: request.order,
      method: request.method.toLowerCase(),
      short_description: short_description,
      body: self.prettify(request.body),
      response: self.prettify(self.getReponse(request)),
      error: self.prettify(error),
      long_description: long_description,
      response_codes: response_codes,
      curl_request: curl([request]),
      httpie_request: httpie([request]),
      python_request: python([request]),
      node_request: node([request]),
    });
  }
  this.generate = function(context, requests, options) {
    // console.log('context', JSON.stringify(context))
    // console.log('requests', JSON.stringify(requests))
    // console.log('options', JSON.stringify(options))
    return self.multipleRequestNotice(requests) + requests.map(self.generateRequest).join("\n\n\n");
  }
}

AviatorJekyllTemplate.languageHighlighter = "markdown"
AviatorJekyllTemplate.identifier = "com.crux.AviatorJekyllTemplate"
AviatorJekyllTemplate.title = "Crux Aviator Jekyll Template Generator";
AviatorJekyllTemplate.fileExtension = "md";
registerCodeGenerator(AviatorJekyllTemplate)
