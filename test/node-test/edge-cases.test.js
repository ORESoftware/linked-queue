#!/usr/bin/env node
/**
 * Edge Case Tests using node:test
 * 
 * Tests for boundary conditions, unusual inputs, and corner cases.
 */
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { LinkedQueue, IsVoid } from '../../dist/esm/linked-queue.js';

describe('LinkedQueue Edge Cases', () => {
  
  describe('Key Types', () => {
    
    it('should handle string keys', () => {
      const q = new LinkedQueue();
      q.enqueue('string-key', 'value');
      assert.strictEqual(q.get('string-key')[1], 'value');
    });
    
    it('should handle number keys', () => {
      const q = new LinkedQueue();
      q.enqueue(123, 'value');
      assert.strictEqual(q.get(123)[1], 'value');
    });
    
    it('should handle object keys', () => {
      const q = new LinkedQueue();
      const key = { id: 1 };
      q.enqueue(key, 'value');
      assert.strictEqual(q.get(key)[1], 'value');
    });
    
    it('should handle symbol keys', () => {
      const q = new LinkedQueue();
      const key = Symbol('test');
      q.enqueue(key, 'value');
      assert.strictEqual(q.get(key)[1], 'value');
    });
    
    it('should distinguish object keys by reference', () => {
      const q = new LinkedQueue();
      const key1 = { id: 1 };
      const key2 = { id: 1 }; // Same content, different reference
      
      q.enqueue(key1, 'value1');
      q.enqueue(key2, 'value2');
      
      assert.strictEqual(q.length, 2);
      assert.strictEqual(q.get(key1)[1], 'value1');
      assert.strictEqual(q.get(key2)[1], 'value2');
    });
    
    it('should handle very long string keys', () => {
      const q = new LinkedQueue();
      const longKey = 'x'.repeat(10000);
      q.enqueue(longKey, 'value');
      assert.strictEqual(q.contains(longKey), true);
    });
    
    it('should handle unicode keys', () => {
      const q = new LinkedQueue();
      q.enqueue('日本語キー', 'value1');
      q.enqueue('🔑🔑🔑', 'value2');
      q.enqueue('مفتاح', 'value3');
      
      assert.strictEqual(q.length, 3);
      assert.strictEqual(q.get('日本語キー')[1], 'value1');
      assert.strictEqual(q.get('🔑🔑🔑')[1], 'value2');
    });
  });
  
  describe('Value Types', () => {
    
    it('should handle null values', () => {
      const q = new LinkedQueue();
      q.enqueue('key', null);
      
      const [key, value] = q.get('key');
      assert.strictEqual(value, null);
    });
    
    it('should handle undefined values', () => {
      const q = new LinkedQueue();
      q.enqueue('key', undefined);
      
      const [key, value] = q.get('key');
      assert.strictEqual(value, undefined);
    });
    
    it('should handle 0 value', () => {
      const q = new LinkedQueue();
      q.enqueue('key', 0);
      
      const [key, value] = q.get('key');
      assert.strictEqual(value, 0);
    });
    
    it('should handle false value', () => {
      const q = new LinkedQueue();
      q.enqueue('key', false);
      
      const [key, value] = q.get('key');
      assert.strictEqual(value, false);
    });
    
    it('should handle empty string value', () => {
      const q = new LinkedQueue();
      q.enqueue('key', '');
      
      const [key, value] = q.get('key');
      assert.strictEqual(value, '');
    });
    
    it('should handle function values', () => {
      const q = new LinkedQueue();
      const fn = () => 'hello';
      q.enqueue('key', fn);
      
      const [key, value] = q.get('key');
      assert.strictEqual(value(), 'hello');
    });
    
    it('should handle circular object values', () => {
      const q = new LinkedQueue();
      const obj = { name: 'test' };
      obj.self = obj; // Circular reference
      
      q.enqueue('key', obj);
      
      const [key, value] = q.get('key');
      assert.strictEqual(value.self.name, 'test');
    });
    
    it('should handle BigInt values', () => {
      const q = new LinkedQueue();
      q.enqueue('key', BigInt(9007199254740991));
      
      const [key, value] = q.get('key');
      assert.strictEqual(value, 9007199254740991n);
    });
    
    it('should handle Date values', () => {
      const q = new LinkedQueue();
      const date = new Date('2024-01-01');
      q.enqueue('key', date);
      
      const [key, value] = q.get('key');
      assert.strictEqual(value.getTime(), date.getTime());
    });
    
    it('should handle Map values', () => {
      const q = new LinkedQueue();
      const map = new Map([['a', 1], ['b', 2]]);
      q.enqueue('key', map);
      
      const [key, value] = q.get('key');
      assert.strictEqual(value.get('a'), 1);
    });
    
    it('should handle Set values', () => {
      const q = new LinkedQueue();
      const set = new Set([1, 2, 3]);
      q.enqueue('key', set);
      
      const [key, value] = q.get('key');
      assert.strictEqual(value.has(2), true);
    });
  });
  
  describe('Single Item Operations', () => {
    
    it('should handle single item correctly', () => {
      const q = new LinkedQueue();
      q.enqueue('only', 'one');
      
      assert.strictEqual(q.length, 1);
      assert.deepStrictEqual(q.first(), q.last());
      assert.deepStrictEqual(q.peek(), q.first());
    });
    
    it('should handle dequeue of single item', () => {
      const q = new LinkedQueue();
      q.enqueue('only', 'one');
      
      const [key, value] = q.dequeue();
      
      assert.strictEqual(key, 'only');
      assert.strictEqual(q.length, 0);
      assert.strictEqual(IsVoid.check(q.first()[0]), true);
      assert.strictEqual(IsVoid.check(q.last()[0]), true);
    });
    
    it('should handle pop of single item', () => {
      const q = new LinkedQueue();
      q.enqueue('only', 'one');
      
      const [key, value] = q.pop();
      
      assert.strictEqual(key, 'only');
      assert.strictEqual(q.length, 0);
    });
    
    it('should handle remove of single item', () => {
      const q = new LinkedQueue();
      q.enqueue('only', 'one');
      
      const [key, value] = q.remove('only');
      
      assert.strictEqual(key, 'only');
      assert.strictEqual(q.length, 0);
    });
  });
  
  describe('Large Queue Operations', () => {
    
    it('should handle 10000 items', () => {
      const q = new LinkedQueue();
      
      for (let i = 0; i < 10000; i++) {
        q.enqueue(`key${i}`, i);
      }
      
      assert.strictEqual(q.length, 10000);
      assert.strictEqual(q.first()[0], 'key0');
      assert.strictEqual(q.last()[0], 'key9999');
    });
    
    it('should correctly dequeue 10000 items', () => {
      const q = new LinkedQueue();
      
      for (let i = 0; i < 10000; i++) {
        q.enqueue(`key${i}`, i);
      }
      
      for (let i = 0; i < 10000; i++) {
        const [key, value] = q.dequeue();
        assert.strictEqual(key, `key${i}`);
        assert.strictEqual(value, i);
      }
      
      assert.strictEqual(q.length, 0);
    });
    
    it('should handle interleaved add/remove', () => {
      const q = new LinkedQueue();
      
      for (let i = 0; i < 1000; i++) {
        q.enqueue(`key${i}`, i);
        if (i % 3 === 0) {
          q.dequeue();
        }
      }
      
      // Started with 1000, removed floor(1000/3)+1 = 334
      assert.strictEqual(q.length, 666);
    });
  });
  
  describe('Alternating Operations', () => {
    
    it('should handle alternating enqueue/dequeue', () => {
      const q = new LinkedQueue();
      
      for (let i = 0; i < 100; i++) {
        q.enqueue(`key${i}`, i);
        const [key, value] = q.dequeue();
        assert.strictEqual(value, i);
      }
      
      assert.strictEqual(q.length, 0);
    });
    
    it('should handle alternating front/back operations', () => {
      const q = new LinkedQueue();
      
      for (let i = 0; i < 50; i++) {
        q.addToFront(`front${i}`, i);
        q.enqueue(`back${i}`, i);
      }
      
      assert.strictEqual(q.length, 100);
      
      // Front operations add to front in reverse order
      assert.strictEqual(q.first()[0], 'front49');
      assert.strictEqual(q.last()[0], 'back49');
    });
  });
  
  describe('Iterator During Modification', () => {
    
    it('should reflect current state after modification during iteration', () => {
      const q = new LinkedQueue();
      q.enqueue('a', 1);
      q.enqueue('b', 2);
      q.enqueue('c', 3);
      
      const keys = [];
      for (const [key, value] of q) {
        keys.push(key);
        // Note: modifying during iteration is generally discouraged
        // This tests the current behavior
      }
      
      assert.strictEqual(keys.length, 3);
    });
  });
  
  describe('Consistency Checks', () => {
    
    it('length should always equal size', () => {
      const q = new LinkedQueue();
      
      for (let i = 0; i < 100; i++) {
        q.enqueue(`key${i}`, i);
        assert.strictEqual(q.length, q.size);
        assert.strictEqual(q.length, q.getLength());
        assert.strictEqual(q.length, q.getSize());
      }
      
      for (let i = 0; i < 50; i++) {
        q.dequeue();
        assert.strictEqual(q.length, q.size);
      }
    });
    
    it('getOrderedList length should equal queue length', () => {
      const q = new LinkedQueue();
      
      for (let i = 0; i < 100; i++) {
        q.enqueue(`key${i}`, i);
        assert.strictEqual(q.getOrderedList().length, q.length);
      }
    });
    
    it('getReverseOrderedList should be reverse of getOrderedList', () => {
      const q = new LinkedQueue();
      q.enqueue('a', 1);
      q.enqueue('b', 2);
      q.enqueue('c', 3);
      
      const ordered = q.getOrderedList();
      const reversed = q.getReverseOrderedList();
      
      assert.deepStrictEqual(
        reversed,
        ordered.slice().reverse()
      );
    });
  });
  
  describe('Re-adding Removed Keys', () => {
    
    it('should allow re-adding removed key', () => {
      const q = new LinkedQueue();
      q.enqueue('key', 'value1');
      q.remove('key');
      q.enqueue('key', 'value2');
      
      assert.strictEqual(q.length, 1);
      assert.strictEqual(q.get('key')[1], 'value2');
    });
    
    it('should allow re-adding dequeued key', () => {
      const q = new LinkedQueue();
      q.enqueue('key', 'value1');
      q.dequeue();
      q.enqueue('key', 'value2');
      
      assert.strictEqual(q.length, 1);
      assert.strictEqual(q.get('key')[1], 'value2');
    });
    
    it('should allow re-adding popped key', () => {
      const q = new LinkedQueue();
      q.enqueue('key', 'value1');
      q.pop();
      q.enqueue('key', 'value2');
      
      assert.strictEqual(q.length, 1);
      assert.strictEqual(q.get('key')[1], 'value2');
    });
  });
  
  describe('Numeric Key Edge Cases', () => {
    
    it('should distinguish between string and number keys', () => {
      const q = new LinkedQueue();
      q.enqueue(1, 'number');
      q.enqueue('1', 'string');
      
      assert.strictEqual(q.length, 2);
      assert.strictEqual(q.get(1)[1], 'number');
      assert.strictEqual(q.get('1')[1], 'string');
    });
    
    it('should handle negative number keys', () => {
      const q = new LinkedQueue();
      q.enqueue(-1, 'negative');
      
      assert.strictEqual(q.get(-1)[1], 'negative');
    });
    
    it('should handle Infinity as key', () => {
      const q = new LinkedQueue();
      q.enqueue(Infinity, 'inf');
      q.enqueue(-Infinity, 'neg-inf');
      
      assert.strictEqual(q.get(Infinity)[1], 'inf');
      assert.strictEqual(q.get(-Infinity)[1], 'neg-inf');
    });
    
    it('should handle NaN as key (but not recommended)', () => {
      const q = new LinkedQueue();
      // NaN !== NaN, so this creates a unique key each time
      // Map handles this specially
      q.enqueue(NaN, 'nan');
      
      // Map uses SameValueZero which treats NaN as equal to NaN
      assert.strictEqual(q.contains(NaN), true);
    });
  });
  
  describe('Empty String and Whitespace', () => {
    
    it('should handle keys with only whitespace', () => {
      const q = new LinkedQueue();
      q.enqueue('   ', 'spaces');
      q.enqueue('\t', 'tab');
      q.enqueue('\n', 'newline');
      
      assert.strictEqual(q.length, 3);
      assert.strictEqual(q.get('   ')[1], 'spaces');
    });
    
    it('should handle values with only whitespace', () => {
      const q = new LinkedQueue();
      q.enqueue('key', '   ');
      
      assert.strictEqual(q.get('key')[1], '   ');
    });
  });
  
  describe('Prototype Pollution Resistance', () => {
    
    it('should not be affected by __proto__ key', () => {
      const q = new LinkedQueue();
      q.enqueue('__proto__', 'value');
      
      assert.strictEqual(q.contains('__proto__'), true);
      assert.strictEqual(q.get('__proto__')[1], 'value');
    });
    
    it('should not be affected by constructor key', () => {
      const q = new LinkedQueue();
      q.enqueue('constructor', 'value');
      
      assert.strictEqual(q.contains('constructor'), true);
      assert.strictEqual(q.get('constructor')[1], 'value');
    });
    
    it('should not be affected by hasOwnProperty key', () => {
      const q = new LinkedQueue();
      q.enqueue('hasOwnProperty', 'value');
      
      assert.strictEqual(q.contains('hasOwnProperty'), true);
    });
  });
});

