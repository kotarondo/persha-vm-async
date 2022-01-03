#!/usr/bin/env node

var http = require('http');
var express = require('express');
var path = require('path');

var app = express();
app.use('/', express.static(path.join(__dirname, '..', 'coverage')));
var server = http.createServer();
server.on('request', app);
server.listen(8000);
