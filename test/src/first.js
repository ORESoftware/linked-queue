import * as assert from 'assert';
import { v4 as uuid } from 'uuid';
import {LinkedQueue, IsVoid} from '../../dist/esm/linked-queue.js';

const q = new LinkedQueue();

// Test head/tail consistency using public API
const testHeadTail = function () {
  const first = q.first();
  const last = q.last();
  const peek = q.peek();
  const ordered = q.getOrderedList();
  const reverse = q.getReverseOrderedList();

  if (q.length === 0) {
    // Empty queue
    if (!IsVoid.check(first[0])) {
      console.error('Empty queue but first is not void', first);
      throw new Error('fml-1');
    }
    if (!IsVoid.check(last[0])) {
      console.error('Empty queue but last is not void', last);
      throw new Error('fml-2');
    }
    if (!IsVoid.check(peek[0])) {
      console.error('Empty queue but peek is not void', peek);
      throw new Error('fml-3');
    }
    assert.strictEqual(ordered.length, 0, 'Ordered list should be empty');
    assert.strictEqual(reverse.length, 0, 'Reverse list should be empty');
    return;
  }

  // First and peek should match
  if (first[0] !== peek[0]) {
    console.error('first:', first[0], 'peek:', peek[0]);
    throw new Error('first and peek should match');
  }

  // Ordered list first should match first()
  if (ordered.length > 0 && ordered[0][0] !== first[0]) {
    console.error('ordered first:', ordered[0][0], 'first:', first[0]);
    throw new Error('ordered first should match first()');
  }

  // Ordered list last should match last()
  if (ordered.length > 0 && ordered[ordered.length - 1][0] !== last[0]) {
    console.error('ordered last:', ordered[ordered.length - 1][0], 'last:', last[0]);
    throw new Error('ordered last should match last()');
  }

  // Reverse list should be reverse of ordered
  if (reverse.length > 0 && reverse[0][0] !== last[0]) {
    console.error('reverse first:', reverse[0][0], 'last:', last[0]);
    throw new Error('reverse first should match last()');
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
    q.addToFront(uuid(), {});
  },
  '3'() {
    q.enq(uuid(), {});
  },
  '4'() {
    q.enq(uuid(), {});
  },
  '5'() {
    q.enq(uuid(), {});
  },
  '6'() {
    q.enqueue(uuid(), {});
  },
  '7'() {
    q.push(uuid(), {});
  },
  '8'() {
    q.addToFront(uuid(), {});
  },
  '9'() {
    q.addToFront(uuid(), {});
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
assert.ok(Number.isInteger(v), 'v is not an integer.');
const t = Date.now();

for (let i = 0; i < 1000000; i++) {

  const rand = Math.floor(Math.random() * ln);
  fns[rand]();

  const newLn = q.getLength();
  assert.ok(Number.isInteger(newLn), 'newLn is not an integer.');
  assert.ok(newLn >= 0, 'newLn is less than zero.');

  // Test every 100 iterations for performance
  if (i % 100 === 0) {
    testHeadTail();
  }
}

// Final test
testHeadTail();

console.log('first.js passed! total time:', Date.now() - t, 'ms');
