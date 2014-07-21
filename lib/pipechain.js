var util = require('util'),
  EventEmitter = require('events').EventEmitter,
  es = require('event-stream'),
  debug = require('debug')('mongoscope-importer:pipechain'),
  ops = require('./operations');

function Pipechain(data){
  this.data = data;
}
util.inherits(Pipechain, EventEmitter);

Pipechain.prototype.run = function(fn){
  var steps = {},
    spec = this.data.read[0],
    self = this;

  function progress(name){
    return es.through(function(data){
      self.emit('step progress', name);
      this.emit('data', data);
    }, function(){
      self.emit('step complete', name);
      this.emit('end');
    });
  }

  debug('read spec', spec);
  steps[spec.name] = [ops.read[spec.name].apply(this, spec.args)];


  this.data.transform.map(function(trans){
    if(!ops.transform[trans.name]){
      throw new Error('Unknown transform: ' + trans.name);
    }
    steps[spec.name].push(ops.transform[trans.name].apply(this, trans.args));
    steps[spec.name].push(progress(trans.name));
  });

  this.data.write.map(function(writeSpec){
    steps[spec.name].push(ops.write[writeSpec.name].apply(this, writeSpec.args));
    steps[spec.name].push(progress(writeSpec.name));
  });

  steps[spec.name].push(es.wait(function(){
    debug('pipechain complete!');
    fn();
  }));

  this.on('step progress', function(step){
    debug('progress on step', step);
  })
  .on('step complete', function(step){
    debug('completed', step);
  });
  this.pipeline = es.pipeline.apply(this, steps[spec.name]);
  return this;
};
