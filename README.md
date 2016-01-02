# json-test-data server

JSON test data generator, node.js server accepting JSON Schema with
annotations conforming to json-schema-faker, and returns JSON sample
data.  This server is meant to provide services during an automated build
process in order to provide sample data given an annotated JSON Schema
file.

See https://github.com/json-schema-faker/json-schema-faker for more
information on the format of the JSON Schema annotations.

## Dockerfile

This is a simple Dockerfile which uses the standard Node -onbuild
image to automatically load and run the server.js file.  The server
listens on port 3000 (specified in the package.json file and
modifiable via standard process.env.npm_package_config_port)

To run the image:

    % docker run -it --rm -p 3000:3000 cjnygard/json-test-data

## Usage

The server expects the annotated JSON Schema file to be send to the
URL as a POST command.  The resulting JSON output will be provided as
**'Content-Type: application/json'**.

    % curl -v -H "Content-Type: application/json" --data-binary \
    "@test.json" -X POST http://docker:3000/schema/v1/api > data.json

### Parameters

The POST query can be modified with two URL parameters.

#### n=<iterations>

The n=<iterations> will trigger multiple instances of the test data
to be generated, according to the number specified in <iterations>.
For example, n=3 will output an array containing three instances of
the JSON Schema structure as concrete JSON elements.

When n is not specified or n=1, the server will remove the enclosing
array and just return the single generated JSON element.

    % curl -v -H "Content-Type: application/json" --data-binary \
    "@test.json" -X POST http://docker:3000/schema/v1/api?n=3


#### addRequired=1

The addRequired=1 flag will trigger the server to scan through the
JSON Schema and add appropriate "required" : [...] arrays ensuring
that all Schema elements are emitted in the test data.

Currently, the addRequired flag does not guess at the appropriate
content of the faked data, it just adds the fields to the array to
ensure *something* is output for all fields.

    % curl -v -H "Content-Type: application/json" --data-binary \
    "@test.json" -X POST http://docker:3000/schema/v1/api?addRequired=1


## Maven integration

See http://github.com/cjnygard/rest-maven-plugin for an example of a
Maven plugin which performs the REST POST request with JSON Schema
to transform the output into JSON test data automatically.
