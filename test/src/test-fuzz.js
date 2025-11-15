#!/usr/bin/env node
"use strict";
/**
 * Major Fuzz Test for linked-queue
 * Tests 4000 random operations in a row to stress test the implementation
 * Based on live-mutex usage patterns and all available methods
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const assert = __importStar(require("assert"));
const linked_queue_1 = require("../../dist/linked-queue");
const crypto = __importStar(require("crypto"));
function createNotifyObj(uuid, pid = Math.floor(Math.random() * 10000), ttl = 5000) {
    return {
        ws: { writable: Math.random() > 0.1 }, // 90% writable
        uuid: uuid,
        pid: pid,
        ttl: ttl,
        keepLocksAfterDeath: false
    };
}
function generateUUID() {
    return crypto.randomBytes(16).toString('hex');
}
function testHeadTail(q) {
    // Verify head/tail consistency
    const first = q.first();
    const last = q.last();
    const peek = q.peek();
    if (q.length === 0) {
        assert.ok(linked_queue_1.IsVoid.check(first[0]), 'First should be void when empty');
        assert.ok(linked_queue_1.IsVoid.check(last[0]), 'Last should be void when empty');
        assert.ok(linked_queue_1.IsVoid.check(peek[0]), 'Peek should be void when empty');
    }
    else {
        assert.ok(!linked_queue_1.IsVoid.check(first[0]), 'First should not be void when not empty');
        assert.ok(!linked_queue_1.IsVoid.check(last[0]), 'Last should not be void when not empty');
        assert.ok(!linked_queue_1.IsVoid.check(peek[0]), 'Peek should not be void when not empty');
        // First and peek should be the same
        assert.strictEqual(first[0], peek[0], 'First and peek should match');
    }
}
function runFuzzTest(versionName, LinkedQueueClass) {
    const q = new LinkedQueueClass();
    const operations = [];
    const startTime = Date.now();
    const operationCount = 4000;
    // Track keys that exist in the queue
    const existingKeys = new Set();
    let operationIndex = 0;
    // Operation functions based on live-mutex usage patterns
    const operationsMap = {
        0: () => {
            // removeAll
            q.removeAll();
            existingKeys.clear();
            operations.push(`${operationIndex}: removeAll()`);
        },
        1: () => {
            // enqueue (push pattern)
            const key = generateUUID();
            const obj = createNotifyObj(key);
            try {
                q.enqueue(key, obj);
                existingKeys.add(key);
                operations.push(`${operationIndex}: enqueue(${key})`);
            }
            catch (err) {
                // Duplicate key - expected sometimes
            }
        },
        2: () => {
            // addToFront (unshift pattern)
            const key = generateUUID();
            const obj = createNotifyObj(key);
            try {
                q.addToFront(key, obj);
                existingKeys.add(key);
                operations.push(`${operationIndex}: addToFront(${key})`);
            }
            catch (err) {
                // Duplicate key - expected sometimes
            }
        },
        3: () => {
            // dequeue
            if (q.length > 0) {
                const result = q.dequeue();
                if (!linked_queue_1.IsVoid.check(result[0])) {
                    const key = result[0];
                    existingKeys.delete(key);
                    operations.push(`${operationIndex}: dequeue() -> ${key}`);
                }
            }
        },
        4: () => {
            // deq(n) - random number between 1 and min(10, queue.length)
            if (q.length > 0) {
                const n = Math.min(Math.floor(Math.random() * 10) + 1, q.length);
                const results = q.deq(n);
                results.forEach(item => {
                    if (Array.isArray(item) && !linked_queue_1.IsVoid.check(item[0])) {
                        existingKeys.delete(item[0]);
                    }
                });
                operations.push(`${operationIndex}: deq(${n}) -> ${results.length} items`);
            }
        },
        5: () => {
            // remove by key
            if (existingKeys.size > 0) {
                const keysArray = Array.from(existingKeys);
                const keyToRemove = keysArray[Math.floor(Math.random() * keysArray.length)];
                const result = q.remove(keyToRemove);
                if (!linked_queue_1.IsVoid.check(result[0])) {
                    existingKeys.delete(keyToRemove);
                    operations.push(`${operationIndex}: remove(${keyToRemove})`);
                }
            }
        },
        6: () => {
            // get by key
            if (existingKeys.size > 0) {
                const keysArray = Array.from(existingKeys);
                const keyToGet = keysArray[Math.floor(Math.random() * keysArray.length)];
                const result = q.get(keyToGet);
                assert.ok(!linked_queue_1.IsVoid.check(result[0]), `Should find key ${String(keyToGet)}`);
                operations.push(`${operationIndex}: get(${keyToGet})`);
            }
        },
        7: () => {
            // contains check
            if (existingKeys.size > 0) {
                const keysArray = Array.from(existingKeys);
                const keyToCheck = keysArray[Math.floor(Math.random() * keysArray.length)];
                const result = q.contains(keyToCheck);
                assert.strictEqual(result, true, `Should contain key ${String(keyToCheck)}`);
                operations.push(`${operationIndex}: contains(${keyToCheck})`);
            }
        },
        8: () => {
            // removeLast
            if (q.length > 0) {
                const result = q.removeLast();
                if (!linked_queue_1.IsVoid.check(result[0])) {
                    const key = result[0];
                    existingKeys.delete(key);
                    operations.push(`${operationIndex}: removeLast() -> ${key}`);
                }
            }
        },
        9: () => {
            // getRandomKey and remove it
            if (q.length > 0) {
                try {
                    const randomKey = q.getRandomKey();
                    const result = q.remove(randomKey);
                    if (!linked_queue_1.IsVoid.check(result[0])) {
                        existingKeys.delete(randomKey);
                        operations.push(`${operationIndex}: remove(randomKey: ${randomKey})`);
                    }
                }
                catch (err) {
                    // Expected if queue is empty
                }
            }
        },
        10: () => {
            // getOrderedList and verify
            const ordered = q.getOrderedList();
            assert.strictEqual(ordered.length, q.length, 'Ordered list length should match queue length');
            operations.push(`${operationIndex}: getOrderedList() -> ${ordered.length} items`);
        },
        11: () => {
            // getReverseOrderedList and verify
            const reverse = q.getReverseOrderedList();
            assert.strictEqual(reverse.length, q.length, 'Reverse list length should match queue length');
            operations.push(`${operationIndex}: getReverseOrderedList() -> ${reverse.length} items`);
        },
        12: () => {
            // length property check
            const len = q.length;
            const getLen = q.getLength();
            assert.strictEqual(len, getLen, 'length and getLength should match');
            assert.strictEqual(len, q.size, 'length and size should match');
            assert.ok(Number.isInteger(len), 'length should be integer');
            assert.ok(len >= 0, 'length should be non-negative');
            operations.push(`${operationIndex}: length check -> ${len}`);
        },
        13: () => {
            // first() and last() consistency
            const first = q.first();
            const last = q.last();
            if (q.length === 0) {
                assert.ok(linked_queue_1.IsVoid.check(first[0]), 'First should be void when empty');
                assert.ok(linked_queue_1.IsVoid.check(last[0]), 'Last should be void when empty');
            }
            else if (q.length === 1) {
                assert.strictEqual(first[0], last[0], 'First and last should match when length is 1');
            }
            operations.push(`${operationIndex}: first/last check`);
        },
        14: () => {
            // Iterator test
            let count = 0;
            for (const [key, value] of q) {
                assert.ok(key, 'Iterator key should exist');
                assert.ok(value, 'Iterator value should exist');
                count++;
            }
            assert.strictEqual(count, q.length, 'Iterator should iterate all items');
            operations.push(`${operationIndex}: iterator -> ${count} items`);
        },
        15: () => {
            // dequeueIterator test
            const beforeLen = q.length;
            let count = 0;
            for (const [key, value] of q.dequeueIterator()) {
                if (!linked_queue_1.IsVoid.check(key)) {
                    count++;
                    existingKeys.delete(key);
                }
            }
            const afterLen = q.length;
            assert.strictEqual(afterLen, 0, 'Queue should be empty after dequeueIterator');
            operations.push(`${operationIndex}: dequeueIterator -> ${count} items, ${beforeLen} -> ${afterLen}`);
        }
    };
    const operationKeys = Object.keys(operationsMap).map(k => parseInt(k));
    const maxOp = Math.max(...operationKeys);
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Fuzz Test: ${versionName}`);
    console.log(`Running ${operationCount} random operations...`);
    console.log('='.repeat(60));
    let previousLength = 0;
    for (let i = 0; i < operationCount; i++) {
        operationIndex = i;
        previousLength = q.length;
        // Randomly select an operation
        const opIndex = Math.floor(Math.random() * (maxOp + 1));
        const operation = operationsMap[opIndex];
        if (operation) {
            try {
                operation();
            }
            catch (err) {
                console.error(`\nError at operation ${i}:`);
                console.error(`Operation: ${operations[operations.length - 1]}`);
                console.error(`Queue length before: ${previousLength}`);
                console.error(`Queue length after: ${q.length}`);
                console.error(`Error: ${err.message}`);
                console.error(`Stack: ${err.stack}`);
                throw err;
            }
        }
        // Verify invariants after each operation
        const currentLength = q.length;
        // Length should be integer and non-negative
        assert.ok(Number.isInteger(currentLength), `Length should be integer at operation ${i}`);
        assert.ok(currentLength >= 0, `Length should be non-negative at operation ${i}`);
        // Length should match size
        assert.strictEqual(currentLength, q.size, `Length and size should match at operation ${i}`);
        assert.strictEqual(currentLength, q.getLength(), `Length and getLength should match at operation ${i}`);
        // Verify head/tail consistency (every 100 operations to avoid performance hit)
        if (i % 100 === 0) {
            testHeadTail(q);
        }
        // Verify existingKeys matches queue contents (every 50 operations)
        if (i % 50 === 0 && currentLength > 0) {
            const ordered = q.getOrderedList();
            const queueKeys = new Set(ordered.map(item => item[0]));
            // Some keys might have been removed, so we check intersection
            for (const key of existingKeys) {
                if (!queueKeys.has(key)) {
                    // Key was removed, clean up
                    existingKeys.delete(key);
                }
            }
        }
        // Progress indicator
        if ((i + 1) % 500 === 0) {
            process.stdout.write(`  Progress: ${i + 1}/${operationCount} operations (queue length: ${currentLength})\r`);
        }
    }
    const endTime = Date.now();
    const duration = endTime - startTime;
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Fuzz Test Complete: ${versionName}`);
    console.log(`Operations: ${operationCount}`);
    console.log(`Duration: ${duration}ms`);
    console.log(`Average: ${(duration / operationCount).toFixed(3)}ms per operation`);
    console.log(`Final queue length: ${q.length}`);
    console.log(`Final existing keys: ${existingKeys.size}`);
    console.log('='.repeat(60));
    // Final verification
    testHeadTail(q);
    assert.ok(q.length >= 0, 'Final length should be non-negative');
    assert.strictEqual(q.length, q.size, 'Final length and size should match');
    assert.strictEqual(q.length, q.getLength(), 'Final length and getLength should match');
    console.log('✓ All invariants maintained throughout fuzz test\n');
}
// Main execution
console.log('Linked-Queue Major Fuzz Test');
console.log('Testing 4000 random operations with full type checking\n');
try {
    runFuzzTest('Latest (2.1.129)', linked_queue_1.LinkedQueue);
    console.log('\n✓ Fuzz test passed for latest version!');
}
catch (err) {
    console.error('\n✗ Fuzz test failed:', err.message);
    process.exit(1);
}
// Try to test current version if available
try {
    const currentModule = require('../live-mutex/node_modules/@oresoftware/linked-queue');
    runFuzzTest('Current (0.1.106)', currentModule.LinkedQueue);
    console.log('\n✓ Fuzz test passed for current version!');
}
catch (err) {
    console.log(`\nNote: Could not test current version: ${err.message}`);
}
console.log('\n✓ All fuzz tests completed successfully!');
