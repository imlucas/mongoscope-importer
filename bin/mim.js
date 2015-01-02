#!/usr/bin/env node

process.env.DEBUG = '*';

var fs = require('fs'),
  docopt = require('docopt').docopt,
  doc = fs.readFileSync(__dirname + '/mim.docopt', 'utf-8'),
  argv = docopt(doc, {version: require('../package.json').version}),
  mim = require('../');

mim.read(argv['<url>'])
  .pipe(mim.write('mongodb://localhost:27017/' + argv['<ns>']));
