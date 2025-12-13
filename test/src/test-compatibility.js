#!/usr/bin/env node
/**
 * Compatibility test for linked-queue
 * Tests v3.0.0 with ESNext modules
 */
import * as assert from 'assert';
import {LinkedQueue, IsVoid} from '../../dist/esm/linked-queue.js';

function createNotifyObj(uuid, pid = 1234, ttl = 5000) {
    return {
        ws: { writable: true },
        uuid: uuid,
        pid: pid,
        ttl: ttl,
        keepLocksAfterDeath: false
    };
}

function runTests(versionName, LinkedQueueClass) {
    const results = {
        passed: 0,
        failed: 0,
        errors: []
    };

    function test(name, fn) {
        try {
            fn();
            results.passed++;
            console.log(`  ✓ ${name}`);
        }
        catch (err) {
            results.failed++;
            const errorMsg = err instanceof Error ? err.message : String(err);
            results.errors.push({ name, error: errorMsg });
            console.log(`  ✗ ${name}: ${errorMsg}`);
        }
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log(`Testing ${versionName}`);
    console.log('='.repeat(60));

    // Test 1: Basic creation
    test('Create empty queue', () => {
        const q = new LinkedQueueClass();
        assert.strictEqual(q.length, 0);
        assert.strictEqual(q.getLength(), 0);
    });

    // Test 2: Enqueue (push pattern)
    test('Enqueue items', () => {
        const q = new LinkedQueueClass();
        const obj1 = createNotifyObj('uuid1');
        const obj2 = createNotifyObj('uuid2');
        q.enqueue('uuid1', obj1);
        assert.strictEqual(q.length, 1);
        assert.strictEqual(q.contains('uuid1'), true);
        q.enqueue('uuid2', obj2);
        assert.strictEqual(q.length, 2);
        assert.strictEqual(q.contains('uuid2'), true);
    });

    // Test 3: AddToFront (unshift pattern)
    test('AddToFront items', () => {
        const q = new LinkedQueueClass();
        const obj1 = createNotifyObj('uuid1');
        const obj2 = createNotifyObj('uuid2');
        q.enqueue('uuid1', obj1);
        q.addToFront('uuid2', obj2);
        assert.strictEqual(q.length, 2);
        const first = q.first();
        assert.ok(!IsVoid.check(first[0]));
        assert.strictEqual(first[0], 'uuid2');
    });

    // Test 4: Dequeue
    test('Dequeue items', () => {
        const q = new LinkedQueueClass();
        const obj1 = createNotifyObj('uuid1');
        const obj2 = createNotifyObj('uuid2');
        q.enqueue('uuid1', obj1);
        q.enqueue('uuid2', obj2);
        const dequeued = q.dequeue();
        assert.ok(!IsVoid.check(dequeued[0]));
        assert.strictEqual(dequeued[0], 'uuid1');
        assert.strictEqual(dequeued[1].uuid, 'uuid1');
        assert.strictEqual(q.length, 1);
    });

    // Test 5: Deq multiple
    test('Deq multiple items', () => {
        const q = new LinkedQueueClass();
        for (let i = 0; i < 10; i++) {
            q.enqueue(`uuid${i}`, createNotifyObj(`uuid${i}`, 1000 + i));
        }
        assert.strictEqual(q.length, 10);
        const dequeued = q.deq(5);
        assert.strictEqual(dequeued.length, 5);
        assert.strictEqual(q.length, 5);
        // Verify order - deq returns arrays of [key, value] tuples
        for (let i = 0; i < 5; i++) {
            const item = dequeued[i];
            assert.ok(item, `Item ${i} should exist`);
            assert.ok(Array.isArray(item), 'Item should be an array tuple');
            assert.strictEqual(item[0], `uuid${i}`);
            assert.strictEqual(item[1].uuid, `uuid${i}`);
        }
    });

    // Test 6: Remove by key
    test('Remove by key', () => {
        const q = new LinkedQueueClass();
        const obj1 = createNotifyObj('uuid1');
        const obj2 = createNotifyObj('uuid2');
        q.enqueue('uuid1', obj1);
        q.enqueue('uuid2', obj2);
        const removed = q.remove('uuid1');
        assert.ok(!IsVoid.check(removed[0]));
        assert.strictEqual(removed[0], 'uuid1');
        assert.strictEqual(q.length, 1);
        assert.strictEqual(q.contains('uuid1'), false);
        assert.strictEqual(q.contains('uuid2'), true);
    });

    // Test 7: Get by key
    test('Get by key', () => {
        const q = new LinkedQueueClass();
        const obj1 = createNotifyObj('uuid1');
        q.enqueue('uuid1', obj1);
        const got = q.get('uuid1');
        assert.ok(!IsVoid.check(got[0]));
        assert.strictEqual(got[0], 'uuid1');
        assert.strictEqual(got[1].uuid, 'uuid1');
        const notFound = q.get('nonexistent');
        assert.ok(IsVoid.check(notFound[0]));
    });

    // Test 8: Contains
    test('Contains check', () => {
        const q = new LinkedQueueClass();
        const obj1 = createNotifyObj('uuid1');
        assert.strictEqual(q.contains('uuid1'), false);
        q.enqueue('uuid1', obj1);
        assert.strictEqual(q.contains('uuid1'), true);
    });

    // Test 9: Length property and getLength method
    test('Length property and getLength method', () => {
        const q = new LinkedQueueClass();
        const obj1 = createNotifyObj('uuid1');
        assert.strictEqual(q.length, 0);
        assert.strictEqual(q.getLength(), 0);
        q.enqueue('uuid1', obj1);
        assert.strictEqual(q.length, 1);
        assert.strictEqual(q.getLength(), 1);
        assert.strictEqual(q.length, q.getLength());
    });

    // Test 10: Empty queue operations
    test('Empty queue operations', () => {
        const q = new LinkedQueueClass();
        const dequeued = q.dequeue();
        assert.ok(IsVoid.check(dequeued[0]));
        const got = q.get('nonexistent');
        assert.ok(IsVoid.check(got[0]));
        const removed = q.remove('nonexistent');
        assert.ok(IsVoid.check(removed[0]));
    });

    // Test 11: Dequeue until valid socket pattern
    test('Dequeue until valid socket', () => {
        const q = new LinkedQueueClass();
        const invalidObj = {
            ws: { writable: false },
            uuid: 'invalid',
            pid: 1234,
            ttl: 5000,
            keepLocksAfterDeath: false
        };
        const validObj = {
            ws: { writable: true },
            uuid: 'valid',
            pid: 5678,
            ttl: 5000,
            keepLocksAfterDeath: false
        };
        q.enqueue('invalid', invalidObj);
        q.enqueue('valid', validObj);
        let lqValue = null;
        let n = null;
        while (lqValue = q.dequeue()) {
            if (IsVoid.check(lqValue[0])) {
                break;
            }
            n = lqValue[1];
            if (n && n.ws && n.ws.writable) {
                break;
            }
        }
        assert.ok(n !== null);
        assert.strictEqual(n.uuid, 'valid');
    });

    // Test 12: Remove and addToFront pattern
    test('Remove and addToFront pattern', () => {
        const q = new LinkedQueueClass();
        const obj1 = createNotifyObj('uuid1');
        const obj2 = createNotifyObj('uuid2');
        q.enqueue('uuid1', obj1);
        const alreadyAdded = q.get('uuid1');
        assert.ok(!IsVoid.check(alreadyAdded[0]));
        q.remove('uuid1');
        q.addToFront('uuid1', obj1);
        assert.strictEqual(q.length, 1);
        q.enqueue('uuid2', obj2);
        assert.strictEqual(q.length, 2);
        const first = q.first();
        assert.strictEqual(first[0], 'uuid1');
    });

    // Test 13: Deq pattern for re-election
    test('Deq pattern for re-election', () => {
        const q = new LinkedQueueClass();
        for (let i = 0; i < 10; i++) {
            q.enqueue(`uuid${i}`, createNotifyObj(`uuid${i}`, 1000 + i));
        }
        const dequeuedItems = q.deq(5);
        dequeuedItems.forEach((item) => {
            assert.ok(Array.isArray(item), 'Item should be an array tuple');
            assert.ok(item[0], 'Item should have key');
            assert.ok(item[1], 'Item should have value');
        });
        assert.strictEqual(q.length, 5);
    });

    // Test 14: Duplicate key handling
    test('Duplicate key error handling', () => {
        const q = new LinkedQueueClass();
        const obj1 = createNotifyObj('uuid1');
        const obj2 = createNotifyObj('uuid1');
        q.enqueue('uuid1', obj1);
        let threw = false;
        try {
            q.enqueue('uuid1', obj2);
        }
        catch (err) {
            threw = true;
        }
        assert.ok(threw, 'Should throw error on duplicate key');
    });

    // Test 15: Deq with more items than available
    test('Deq with more items than available', () => {
        const q = new LinkedQueueClass();
        const obj1 = createNotifyObj('uuid1');
        q.enqueue('uuid1', obj1);
        const dequeued = q.deq(10);
        const validItems = dequeued.filter(item => !IsVoid.check(item[0]));
        assert.strictEqual(validItems.length, 1, 'Should only return available valid items');
        assert.strictEqual(q.length, 0);
    });

    // Test 16: Order maintenance after operations
    test('Order maintenance', () => {
        const q = new LinkedQueueClass();
        for (let i = 0; i < 5; i++) {
            q.enqueue(`uuid${i}`, createNotifyObj(`uuid${i}`, 1000 + i));
        }
        q.remove('uuid2');
        const d1 = q.dequeue();
        assert.strictEqual(d1[0], 'uuid0');
        const d2 = q.dequeue();
        assert.strictEqual(d2[0], 'uuid1');
        const d3 = q.dequeue();
        assert.strictEqual(d3[0], 'uuid3');
    });

    // Test 17: Large number of operations
    test('Large number of operations', () => {
        const q = new LinkedQueueClass();
        const count = 1000;
        for (let i = 0; i < count; i++) {
            q.enqueue(`uuid${i}`, createNotifyObj(`uuid${i}`, 1000 + i));
        }
        assert.strictEqual(q.length, count);
        for (let i = 0; i < count / 2; i++) {
            q.remove(`uuid${i}`);
        }
        assert.strictEqual(q.length, count / 2);
        const remaining = q.deq(count);
        const validRemaining = remaining.filter(item => !IsVoid.check(item[0]));
        assert.strictEqual(validRemaining.length, count / 2, 'Should return all remaining valid items');
        assert.strictEqual(q.length, 0);
    });

    // Test 18: Iterator
    test('Iterator', () => {
        const q = new LinkedQueueClass();
        for (let i = 0; i < 5; i++) {
            q.enqueue(`uuid${i}`, createNotifyObj(`uuid${i}`, 1000 + i));
        }
        let count = 0;
        for (const [key, value] of q) {
            assert.ok(key, 'Key should exist');
            assert.ok(value, 'Value should exist');
            count++;
        }
        assert.strictEqual(count, 5, 'Should iterate all items');
    });

    // Test 19: Reverse iterator
    test('Reverse iterator', () => {
        const q = new LinkedQueueClass();
        for (let i = 0; i < 5; i++) {
            q.enqueue(`uuid${i}`, createNotifyObj(`uuid${i}`, 1000 + i));
        }
        const keys = [];
        for (const [key, value] of q.reverseIterator()) {
            keys.push(key);
        }
        assert.deepStrictEqual(keys, ['uuid4', 'uuid3', 'uuid2', 'uuid1', 'uuid0']);
    });

    // Test 20: Pop (removeLast)
    test('Pop (removeLast)', () => {
        const q = new LinkedQueueClass();
        for (let i = 0; i < 3; i++) {
            q.enqueue(`uuid${i}`, createNotifyObj(`uuid${i}`, 1000 + i));
        }
        const popped = q.pop();
        assert.strictEqual(popped[0], 'uuid2');
        assert.strictEqual(q.length, 2);
    });

    // Test 21: Shift (dequeue alias)
    test('Shift (dequeue alias)', () => {
        const q = new LinkedQueueClass();
        for (let i = 0; i < 3; i++) {
            q.enqueue(`uuid${i}`, createNotifyObj(`uuid${i}`, 1000 + i));
        }
        const shifted = q.shift();
        assert.strictEqual(shifted[0], 'uuid0');
        assert.strictEqual(q.length, 2);
    });

    return results;
}

// Main execution
console.log('Linked-Queue Compatibility Test');
console.log('Testing v3.0.0 with ESNext modules\n');

let allPassed = true;

try {
    const results = runTests('v3.0.0', LinkedQueue);
    if (results.failed > 0) {
        allPassed = false;
    }
    console.log(`\n${'='.repeat(60)}`);
    console.log('SUMMARY');
    console.log('='.repeat(60));
    console.log(`  Passed: ${results.passed}`);
    console.log(`  Failed: ${results.failed}`);
    if (results.errors.length > 0) {
        console.log(`  Errors:`);
        results.errors.forEach(err => {
            console.log(`    - ${err.name}: ${err.error}`);
        });
    }
}
catch (err) {
    console.error(`\nError:`, err.message);
    allPassed = false;
}

if (allPassed) {
    console.log('\n✓ All tests passed!');
}

process.exit(allPassed ? 0 : 1);
