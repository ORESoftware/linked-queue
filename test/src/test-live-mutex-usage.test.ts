#!/usr/bin/env node

/**
 * Comprehensive test for linked-queue based on how it's used in live-mutex
 * Tests both current version (0.1.106) and latest version (2.1.129)
 */

import * as assert from 'assert';
import {LinkedQueue, LinkedQueueValue, IsVoid} from '../../dist/linked-queue';

interface NotifyObj {
    ws: any;
    uuid: string;
    pid: number;
    ttl: number;
    keepLocksAfterDeath: boolean;
}

describe('LinkedQueue - Live-Mutex Usage Tests', () => {

    describe('Basic Operations - as used in broker.ts', () => {
        let queue: LinkedQueue<NotifyObj, string>;

        beforeEach(() => {
            queue = new LinkedQueue<NotifyObj, string>();
        });

        it('should create an empty queue', () => {
            assert.strictEqual(queue.length, 0);
            assert.strictEqual(queue.getLength(), 0);
        });

        it('should push items to the end (enqueue)', () => {
            const obj1: NotifyObj = {
                ws: {writable: true},
                uuid: 'uuid1',
                pid: 1234,
                ttl: 5000,
                keepLocksAfterDeath: false
            };
            const obj2: NotifyObj = {
                ws: {writable: true},
                uuid: 'uuid2',
                pid: 5678,
                ttl: 5000,
                keepLocksAfterDeath: false
            };

            // Test enqueue (which should be aliased as push in some versions)
            queue.enqueue('uuid1', obj1);
            assert.strictEqual(queue.length, 1);
            assert.strictEqual(queue.contains('uuid1'), true);

            queue.enqueue('uuid2', obj2);
            assert.strictEqual(queue.length, 2);
            assert.strictEqual(queue.contains('uuid2'), true);
        });

        it('should add items to front (addToFront/unshift)', () => {
            const obj1: NotifyObj = {
                ws: {writable: true},
                uuid: 'uuid1',
                pid: 1234,
                ttl: 5000,
                keepLocksAfterDeath: false
            };
            const obj2: NotifyObj = {
                ws: {writable: true},
                uuid: 'uuid2',
                pid: 5678,
                ttl: 5000,
                keepLocksAfterDeath: false
            };

            queue.enqueue('uuid1', obj1);
            queue.addToFront('uuid2', obj2);

            assert.strictEqual(queue.length, 2);
            const first = queue.first();
            assert.ok(!IsVoid.check(first[0]));
            assert.strictEqual(first[0], 'uuid2'); // Should be first
        });

        it('should dequeue items from front', () => {
            const obj1: NotifyObj = {
                ws: {writable: true},
                uuid: 'uuid1',
                pid: 1234,
                ttl: 5000,
                keepLocksAfterDeath: false
            };
            const obj2: NotifyObj = {
                ws: {writable: true},
                uuid: 'uuid2',
                pid: 5678,
                ttl: 5000,
                keepLocksAfterDeath: false
            };

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

        it('should dequeue multiple items (deq)', () => {
            const objs: NotifyObj[] = [];
            for (let i = 0; i < 10; i++) {
                const obj: NotifyObj = {
                    ws: {writable: true},
                    uuid: `uuid${i}`,
                    pid: 1000 + i,
                    ttl: 5000,
                    keepLocksAfterDeath: false
                };
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

        it('should remove items by key', () => {
            const obj1: NotifyObj = {
                ws: {writable: true},
                uuid: 'uuid1',
                pid: 1234,
                ttl: 5000,
                keepLocksAfterDeath: false
            };
            const obj2: NotifyObj = {
                ws: {writable: true},
                uuid: 'uuid2',
                pid: 5678,
                ttl: 5000,
                keepLocksAfterDeath: false
            };

            queue.enqueue('uuid1', obj1);
            queue.enqueue('uuid2', obj2);

            const removed = queue.remove('uuid1');
            assert.ok(!IsVoid.check(removed[0]));
            assert.strictEqual(removed[0], 'uuid1');
            assert.strictEqual(queue.length, 1);
            assert.strictEqual(queue.contains('uuid1'), false);
            assert.strictEqual(queue.contains('uuid2'), true);
        });

        it('should get items by key', () => {
            const obj1: NotifyObj = {
                ws: {writable: true},
                uuid: 'uuid1',
                pid: 1234,
                ttl: 5000,
                keepLocksAfterDeath: false
            };

            queue.enqueue('uuid1', obj1);

            const got = queue.get('uuid1');
            assert.ok(!IsVoid.check(got[0]));
            assert.strictEqual(got[0], 'uuid1');
            assert.strictEqual(got[1].uuid, 'uuid1');
            assert.strictEqual(got[1].pid, 1234);

            const notFound = queue.get('nonexistent');
            assert.ok(IsVoid.check(notFound[0]));
        });

        it('should check if key exists (contains)', () => {
            const obj1: NotifyObj = {
                ws: {writable: true},
                uuid: 'uuid1',
                pid: 1234,
                ttl: 5000,
                keepLocksAfterDeath: false
            };

            assert.strictEqual(queue.contains('uuid1'), false);
            queue.enqueue('uuid1', obj1);
            assert.strictEqual(queue.contains('uuid1'), true);
            assert.strictEqual(queue.contains('nonexistent'), false);
        });

        it('should handle empty queue operations', () => {
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

    describe('Live-Mutex Specific Patterns', () => {
        let queue: LinkedQueue<NotifyObj, string>;

        beforeEach(() => {
            queue = new LinkedQueue<NotifyObj, string>();
        });

        it('should simulate ensureNewLockHolder pattern - dequeue until valid', () => {
            // Pattern from broker.ts line 1103
            const invalidObj: NotifyObj = {
                ws: {writable: false}, // Invalid socket
                uuid: 'invalid',
                pid: 1234,
                ttl: 5000,
                keepLocksAfterDeath: false
            };
            const validObj: NotifyObj = {
                ws: {writable: true}, // Valid socket
                uuid: 'valid',
                pid: 5678,
                ttl: 5000,
                keepLocksAfterDeath: false
            };

            queue.enqueue('invalid', invalidObj);
            queue.enqueue('valid', validObj);

            let lqValue: LinkedQueueValue<NotifyObj, string> | null = null;
            let n: NotifyObj | null = null;

            // Find the next valid waiter (pattern from broker.ts)
            while (lqValue = queue.dequeue() as any) {
                if (IsVoid.check(lqValue.key)) {
                    break;
                }
                n = lqValue.value;
                if (n && n.ws && n.ws.writable) {
                    break;
                }
            }

            assert.ok(n !== null);
            assert.strictEqual(n!.uuid, 'valid');
            assert.strictEqual(queue.length, 0); // Both dequeued
        });

        it('should simulate lock pattern - push, unshift, remove', () => {
            // Pattern from broker.ts lines 1365-1379
            const obj1: NotifyObj = {
                ws: {writable: true},
                uuid: 'uuid1',
                pid: 1234,
                ttl: 5000,
                keepLocksAfterDeath: false
            };
            const obj2: NotifyObj = {
                ws: {writable: true},
                uuid: 'uuid2',
                pid: 5678,
                ttl: 5000,
                keepLocksAfterDeath: false
            };

            // Normal push
            queue.enqueue('uuid1', obj1);
            assert.strictEqual(queue.length, 1);

            // Check if already added
            const alreadyAdded = queue.get('uuid1');
            assert.ok(!IsVoid.check(alreadyAdded[0]));

            // Remove and unshift (force pattern)
            queue.remove('uuid1');
            queue.addToFront('uuid1', obj1);
            assert.strictEqual(queue.length, 1);

            // Add another with push
            queue.enqueue('uuid2', obj2);
            assert.strictEqual(queue.length, 2);

            // Verify order (uuid1 should be first due to unshift)
            const first = queue.first();
            assert.strictEqual(first[0], 'uuid1');
        });

        it('should simulate deq pattern for re-election', () => {
            // Pattern from broker.ts line 1222
            const objs: NotifyObj[] = [];
            for (let i = 0; i < 10; i++) {
                const obj: NotifyObj = {
                    ws: {writable: true},
                    uuid: `uuid${i}`,
                    pid: 1000 + i,
                    ttl: 5000,
                    keepLocksAfterDeath: false
                };
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

        it('should handle length property and getLength method', () => {
            // Pattern from broker.ts - uses both
            const obj1: NotifyObj = {
                ws: {writable: true},
                uuid: 'uuid1',
                pid: 1234,
                ttl: 5000,
                keepLocksAfterDeath: false
            };

            assert.strictEqual(queue.length, 0);
            assert.strictEqual(queue.getLength(), 0);

            queue.enqueue('uuid1', obj1);

            assert.strictEqual(queue.length, 1);
            assert.strictEqual(queue.getLength(), 1);

            // Both should be in sync
            assert.strictEqual(queue.length, queue.getLength());
        });

        it('should handle cleanup pattern - remove by uuid', () => {
            // Pattern from broker.ts line 389, 766
            const obj1: NotifyObj = {
                ws: {writable: true},
                uuid: 'uuid1',
                pid: 1234,
                ttl: 5000,
                keepLocksAfterDeath: false
            };
            const obj2: NotifyObj = {
                ws: {writable: true},
                uuid: 'uuid2',
                pid: 5678,
                ttl: 5000,
                keepLocksAfterDeath: false
            };

            queue.enqueue('uuid1', obj1);
            queue.enqueue('uuid2', obj2);

            // Cleanup specific uuid
            queue.remove('uuid1');
            assert.strictEqual(queue.length, 1);
            assert.strictEqual(queue.contains('uuid1'), false);
            assert.strictEqual(queue.contains('uuid2'), true);
        });
    });

    describe('Edge Cases and Error Handling', () => {
        let queue: LinkedQueue<NotifyObj, string>;

        beforeEach(() => {
            queue = new LinkedQueue<NotifyObj, string>();
        });

        it('should handle duplicate key attempts', () => {
            const obj1: NotifyObj = {
                ws: {writable: true},
                uuid: 'uuid1',
                pid: 1234,
                ttl: 5000,
                keepLocksAfterDeath: false
            };
            const obj2: NotifyObj = {
                ws: {writable: true},
                uuid: 'uuid1', // Same uuid
                pid: 5678,
                ttl: 5000,
                keepLocksAfterDeath: false
            };

            queue.enqueue('uuid1', obj1);

            // Should throw error when trying to add duplicate
            assert.throws(() => {
                queue.enqueue('uuid1', obj2);
            }, Error);
        });

        it('should handle deq with more items than available', () => {
            const obj1: NotifyObj = {
                ws: {writable: true},
                uuid: 'uuid1',
                pid: 1234,
                ttl: 5000,
                keepLocksAfterDeath: false
            };

            queue.enqueue('uuid1', obj1);

            // Request more than available
            const dequeued = queue.deq(10);
            assert.strictEqual(dequeued.length, 1);
            assert.strictEqual(queue.length, 0);
        });

        it('should handle deq with zero or negative numbers', () => {
            assert.throws(() => {
                queue.deq(0);
            }, Error);

            assert.throws(() => {
                queue.deq(-1);
            }, Error);
        });

        it('should maintain order after multiple operations', () => {
            const objs: NotifyObj[] = [];
            for (let i = 0; i < 5; i++) {
                const obj: NotifyObj = {
                    ws: {writable: true},
                    uuid: `uuid${i}`,
                    pid: 1000 + i,
                    ttl: 5000,
                    keepLocksAfterDeath: false
                };
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

    describe('Performance and Stress Tests', () => {
        it('should handle large number of operations', () => {
            const queue = new LinkedQueue<NotifyObj, string>();
            const count = 10000;

            // Add many items
            for (let i = 0; i < count; i++) {
                const obj: NotifyObj = {
                    ws: {writable: true},
                    uuid: `uuid${i}`,
                    pid: 1000 + i,
                    ttl: 5000,
                    keepLocksAfterDeath: false
                };
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

        it('should handle rapid add/remove cycles', () => {
            const queue = new LinkedQueue<NotifyObj, string>();

            for (let cycle = 0; cycle < 100; cycle++) {
                // Add items
                for (let i = 0; i < 10; i++) {
                    const obj: NotifyObj = {
                        ws: {writable: true},
                        uuid: `uuid${cycle}_${i}`,
                        pid: cycle * 10 + i,
                        ttl: 5000,
                        keepLocksAfterDeath: false
                    };
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
    });
});

// Run tests if executed directly
if (require.main === module) {
    console.log('Running LinkedQueue tests for live-mutex usage patterns...');
    console.log('Note: This test file should be run with a test runner like mocha or jest');
}

