var es = require('event-stream'),
  debug = require('debug')('mongoscope-importer:mongo');

module.exports = {
    createWriteStream: function(db, collectionName){
      return es.through(function(obj){
        var collection = db.collection(collectionName);
        if(Array.isArray(obj)){
          var batch = collection.initializeUnorderedBulkOp();
          obj.map(function(doc){
            if(!doc._id && doc.id){
              doc._id = doc.id;
              delete doc.id;
            }
            batch.insert(doc);
          });
          batch.execute(function(err, res){
            debug('batch execute result', err, res);
            this.emit('data', obj);
          }.bind(this));
        }
        else{
          collection.insert(obj, function(){
            this.emit('data', obj);
          }.bind(this));
        }
      });
    },
    createReadStream: function(db, collectionName, query){
      query = query || {};
      return db.collection(collectionName).find(query).stream();
    }
};
