// npm install express body-parser json-schema-faker

var jsf = require('json-schema-faker');

var schema = {
  type: 'object',
  properties: {
    user: {
      type: 'object',
      properties: {
        id: {
          $ref: '#/definitions/positiveInt'
        },
        name: {
          type: 'string',
          faker: 'name.findName'
        },
        email: {
          type: 'string',
          format: 'email',
          faker: 'internet.email'
        }
      },
      required: ['id', 'name', 'email']
    }
  },
  required: ['user'],
  definitions: {
    positiveInt: {
      type: 'integer',
      minimum: 0,
      exclusiveMinimum: true
    }
  }
};

var express = require('express');
var bodyParser = require('body-parser');

var app = express();

app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));


var addRequired = function(obj) {
    if(!obj.hasOwnProperty("type") ||
       ((obj["type"] != "object") && (obj["type"] != "array"))) {
        return;
    }

    if(obj.hasOwnProperty("items")) {
	    addRequired(obj["items"]);
        return;
    }

    if(obj.hasOwnProperty("properties")) {
        var props = obj["properties"];
        Object.keys(props).forEach(function( key ){
	        addRequired(props[ key ]);
        });
        obj["required"] = Object.keys(props);
    }
}


app.post('/schema/v1/api', function(req, res) {
    res.set('Content-Type', 'application/json');
    console.log("Schema:\n", JSON.stringify(req.body, null, 2)); // your JSON

    if(req.query.addRequired) {
        addRequired(req.body);
        console.log("Schema with required:\n",
                    JSON.stringify(req.body, null, 2)); // your JSON
    }

    var iterations = req.query.n || 1;
    var data = [];
    for(var i = 0; i < iterations; i++) {
        data.push(jsf(req.body));
    }
    console.log("Data:\n", JSON.stringify(data, null, 2));      // test data
    if(iterations == 1) {
        res.send(JSON.stringify(data[0], null, 2));
    }else{
        res.send(JSON.stringify(data, null, 2));
    }
});

app.post('/schema/v1/test', function(req, res) {
    res.set('Content-Type', 'application/json');
    var data = jsf(schema);
    console.log(data);      // test data
    res.send(JSON.stringify(data, null, 2));
});

app.listen(process.env.npm_package_config_port);
