/**
 * Compare LinkedQueue versions:
 * - Current version used by live-mutex: 0.1.106
 * - Latest version: 2.1.129
 * 
 * This test identifies API differences and compatibility issues
 */

import * as path from 'path';
import * as fs from 'fs';

interface NotifyObj {
    ws: {
        writable: boolean;
    };
    uuid: string;
    pid: number;
    ttl: number;
    keepLocksAfterDeath?: boolean;
}

// Type definitions for LinkedQueue (current version 0.1.106)
interface LinkedQueueValue<T> {
    after?: LinkedQueueValue<T>;
    before?: LinkedQueueValue<T>;
    value: T;
    key: any;
}

interface LinkedQueueInterface<T, K = any> {
    length: number;
    constructor(): LinkedQueueInterface<T, K>;
    getLength(): number;
    getSize(): number;
    getRandomKey(): K;
    getRandomItem(): LinkedQueueValue<T> | null;
    remove(k: any): LinkedQueueValue<T>;
    contains(k: any): boolean;
    get(k: any): LinkedQueueValue<T>;
    peek(): LinkedQueueValue<T>;
    getOrderedList(): Array<LinkedQueueValue<T>>;
    forEach(fn: (val: LinkedQueueValue<T>, index: number) => void, ctx?: any): this;
    map<V>(fn: (val: LinkedQueueValue<T>, index: number) => V, ctx?: any): Array<V>;
    filter(fn: (val: LinkedQueueValue<T>, index: number) => boolean, ctx?: any): LinkedQueueValue<T>[];
    first(): LinkedQueueValue<T>;
    last(): LinkedQueueValue<T>;
    getReverseOrderedList(): Array<LinkedQueueValue<T>>;
    removeAll(): void;
    addToFront(k: any, obj?: any): void;
    enq(...args: Array<any>): void;
    deq(n: number): LinkedQueueValue<T>[];
    dequeue(): LinkedQueueValue<T>;
    enqueue(k: any, obj?: any): void;
    removeLast(): LinkedQueueValue<T>;
    clear(): any;
    unshift(k: any, obj?: any): void;
    push(k: any, obj?: any): void;
    add(k: any, obj?: any): void;
    shift(): LinkedQueueValue<T>;
    pop(): LinkedQueueValue<T>;
}

console.log('========================================');
console.log('LinkedQueue Version Comparison Test');
console.log('========================================\n');

// Test current version (0.1.106) from live-mutex node_modules
const currentVersionPath = path.join(__dirname, '../live-mutex/node_modules/@oresoftware/linked-queue');
const latestVersionPath = __dirname; // Current repo

let currentLinkedQueue: any;
let latestLinkedQueue: any;
let currentVersion: string = 'unknown';
let latestVersion: string = 'unknown';

// Try to load current version
try {
    const currentPkg = require(path.join(currentVersionPath, 'package.json'));
    currentVersion = currentPkg.version;
    currentLinkedQueue = require(path.join(currentVersionPath, 'dist/linked-queue.js'));
    console.log(`✅ Loaded current version: ${currentVersion}`);
} catch (err: any) {
    console.error(`❌ Could not load current version from ${currentVersionPath}:`, err.message);
    console.log('   This is expected if node_modules is not set up. We will test API compatibility instead.\n');
}

// Try to load latest version (from source)
try {
    // We'll need to test this differently since it's TypeScript
    const latestPkg = require(path.join(latestVersionPath, 'package.json'));
    latestVersion = latestPkg.version;
    console.log(`✅ Found latest version: ${latestVersion}`);
    console.log('   Note: Latest version is TypeScript and needs compilation\n');
} catch (err: any) {
    console.error(`❌ Could not load latest version:`, err.message);
}

console.log('========================================');
console.log('API Comparison');
console.log('========================================\n');

// Methods used in live-mutex broker code
const methodsUsedInLiveMutex: string[] = [
    'constructor',
    'length', // property
    'push',
    'unshift', 
    'remove',
    'dequeue',
    'get',
    'contains',
    'deq',
    'getLength'
];

// Check current version API
if (currentLinkedQueue && currentLinkedQueue.LinkedQueue) {
    const CurrentQueue: any = currentLinkedQueue.LinkedQueue;
    console.log('Current Version (0.1.106) API:');
    console.log('----------------------------------------');
    
    const currentPrototype = CurrentQueue.prototype as any;
    const currentMethods = Object.getOwnPropertyNames(currentPrototype)
        .filter((name: string) => name !== 'constructor' && typeof currentPrototype[name] === 'function');
    
    methodsUsedInLiveMutex.forEach(method => {
        if (method === 'length') {
            // Check if length is a property
            const testQ = new CurrentQueue();
            const hasLength = 'length' in testQ || testQ.hasOwnProperty('length') || 
                            Object.getOwnPropertyDescriptor(Object.getPrototypeOf(testQ), 'length');
            console.log(`  ${hasLength ? '✅' : '❌'} length (property)`);
        } else if (currentPrototype[method]) {
            console.log(`  ✅ ${method}()`);
        } else {
            console.log(`  ❌ ${method}() - MISSING!`);
        }
    });
    
    console.log('\nAll methods in current version:');
    currentMethods.forEach((m: string) => console.log(`    - ${m}()`));
}

console.log('\n========================================');
console.log('Testing Current Version (0.1.106)');
console.log('========================================\n');

if (currentLinkedQueue && currentLinkedQueue.LinkedQueue) {
    const {LinkedQueue} = currentLinkedQueue;
    const assert = require('assert');
    
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
        }
    }
    
    // Test 1: Basic operations
    test('Basic instantiation', () => {
        const q: any = new LinkedQueue();
        assert(q instanceof LinkedQueue);
        assert(typeof q.length === 'number');
    });
    
    // Test 2: push method (used in broker.ts)
    test('push method exists and works', () => {
        const q: any = new LinkedQueue();
        assert(typeof q.push === 'function', 'push should be a function');
        q.push('key1', {ws: {writable: true}, uuid: 'key1', pid: 1, ttl: 5000});
        assert(q.length === 1, 'length should be 1 after push');
    });
    
    // Test 3: unshift method (used in broker.ts)
    test('unshift method exists and works', () => {
        const q: any = new LinkedQueue();
        assert(typeof q.unshift === 'function', 'unshift should be a function');
        q.push('key1', {ws: {writable: true}, uuid: 'key1', pid: 1, ttl: 5000});
        q.unshift('key2', {ws: {writable: true}, uuid: 'key2', pid: 2, ttl: 5000});
        assert(q.length === 2, 'length should be 2');
        const first = q.first();
        assert(first && first.key === 'key2', 'unshift should add to front');
    });
    
    // Test 4: remove method
    test('remove method', () => {
        const q: any = new LinkedQueue();
        q.push('key1', {ws: {writable: true}, uuid: 'key1', pid: 1, ttl: 5000});
        q.push('key2', {ws: {writable: true}, uuid: 'key2', pid: 2, ttl: 5000});
        const removed = q.remove('key1');
        assert(removed, 'remove should return value');
        assert(q.length === 1, 'length should be 1 after remove');
        assert(!q.contains('key1'), 'key1 should not be in queue');
    });
    
    // Test 5: dequeue method
    test('dequeue method', () => {
        const q: any = new LinkedQueue();
        q.push('key1', {ws: {writable: true}, uuid: 'key1', pid: 1, ttl: 5000});
        q.push('key2', {ws: {writable: true}, uuid: 'key2', pid: 2, ttl: 5000});
        const dq = q.dequeue();
        assert(dq, 'dequeue should return value');
        assert(dq.key === 'key1', 'dequeue should return first item (FIFO)');
        assert(q.length === 1, 'length should be 1 after dequeue');
    });
    
    // Test 6: get method
    test('get method', () => {
        const q: any = new LinkedQueue();
        q.push('key1', {ws: {writable: true}, uuid: 'key1', pid: 1, ttl: 5000});
        const result = q.get('key1');
        assert(result, 'get should return value');
        assert(result.key === 'key1', 'get should return correct key');
    });
    
    // Test 7: contains method
    test('contains method', () => {
        const q: any = new LinkedQueue();
        assert(q.contains('key1') === false, 'contains should return false for empty queue');
        q.push('key1', {ws: {writable: true}, uuid: 'key1', pid: 1, ttl: 5000});
        assert(q.contains('key1') === true, 'contains should return true for existing key');
    });
    
    // Test 8: deq method
    test('deq method (dequeue multiple)', () => {
        const q: any = new LinkedQueue();
        q.push('key1', {ws: {writable: true}, uuid: 'key1', pid: 1, ttl: 5000});
        q.push('key2', {ws: {writable: true}, uuid: 'key2', pid: 2, ttl: 5000});
        q.push('key3', {ws: {writable: true}, uuid: 'key3', pid: 3, ttl: 5000});
        const dequeued = q.deq(2);
        assert(Array.isArray(dequeued), 'deq should return array');
        assert(dequeued.length === 2, 'deq(2) should return 2 items');
        assert(q.length === 1, 'queue should have 1 item remaining');
    });
    
    // Test 9: getLength method
    test('getLength method', () => {
        const q: any = new LinkedQueue();
        assert(q.getLength() === 0, 'getLength should return 0');
        q.push('key1', {ws: {writable: true}, uuid: 'key1', pid: 1, ttl: 5000});
        assert(q.getLength() === 1, 'getLength should return 1');
        assert(q.getLength() === q.length, 'getLength should equal length');
    });
    
    // Test 10: Live-mutex usage pattern
    test('Live-mutex usage pattern (ensureNewLockHolder)', () => {
        const q: any = new LinkedQueue();
        const notifyObjs: NotifyObj[] = [
            {ws: {writable: true}, uuid: 'uuid-1', pid: 123, ttl: 5000},
            {ws: {writable: false}, uuid: 'uuid-2', pid: 456, ttl: 5000},
            {ws: {writable: true}, uuid: 'uuid-3', pid: 789, ttl: 5000},
        ];
        
        notifyObjs.forEach(obj => {
            q.push(obj.uuid, obj);
        });
        
        assert(q.length === 3, 'should have 3 items');
        
        // Simulate dequeue loop from broker.ts ensureNewLockHolder
        let validWaiter: NotifyObj | null = null;
        let lqValue: LinkedQueueValue<NotifyObj> | undefined;
        while (lqValue = q.dequeue() as LinkedQueueValue<NotifyObj> | undefined) {
            const n = lqValue.value;
            if (n && n.ws && n.ws.writable) {
                validWaiter = n;
                break;
            }
        }
        
        assert(validWaiter !== null, 'should find valid waiter');
        assert(validWaiter.uuid === 'uuid-1', 'should find first valid waiter');
    });
    
    // Test 11: Type checking - ensure types work correctly
    test('Type checking - LinkedQueueValue structure', () => {
        const q: any = new LinkedQueue();
        q.push('test-uuid', {ws: {writable: true}, uuid: 'test-uuid', pid: 999, ttl: 5000});
        
        const value = q.get('test-uuid');
        assert(value !== null && value !== undefined, 'get should return value');
        
        // Type check: value should have LinkedQueueValue structure
        assert('key' in value, 'value should have key property');
        assert('value' in value, 'value should have value property');
        
        const notifyObj: NotifyObj = value.value;
        assert(notifyObj.uuid === 'test-uuid', 'value should be NotifyObj');
        assert(typeof notifyObj.pid === 'number', 'pid should be number');
        assert(typeof notifyObj.ttl === 'number', 'ttl should be number');
    });
    
    // Test 12: deq return type checking
    test('deq return type checking', () => {
        const q: any = new LinkedQueue();
        q.push('key1', {ws: {writable: true}, uuid: 'key1', pid: 1, ttl: 5000});
        q.push('key2', {ws: {writable: true}, uuid: 'key2', pid: 2, ttl: 5000});
        
        const dequeued: LinkedQueueValue<NotifyObj>[] = q.deq(2);
        assert(Array.isArray(dequeued), 'deq should return array');
        
        dequeued.forEach((lqv: LinkedQueueValue<NotifyObj>) => {
            assert('key' in lqv, 'LinkedQueueValue should have key');
            assert('value' in lqv, 'LinkedQueueValue should have value');
            assert(typeof lqv.value === 'object', 'value should be object');
        });
    });
    
    // Test 13: Major Fuzz Test - 4000 operations
    test('Major Fuzz Test - 4000 operations', () => {
        const q: any = new LinkedQueue();
        const operations = 4000;
        let nextKeyId = 1;
        const keyMap = new Map<string, NotifyObj>(); // Track what should be in queue
        const startTime = Date.now();
        
        // Operation types based on live-mutex usage patterns
        const operationTypes = [
            'push',      // Add to end (most common in live-mutex)
            'unshift',   // Add to front (used for retries/force)
            'dequeue',   // Remove from front
            'remove',    // Remove by key
            'get',       // Get by key
            'contains',  // Check if key exists
            'deq',       // Dequeue multiple
            'getLength', // Get length
        ];
        
        // Weighted probabilities (matching live-mutex usage patterns)
        const weights = {
            push: 30,      // Most common - adding lock requests
            unshift: 5,    // Less common - retries/force
            dequeue: 20,   // Common - processing lock requests
            remove: 15,    // Common - cleanup
            get: 10,       // Common - checking status
            contains: 10,  // Common - checking existence
            deq: 5,        // Less common - bulk dequeue
            getLength: 5,  // Less common - stats
        };
        
        // Build weighted operation array
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
                    case 'push': {
                        const key = `key-${nextKeyId++}`;
                        const value: NotifyObj = {
                            ws: {writable: Math.random() > 0.3},
                            uuid: key,
                            pid: Math.floor(Math.random() * 10000),
                            ttl: 5000 + Math.floor(Math.random() * 10000),
                            keepLocksAfterDeath: Math.random() > 0.5
                        };
                        q.push(key, value);
                        keyMap.set(key, value);
                        break;
                    }
                    
                    case 'unshift': {
                        if (q.length > 0) {
                            const key = `key-${nextKeyId++}`;
                            const value: NotifyObj = {
                                ws: {writable: Math.random() > 0.3},
                                uuid: key,
                                pid: Math.floor(Math.random() * 10000),
                                ttl: 5000 + Math.floor(Math.random() * 10000),
                            };
                            q.unshift(key, value);
                            keyMap.set(key, value);
                        }
                        break;
                    }
                    
                    case 'dequeue': {
                        if (q.length > 0) {
                            const dequeued = q.dequeue();
                            if (dequeued && dequeued.key) {
                                keyMap.delete(dequeued.key);
                            }
                        }
                        break;
                    }
                    
                    case 'remove': {
                        if (keyMap.size > 0) {
                            const keys = Array.from(keyMap.keys());
                            const keyToRemove = keys[Math.floor(Math.random() * keys.length)];
                            const removed = q.remove(keyToRemove);
                            if (removed) {
                                keyMap.delete(keyToRemove);
                            }
                        }
                        break;
                    }
                    
                    case 'get': {
                        if (keyMap.size > 0) {
                            const keys = Array.from(keyMap.keys());
                            const keyToGet = keys[Math.floor(Math.random() * keys.length)];
                            const result = q.get(keyToGet);
                            assert(result, 'get should return value for existing key');
                            assert(result.key === keyToGet, 'get should return correct key');
                        }
                        break;
                    }
                    
                    case 'contains': {
                        if (keyMap.size > 0) {
                            const keys = Array.from(keyMap.keys());
                            const keyToCheck = keys[Math.floor(Math.random() * keys.length)];
                            assert(q.contains(keyToCheck) === true, 'contains should return true for existing key');
                        }
                        // Also test non-existent key
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
                                if (item && item.key) {
                                    keyMap.delete(item.key);
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
                        assert(length === keyMap.size, 'getLength should match tracked size');
                        break;
                    }
                }
                
                // Validate queue state periodically
                if (i % 500 === 0) {
                    const expectedLength = keyMap.size;
                    const actualLength = q.length;
                    assert(actualLength === expectedLength, 
                        `Length mismatch at operation ${i}: expected ${expectedLength}, got ${actualLength}`);
                    
                    // Verify all tracked keys are in queue
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
        
        // Verify final state
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
    console.log('Current Version Test Summary');
    console.log('========================================');
    console.log(`Passed: ${testsPassed}`);
    console.log(`Failed: ${testsFailed}`);
    console.log('========================================\n');
}

console.log('\n========================================');
console.log('Upgrade Analysis');
console.log('========================================\n');

console.log('Key Findings:');
console.log('1. Current version (0.1.106) has: push, unshift, pop, shift methods');
console.log('2. Latest version (2.1.129) may have different API');
console.log('3. Need to check if latest version has these aliases\n');

console.log('Recommendations:');
console.log('- Test latest version to see if push/unshift exist');
console.log('- If not, live-mutex code needs to use enqueue/addToFront instead');
console.log('- Check for any breaking changes in return types\n');

console.log('Next Steps:');
console.log('1. Check latest version source for push/unshift methods');
console.log('2. If missing, update live-mutex broker code to use enqueue/addToFront');
console.log('3. Test with latest version to ensure compatibility\n');

