#!/usr/bin/env node
/**
 * Internal State Tests using node:test
 * 
 * Tests that verify internal state using __unsafeGetInternalsForTesting().
 * These tests access private fields for deep verification.
 */
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import * as crypto from 'crypto';
import { LinkedQueue, IsVoid } from '../../dist/esm/linked-queue.js';

function getInternals(q) {
  return q.__unsafeGetInternalsForTesting();
}

function generateUUID() {
  return crypto.randomBytes(16).toString('hex');
}

describe('LinkedQueue Internal State', () => {
  
  describe('Empty Queue Internals', () => {
    
    it('should have null head and tail when empty', () => {
      const q = new LinkedQueue();
      const { head, tail, lookup } = getInternals(q);
      
      assert.strictEqual(head, null);
      assert.strictEqual(tail, null);
      assert.strictEqual(lookup.size, 0);
    });
    
    it('should have null head and tail after clear', () => {
      const q = new LinkedQueue();
      q.enqueue('a', 1);
      q.enqueue('b', 2);
      q.clear();
      
      const { head, tail, lookup } = getInternals(q);
      
      assert.strictEqual(head, null);
      assert.strictEqual(tail, null);
      assert.strictEqual(lookup.size, 0);
    });
    
    it('should have null head and tail after full dequeue', () => {
      const q = new LinkedQueue();
      q.enqueue('a', 1);
      q.dequeue();
      
      const { head, tail, lookup } = getInternals(q);
      
      assert.strictEqual(head, null);
      assert.strictEqual(tail, null);
      assert.strictEqual(lookup.size, 0);
    });
  });
  
  describe('Single Item Internals', () => {
    
    it('should have head === tail for single item', () => {
      const q = new LinkedQueue();
      q.enqueue('only', 'one');
      
      const { head, tail } = getInternals(q);
      
      assert.strictEqual(head, tail);
      assert.strictEqual(head.key, 'only');
      assert.strictEqual(head.value, 'one');
    });
    
    it('single item should have no before/after pointers', () => {
      const q = new LinkedQueue();
      q.enqueue('only', 'one');
      
      const { head } = getInternals(q);
      
      assert.strictEqual(head.before, null);
      assert.strictEqual(head.after, null);
    });
  });
  
  describe('Linked List Structure', () => {
    
    it('should maintain correct before/after pointers', () => {
      const q = new LinkedQueue();
      q.enqueue('a', 1);
      q.enqueue('b', 2);
      q.enqueue('c', 3);
      
      const { head, tail } = getInternals(q);
      
      // Head checks
      assert.strictEqual(head.key, 'a');
      assert.strictEqual(head.before, null);
      assert.ok(head.after !== null);
      
      // Middle checks
      const middle = head.after;
      assert.strictEqual(middle.key, 'b');
      assert.strictEqual(middle.before, head);
      assert.strictEqual(middle.after, tail);
      
      // Tail checks
      assert.strictEqual(tail.key, 'c');
      assert.strictEqual(tail.before, middle);
      assert.strictEqual(tail.after, null);
    });
    
    it('should maintain bidirectional links', () => {
      const q = new LinkedQueue();
      for (let i = 0; i < 10; i++) {
        q.enqueue(`key${i}`, i);
      }
      
      const { head, tail } = getInternals(q);
      
      // Forward traversal
      let current = head;
      let prev = null;
      let count = 0;
      
      while (current) {
        assert.strictEqual(current.before, prev);
        if (prev) {
          assert.strictEqual(prev.after, current);
        }
        prev = current;
        current = current.after;
        count++;
      }
      
      assert.strictEqual(count, 10);
      assert.strictEqual(prev, tail);
    });
    
    it('head should never have before pointer', () => {
      const q = new LinkedQueue();
      
      for (let i = 0; i < 100; i++) {
        if (Math.random() < 0.5) {
          q.enqueue(`enq${i}`, i);
        } else {
          q.addToFront(`front${i}`, i);
        }
        
        const { head } = getInternals(q);
        if (head) {
          assert.strictEqual(head.before, null, `Head should not have before at iteration ${i}`);
        }
      }
    });
    
    it('tail should never have after pointer', () => {
      const q = new LinkedQueue();
      
      for (let i = 0; i < 100; i++) {
        if (Math.random() < 0.5) {
          q.enqueue(`enq${i}`, i);
        } else {
          q.addToFront(`front${i}`, i);
        }
        
        const { tail } = getInternals(q);
        if (tail) {
          assert.strictEqual(tail.after, null, `Tail should not have after at iteration ${i}`);
        }
      }
    });
  });
  
  describe('Lookup Map Consistency', () => {
    
    it('should have lookup entry for each node', () => {
      const q = new LinkedQueue();
      q.enqueue('a', 1);
      q.enqueue('b', 2);
      q.enqueue('c', 3);
      
      const { head, lookup } = getInternals(q);
      
      let current = head;
      while (current) {
        assert.ok(lookup.has(current.key), `Lookup should have key ${current.key}`);
        assert.strictEqual(lookup.get(current.key), current, 'Lookup should point to exact node');
        current = current.after;
      }
    });
    
    it('lookup size should match linked list count', () => {
      const q = new LinkedQueue();
      
      for (let i = 0; i < 100; i++) {
        q.enqueue(`key${i}`, i);
        
        const { head, lookup } = getInternals(q);
        
        // Count linked list nodes
        let count = 0;
        let current = head;
        while (current) {
          count++;
          current = current.after;
        }
        
        assert.strictEqual(lookup.size, count, `Lookup size should match at iteration ${i}`);
        assert.strictEqual(lookup.size, q.length, 'Lookup size should match queue length');
      }
    });
    
    it('removed keys should not be in lookup', () => {
      const q = new LinkedQueue();
      q.enqueue('a', 1);
      q.enqueue('b', 2);
      q.enqueue('c', 3);
      
      q.remove('b');
      
      const { lookup } = getInternals(q);
      
      assert.strictEqual(lookup.has('b'), false);
      assert.strictEqual(lookup.has('a'), true);
      assert.strictEqual(lookup.has('c'), true);
    });
  });
  
  describe('Pointer Repair After Remove', () => {
    
    it('should repair links after removing middle node', () => {
      const q = new LinkedQueue();
      q.enqueue('a', 1);
      q.enqueue('b', 2);
      q.enqueue('c', 3);
      
      q.remove('b');
      
      const { head, tail } = getInternals(q);
      
      assert.strictEqual(head.key, 'a');
      assert.strictEqual(tail.key, 'c');
      assert.strictEqual(head.after, tail);
      assert.strictEqual(tail.before, head);
    });
    
    it('should update head when removing first node', () => {
      const q = new LinkedQueue();
      q.enqueue('a', 1);
      q.enqueue('b', 2);
      q.enqueue('c', 3);
      
      q.remove('a');
      
      const { head, tail } = getInternals(q);
      
      assert.strictEqual(head.key, 'b');
      assert.strictEqual(head.before, null);
    });
    
    it('should update tail when removing last node', () => {
      const q = new LinkedQueue();
      q.enqueue('a', 1);
      q.enqueue('b', 2);
      q.enqueue('c', 3);
      
      q.remove('c');
      
      const { head, tail } = getInternals(q);
      
      assert.strictEqual(tail.key, 'b');
      assert.strictEqual(tail.after, null);
    });
  });
  
  describe('Internal Fuzz Test', () => {
    
    it('should maintain internal consistency during 50K random operations', () => {
      const q = new LinkedQueue();
      
      for (let i = 0; i < 50000; i++) {
        const op = Math.floor(Math.random() * 8);
        
        switch (op) {
          case 0:
          case 1:
            q.enqueue(generateUUID(), i);
            break;
          case 2:
            q.addToFront(generateUUID(), i);
            break;
          case 3:
            if (q.length > 0) q.dequeue();
            break;
          case 4:
            if (q.length > 0) q.pop();
            break;
          case 5:
            if (q.length > 0) {
              try { q.remove(q.getRandomKey()); } catch {}
            }
            break;
          case 6:
            if (Math.random() < 0.02) q.clear();
            break;
          case 7:
            if (q.length > 0) {
              const n = Math.min(Math.floor(Math.random() * 3) + 1, q.length);
              q.deq(n);
            }
            break;
        }
        
        // Verify internal consistency every 100 iterations
        if (i % 100 === 0) {
          const { head, tail, lookup } = getInternals(q);
          
          if (q.length === 0) {
            assert.strictEqual(head, null, `Head should be null when empty at ${i}`);
            assert.strictEqual(tail, null, `Tail should be null when empty at ${i}`);
            assert.strictEqual(lookup.size, 0, `Lookup should be empty when queue empty at ${i}`);
          } else {
            assert.ok(head !== null, `Head should not be null at ${i}`);
            assert.ok(tail !== null, `Tail should not be null at ${i}`);
            assert.strictEqual(head.before, null, `Head.before should be null at ${i}`);
            assert.strictEqual(tail.after, null, `Tail.after should be null at ${i}`);
            
            // Count linked list
            let count = 0;
            let current = head;
            while (current) {
              assert.ok(lookup.has(current.key), `Lookup missing key at ${i}`);
              count++;
              current = current.after;
            }
            
            assert.strictEqual(count, q.length, `Linked list count mismatch at ${i}`);
            assert.strictEqual(lookup.size, q.length, `Lookup size mismatch at ${i}`);
          }
        }
      }
    });
  });
  
  describe('Deep Pointer Validation', () => {
    
    it('should validate all pointers point to valid nodes', () => {
      const q = new LinkedQueue();
      
      // Build up
      for (let i = 0; i < 100; i++) {
        if (Math.random() < 0.5) {
          q.enqueue(`e${i}`, i);
        } else {
          q.addToFront(`f${i}`, i);
        }
      }
      
      // Remove some
      for (let i = 0; i < 30; i++) {
        if (q.length > 0) {
          if (Math.random() < 0.5) {
            q.dequeue();
          } else {
            q.pop();
          }
        }
      }
      
      const { head, tail, lookup } = getInternals(q);
      const validNodes = new Set();
      
      // Collect all valid nodes
      let current = head;
      while (current) {
        validNodes.add(current);
        current = current.after;
      }
      
      // Verify all pointers point to valid nodes
      current = head;
      while (current) {
        if (current.before) {
          assert.ok(validNodes.has(current.before), 'Before should point to valid node');
        }
        if (current.after) {
          assert.ok(validNodes.has(current.after), 'After should point to valid node');
        }
        current = current.after;
      }
      
      // Verify lookup points to valid nodes
      for (const [key, node] of lookup) {
        assert.ok(validNodes.has(node), `Lookup entry for ${key} should point to valid node`);
      }
    });
  });
  
  describe('Traversal Equivalence', () => {
    
    it('forward traversal should match reverse traversal reversed', () => {
      const q = new LinkedQueue();
      for (let i = 0; i < 50; i++) {
        q.enqueue(`key${i}`, i);
      }
      
      const { head, tail } = getInternals(q);
      
      // Forward
      const forward = [];
      let current = head;
      while (current) {
        forward.push(current.key);
        current = current.after;
      }
      
      // Backward
      const backward = [];
      current = tail;
      while (current) {
        backward.push(current.key);
        current = current.before;
      }
      
      backward.reverse();
      assert.deepStrictEqual(forward, backward);
    });
  });
});

