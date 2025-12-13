#!/usr/bin/env node
/**
 * Core LinkedQueue Test Suite using node:test
 * 
 * Comprehensive tests for all public API methods.
 */
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { LinkedQueue, IsVoid } from '../../dist/esm/linked-queue.js';

describe('LinkedQueue Core API', () => {
  
  describe('Constructor and Basic Properties', () => {
    
    it('should create an empty queue', () => {
      const q = new LinkedQueue();
      assert.strictEqual(q.length, 0);
      assert.strictEqual(q.size, 0);
      assert.strictEqual(q.getLength(), 0);
      assert.strictEqual(q.getSize(), 0);
    });
    
    it('should have r2gSmokeTest function', async () => {
      const { r2gSmokeTest } = await import('../../dist/esm/linked-queue.js');
      assert.strictEqual(r2gSmokeTest(), true);
    });
    
    it('should have correct toJSON representation', () => {
      const q = new LinkedQueue();
      q.enqueue('a', 1);
      q.enqueue('b', 2);
      const json = q.toJSON();
      assert.deepStrictEqual(json, { size: 2 });
    });
    
    it('should have correct getComputedProperties', () => {
      const q = new LinkedQueue();
      q.enqueue('a', 1);
      const props = q.getComputedProperties();
      assert.deepStrictEqual(props, { size: 1 });
    });
  });
  
  describe('Enqueue Operations', () => {
    let q;
    
    beforeEach(() => {
      q = new LinkedQueue();
    });
    
    it('should enqueue with key and value', () => {
      q.enqueue('key1', 'value1');
      assert.strictEqual(q.length, 1);
      assert.strictEqual(q.contains('key1'), true);
    });
    
    it('should enqueue with single argument (key = value)', () => {
      q.enqueue('item1');
      assert.strictEqual(q.length, 1);
      const [key, value] = q.peek();
      assert.strictEqual(key, 'item1');
      assert.strictEqual(value, 'item1');
    });
    
    it('should enqueue multiple items maintaining order', () => {
      q.enqueue('a', 1);
      q.enqueue('b', 2);
      q.enqueue('c', 3);
      
      const ordered = q.getOrderedList();
      assert.strictEqual(ordered.length, 3);
      assert.strictEqual(ordered[0][0], 'a');
      assert.strictEqual(ordered[1][0], 'b');
      assert.strictEqual(ordered[2][0], 'c');
    });
    
    it('should throw on duplicate keys', () => {
      q.enqueue('dup', 'value1');
      assert.throws(() => q.enqueue('dup', 'value2'), Error);
    });
    
    it('should throw when called with no arguments', () => {
      assert.throws(() => q.enqueue(), Error);
    });
    
    it('enq should be an alias for enqueue', () => {
      q.enq('key1', 'value1');
      assert.strictEqual(q.length, 1);
      assert.strictEqual(q.contains('key1'), true);
    });
    
    it('push should be an alias for enqueue', () => {
      q.push('key1', 'value1');
      assert.strictEqual(q.length, 1);
      assert.strictEqual(q.contains('key1'), true);
    });
  });
  
  describe('AddToFront Operations', () => {
    let q;
    
    beforeEach(() => {
      q = new LinkedQueue();
    });
    
    it('should add to front of empty queue', () => {
      q.addToFront('key1', 'value1');
      assert.strictEqual(q.length, 1);
      const [key, value] = q.first();
      assert.strictEqual(key, 'key1');
    });
    
    it('should add to front of non-empty queue', () => {
      q.enqueue('existing', 'value');
      q.addToFront('front', 'frontValue');
      
      const [key, value] = q.first();
      assert.strictEqual(key, 'front');
      assert.strictEqual(q.length, 2);
    });
    
    it('should throw on duplicate keys', () => {
      q.addToFront('dup', 'value1');
      assert.throws(() => q.addToFront('dup', 'value2'), Error);
    });
    
    it('should throw on falsy key', () => {
      assert.throws(() => q.addToFront('', 'value'), Error);
      assert.throws(() => q.addToFront(0, 'value'), Error);
      assert.throws(() => q.addToFront(null, 'value'), Error);
    });
    
    it('unshift should be an alias for addToFront', () => {
      q.unshift('key1', 'value1');
      assert.strictEqual(q.length, 1);
      assert.strictEqual(q.first()[0], 'key1');
    });
  });
  
  describe('Dequeue Operations', () => {
    let q;
    
    beforeEach(() => {
      q = new LinkedQueue();
      q.enqueue('a', 1);
      q.enqueue('b', 2);
      q.enqueue('c', 3);
    });
    
    it('should dequeue from front (FIFO)', () => {
      const [key, value] = q.dequeue();
      assert.strictEqual(key, 'a');
      assert.strictEqual(value, 1);
      assert.strictEqual(q.length, 2);
    });
    
    it('should return IsVoid on empty queue', () => {
      q.clear();
      const result = q.dequeue();
      assert.strictEqual(IsVoid.check(result[0]), true);
    });
    
    it('should dequeue all items in order', () => {
      const items = [];
      while (q.length > 0) {
        items.push(q.dequeue());
      }
      assert.strictEqual(items.length, 3);
      assert.strictEqual(items[0][0], 'a');
      assert.strictEqual(items[1][0], 'b');
      assert.strictEqual(items[2][0], 'c');
    });
    
    it('shift should be an alias for dequeue', () => {
      const [key, value] = q.shift();
      assert.strictEqual(key, 'a');
      assert.strictEqual(q.length, 2);
    });
    
    it('deq() without args should behave like dequeue()', () => {
      const [key, value] = q.deq();
      assert.strictEqual(key, 'a');
      assert.strictEqual(q.length, 2);
    });
    
    it('deq(n) should dequeue n items', () => {
      const items = q.deq(2);
      assert.strictEqual(Array.isArray(items), true);
      assert.strictEqual(items.length, 2);
      assert.strictEqual(items[0][0], 'a');
      assert.strictEqual(items[1][0], 'b');
      assert.strictEqual(q.length, 1);
    });
    
    it('deq(n) should handle n > length', () => {
      const items = q.deq(10);
      assert.strictEqual(items.length, 3);
      assert.strictEqual(q.length, 0);
    });
    
    it('deq should throw on non-integer', () => {
      assert.throws(() => q.deq(1.5), Error);
      assert.throws(() => q.deq('2'), Error);
    });
    
    it('deq should throw on non-positive integer', () => {
      assert.throws(() => q.deq(0), Error);
      assert.throws(() => q.deq(-1), Error);
    });
  });
  
  describe('Pop/RemoveLast Operations', () => {
    let q;
    
    beforeEach(() => {
      q = new LinkedQueue();
      q.enqueue('a', 1);
      q.enqueue('b', 2);
      q.enqueue('c', 3);
    });
    
    it('should remove from back', () => {
      const [key, value] = q.removeLast();
      assert.strictEqual(key, 'c');
      assert.strictEqual(value, 3);
      assert.strictEqual(q.length, 2);
    });
    
    it('should return IsVoid on empty queue', () => {
      q.clear();
      const result = q.removeLast();
      assert.strictEqual(IsVoid.check(result[0]), true);
    });
    
    it('pop should be an alias for removeLast', () => {
      const [key, value] = q.pop();
      assert.strictEqual(key, 'c');
      assert.strictEqual(q.length, 2);
    });
    
    it('should pop all items in reverse order', () => {
      const items = [];
      while (q.length > 0) {
        items.push(q.pop());
      }
      assert.strictEqual(items.length, 3);
      assert.strictEqual(items[0][0], 'c');
      assert.strictEqual(items[1][0], 'b');
      assert.strictEqual(items[2][0], 'a');
    });
  });
  
  describe('Remove by Key', () => {
    let q;
    
    beforeEach(() => {
      q = new LinkedQueue();
      q.enqueue('a', 1);
      q.enqueue('b', 2);
      q.enqueue('c', 3);
    });
    
    it('should remove item by key from middle', () => {
      const [key, value] = q.remove('b');
      assert.strictEqual(key, 'b');
      assert.strictEqual(value, 2);
      assert.strictEqual(q.length, 2);
      assert.strictEqual(q.contains('b'), false);
    });
    
    it('should remove item by key from front', () => {
      const [key, value] = q.remove('a');
      assert.strictEqual(key, 'a');
      assert.strictEqual(q.length, 2);
      assert.strictEqual(q.first()[0], 'b');
    });
    
    it('should remove item by key from back', () => {
      const [key, value] = q.remove('c');
      assert.strictEqual(key, 'c');
      assert.strictEqual(q.length, 2);
      assert.strictEqual(q.last()[0], 'b');
    });
    
    it('should return IsVoid for non-existent key', () => {
      const result = q.remove('nonexistent');
      assert.strictEqual(IsVoid.check(result[0]), true);
      assert.strictEqual(q.length, 3);
    });
    
    it('should maintain order after removal', () => {
      q.remove('b');
      const ordered = q.getOrderedList();
      assert.strictEqual(ordered[0][0], 'a');
      assert.strictEqual(ordered[1][0], 'c');
    });
  });
  
  describe('Get and Contains', () => {
    let q;
    
    beforeEach(() => {
      q = new LinkedQueue();
      q.enqueue('a', 1);
      q.enqueue('b', 2);
    });
    
    it('should get item by key', () => {
      const [key, value] = q.get('a');
      assert.strictEqual(key, 'a');
      assert.strictEqual(value, 1);
    });
    
    it('should return IsVoid for non-existent key', () => {
      const result = q.get('nonexistent');
      assert.strictEqual(IsVoid.check(result[0]), true);
    });
    
    it('should check if key exists', () => {
      assert.strictEqual(q.contains('a'), true);
      assert.strictEqual(q.contains('nonexistent'), false);
    });
    
    it('contains should not return truthy for falsy values', () => {
      // Even if value is falsy, contains should work correctly
      q.enqueue('zero', 0);
      q.enqueue('empty', '');
      q.enqueue('nullVal', null);
      
      assert.strictEqual(q.contains('zero'), true);
      assert.strictEqual(q.contains('empty'), true);
      assert.strictEqual(q.contains('nullVal'), true);
    });
  });
  
  describe('Peek, First, Last', () => {
    let q;
    
    beforeEach(() => {
      q = new LinkedQueue();
    });
    
    it('should peek at first item without removing', () => {
      q.enqueue('a', 1);
      q.enqueue('b', 2);
      
      const [key, value] = q.peek();
      assert.strictEqual(key, 'a');
      assert.strictEqual(value, 1);
      assert.strictEqual(q.length, 2);
    });
    
    it('should return IsVoid on empty peek', () => {
      const result = q.peek();
      assert.strictEqual(IsVoid.check(result[0]), true);
    });
    
    it('first() should be same as peek()', () => {
      q.enqueue('a', 1);
      const peek = q.peek();
      const first = q.first();
      assert.deepStrictEqual(peek, first);
    });
    
    it('last() should return last item', () => {
      q.enqueue('a', 1);
      q.enqueue('b', 2);
      
      const [key, value] = q.last();
      assert.strictEqual(key, 'b');
      assert.strictEqual(value, 2);
    });
    
    it('should return IsVoid on empty last', () => {
      const result = q.last();
      assert.strictEqual(IsVoid.check(result[0]), true);
    });
    
    it('single item: first === last', () => {
      q.enqueue('only', 'one');
      const first = q.first();
      const last = q.last();
      assert.deepStrictEqual(first, last);
    });
  });
  
  describe('Clear and RemoveAll', () => {
    let q;
    
    beforeEach(() => {
      q = new LinkedQueue();
      q.enqueue('a', 1);
      q.enqueue('b', 2);
      q.enqueue('c', 3);
    });
    
    it('should clear all items', () => {
      q.clear();
      assert.strictEqual(q.length, 0);
      assert.strictEqual(IsVoid.check(q.first()[0]), true);
      assert.strictEqual(IsVoid.check(q.last()[0]), true);
    });
    
    it('removeAll should be same as clear', () => {
      q.removeAll();
      assert.strictEqual(q.length, 0);
    });
    
    it('should be reusable after clear', () => {
      q.clear();
      q.enqueue('new', 'item');
      assert.strictEqual(q.length, 1);
      assert.strictEqual(q.first()[0], 'new');
    });
  });
  
  describe('GetOrderedList and GetReverseOrderedList', () => {
    let q;
    
    beforeEach(() => {
      q = new LinkedQueue();
      q.enqueue('a', 1);
      q.enqueue('b', 2);
      q.enqueue('c', 3);
    });
    
    it('should return ordered list', () => {
      const list = q.getOrderedList();
      assert.strictEqual(list.length, 3);
      assert.deepStrictEqual(list[0], ['a', 1]);
      assert.deepStrictEqual(list[1], ['b', 2]);
      assert.deepStrictEqual(list[2], ['c', 3]);
    });
    
    it('should return reverse ordered list', () => {
      const list = q.getReverseOrderedList();
      assert.strictEqual(list.length, 3);
      assert.deepStrictEqual(list[0], ['c', 3]);
      assert.deepStrictEqual(list[1], ['b', 2]);
      assert.deepStrictEqual(list[2], ['a', 1]);
    });
    
    it('should return empty array for empty queue', () => {
      q.clear();
      assert.deepStrictEqual(q.getOrderedList(), []);
      assert.deepStrictEqual(q.getReverseOrderedList(), []);
    });
  });
  
  describe('Random Access', () => {
    let q;
    
    beforeEach(() => {
      q = new LinkedQueue();
      q.enqueue('a', 1);
      q.enqueue('b', 2);
      q.enqueue('c', 3);
    });
    
    it('should get random key', () => {
      const key = q.getRandomKey();
      assert.strictEqual(['a', 'b', 'c'].includes(key), true);
    });
    
    it('should throw on empty queue', () => {
      q.clear();
      assert.throws(() => q.getRandomKey(), Error);
    });
    
    it('should get random item', () => {
      const [key, value] = q.getRandomItem();
      assert.strictEqual(['a', 'b', 'c'].includes(key), true);
    });
    
    it('should return IsVoid for empty queue random item', () => {
      q.clear();
      const result = q.getRandomItem();
      assert.strictEqual(IsVoid.check(result[0]), true);
    });
  });
  
  describe('IsVoid Checking', () => {
    
    it('static IsVoid should work', () => {
      const q = new LinkedQueue();
      const result = q.dequeue();
      assert.strictEqual(LinkedQueue.IsVoid(result[0]), true);
    });
    
    it('instance checkIfVoid should work', () => {
      const q = new LinkedQueue();
      const result = q.dequeue();
      assert.strictEqual(q.checkIfVoid(result[0]), true);
    });
    
    it('IsVoid.check should work', () => {
      const q = new LinkedQueue();
      const result = q.dequeue();
      assert.strictEqual(IsVoid.check(result[0]), true);
    });
    
    it('should not match regular values', () => {
      assert.strictEqual(IsVoid.check(null), false);
      assert.strictEqual(IsVoid.check(undefined), false);
      assert.strictEqual(IsVoid.check(0), false);
      assert.strictEqual(IsVoid.check(''), false);
      assert.strictEqual(IsVoid.check([]), false);
    });
  });
  
  describe('Not Yet Implemented Methods', () => {
    let q;
    
    beforeEach(() => {
      q = new LinkedQueue();
    });
    
    it('insertInFrontOf should throw', () => {
      assert.throws(() => q.insertInFrontOf(), Error);
    });
    
    it('insertBehind should throw', () => {
      assert.throws(() => q.insertBehind(), Error);
    });
    
    it('insertAtIndex should throw', () => {
      assert.throws(() => q.insertAtIndex('key', 'value'), Error);
    });
  });
});

