#!/usr/bin/env node
/**
 * Iterator Tests using node:test
 * 
 * Tests for all iterator functionality including Symbol.iterator,
 * reverseIterator, dequeueIterator, asyncIterator, and functional methods.
 */
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { LinkedQueue, IsVoid } from '../../dist/esm/linked-queue.js';

describe('LinkedQueue Iterators', () => {
  
  describe('Symbol.iterator (for...of)', () => {
    
    it('should iterate over all items in order', () => {
      const q = new LinkedQueue();
      q.enqueue('a', 1);
      q.enqueue('b', 2);
      q.enqueue('c', 3);
      
      const items = [];
      for (const [key, value] of q) {
        items.push([key, value]);
      }
      
      assert.strictEqual(items.length, 3);
      assert.deepStrictEqual(items[0], ['a', 1]);
      assert.deepStrictEqual(items[1], ['b', 2]);
      assert.deepStrictEqual(items[2], ['c', 3]);
    });
    
    it('should not modify the queue', () => {
      const q = new LinkedQueue();
      q.enqueue('a', 1);
      q.enqueue('b', 2);
      
      for (const item of q) {
        // iterate
      }
      
      assert.strictEqual(q.length, 2);
    });
    
    it('should handle empty queue', () => {
      const q = new LinkedQueue();
      const items = [];
      
      for (const item of q) {
        items.push(item);
      }
      
      assert.strictEqual(items.length, 0);
    });
    
    it('should be re-iterable', () => {
      const q = new LinkedQueue();
      q.enqueue('a', 1);
      q.enqueue('b', 2);
      
      let count1 = 0, count2 = 0;
      
      for (const item of q) count1++;
      for (const item of q) count2++;
      
      assert.strictEqual(count1, 2);
      assert.strictEqual(count2, 2);
    });
    
    it('iterator() should return the queue itself', () => {
      const q = new LinkedQueue();
      assert.strictEqual(q.iterator(), q);
      assert.strictEqual(q.getIterator(), q);
    });
    
    it('should work with spread operator', () => {
      const q = new LinkedQueue();
      q.enqueue('a', 1);
      q.enqueue('b', 2);
      
      const items = [...q];
      assert.strictEqual(items.length, 2);
    });
    
    it('should work with Array.from', () => {
      const q = new LinkedQueue();
      q.enqueue('a', 1);
      q.enqueue('b', 2);
      
      const items = Array.from(q);
      assert.strictEqual(items.length, 2);
    });
  });
  
  describe('reverseIterator', () => {
    
    it('should iterate in reverse order', () => {
      const q = new LinkedQueue();
      q.enqueue('a', 1);
      q.enqueue('b', 2);
      q.enqueue('c', 3);
      
      const items = [];
      for (const [key, value] of q.reverseIterator()) {
        items.push([key, value]);
      }
      
      assert.strictEqual(items.length, 3);
      assert.deepStrictEqual(items[0], ['c', 3]);
      assert.deepStrictEqual(items[1], ['b', 2]);
      assert.deepStrictEqual(items[2], ['a', 1]);
    });
    
    it('should not modify the queue', () => {
      const q = new LinkedQueue();
      q.enqueue('a', 1);
      q.enqueue('b', 2);
      
      for (const item of q.reverseIterator()) {
        // iterate
      }
      
      assert.strictEqual(q.length, 2);
    });
    
    it('should handle empty queue', () => {
      const q = new LinkedQueue();
      const items = [];
      
      for (const item of q.reverseIterator()) {
        items.push(item);
      }
      
      assert.strictEqual(items.length, 0);
    });
    
    it('should work with spread', () => {
      const q = new LinkedQueue();
      q.enqueue('a', 1);
      q.enqueue('b', 2);
      
      const items = [...q.reverseIterator()];
      assert.strictEqual(items.length, 2);
      assert.strictEqual(items[0][0], 'b');
      assert.strictEqual(items[1][0], 'a');
    });
  });
  
  describe('dequeueIterator', () => {
    
    it('should iterate and remove all items', () => {
      const q = new LinkedQueue();
      q.enqueue('a', 1);
      q.enqueue('b', 2);
      q.enqueue('c', 3);
      
      const items = [];
      for (const [key, value] of q.dequeueIterator()) {
        items.push([key, value]);
      }
      
      assert.strictEqual(items.length, 3);
      assert.strictEqual(q.length, 0);
    });
    
    it('should iterate in FIFO order', () => {
      const q = new LinkedQueue();
      q.enqueue('a', 1);
      q.enqueue('b', 2);
      
      const items = [...q.dequeueIterator()];
      
      assert.deepStrictEqual(items[0], ['a', 1]);
      assert.deepStrictEqual(items[1], ['b', 2]);
    });
    
    it('should handle empty queue', () => {
      const q = new LinkedQueue();
      const items = [...q.dequeueIterator()];
      assert.strictEqual(items.length, 0);
    });
    
    it('should only iterate once (destructive)', () => {
      const q = new LinkedQueue();
      q.enqueue('a', 1);
      q.enqueue('b', 2);
      
      const iter1 = [...q.dequeueIterator()];
      const iter2 = [...q.dequeueIterator()];
      
      assert.strictEqual(iter1.length, 2);
      assert.strictEqual(iter2.length, 0);
    });
  });
  
  describe('forEach', () => {
    
    it('should iterate over all items', () => {
      const q = new LinkedQueue();
      q.enqueue('a', 1);
      q.enqueue('b', 2);
      q.enqueue('c', 3);
      
      const items = [];
      q.forEach(([key, value], index) => {
        items.push({ key, value, index });
      });
      
      assert.strictEqual(items.length, 3);
      assert.deepStrictEqual(items[0], { key: 'a', value: 1, index: 0 });
      assert.deepStrictEqual(items[1], { key: 'b', value: 2, index: 1 });
      assert.deepStrictEqual(items[2], { key: 'c', value: 3, index: 2 });
    });
    
    it('should not modify the queue', () => {
      const q = new LinkedQueue();
      q.enqueue('a', 1);
      q.enqueue('b', 2);
      
      q.forEach(() => {});
      
      assert.strictEqual(q.length, 2);
    });
    
    it('should return the queue for chaining', () => {
      const q = new LinkedQueue();
      q.enqueue('a', 1);
      
      const result = q.forEach(() => {});
      assert.strictEqual(result, q);
    });
    
    it('should accept context', () => {
      const q = new LinkedQueue();
      q.enqueue('a', 1);
      
      const ctx = { multiplier: 10 };
      const values = [];
      
      q.forEach(function([key, value]) {
        values.push(value * this.multiplier);
      }, ctx);
      
      assert.deepStrictEqual(values, [10]);
    });
  });
  
  describe('dequeueEach', () => {
    
    it('should iterate and remove all items', () => {
      const q = new LinkedQueue();
      q.enqueue('a', 1);
      q.enqueue('b', 2);
      q.enqueue('c', 3);
      
      const items = [];
      q.dequeueEach(([key, value], index) => {
        items.push({ key, value, index });
      });
      
      assert.strictEqual(items.length, 3);
      assert.strictEqual(q.length, 0);
    });
    
    it('should return the queue for chaining', () => {
      const q = new LinkedQueue();
      q.enqueue('a', 1);
      
      const result = q.dequeueEach(() => {});
      assert.strictEqual(result, q);
    });
    
    it('should handle empty queue', () => {
      const q = new LinkedQueue();
      let called = false;
      
      q.dequeueEach(() => { called = true; });
      
      assert.strictEqual(called, false);
    });
  });
  
  describe('map', () => {
    
    it('should transform all items', () => {
      const q = new LinkedQueue();
      q.enqueue('a', 1);
      q.enqueue('b', 2);
      q.enqueue('c', 3);
      
      const result = q.map(([key, value]) => value * 2);
      
      assert.deepStrictEqual(result, [2, 4, 6]);
    });
    
    it('should pass index to callback', () => {
      const q = new LinkedQueue();
      q.enqueue('a', 1);
      q.enqueue('b', 2);
      
      const result = q.map(([key, value], index) => index);
      
      assert.deepStrictEqual(result, [0, 1]);
    });
    
    it('should not modify the queue', () => {
      const q = new LinkedQueue();
      q.enqueue('a', 1);
      q.enqueue('b', 2);
      
      q.map(([key, value]) => value * 2);
      
      assert.strictEqual(q.length, 2);
      assert.strictEqual(q.get('a')[1], 1);
    });
    
    it('should accept context', () => {
      const q = new LinkedQueue();
      q.enqueue('a', 1);
      
      const ctx = { multiplier: 10 };
      const result = q.map(function([key, value]) {
        return value * this.multiplier;
      }, ctx);
      
      assert.deepStrictEqual(result, [10]);
    });
    
    it('should return empty array for empty queue', () => {
      const q = new LinkedQueue();
      const result = q.map(x => x);
      assert.deepStrictEqual(result, []);
    });
  });
  
  describe('filter', () => {
    
    it('should filter items', () => {
      const q = new LinkedQueue();
      q.enqueue('a', 1);
      q.enqueue('b', 2);
      q.enqueue('c', 3);
      q.enqueue('d', 4);
      
      const result = q.filter(([key, value]) => value % 2 === 0);
      
      assert.strictEqual(result.length, 2);
      assert.deepStrictEqual(result[0], ['b', 2]);
      assert.deepStrictEqual(result[1], ['d', 4]);
    });
    
    it('should not modify the queue', () => {
      const q = new LinkedQueue();
      q.enqueue('a', 1);
      q.enqueue('b', 2);
      
      q.filter(() => true);
      
      assert.strictEqual(q.length, 2);
    });
    
    it('should return empty array when nothing matches', () => {
      const q = new LinkedQueue();
      q.enqueue('a', 1);
      q.enqueue('b', 2);
      
      const result = q.filter(() => false);
      
      assert.deepStrictEqual(result, []);
    });
    
    it('should accept context', () => {
      const q = new LinkedQueue();
      q.enqueue('a', 1);
      q.enqueue('b', 10);
      
      const ctx = { threshold: 5 };
      const result = q.filter(function([key, value]) {
        return value > this.threshold;
      }, ctx);
      
      assert.strictEqual(result.length, 1);
      assert.strictEqual(result[0][1], 10);
    });
  });
  
  describe('asyncIterator', async () => {
    
    it('should async iterate over all items', async () => {
      const q = new LinkedQueue();
      q.enqueue('a', 1);
      q.enqueue('b', 2);
      
      const items = [];
      for await (const [key, value] of q.asyncIterator()) {
        items.push([key, value]);
      }
      
      assert.strictEqual(items.length, 2);
    });
    
    it('should handle empty queue', async () => {
      const q = new LinkedQueue();
      const items = [];
      
      for await (const item of q.asyncIterator()) {
        items.push(item);
      }
      
      assert.strictEqual(items.length, 0);
    });
  });
  
  describe('asyncReverseIterator', async () => {
    
    it('should async iterate in reverse', async () => {
      const q = new LinkedQueue();
      q.enqueue('a', 1);
      q.enqueue('b', 2);
      
      const items = [];
      for await (const [key, value] of q.asyncReverseIterator()) {
        items.push([key, value]);
      }
      
      assert.strictEqual(items.length, 2);
      assert.strictEqual(items[0][0], 'b');
      assert.strictEqual(items[1][0], 'a');
    });
  });
});

