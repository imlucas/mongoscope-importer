var Pipechain = require('./pipechain'),
  ops = require('./operations');

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

module.exports.streams = ops.streams;
