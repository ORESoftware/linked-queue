#!/usr/bin/env node
/**
 * Internal Head/Tail Pointer Fuzz Test
 * 
 * This test accesses PRIVATE fields via __unsafeGetInternalsForTesting()
 * to verify internal state consistency.
 * 
 * DO NOT use __unsafeGetInternalsForTesting() in production code.
 */
import * as assert from 'assert';
import { v4 as uuid } from 'uuid';
import { LinkedQueue, IsVoid } from '../../dist/esm/linked-queue.js';

/**
 * Get internal state via the testing helper
 */
function getInternals(q) {
  return q.__unsafeGetInternalsForTesting();
}

/**
 * Verify head pointer by traversing from tail backwards
 */
const testHead = function (q) {
  const { head, tail } = getInternals(q);
  
  let v = tail;
  let before = null;

  while (v) {
    before = v;
    v = v.before;
  }

  const peek = q.peek();
  
  if (!before && !head) {
    // Empty queue
    if (!IsVoid.check(peek[0])) {
      console.error('Empty queue but peek is not void', peek);
      throw new Error('head-test: Empty queue but peek is not void');
    }
    return;
  }
  
  if (!before || !peek || IsVoid.check(peek[0]) || before.key !== peek[0]) {
    console.error('before:', before && before.key, 'peek:', peek && peek[0], 'ordered:', q.getOrderedList().map(v => v[0]));
    throw new Error('head-test: Head pointer mismatch');
  }
};

/**
 * Verify tail pointer by traversing from head forwards
 */
const testTail = function (q) {
  const { head, tail } = getInternals(q);
  
  let v = head;
  let after = null;

  while (v) {
    after = v;
    v = v.after;
  }

  if (!after && !tail) {
    // Empty queue
    return;
  }
  
  if (!after || !tail || after.key !== tail.key) {
    console.error('after:', after && after.key, 'tail:', tail && tail.key, 'ordered:', q.getOrderedList().map(v => v[0]));
    throw new Error('tail-test: Tail pointer mismatch');
  }
};

/**
 * Verify lookup map matches linked list
 */
const testLookup = function (q) {
  const { head, lookup } = getInternals(q);
  
  // Count items in linked list
  let count = 0;
  let v = head;
  while (v) {
    count++;
    // Verify key is in lookup
    if (!lookup.has(v.key)) {
      throw new Error(`lookup-test: Key ${v.key} in linked list but not in lookup`);
    }
    // Verify lookup points to correct node
    if (lookup.get(v.key) !== v) {
      throw new Error(`lookup-test: Lookup for ${v.key} points to wrong node`);
    }
    v = v.after;
  }
  
  // Verify lookup size matches
  if (lookup.size !== count) {
    throw new Error(`lookup-test: Lookup size ${lookup.size} != linked list count ${count}`);
  }
};

/**
 * Verify before/after pointers are consistent
 */
const testPointers = function (q) {
  const { head, tail } = getInternals(q);
  
  if (!head && !tail) {
    // Empty queue is valid
    return;
  }
  
  if (!head || !tail) {
    throw new Error('pointer-test: Head and tail must both be set or both be null');
  }
  
  // Head should not have before pointer
  if (head.before) {
    throw new Error('pointer-test: Head should not have a before pointer');
  }
  
  // Tail should not have after pointer
  if (tail.after) {
    throw new Error('pointer-test: Tail should not have an after pointer');
  }
  
  // Traverse and verify bidirectional links
  let v = head;
  let prev = null;
  
  while (v) {
    // Verify before pointer
    if (v.before !== prev) {
      throw new Error(`pointer-test: Node ${v.key} has wrong before pointer`);
    }
    
    // Verify after's before points back to us
    if (v.after && v.after.before !== v) {
      throw new Error(`pointer-test: Node ${v.key}.after.before doesn't point back`);
    }
    
    prev = v;
    v = v.after;
  }
  
  // Last node should be tail
  if (prev !== tail) {
    throw new Error('pointer-test: Last traversed node is not tail');
  }
};

// All internal tests
const runAllInternalTests = function (q) {
  testHead(q);
  testTail(q);
  testLookup(q);
  testPointers(q);
};

// Operations for fuzz testing
const q = new LinkedQueue();

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
  },
  '14'() {
    q.pop();
  },
  '15'() {
    q.removeLast();
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

console.log('Running internal head/tail fuzz test (1M operations)...');

for (let i = 0; i < 1000000; i++) {

  const rand = Math.floor(Math.random() * ln);
  fns[rand]();

  const newLn = q.getLength();
  assert.ok(Number.isInteger(newLn), 'newLn is not an integer.');
  assert.ok(newLn >= 0, 'newLn is less than zero.');

  // Run internal tests every 100 operations for performance
  if (i % 100 === 0) {
    runAllInternalTests(q);
  }
  
  // Progress indicator
  if ((i + 1) % 100000 === 0) {
    process.stdout.write(`  Progress: ${(i + 1) / 10000}% (queue length: ${newLn})\r`);
  }
}

// Final comprehensive test
runAllInternalTests(q);

console.log(`\nhead-tail-fuzz.js passed! total time: ${Date.now() - t}ms`);
console.log(`Final queue length: ${q.length}`);
