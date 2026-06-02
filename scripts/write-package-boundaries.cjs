#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const dist = path.resolve(projectRoot, 'dist');
const esm = path.resolve(dist, 'esm');

fs.mkdirSync(esm, {recursive: true});

fs.writeFileSync(
  path.resolve(dist, 'package.json'),
  JSON.stringify({type: 'commonjs'}, null, 2) + '\n'
);

fs.writeFileSync(
  path.resolve(esm, 'package.json'),
  JSON.stringify({type: 'module'}, null, 2) + '\n'
);
