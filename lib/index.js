var Pipechain = require('./pipechain'),
  ops = require('./operations'),
  streams = ops.streams,
  EJSON = require('mongodb-extended-json'),
  gunzip = require('gunzip-maybe'),
  peek = require('peek-stream'),
  debug = require('debug')('mongoscope-importer');

/**
 * Express middleware to build a real pipechain from user input and return a
 * list of write streams.
 */
module.exports = function(req, res){
  var pipechain, data = JSON.parse(req.param('pipechain'));
  if(data.write[0].name === 'mongo'){
    data.write[0].args = [req.db, req.param('collection_name')];
  }

  pipechain = new Pipechain(data)
    .run(function(){
      res.send({state: 'complete', collection_name: req.param('collection_name')});
    })
    .on('error', function(err){
      res.send(400, {message: err.message});
    });
};

module.exports.streams = streams;

var urlType = function(url){
  if(url.indexOf('http') === 0){
    debug('%s type is `http`', url);
    return 'http';
  }
  if(url.indexOf('mongodb') === 0){
    debug('%s type is `mongodb`', url);
    return 'mongodb';
  }
  debug('%s type is `file`', url);
  return 'file';
};

var readers = {
  file: streams.fs.createReadStream,
  http: streams.http.createReadStream,
  mongodb: streams.mongo.createReadStream
};

var writers = {
  mongodb: streams.mongo.createWriteStream,
  http: streams.http.creatWriteStream,
  file: streams.fs.createWriteStream
};

function deserialize(req, options){
  var contentType;
  req.on('response', function(response) {
    contentType = response.headers['content-type'];
    debug('content type is %s', contentType);
  });


  return peek(function(data, swap) {
    if(!contentType){
      // we do not know - bail
      return swap(new Error('No content type?'));
    }
    if(contentType === 'application/json'){
      debug('creating json stream parser for path `%s`', options.jsonpath);
      return swap(null, EJSON.createParseStream(options.jsonpath));
    }
    if(contentType === 'text/csv'){
      return swap(null, streams.transforms.fromCSV());
    }
  });
}

module.exports.read = function(url, options){
  options = options || {};
  options.jsonpath = options.jsonpath || '*';

  var _type = urlType(url);
  var fn =  readers[_type];
  var stream = fn.apply(null, arguments);
  if(_type === 'http'){
    debug('adding maybe gunzip and deserialize for http read');
    stream = stream.pipe(gunzip())
      .pipe(deserialize(stream, options));
  }
  return stream;
};

module.exports.write = function(url){
  var _type = urlType(url);
  var fn =  writers[_type];
  var stream = fn.apply(null, arguments);
  return stream;
};
