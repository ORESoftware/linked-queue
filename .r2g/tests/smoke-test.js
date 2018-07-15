#!/usr/bin/env node
'use strict';

const {LinkedQueue} = require('@oresoftware/linked-queue');

const q = new LinkedQueue();

const t = Date.now();

for (let i = 0; i < 100000; i++) {
  q.addToFront({});
}

console.log('total time:', Date.now() - t);  // just 60 milliseconds!
