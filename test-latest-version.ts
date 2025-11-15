/**
 * Test Latest Version (2.1.129) of LinkedQueue
 * 
 * This test verifies the latest version API and checks for compatibility
 * with live-mutex usage patterns.
 */

import {LinkedQueue, LinkedQueueValue, IsVoid} from './src/linked-queue';
import * as assert from 'assert';

interface NotifyObj {
    ws: {
        writable: boolean;
    };
    uuid: string;
    pid: number;
    ttl: number;
    keepLocksAfterDeath?: boolean;
}

console.log('========================================');
console.log('LinkedQueue Latest Version Test (2.1.129)');
console.log('========================================\n');

let testsPassed = 0;
let testsFailed = 0;

function test(name: string, fn: () => void): void {
    try {
        fn();
        testsPassed++;
        console.log(`✅ ${name}`);
    } catch (err: any) {
        testsFailed++;
        console.error(`❌ ${name}:`, err.message);
        if (err.stack) {
            console.error(err.stack);
        }
    }
}

// Test 1: Basic instantiation
test('Basic instantiation', () => {
    const q = new LinkedQueue<NotifyObj>();
    assert(q instanceof LinkedQueue);
    assert(typeof q.length === 'number');
    assert(q.length === 0, 'New queue should have length 0');
});

// Test 2: enqueue method (replacement for push)
test('enqueue method (replacement for push)', () => {
    const q = new LinkedQueue<NotifyObj>();
    assert(typeof q.enqueue === 'function', 'enqueue should be a function');
    q.enqueue('key1', {ws: {writable: true}, uuid: 'key1', pid: 1, ttl: 5000});
    assert(q.length === 1, 'length should be 1 after enqueue');
});

// Test 3: Check if push exists (it shouldn't)
test('push method does NOT exist (breaking change)', () => {
    const q = new LinkedQueue<NotifyObj>();
    const qAny = q as any;
    assert(typeof qAny.push === 'undefined', 'push should NOT exist in latest version');
    console.log('   Note: push() is missing - use enqueue() instead');
});

// Test 4: addToFront method (replacement for unshift)
test('addToFront method (replacement for unshift)', () => {
    const q = new LinkedQueue<NotifyObj>();
    assert(typeof q.addToFront === 'function', 'addToFront should be a function');
    q.enqueue('key1', {ws: {writable: true}, uuid: 'key1', pid: 1, ttl: 5000});
    q.addToFront('key2', {ws: {writable: true}, uuid: 'key2', pid: 2, ttl: 5000});
    assert(q.length === 2, 'length should be 2');
    const first = q.first();
    assert(!IsVoid.check(first[0]), 'first should not be void');
    assert(first[0] === 'key2', 'addToFront should add to front');
});

// Test 5: Check if unshift exists (it shouldn't)
test('unshift method does NOT exist (breaking change)', () => {
    const q = new LinkedQueue<NotifyObj>();
    const qAny = q as any;
    assert(typeof qAny.unshift === 'undefined', 'unshift should NOT exist in latest version');
    console.log('   Note: unshift() is missing - use addToFront() instead');
});

// Test 6: remove method
test('remove method', () => {
    const q = new LinkedQueue<NotifyObj>();
    q.enqueue('key1', {ws: {writable: true}, uuid: 'key1', pid: 1, ttl: 5000});
    q.enqueue('key2', {ws: {writable: true}, uuid: 'key2', pid: 2, ttl: 5000});
    const removed = q.remove('key1');
    assert(!IsVoid.check(removed[0]), 'remove should return non-void result');
    assert(removed[0] === 'key1', 'remove should return correct key');
    assert(q.length === 1, 'length should be 1 after remove');
    assert(q.contains('key1') === false, 'key1 should not be in queue');
});

// Test 7: dequeue method (note: different return type)
test('dequeue method (returns [K, V] | [IsVoidVal])', () => {
    const q = new LinkedQueue<NotifyObj>();
    q.enqueue('key1', {ws: {writable: true}, uuid: 'key1', pid: 1, ttl: 5000});
    q.enqueue('key2', {ws: {writable: true}, uuid: 'key2', pid: 2, ttl: 5000});
    const dq = q.dequeue();
    assert(!IsVoid.check(dq[0]), 'dequeue should return non-void result');
    assert(dq[0] === 'key1', 'dequeue should return first item (FIFO)');
    assert(q.length === 1, 'length should be 1 after dequeue');
    
    // Test empty queue
    const dq2 = q.dequeue();
    const dq3 = q.dequeue();
    assert(IsVoid.check(dq3[0]), 'dequeue should return IsVoidVal for empty queue');
});

// Test 8: get method (note: different return type)
test('get method (returns [K, V] | [IsVoidVal])', () => {
    const q = new LinkedQueue<NotifyObj>();
    q.enqueue('key1', {ws: {writable: true}, uuid: 'key1', pid: 1, ttl: 5000});
    const result = q.get('key1');
    assert(!IsVoid.check(result[0]), 'get should return non-void result');
    assert(result[0] === 'key1', 'get should return correct key');
    assert(result[1].uuid === 'key1', 'get should return correct value');
    
    // Test non-existent key
    const notFound = q.get('non-existent');
    assert(IsVoid.check(notFound[0]), 'get should return IsVoidVal for non-existent key');
});

// Test 9: contains method
test('contains method', () => {
    const q = new LinkedQueue<NotifyObj>();
    assert(q.contains('key1') === false, 'contains should return false for empty queue');
    q.enqueue('key1', {ws: {writable: true}, uuid: 'key1', pid: 1, ttl: 5000});
    assert(q.contains('key1') === true, 'contains should return true for existing key');
});

// Test 10: deq method (dequeue multiple)
test('deq method (dequeue multiple)', () => {
    const q = new LinkedQueue<NotifyObj>();
    q.enqueue('key1', {ws: {writable: true}, uuid: 'key1', pid: 1, ttl: 5000});
    q.enqueue('key2', {ws: {writable: true}, uuid: 'key2', pid: 2, ttl: 5000});
    q.enqueue('key3', {ws: {writable: true}, uuid: 'key3', pid: 3, ttl: 5000});
    const dequeued = q.deq(2);
    assert(Array.isArray(dequeued), 'deq should return array');
    assert(dequeued.length === 2, 'deq(2) should return 2 items');
    assert(q.length === 1, 'queue should have 1 item remaining');
    
    // Note: deq returns array of [K, V] tuples (from dequeue), not LinkedQueueValue
    // This is because deq internally calls dequeue() which returns [K, V] | [IsVoidVal]
    dequeued.forEach((item: any) => {
        assert(Array.isArray(item), 'deq items should be arrays (tuples)');
        assert(item.length >= 1, 'deq items should have at least one element');
        if (!IsVoid.check(item[0])) {
            assert(typeof item[0] === 'string', 'First element should be key (string)');
            assert(typeof item[1] === 'object', 'Second element should be value (object)');
        }
    });
});

// Test 11: getLength method
test('getLength method', () => {
    const q = new LinkedQueue<NotifyObj>();
    assert(q.getLength() === 0, 'getLength should return 0');
    q.enqueue('key1', {ws: {writable: true}, uuid: 'key1', pid: 1, ttl: 5000});
    assert(q.getLength() === 1, 'getLength should return 1');
    assert(q.getLength() === q.length, 'getLength should equal length property');
});

// Test 12: Live-mutex usage pattern (with enqueue/addToFront)
test('Live-mutex usage pattern (ensureNewLockHolder) - adapted for latest version', () => {
    const q = new LinkedQueue<NotifyObj>();
    const notifyObjs: NotifyObj[] = [
        {ws: {writable: true}, uuid: 'uuid-1', pid: 123, ttl: 5000},
        {ws: {writable: false}, uuid: 'uuid-2', pid: 456, ttl: 5000},
        {ws: {writable: true}, uuid: 'uuid-3', pid: 789, ttl: 5000},
    ];
    
    // Use enqueue instead of push
    notifyObjs.forEach(obj => {
        q.enqueue(obj.uuid, obj);
    });
    
    assert(q.length === 3, 'should have 3 items');
    
    // Simulate dequeue loop - note different return type
    let validWaiter: NotifyObj | null = null;
    let dqResult: [string, NotifyObj] | [typeof IsVoid] | undefined;
    
    while (dqResult = q.dequeue() as any) {
        if (IsVoid.check(dqResult[0])) {
            break;
        }
        const [key, n] = dqResult as [string, NotifyObj];
        if (n && n.ws && n.ws.writable) {
            validWaiter = n;
            break;
        }
    }
    
    assert(validWaiter !== null, 'should find valid waiter');
    assert(validWaiter.uuid === 'uuid-1', 'should find first valid waiter');
});

// Test 13: Major Fuzz Test - 4000 operations (latest version)
test('Major Fuzz Test - 4000 operations (latest version)', () => {
    const q = new LinkedQueue<NotifyObj>();
    const operations = 4000;
    let nextKeyId = 1;
    const keyMap = new Map<string, NotifyObj>();
    const startTime = Date.now();
    
    // Operation types for latest version (using enqueue/addToFront instead of push/unshift)
    const operationTypes = [
        'enqueue',    // Add to end (replacement for push)
        'addToFront', // Add to front (replacement for unshift)
        'dequeue',    // Remove from front
        'remove',     // Remove by key
        'get',        // Get by key
        'contains',   // Check if key exists
        'deq',        // Dequeue multiple
        'getLength',  // Get length
    ];
    
    // Weighted probabilities
    const weights = {
        enqueue: 30,
        addToFront: 5,
        dequeue: 20,
        remove: 15,
        get: 10,
        contains: 10,
        deq: 5,
        getLength: 5,
    };
    
    const weightedOps: string[] = [];
    Object.entries(weights).forEach(([op, weight]) => {
        for (let i = 0; i < weight; i++) {
            weightedOps.push(op);
        }
    });
    
    let operationCounts: {[key: string]: number} = {};
    operationTypes.forEach(op => operationCounts[op] = 0);
    
    for (let i = 0; i < operations; i++) {
        const op = weightedOps[Math.floor(Math.random() * weightedOps.length)];
        operationCounts[op]++;
        
        try {
            switch (op) {
                case 'enqueue': {
                    const key = `key-${nextKeyId++}`;
                    const value: NotifyObj = {
                        ws: {writable: Math.random() > 0.3},
                        uuid: key,
                        pid: Math.floor(Math.random() * 10000),
                        ttl: 5000 + Math.floor(Math.random() * 10000),
                        keepLocksAfterDeath: Math.random() > 0.5
                    };
                    q.enqueue(key, value);
                    keyMap.set(key, value);
                    break;
                }
                
                case 'addToFront': {
                    if (q.length > 0) {
                        const key = `key-${nextKeyId++}`;
                        const value: NotifyObj = {
                            ws: {writable: Math.random() > 0.3},
                            uuid: key,
                            pid: Math.floor(Math.random() * 10000),
                            ttl: 5000 + Math.floor(Math.random() * 10000),
                        };
                        q.addToFront(key, value);
                        keyMap.set(key, value);
                    }
                    break;
                }
                
                case 'dequeue': {
                    if (q.length > 0) {
                        const dequeued = q.dequeue();
                        if (!IsVoid.check(dequeued[0])) {
                            const [key] = dequeued as [string, NotifyObj];
                            keyMap.delete(key);
                        }
                    }
                    break;
                }
                
                case 'remove': {
                    if (keyMap.size > 0) {
                        const keys = Array.from(keyMap.keys());
                        const keyToRemove = keys[Math.floor(Math.random() * keys.length)];
                        const removed = q.remove(keyToRemove);
                        if (!IsVoid.check(removed[0])) {
                            keyMap.delete(keyToRemove);
                        }
                    }
                    break;
                }
                
                case 'get': {
                    if (keyMap.size > 0 && q.length > 0) {
                        const keys = Array.from(keyMap.keys());
                        const keyToGet = keys[Math.floor(Math.random() * keys.length)];
                        // Only test if key is actually in queue (might have been removed)
                        if (q.contains(keyToGet)) {
                            const result = q.get(keyToGet);
                            assert(!IsVoid.check(result[0]), 'get should return value for existing key');
                            assert(result[0] === keyToGet, 'get should return correct key');
                        }
                    }
                    break;
                }
                
                case 'contains': {
                    if (keyMap.size > 0) {
                        const keys = Array.from(keyMap.keys());
                        const keyToCheck = keys[Math.floor(Math.random() * keys.length)];
                        assert(q.contains(keyToCheck) === true, 'contains should return true for existing key');
                    }
                    const nonExistent = `key-nonexistent-${Date.now()}`;
                    assert(q.contains(nonExistent) === false, 'contains should return false for non-existent key');
                    break;
                }
                
                case 'deq': {
                    if (q.length > 0) {
                        const count = Math.min(Math.floor(Math.random() * 5) + 1, q.length);
                        const dequeued = q.deq(count);
                        assert(Array.isArray(dequeued), 'deq should return array');
                        assert(dequeued.length <= count, 'deq should return at most count items');
                        dequeued.forEach((item: any) => {
                            // deq returns [K, V] tuples from dequeue()
                            if (Array.isArray(item) && !IsVoid.check(item[0])) {
                                const [key] = item as [string, NotifyObj];
                                keyMap.delete(key);
                            }
                        });
                    }
                    break;
                }
                
                case 'getLength': {
                    const length = q.getLength();
                    assert(typeof length === 'number', 'getLength should return number');
                    assert(length >= 0, 'getLength should be non-negative');
                    assert(length === q.length, 'getLength should equal length property');
                    // Note: keyMap.size might not match if operations are in progress
                    // We validate this periodically instead
                    break;
                }
            }
            
            // Validate queue state periodically
            if (i % 500 === 0) {
                const expectedLength = keyMap.size;
                const actualLength = q.length;
                assert(actualLength === expectedLength, 
                    `Length mismatch at operation ${i}: expected ${expectedLength}, got ${actualLength}`);
                
                for (const key of keyMap.keys()) {
                    assert(q.contains(key), `Tracked key ${key} should be in queue at operation ${i}`);
                }
            }
            
        } catch (err: any) {
            throw new Error(`Operation ${i} (${op}) failed: ${err.message}`);
        }
    }
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Final validation
    const finalLength = q.length;
    const finalTrackedSize = keyMap.size;
    assert(finalLength === finalTrackedSize, 
        `Final length mismatch: expected ${finalTrackedSize}, got ${finalLength}`);
    
    for (const key of keyMap.keys()) {
        assert(q.contains(key), `Final state: tracked key ${key} should be in queue`);
    }
    
    console.log(`   Completed ${operations} operations in ${duration}ms`);
    console.log(`   Final queue length: ${finalLength}`);
    console.log(`   Operations breakdown:`);
    Object.entries(operationCounts).forEach(([op, count]) => {
        const percentage = ((count / operations) * 100).toFixed(1);
        console.log(`     ${op}: ${count} (${percentage}%)`);
    });
    console.log(`   Average time per operation: ${(duration / operations).toFixed(3)}ms`);
});

console.log('\n========================================');
console.log('Latest Version Test Summary');
console.log('========================================');
console.log(`Passed: ${testsPassed}`);
console.log(`Failed: ${testsFailed}`);
console.log('========================================\n');

if (testsFailed === 0) {
    console.log('✅ All tests passed for latest version (2.1.129)!');
    console.log('\n⚠️  Breaking Changes Detected:');
    console.log('   - push() method removed (use enqueue() instead)');
    console.log('   - unshift() method removed (use addToFront() instead)');
    console.log('   - dequeue() return type changed to [K, V] | [IsVoidVal]');
    console.log('   - get() return type changed to [K, V] | [IsVoidVal]');
    process.exit(0);
} else {
    console.error(`❌ ${testsFailed} test(s) failed!`);
    process.exit(1);
}

