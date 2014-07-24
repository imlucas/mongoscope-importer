#!/usr/bin/env node

var importer = require('../'),
  fs = require('fs'),
  MongoClient = require('mongodb').MongoClient,
  datasets = require('mongodb-datasets'),
  yargs = require('yargs')
    .usage('Mongoscope-Importer version 0.0.0')
    .example('$0 schema.json -n 10 -c docs', '')
    .example('cat schema.json | $0 -n 10 -c docs', '')
    .describe(0, 'Path to a datasets schema file')
    .options('n', {
      demand: true,
      alias: 'size',
      describe: 'Number of documents to generate'
    })
    .options('d', {
      alias: 'dbpath',
      default: 'mongodb://localhost:27017/test',
      describe: 'URI of your MongoDB database'
    })
    .options('c', {
      demand: true,
      alias: 'collection',
      describe: 'MongoDB collection to store results'
    })
    .check(function (argv) {
      if (argv._.length > 1)
        throw 'Too many arguments!';
      var _0 = argv._[0];
      if (_0 && _0 !== 'help' && !fs.existsSync(_0))
        throw 'Schema file does not exist!';
    });
var argv = yargs.argv;

if(argv.h || argv.help || argv._[0] === 'help')
  return yargs.showHelp();

MongoClient.connect(argv.dbpath, function(err, db){
  if (err) throw err;

  (argv._[0] ? fs.createReadStream(argv._[0]) : process.stdin)
    .pipe(datasets.createGeneratorStream({size: argv.size}))
    .pipe(importer.streams.mongo.createWriteStream(db, argv.collection))
    .on('end', function(){
      console.log('your mongo has data now!  noms!');
    });
});
