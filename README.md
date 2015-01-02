# mongoscope-importer

[![build status](https://secure.travis-ci.org/imlucas/mongoscope-importer.png)](http://travis-ci.org/imlucas/mongoscope-importer)

> Work in progress

## Example

Download all raw results from dyno production pool and insert them into your local `dyno.results` collection:

```
mim dyno.results "http://dyno.mongodb.parts/api/v1/results?limit=10&query={\"testbed.servers.mongod.0.hostinfo.system.hostname\":\"ec2-ubu-1\"}" "*"
```


## Install

```
npm install --save mongoscope-importer
```

## Test

```
npm test
```

## API

> @todo
