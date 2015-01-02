var es = require('event-stream'),
  debug = require('debug')('mongoscope-importer:mongo'),
  mongodbUri = require('mongodb-uri'),
  mongo = require('mongodb');

module.exports = {
    createWriteStream: function(url){
      debug('createWriteStream %s', url);
      var data = mongodbUri.parse(url);
      var parts = data.database.split('.');
      data.database = parts.shift();

      var uri = mongodbUri.format(data);
      var collectionName = parts.join('.');
      var collection, _db, i = 0;

      function connect(fn){
        if(_db) return process.nextTick(function(){
          fn(null, _db);
        });

        debug('connect %s', uri);
        mongo.connect(uri, function(err, db){
          if(err) return fn(err);
          _db = db;
          collection = db.collection(collectionName);
          fn();
        });
      }

      connect(function(err){
        if(err) console.error(err);
      });

      var start = Date.now();
      return es.through(function(doc){
        i++;
        var self = this;
        if(i % 1000 === 0){
          debug(' checkpoint: upserted %d docs', i);
        }
        else if(i === 1){
          debug('started: inserting first doc');
        }

        collection.update({_id: doc._id}, doc, {upsert: true, w: 0}, function(err){
          if(err) return self.emit('error', err);

          self.emit('data', doc);
        });
      }, function(){
        var ms = (Date.now() - start);
        debug('complete');
        debug('Total time: %dms', ms);
        debug('Docs: %d', i);
        debug('Throughput: %d ops/sec', (i/ms)*1000);

        this.emit('end');
        setTimeout(function(){
          _db.close();
        }, 100);

      });
    },
    createReadStream: function(db, collectionName, query){
      query = query || {};
      return db.collection(collectionName).find(query).stream();
    }
};
