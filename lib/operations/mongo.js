var es = require('event-stream'),
  debug = require('debug')('mongoscope-importer:mongo');

module.exports = {
    createWriteStream: function(db, collectionName){
      return es.through(function(obj){
        if(Array.isArray(obj)){
          var batch = db.collection(collectionName).initializeUnorderedBulkOp();
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
          this.collection.insert(obj, function(){
            this.emit('data', obj);
          }.bind(this));
        }
      });
    },
    createReadStream: function(){
      throw new Error('Not Implemented');
    }
};
