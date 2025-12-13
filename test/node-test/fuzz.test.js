#!/usr/bin/env node
/**
 * Fuzz Tests using node:test
 * 
 * Random operation testing to stress test the queue implementation.
 */
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import * as crypto from 'crypto';
import { LinkedQueue, IsVoid } from '../../dist/esm/linked-queue.js';

function generateUUID() {
  return crypto.randomBytes(16).toString('hex');
}

describe('LinkedQueue Fuzz Tests', () => {
  
  describe('Random Operations (10K iterations)', () => {
    
    it('should maintain invariants during random operations', () => {
      const q = new LinkedQueue();
      const trackedKeys = new Set();
      const operations = 10000;
      
      for (let i = 0; i < operations; i++) {
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
          
          case 8: // clear (rarely)
            if (Math.random() < 0.05) {
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
        
        // Invariant checks
        assert.ok(Number.isInteger(q.length), `Length should be integer at iteration ${i}`);
        assert.ok(q.length >= 0, `Length should be non-negative at iteration ${i}`);
        assert.strictEqual(q.length, q.size, `Length should equal size at iteration ${i}`);
        
        // Periodic deep checks
        if (i % 100 === 0) {
          const ordered = q.getOrderedList();
          assert.strictEqual(ordered.length, q.length, 'Ordered list should match length');
          
          if (q.length > 0) {
            const first = q.first();
            const peek = q.peek();
            assert.strictEqual(first[0], peek[0], 'First should equal peek');
            
            const last = q.last();
            assert.ok(!IsVoid.check(last[0]), 'Last should not be void when not empty');
          }
        }
      }
    });
  });
  
  describe('Rapid Enqueue/Dequeue (100K iterations)', () => {
    
    it('should handle rapid alternating operations', () => {
      const q = new LinkedQueue();
      const iterations = 100000;
      
      for (let i = 0; i < iterations; i++) {
        const key = `key${i}`;
        q.enqueue(key, i);
        
        if (Math.random() < 0.5 && q.length > 0) {
          q.dequeue();
        }
      }
      
      // Queue should have roughly half the items
      assert.ok(q.length > 0, 'Queue should have items');
      assert.ok(q.length < iterations, 'Queue should have fewer than all items');
      
      // Drain and verify
      let count = 0;
      while (q.length > 0) {
        const result = q.dequeue();
        assert.ok(!IsVoid.check(result[0]), 'Should get valid item');
        count++;
      }
      
      assert.strictEqual(q.length, 0, 'Queue should be empty');
    });
  });
  
  describe('Front/Back Balance (50K iterations)', () => {
    
    it('should handle balanced front/back operations', () => {
      const q = new LinkedQueue();
      const iterations = 50000;
      
      for (let i = 0; i < iterations; i++) {
        const key = `key${i}`;
        
        // Alternate front/back additions
        if (i % 2 === 0) {
          q.enqueue(key, i);
        } else {
          q.addToFront(key, i);
        }
        
        // Occasionally remove from both ends
        if (Math.random() < 0.3 && q.length > 2) {
          if (Math.random() < 0.5) {
            q.dequeue();
          } else {
            q.pop();
          }
        }
      }
      
      // Verify structure
      const ordered = q.getOrderedList();
      const reversed = q.getReverseOrderedList();
      
      assert.strictEqual(ordered.length, q.length);
      assert.strictEqual(reversed.length, q.length);
      
      // Verify reverse is actually reversed
      for (let i = 0; i < ordered.length; i++) {
        assert.strictEqual(ordered[i][0], reversed[ordered.length - 1 - i][0]);
      }
    });
  });
  
  describe('Random Removal Stress (25K iterations)', () => {
    
    it('should handle many random removals', () => {
      const q = new LinkedQueue();
      const keys = [];
      
      // Build up queue
      for (let i = 0; i < 5000; i++) {
        const key = generateUUID();
        q.enqueue(key, i);
        keys.push(key);
      }
      
      // Random removals
      for (let i = 0; i < 25000; i++) {
        if (q.length === 0) {
          // Refill
          const key = generateUUID();
          q.enqueue(key, i);
          keys.push(key);
          continue;
        }
        
        const op = Math.floor(Math.random() * 4);
        
        switch (op) {
          case 0: // Remove by key
            if (keys.length > 0) {
              const idx = Math.floor(Math.random() * keys.length);
              const key = keys[idx];
              q.remove(key);
              keys.splice(idx, 1);
            }
            break;
          
          case 1: // Dequeue
            q.dequeue();
            keys.shift(); // Approximate - may not be exact
            break;
          
          case 2: // Pop
            q.pop();
            keys.pop(); // Approximate - may not be exact
            break;
          
          case 3: // Add new
            const key = generateUUID();
            q.enqueue(key, i);
            keys.push(key);
            break;
        }
        
        // Verify length consistency
        assert.ok(q.length >= 0);
      }
    });
  });
  
  describe('Iterator Consistency (5K iterations)', () => {
    
    it('should maintain iterator consistency', () => {
      for (let run = 0; run < 100; run++) {
        const q = new LinkedQueue();
        const expectedOrder = [];
        
        // Random insertions
        for (let i = 0; i < 50; i++) {
          const key = `key${i}`;
          const value = Math.random();
          
          if (Math.random() < 0.5) {
            q.enqueue(key, value);
            expectedOrder.push([key, value]);
          } else {
            q.addToFront(key, value);
            expectedOrder.unshift([key, value]);
          }
        }
        
        // Verify order matches
        const ordered = q.getOrderedList();
        assert.strictEqual(ordered.length, expectedOrder.length);
        
        for (let i = 0; i < ordered.length; i++) {
          assert.strictEqual(ordered[i][0], expectedOrder[i][0]);
        }
        
        // Verify iterator
        let idx = 0;
        for (const [key, value] of q) {
          assert.strictEqual(key, expectedOrder[idx][0]);
          idx++;
        }
        assert.strictEqual(idx, expectedOrder.length);
        
        // Verify reverse
        idx = expectedOrder.length - 1;
        for (const [key, value] of q.reverseIterator()) {
          assert.strictEqual(key, expectedOrder[idx][0]);
          idx--;
        }
        assert.strictEqual(idx, -1);
      }
    });
  });
  
  describe('Contains/Get Consistency (10K iterations)', () => {
    
    it('should maintain contains/get consistency', () => {
      const q = new LinkedQueue();
      const allKeys = new Map(); // key -> value
      
      for (let i = 0; i < 10000; i++) {
        const op = Math.floor(Math.random() * 5);
        
        switch (op) {
          case 0: // Add
          case 1: {
            const key = generateUUID();
            const value = { iteration: i };
            q.enqueue(key, value);
            allKeys.set(key, value);
            break;
          }
          
          case 2: // Remove
            if (allKeys.size > 0) {
              const key = Array.from(allKeys.keys())[0];
              q.remove(key);
              allKeys.delete(key);
            }
            break;
          
          case 3: // Dequeue
            if (q.length > 0) {
              const result = q.dequeue();
              if (!IsVoid.check(result[0])) {
                allKeys.delete(result[0]);
              }
            }
            break;
          
          case 4: // Verify
            for (const [key, value] of allKeys) {
              assert.strictEqual(q.contains(key), true, `Should contain ${key}`);
              const got = q.get(key);
              assert.ok(!IsVoid.check(got[0]), `Get should return value for ${key}`);
              assert.strictEqual(got[1], value, `Value should match for ${key}`);
            }
            break;
        }
        
        // Verify size
        assert.strictEqual(q.length, allKeys.size, `Size mismatch at iteration ${i}`);
      }
    });
  });
  
  describe('Deq(n) Boundary Tests', () => {
    
    it('should handle deq(n) with various n values', () => {
      for (let run = 0; run < 100; run++) {
        const q = new LinkedQueue();
        const size = Math.floor(Math.random() * 100) + 1;
        
        for (let i = 0; i < size; i++) {
          q.enqueue(`key${i}`, i);
        }
        
        const n = Math.floor(Math.random() * (size * 2)) + 1;
        const expectedReturn = Math.min(n, size);
        
        const result = q.deq(n);
        
        assert.strictEqual(Array.isArray(result), true);
        assert.strictEqual(result.length, expectedReturn);
        assert.strictEqual(q.length, size - expectedReturn);
      }
    });
  });
  
  describe('Empty Queue Operations', () => {
    
    it('should handle operations on empty queue safely', () => {
      for (let run = 0; run < 1000; run++) {
        const q = new LinkedQueue();
        
        // All these should not throw
        const deq = q.dequeue();
        assert.ok(IsVoid.check(deq[0]));
        
        const pop = q.pop();
        assert.ok(IsVoid.check(pop[0]));
        
        const remove = q.remove('nonexistent');
        assert.ok(IsVoid.check(remove[0]));
        
        const get = q.get('nonexistent');
        assert.ok(IsVoid.check(get[0]));
        
        assert.strictEqual(q.contains('anything'), false);
        
        const first = q.first();
        assert.ok(IsVoid.check(first[0]));
        
        const last = q.last();
        assert.ok(IsVoid.check(last[0]));
        
        const peek = q.peek();
        assert.ok(IsVoid.check(peek[0]));
        
        const ordered = q.getOrderedList();
        assert.deepStrictEqual(ordered, []);
        
        const reversed = q.getReverseOrderedList();
        assert.deepStrictEqual(reversed, []);
        
        // Iterator should return nothing
        let count = 0;
        for (const item of q) count++;
        assert.strictEqual(count, 0);
        
        // Clear should be safe
        q.clear();
        assert.strictEqual(q.length, 0);
      }
    });
  });
  
  describe('First/Last Pointer Consistency', () => {
    
    it('should maintain first/last consistency during operations', () => {
      const q = new LinkedQueue();
      
      for (let i = 0; i < 10000; i++) {
        const op = Math.floor(Math.random() * 6);
        
        switch (op) {
          case 0:
            q.enqueue(generateUUID(), i);
            break;
          case 1:
            q.addToFront(generateUUID(), i);
            break;
          case 2:
            if (q.length > 0) q.dequeue();
            break;
          case 3:
            if (q.length > 0) q.pop();
            break;
          case 4:
            if (q.length > 0) {
              try { q.remove(q.getRandomKey()); } catch {}
            }
            break;
          case 5:
            if (Math.random() < 0.05) q.clear();
            break;
        }
        
        // Verify first/last consistency
        if (q.length === 0) {
          assert.ok(IsVoid.check(q.first()[0]));
          assert.ok(IsVoid.check(q.last()[0]));
          assert.ok(IsVoid.check(q.peek()[0]));
        } else {
          assert.ok(!IsVoid.check(q.first()[0]));
          assert.ok(!IsVoid.check(q.last()[0]));
          assert.ok(!IsVoid.check(q.peek()[0]));
          assert.strictEqual(q.first()[0], q.peek()[0]);
          
          const ordered = q.getOrderedList();
          assert.strictEqual(q.first()[0], ordered[0][0]);
          assert.strictEqual(q.last()[0], ordered[ordered.length - 1][0]);
        }
      }
    });
  });
});

