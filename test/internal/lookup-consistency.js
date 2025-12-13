#!/usr/bin/env node
/**
 * Lookup Map Consistency Fuzz Test
 * 
 * This test accesses PRIVATE fields via __unsafeGetInternalsForTesting()
 * to verify the lookup Map stays in sync with the linked list structure.
 * 
 * DO NOT use __unsafeGetInternalsForTesting() in production code.
 */
import * as assert from 'assert';
import * as crypto from 'crypto';
import { LinkedQueue, IsVoid } from '../../dist/esm/linked-queue.js';

// Access private fields via testing helper
function getInternals(q) {
  return q.__unsafeGetInternalsForTesting();
}

function generateUUID() {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Verify lookup map is consistent with linked list
 */
function verifyConsistency(q) {
  const { head, tail, lookup } = getInternals(q);
  
  // Count linked list items
  let linkedCount = 0;
  const linkedKeys = new Set();
  let v = head;
  
  while (v) {
    linkedCount++;
    linkedKeys.add(v.key);
    
    // Verify this node is in lookup
    if (!lookup.has(v.key)) {
      throw new Error(`Node ${v.key} in linked list but not in lookup`);
    }
    
    // Verify lookup points to this exact node
    if (lookup.get(v.key) !== v) {
      throw new Error(`Lookup for ${v.key} points to different node`);
    }
    
    v = v.after;
  }
  
  // Verify lookup size matches
  if (lookup.size !== linkedCount) {
    throw new Error(`Lookup size ${lookup.size} != linked list count ${linkedCount}`);
  }
  
  // Verify all lookup entries are in linked list
  for (const key of lookup.keys()) {
    if (!linkedKeys.has(key)) {
      throw new Error(`Lookup has key ${key} not in linked list`);
    }
  }
  
  // Verify length matches
  if (q.length !== linkedCount) {
    throw new Error(`q.length ${q.length} != linked list count ${linkedCount}`);
  }
  
  // Verify head/tail consistency
  if (linkedCount === 0) {
    if (head !== null || tail !== null) {
      throw new Error('Empty list should have null head and tail');
    }
  } else {
    if (!head || !tail) {
      throw new Error('Non-empty list should have head and tail');
    }
  }
}

const q = new LinkedQueue();
const trackedKeys = new Set();

console.log('Running lookup-consistency fuzz test (500K operations)...');
const t = Date.now();

for (let i = 0; i < 500000; i++) {
  const op = Math.floor(Math.random() * 10);
  
  switch (op) {
    case 0: // enqueue
    case 1:
    case 2: {
      const key = generateUUID();
      q.enqueue(key, { data: i });
      trackedKeys.add(key);
      break;
    }
    
    case 3: // addToFront
    case 4: {
      const key = generateUUID();
      q.addToFront(key, { data: i });
      trackedKeys.add(key);
      break;
    }
    
    case 5: // dequeue
      if (q.length > 0) {
        const result = q.dequeue();
        if (!IsVoid.check(result[0])) {
          trackedKeys.delete(result[0]);
        }
      }
      break;
    
    case 6: // pop
      if (q.length > 0) {
        const result = q.pop();
        if (!IsVoid.check(result[0])) {
          trackedKeys.delete(result[0]);
        }
      }
      break;
    
    case 7: // remove random
      if (trackedKeys.size > 0) {
        const keysArray = Array.from(trackedKeys);
        const keyToRemove = keysArray[Math.floor(Math.random() * keysArray.length)];
        const result = q.remove(keyToRemove);
        if (!IsVoid.check(result[0])) {
          trackedKeys.delete(keyToRemove);
        }
      }
      break;
    
    case 8: // clear (occasionally)
      if (Math.random() < 0.1) {
        q.clear();
        trackedKeys.clear();
      }
      break;
    
    case 9: // deq multiple
      if (q.length > 0) {
        const n = Math.min(Math.floor(Math.random() * 5) + 1, q.length);
        const results = q.deq(n);
        if (Array.isArray(results)) {
          for (const item of results) {
            if (Array.isArray(item) && !IsVoid.check(item[0])) {
              trackedKeys.delete(item[0]);
            }
          }
        }
      }
      break;
  }
  
  // Verify consistency every 100 operations
  if (i % 100 === 0) {
    verifyConsistency(q);
    
    // Verify our tracked keys match the queue
    const { lookup } = getInternals(q);
    
    // Clean up tracked keys that were removed
    for (const key of trackedKeys) {
      if (!lookup.has(key)) {
        trackedKeys.delete(key);
      }
    }
  }
  
  // Progress indicator
  if ((i + 1) % 50000 === 0) {
    process.stdout.write(`  Progress: ${(i + 1) / 5000}% (queue length: ${q.length})\r`);
  }
}

// Final verification
verifyConsistency(q);

console.log(`\nlookup-consistency.js passed! total time: ${Date.now() - t}ms`);
console.log(`Final queue length: ${q.length}`);
