#!/usr/bin/env node
'use strict';

const assert = require('assert');
const {LinkedQueue} = require('@oresoftware/linked-queue');

const q = new LinkedQueue();

q.enqueue('a', 1);
q.enqueue('b', 2);
q.addToFront('z');

assert.strictEqual(q.length, 3);
assert.deepStrictEqual(q.dequeue(), ['z', 'z']);
assert.deepStrictEqual(q.dequeue(), ['a', 1]);
assert.deepStrictEqual(q.dequeue(), ['b', 2]);
assert.strictEqual(q.length, 0);

console.log('linked-queue r2g smoke test passed.');
