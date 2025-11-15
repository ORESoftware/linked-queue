'use strict';

const {LinkedQueue} = require('../../dist/linked-queue');
const assert = require('assert');
const q = new LinkedQueue();
const uuid = require('uuid/v4');

const t = Date.now();

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
    q.enq([{},'hello']);
  },
  '4'() {
    q.enq([{},'hello']);
  },
  '5'() {
    q.enqueue([uuid(), {}]);
  },
  '6'() {
    q.enqueue(['dude',{}]);
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
    q.deq(1);
  },
  '11'() {
    q.dequeue();
  },
  '12'() {
    q.shift();
  },
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

for (let i = 0; i < 1000000; i++) {

  const rand = Math.floor(Math.random() * ln);
  fns[rand]();

  const newLn = q.getLength();
  assert(Number.isInteger(newLn), 'newLn is not an integer.');

  // console.log('prev length', v, 'new length:', newLn, 'rand is:', rand);

  if (rand < 2 && newLn !== 0) {
    throw new Error('we called clear or removeAll, length should be 0.');
  }

  if (rand > 9 && v === 0 && newLn !== 0) {
    throw new Error('New length should be zero.')
  }

  if (rand > 9 && v > 0 && ((newLn + 1) !== v)) {
    throw new Error('New length should be one fewer.')
  }

  if (rand > 1 && rand < 10 && v > 0  && ((newLn - 1) !== v)) {
    throw new Error('New length should be one greater.')
  }

  v = q.getLength();

}

console.log('total time:', Date.now() - t);
