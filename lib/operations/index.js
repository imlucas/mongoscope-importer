var zlib = require('zlib'),
  http = require('./http'),
  mongo = require('./mongo'),
  JSONStream = require('JSONStream'),
  fs = require('fs'),
  csv = require('csv-streamify');

var streams = {
  mongo: mongo,
  fs: {
    createReadSteam: fs.createReadStream,
    createWriteStream: fs.createWriteStream
  },
  json: {
    createReadStream: JSONStream.parse,
    createWriteStream: JSONStream.stringify
  },
  http: http
};

/**
 * Map Pipechain read steps to the underlying stream constructor.
 */
module.exports.read = {
  file: streams.fs.createReadStream,
  url: streams.http.createReadStream
};

/**
 * Map Pipechain write steps to the underlying stream constructor.
 */
module.exports.write = {
  mongo: streams.mongo.createWriteStream,
  url: streams.http.creatWriteStream,
  file: streams.fs.createWriteStream
};

/**
 * Transform steps.
 */
module.exports.transform = {
  fromGZIP: zlib.createGunzip,
  toGZIP: zlib.createGzip,
  fromJSON: streams.json.createReadStream,
  toJSON: streams.json.createWriteStream,
  fromCSV: function(){
    return csv({objectMode: true, columns: true});
  },
  fromTSV: function() {
    return csv({objectMode: true, delimiter: "\t"});
  }
};

module.exports.streams = streams;
