#!/usr/bin/env node
/**
 * Linked List Integrity Test
 * 
 * This test accesses PRIVATE fields via __unsafeGetInternalsForTesting()
 * to verify the doubly-linked list structure remains valid.
 * 
 * DO NOT use __unsafeGetInternalsForTesting() in production code.
 */
import * as assert from 'assert';
import { LinkedQueue, IsVoid } from '../../dist/esm/linked-queue.js';

// Access private fields via testing helper
function getInternals(q) {
  return q.__unsafeGetInternalsForTesting();
}

function runTest(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
  } catch (err) {
    console.log(`  ✗ ${name}: ${err.message}`);
    throw err;
  }
}

console.log('Running linked-list-integrity tests...\n');

// Test 1: Empty queue internals
runTest('Empty queue has null head and tail', () => {
  const q = new LinkedQueue();
  const { head, tail, lookup } = getInternals(q);
  
  assert.strictEqual(head, null, 'Head should be null');
  assert.strictEqual(tail, null, 'Tail should be null');
  assert.strictEqual(lookup.size, 0, 'Lookup should be empty');
});

// Test 2: Single item queue
runTest('Single item has head === tail', () => {
  const q = new LinkedQueue();
  q.enqueue('key1', 'value1');
  
  const { head, tail, lookup } = getInternals(q);
  
  assert.strictEqual(head, tail, 'Head and tail should be same node');
  assert.strictEqual(head.key, 'key1', 'Key should match');
  assert.strictEqual(head.value, 'value1', 'Value should match');
  assert.strictEqual(head.before, null, 'Before should be null');
  assert.strictEqual(head.after, null, 'After should be null');
  assert.strictEqual(lookup.size, 1, 'Lookup should have 1 entry');
});

// Test 3: Two items have correct pointers
runTest('Two items have correct before/after pointers', () => {
  const q = new LinkedQueue();
  q.enqueue('key1', 'value1');
  q.enqueue('key2', 'value2');
  
  const { head, tail } = getInternals(q);
  
  assert.strictEqual(head.key, 'key1', 'Head key should be key1');
  assert.strictEqual(tail.key, 'key2', 'Tail key should be key2');
  
  assert.strictEqual(head.before, null, 'Head.before should be null');
  assert.strictEqual(head.after, tail, 'Head.after should be tail');
  assert.strictEqual(tail.before, head, 'Tail.before should be head');
  assert.strictEqual(tail.after, null, 'Tail.after should be null');
});

// Test 4: addToFront updates head correctly
runTest('addToFront updates head and pointers', () => {
  const q = new LinkedQueue();
  q.enqueue('key1', 'value1');
  q.addToFront('key0', 'value0');
  
  const { head, tail } = getInternals(q);
  
  assert.strictEqual(head.key, 'key0', 'New head should be key0');
  assert.strictEqual(tail.key, 'key1', 'Tail should still be key1');
  assert.strictEqual(head.after.key, 'key1', 'Head.after should be key1');
  assert.strictEqual(tail.before.key, 'key0', 'Tail.before should be key0');
});

// Test 5: Dequeue updates head correctly
runTest('Dequeue updates head and cleans pointers', () => {
  const q = new LinkedQueue();
  q.enqueue('key1', 'value1');
  q.enqueue('key2', 'value2');
  q.enqueue('key3', 'value3');
  
  q.dequeue(); // Remove key1
  
  const { head, tail, lookup } = getInternals(q);
  
  assert.strictEqual(head.key, 'key2', 'New head should be key2');
  assert.strictEqual(head.before, null, 'New head.before should be null');
  assert.strictEqual(tail.key, 'key3', 'Tail should still be key3');
  assert.strictEqual(lookup.size, 2, 'Lookup should have 2 entries');
  assert.strictEqual(lookup.has('key1'), false, 'key1 should be removed from lookup');
});

// Test 6: RemoveLast updates tail correctly
runTest('RemoveLast updates tail and cleans pointers', () => {
  const q = new LinkedQueue();
  q.enqueue('key1', 'value1');
  q.enqueue('key2', 'value2');
  q.enqueue('key3', 'value3');
  
  q.removeLast(); // Remove key3
  
  const { head, tail, lookup } = getInternals(q);
  
  assert.strictEqual(head.key, 'key1', 'Head should still be key1');
  assert.strictEqual(tail.key, 'key2', 'New tail should be key2');
  assert.strictEqual(tail.after, null, 'New tail.after should be null');
  assert.strictEqual(lookup.size, 2, 'Lookup should have 2 entries');
  assert.strictEqual(lookup.has('key3'), false, 'key3 should be removed from lookup');
});

// Test 7: Remove middle item repairs links
runTest('Remove middle item repairs before/after links', () => {
  const q = new LinkedQueue();
  q.enqueue('key1', 'value1');
  q.enqueue('key2', 'value2');
  q.enqueue('key3', 'value3');
  
  q.remove('key2'); // Remove middle
  
  const { head, tail, lookup } = getInternals(q);
  
  assert.strictEqual(head.key, 'key1', 'Head should be key1');
  assert.strictEqual(tail.key, 'key3', 'Tail should be key3');
  assert.strictEqual(head.after, tail, 'Head.after should now point to tail');
  assert.strictEqual(tail.before, head, 'Tail.before should now point to head');
  assert.strictEqual(lookup.size, 2, 'Lookup should have 2 entries');
});

// Test 8: Remove head updates correctly
runTest('Remove head updates head pointer', () => {
  const q = new LinkedQueue();
  q.enqueue('key1', 'value1');
  q.enqueue('key2', 'value2');
  
  q.remove('key1'); // Remove head
  
  const { head, tail } = getInternals(q);
  
  assert.strictEqual(head.key, 'key2', 'New head should be key2');
  assert.strictEqual(head.before, null, 'New head.before should be null');
  assert.strictEqual(head, tail, 'Head and tail should be same (single item)');
});

// Test 9: Remove tail updates correctly
runTest('Remove tail updates tail pointer', () => {
  const q = new LinkedQueue();
  q.enqueue('key1', 'value1');
  q.enqueue('key2', 'value2');
  
  q.remove('key2'); // Remove tail
  
  const { head, tail } = getInternals(q);
  
  assert.strictEqual(tail.key, 'key1', 'New tail should be key1');
  assert.strictEqual(tail.after, null, 'New tail.after should be null');
  assert.strictEqual(head, tail, 'Head and tail should be same (single item)');
});

// Test 10: Clear resets all internals
runTest('Clear resets head, tail, and lookup', () => {
  const q = new LinkedQueue();
  q.enqueue('key1', 'value1');
  q.enqueue('key2', 'value2');
  q.enqueue('key3', 'value3');
  
  q.clear();
  
  const { head, tail, lookup } = getInternals(q);
  
  assert.strictEqual(head, null, 'Head should be null');
  assert.strictEqual(tail, null, 'Tail should be null');
  assert.strictEqual(lookup.size, 0, 'Lookup should be empty');
});

// Test 11: Dequeue to empty resets both pointers
runTest('Dequeue to empty resets head and tail', () => {
  const q = new LinkedQueue();
  q.enqueue('key1', 'value1');
  
  q.dequeue();
  
  const { head, tail, lookup } = getInternals(q);
  
  assert.strictEqual(head, null, 'Head should be null');
  assert.strictEqual(tail, null, 'Tail should be null');
  assert.strictEqual(lookup.size, 0, 'Lookup should be empty');
});

// Test 12: Pop to empty resets both pointers
runTest('Pop to empty resets head and tail', () => {
  const q = new LinkedQueue();
  q.enqueue('key1', 'value1');
  
  q.pop();
  
  const { head, tail, lookup } = getInternals(q);
  
  assert.strictEqual(head, null, 'Head should be null');
  assert.strictEqual(tail, null, 'Tail should be null');
  assert.strictEqual(lookup.size, 0, 'Lookup should be empty');
});

// Test 13: Lookup always points to actual node
runTest('Lookup entries point to correct nodes', () => {
  const q = new LinkedQueue();
  q.enqueue('key1', 'value1');
  q.enqueue('key2', 'value2');
  q.enqueue('key3', 'value3');
  
  const { lookup } = getInternals(q);
  
  for (const [key, node] of lookup.entries()) {
    assert.strictEqual(node.key, key, `Node key ${node.key} should match lookup key ${key}`);
  }
});

// Test 14: Iterator visits all nodes in linked order
runTest('Iterator matches internal linked list order', () => {
  const q = new LinkedQueue();
  q.enqueue('key1', 'value1');
  q.enqueue('key2', 'value2');
  q.enqueue('key3', 'value3');
  
  const { head } = getInternals(q);
  
  // Collect keys via iterator
  const iteratorKeys = [];
  for (const [key] of q) {
    iteratorKeys.push(key);
  }
  
  // Collect keys via internal traversal
  const internalKeys = [];
  let v = head;
  while (v) {
    internalKeys.push(v.key);
    v = v.after;
  }
  
  assert.deepStrictEqual(iteratorKeys, internalKeys, 'Iterator order should match internal linked list');
});

// Test 15: Reverse iterator visits in reverse order
runTest('Reverse iterator matches internal reverse order', () => {
  const q = new LinkedQueue();
  q.enqueue('key1', 'value1');
  q.enqueue('key2', 'value2');
  q.enqueue('key3', 'value3');
  
  const { tail } = getInternals(q);
  
  // Collect keys via reverse iterator
  const iteratorKeys = [];
  for (const [key] of q.reverseIterator()) {
    iteratorKeys.push(key);
  }
  
  // Collect keys via internal reverse traversal
  const internalKeys = [];
  let v = tail;
  while (v) {
    internalKeys.push(v.key);
    v = v.before;
  }
  
  assert.deepStrictEqual(iteratorKeys, internalKeys, 'Reverse iterator order should match internal reverse traversal');
});

console.log('\n✓ All linked-list-integrity tests passed!');
