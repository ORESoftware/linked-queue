'use strict';

const assert = require('assert');
const uuid = require('uuid/v4');
const {LinkedQueue} = require('@oresoftware/linked-queue');
const q = new LinkedQueue();

const testHead = function () {

  let v = q.tail;
  let before = null;

  while (v) {
    before = v;
    v = v.before;
  }

  let peek = q.peek();
  if (before !== peek) {
    console.error(before.key, peek && peek.key, q.getOrderedList().map(v => v.key));
    throw 'fml-1';
  }

};

const testTail = function () {

  let v = q.head;
  let after = null;

  while (v) {
    after = v;
    v = v.after;
  }

  if (after !== q.tail) {
    console.error(after.key, q.tail && q.tail.key, q.getOrderedList().map(v => v.key));
    throw new Error('fml 2');
  }

};

const fns = {
  '0'() {
    q.removeAll();
  },
  '1'() {
    q.clear();
  },
  '2'() {
    q.addToFront({});
  },
  '3'() {
    q.enq({});
  },
  '4'() {
    q.enq({});
  },
  '5'() {
    q.enq(uuid(), {});
  },
  '6'() {
    q.enqueue({});
  },
  '7'() {
    q.push(uuid(), {});
  },
  '8'() {
    q.addToFront(uuid(), {});
  },
  '9'() {
    q.addToFront({});
  },
  '10'() {
    q.deq();
  },
  '11'() {
    q.dequeue();
  },
  '12'() {
    q.shift();
  },
  '13'() {
    try {
      return q.remove(q.getRandomKey());
    }
    catch (err) {
      return null;
    }
  }
};

const keys = Object.keys(fns);
const isUnique = keys.map(v => parseInt(v)).reduce((a, b) => {
  if (b !== (a + 1)) {
    console.log(a, b);
    throw new Error('missing key');
  }
  return b;
});

const ln = keys.length;
let v = q.getLength();
assert(Number.isInteger(v), 'v is not an integer.');
const t = Date.now();

for (let i = 0; i < 1000000; i++) {

  const rand = Math.floor(Math.random() * ln);
  fns[rand]();

  const newLn = q.getLength();
  assert(Number.isInteger(newLn), 'newLn is not an integer.');
  assert(newLn >= 0, 'newLn is less than zero.');

  testHead();
  testTail();

}

console.log('total time:', Date.now() - t);

