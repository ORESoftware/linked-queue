#!/usr/bin/env node

'use strict';

/**
 * Improved tests for linked-queue based on live-mutex usage patterns
 * Tests the actual methods used in broker.ts and broker-1.ts
 */

const assert = require('assert');
const {LinkedQueue, LinkedQueueValue, IsVoid} = require('../../dist/linked-queue');

// Simulate NotifyObj interface from live-mutex
function createNotifyObj(uuid, pid = 1234, ttl = 5000) {
    return {
        ws: {writable: true},
        uuid: uuid,
        pid: pid,
        ttl: ttl,
        keepLocksAfterDeath: false
    };
}

function runTests() {
    let queue;
    let testCount = 0;
    let passCount = 0;
    let failCount = 0;

    function test(name, fn) {
        testCount++;
        try {
            fn();
            passCount++;
            console.log(`✓ ${name}`);
        } catch (err) {
            failCount++;
            console.error(`✗ ${name}: ${err.message}`);
            throw err;
        }
    }

    function beforeEach(fn) {
        queue = new LinkedQueue();
        fn();
    }

    console.log('\n=== Basic Operations - as used in broker.ts ===\n');

    beforeEach(() => {
        test('should create an empty queue', () => {
            assert.strictEqual(queue.length, 0);
            assert.strictEqual(queue.getLength(), 0);
            assert.strictEqual(queue.size, 0);
        });

        test('should enqueue items (push pattern)', () => {
            const obj1 = createNotifyObj('uuid1');
            const obj2 = createNotifyObj('uuid2');

            queue.enqueue('uuid1', obj1);
            assert.strictEqual(queue.length, 1);
            assert.strictEqual(queue.contains('uuid1'), true);

            queue.enqueue('uuid2', obj2);
            assert.strictEqual(queue.length, 2);
            assert.strictEqual(queue.contains('uuid2'), true);
        });

        test('should add items to front (unshift pattern)', () => {
            const obj1 = createNotifyObj('uuid1');
            const obj2 = createNotifyObj('uuid2');

            queue.enqueue('uuid1', obj1);
            queue.addToFront('uuid2', obj2);

            assert.strictEqual(queue.length, 2);
            const first = queue.first();
            assert.ok(!IsVoid.check(first[0]));
            assert.strictEqual(first[0], 'uuid2'); // Should be first
        });

        test('should dequeue items from front', () => {
            const obj1 = createNotifyObj('uuid1');
            const obj2 = createNotifyObj('uuid2');

            queue.enqueue('uuid1', obj1);
            queue.enqueue('uuid2', obj2);

            const dequeued = queue.dequeue();
            assert.ok(!IsVoid.check(dequeued[0]));
            assert.strictEqual(dequeued[0], 'uuid1');
            assert.strictEqual(dequeued[1].uuid, 'uuid1');
            assert.strictEqual(queue.length, 1);

            const dequeued2 = queue.dequeue();
            assert.ok(!IsVoid.check(dequeued2[0]));
            assert.strictEqual(dequeued2[0], 'uuid2');
            assert.strictEqual(queue.length, 0);
        });

        test('should dequeue multiple items (deq pattern from broker.ts line 1222)', () => {
            const objs = [];
            for (let i = 0; i < 10; i++) {
                const obj = createNotifyObj(`uuid${i}`, 1000 + i);
                objs.push(obj);
                queue.enqueue(`uuid${i}`, obj);
            }

            assert.strictEqual(queue.length, 10);

            const dequeued = queue.deq(5);
            assert.strictEqual(dequeued.length, 5);
            assert.strictEqual(queue.length, 5);

            // Verify order
            for (let i = 0; i < 5; i++) {
                assert.strictEqual(dequeued[i].key, `uuid${i}`);
                assert.strictEqual(dequeued[i].value.uuid, `uuid${i}`);
            }
        });

        test('should remove items by key (pattern from broker.ts line 389, 766)', () => {
            const obj1 = createNotifyObj('uuid1');
            const obj2 = createNotifyObj('uuid2');

            queue.enqueue('uuid1', obj1);
            queue.enqueue('uuid2', obj2);

            const removed = queue.remove('uuid1');
            assert.ok(!IsVoid.check(removed[0]));
            assert.strictEqual(removed[0], 'uuid1');
            assert.strictEqual(queue.length, 1);
            assert.strictEqual(queue.contains('uuid1'), false);
            assert.strictEqual(queue.contains('uuid2'), true);
        });

        test('should get items by key (pattern from broker.ts line 1371)', () => {
            const obj1 = createNotifyObj('uuid1');

            queue.enqueue('uuid1', obj1);

            const got = queue.get('uuid1');
            assert.ok(!IsVoid.check(got[0]));
            assert.strictEqual(got[0], 'uuid1');
            assert.strictEqual(got[1].uuid, 'uuid1');
            assert.strictEqual(got[1].pid, 1234);

            const notFound = queue.get('nonexistent');
            assert.ok(IsVoid.check(notFound[0]));
        });

        test('should check if key exists (contains pattern from broker.ts line 1216)', () => {
            const obj1 = createNotifyObj('uuid1');

            assert.strictEqual(queue.contains('uuid1'), false);
            queue.enqueue('uuid1', obj1);
            assert.strictEqual(queue.contains('uuid1'), true);
            assert.strictEqual(queue.contains('nonexistent'), false);
        });

        test('should handle empty queue operations', () => {
            const dequeued = queue.dequeue();
            assert.ok(IsVoid.check(dequeued[0]));

            const got = queue.get('nonexistent');
            assert.ok(IsVoid.check(got[0]));

            const removed = queue.remove('nonexistent');
            assert.ok(IsVoid.check(removed[0]));

            assert.strictEqual(queue.length, 0);
            assert.strictEqual(queue.getLength(), 0);
        });
    });

    console.log('\n=== Live-Mutex Specific Patterns ===\n');

    beforeEach(() => {
        test('should simulate ensureNewLockHolder pattern - dequeue until valid (broker.ts line 1103)', () => {
            // Pattern from broker.ts line 1103
            const invalidObj = {
                ws: {writable: false}, // Invalid socket
                uuid: 'invalid',
                pid: 1234,
                ttl: 5000,
                keepLocksAfterDeath: false
            };
            const validObj = {
                ws: {writable: true}, // Valid socket
                uuid: 'valid',
                pid: 5678,
                ttl: 5000,
                keepLocksAfterDeath: false
            };

            queue.enqueue('invalid', invalidObj);
            queue.enqueue('valid', validObj);

            let lqValue = null;
            let n = null;

            // Find the next valid waiter (pattern from broker.ts)
            while (lqValue = queue.dequeue()) {
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
            assert.strictEqual(queue.length, 0); // Both dequeued
        });

        test('should simulate lock pattern - push, unshift, remove (broker.ts lines 1365-1379)', () => {
            // Pattern from broker.ts lines 1365-1379
            const obj1 = createNotifyObj('uuid1');
            const obj2 = createNotifyObj('uuid2');

            // Normal enqueue (push pattern)
            queue.enqueue('uuid1', obj1);
            assert.strictEqual(queue.length, 1);

            // Check if already added
            const alreadyAdded = queue.get('uuid1');
            assert.ok(!IsVoid.check(alreadyAdded[0]));

            // Remove and addToFront (force pattern - unshift)
            queue.remove('uuid1');
            queue.addToFront('uuid1', obj1);
            assert.strictEqual(queue.length, 1);

            // Add another with enqueue (push)
            queue.enqueue('uuid2', obj2);
            assert.strictEqual(queue.length, 2);

            // Verify order (uuid1 should be first due to addToFront)
            const first = queue.first();
            assert.strictEqual(first[0], 'uuid1');
        });

        test('should simulate deq pattern for re-election (broker.ts line 1222)', () => {
            // Pattern from broker.ts line 1222
            const objs = [];
            for (let i = 0; i < 10; i++) {
                const obj = createNotifyObj(`uuid${i}`, 1000 + i);
                objs.push(obj);
                queue.enqueue(`uuid${i}`, obj);
            }

            // Dequeue first 5 for re-election
            queue.deq(5).forEach(lqv => {
                assert.ok(lqv.key);
                assert.ok(lqv.value);
                // In real code, would send message to obj.ws
            });

            assert.strictEqual(queue.length, 5);
        });

        test('should handle length property and getLength method (broker.ts uses both)', () => {
            // Pattern from broker.ts - uses both
            const obj1 = createNotifyObj('uuid1');

            assert.strictEqual(queue.length, 0);
            assert.strictEqual(queue.getLength(), 0);

            queue.enqueue('uuid1', obj1);

            assert.strictEqual(queue.length, 1);
            assert.strictEqual(queue.getLength(), 1);

            // Both should be in sync
            assert.strictEqual(queue.length, queue.getLength());
        });

        test('should handle cleanup pattern - remove by uuid (broker.ts line 389, 766)', () => {
            // Pattern from broker.ts line 389, 766
            const obj1 = createNotifyObj('uuid1');
            const obj2 = createNotifyObj('uuid2');

            queue.enqueue('uuid1', obj1);
            queue.enqueue('uuid2', obj2);

            // Cleanup specific uuid
            queue.remove('uuid1');
            assert.strictEqual(queue.length, 1);
            assert.strictEqual(queue.contains('uuid1'), false);
            assert.strictEqual(queue.contains('uuid2'), true);
        });
    });

    console.log('\n=== Edge Cases and Error Handling ===\n');

    beforeEach(() => {
        test('should handle duplicate key attempts', () => {
            const obj1 = createNotifyObj('uuid1');
            const obj2 = createNotifyObj('uuid1'); // Same uuid

            queue.enqueue('uuid1', obj1);

            // Should throw error when trying to add duplicate
            assert.throws(() => {
                queue.enqueue('uuid1', obj2);
            }, Error);
        });

        test('should handle deq with more items than available', () => {
            const obj1 = createNotifyObj('uuid1');

            queue.enqueue('uuid1', obj1);

            // Request more than available
            const dequeued = queue.deq(10);
            assert.strictEqual(dequeued.length, 1);
            assert.strictEqual(queue.length, 0);
        });

        test('should handle deq with zero or negative numbers', () => {
            assert.throws(() => {
                queue.deq(0);
            }, Error);

            assert.throws(() => {
                queue.deq(-1);
            }, Error);
        });

        test('should maintain order after multiple operations', () => {
            const objs = [];
            for (let i = 0; i < 5; i++) {
                const obj = createNotifyObj(`uuid${i}`, 1000 + i);
                objs.push(obj);
                queue.enqueue(`uuid${i}`, obj);
            }

            // Remove middle item
            queue.remove('uuid2');

            // Dequeue should maintain order
            const d1 = queue.dequeue();
            assert.strictEqual(d1[0], 'uuid0');

            const d2 = queue.dequeue();
            assert.strictEqual(d2[0], 'uuid1');

            const d3 = queue.dequeue();
            assert.strictEqual(d3[0], 'uuid3');
        });
    });

    console.log('\n=== Performance and Stress Tests ===\n');

    test('should handle large number of operations', () => {
        const queue = new LinkedQueue();
        const count = 10000;

        // Add many items
        for (let i = 0; i < count; i++) {
            const obj = createNotifyObj(`uuid${i}`, 1000 + i);
            queue.enqueue(`uuid${i}`, obj);
        }

        assert.strictEqual(queue.length, count);

        // Remove some
        for (let i = 0; i < count / 2; i++) {
            queue.remove(`uuid${i}`);
        }

        assert.strictEqual(queue.length, count / 2);

        // Dequeue rest
        const remaining = queue.deq(count);
        assert.strictEqual(remaining.length, count / 2);
        assert.strictEqual(queue.length, 0);
    });

    test('should handle rapid add/remove cycles', () => {
        const queue = new LinkedQueue();

        for (let cycle = 0; cycle < 100; cycle++) {
            // Add items
            for (let i = 0; i < 10; i++) {
                const obj = createNotifyObj(`uuid${cycle}_${i}`, cycle * 10 + i);
                queue.enqueue(`uuid${cycle}_${i}`, obj);
            }

            // Remove some
            for (let i = 0; i < 5; i++) {
                queue.remove(`uuid${cycle}_${i}`);
            }

            // Dequeue some
            queue.deq(3);

            // Verify consistency
            assert.ok(queue.length >= 0);
            assert.strictEqual(queue.length, queue.getLength());
        }
    });

    console.log('\n=== Iterator Tests ===\n');

    test('should iterate over queue items', () => {
        const queue = new LinkedQueue();
        const objs = [];
        for (let i = 0; i < 5; i++) {
            const obj = createNotifyObj(`uuid${i}`, 1000 + i);
            objs.push(obj);
            queue.enqueue(`uuid${i}`, obj);
        }

        const items = [];
        for (const [key, value] of queue) {
            items.push([key, value]);
        }

        assert.strictEqual(items.length, 5);
        assert.strictEqual(items[0][0], 'uuid0');
        assert.strictEqual(items[4][0], 'uuid4');
    });

    test('should use dequeueIterator', () => {
        const queue = new LinkedQueue();
        const objs = [];
        for (let i = 0; i < 5; i++) {
            const obj = createNotifyObj(`uuid${i}`, 1000 + i);
            objs.push(obj);
            queue.enqueue(`uuid${i}`, obj);
        }

        const items = [];
        for (const [key, value] of queue.dequeueIterator()) {
            items.push([key, value]);
        }

        assert.strictEqual(items.length, 5);
        assert.strictEqual(queue.length, 0); // All dequeued
    });

    console.log(`\n=== Test Results: ${passCount}/${testCount} passed ===\n`);
    
    if (failCount > 0) {
        process.exit(1);
    }
}

// Run tests if executed directly
if (require.main === module) {
    try {
        runTests();
        console.log('All tests passed!');
    } catch (err) {
        console.error('Test suite failed:', err);
        process.exit(1);
    }
}
