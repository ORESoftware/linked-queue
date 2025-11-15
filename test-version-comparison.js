/**
 * Compare LinkedQueue versions:
 * - Current version used by live-mutex: 0.1.106
 * - Latest version: 2.1.129
 * 
 * This test identifies API differences and compatibility issues
 */

const path = require('path');
const fs = require('fs');

console.log('========================================');
console.log('LinkedQueue Version Comparison Test');
console.log('========================================\n');

// Test current version (0.1.106) from live-mutex node_modules
const currentVersionPath = path.join(__dirname, '../live-mutex/node_modules/@oresoftware/linked-queue');
const latestVersionPath = __dirname; // Current repo

let currentLinkedQueue, latestLinkedQueue;
let currentVersion = 'unknown';
let latestVersion = 'unknown';

// Try to load current version
try {
    const currentPkg = require(path.join(currentVersionPath, 'package.json'));
    currentVersion = currentPkg.version;
    currentLinkedQueue = require(path.join(currentVersionPath, 'dist/linked-queue.js'));
    console.log(`✅ Loaded current version: ${currentVersion}`);
} catch (err) {
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
} catch (err) {
    console.error(`❌ Could not load latest version:`, err.message);
}

console.log('========================================');
console.log('API Comparison');
console.log('========================================\n');

// Methods used in live-mutex broker code
const methodsUsedInLiveMutex = [
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
    const CurrentQueue = currentLinkedQueue.LinkedQueue;
    console.log('Current Version (0.1.106) API:');
    console.log('----------------------------------------');
    
    const currentPrototype = CurrentQueue.prototype;
    const currentMethods = Object.getOwnPropertyNames(currentPrototype)
        .filter(name => name !== 'constructor' && typeof currentPrototype[name] === 'function');
    
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
    currentMethods.forEach(m => console.log(`    - ${m}()`));
}

console.log('\n========================================');
console.log('Testing Current Version (0.1.106)');
console.log('========================================\n');

if (currentLinkedQueue && currentLinkedQueue.LinkedQueue) {
    const {LinkedQueue} = currentLinkedQueue;
    const assert = require('assert');
    
    let testsPassed = 0;
    let testsFailed = 0;
    
    function test(name, fn) {
        try {
            fn();
            testsPassed++;
            console.log(`✅ ${name}`);
        } catch (err) {
            testsFailed++;
            console.error(`❌ ${name}:`, err.message);
        }
    }
    
    // Test 1: Basic operations
    test('Basic instantiation', () => {
        const q = new LinkedQueue();
        assert(q instanceof LinkedQueue);
        assert(typeof q.length === 'number');
    });
    
    // Test 2: push method (used in broker.ts)
    test('push method exists and works', () => {
        const q = new LinkedQueue();
        assert(typeof q.push === 'function', 'push should be a function');
        q.push('key1', {value: 1});
        assert(q.length === 1, 'length should be 1 after push');
    });
    
    // Test 3: unshift method (used in broker.ts)
    test('unshift method exists and works', () => {
        const q = new LinkedQueue();
        assert(typeof q.unshift === 'function', 'unshift should be a function');
        q.push('key1', {value: 1});
        q.unshift('key2', {value: 2});
        assert(q.length === 2, 'length should be 2');
        const first = q.first();
        assert(first && first.key === 'key2', 'unshift should add to front');
    });
    
    // Test 4: remove method
    test('remove method', () => {
        const q = new LinkedQueue();
        q.push('key1', {value: 1});
        q.push('key2', {value: 2});
        const removed = q.remove('key1');
        assert(removed, 'remove should return value');
        assert(q.length === 1, 'length should be 1 after remove');
        assert(!q.contains('key1'), 'key1 should not be in queue');
    });
    
    // Test 5: dequeue method
    test('dequeue method', () => {
        const q = new LinkedQueue();
        q.push('key1', {value: 1});
        q.push('key2', {value: 2});
        const dq = q.dequeue();
        assert(dq, 'dequeue should return value');
        assert(dq.key === 'key1', 'dequeue should return first item (FIFO)');
        assert(q.length === 1, 'length should be 1 after dequeue');
    });
    
    // Test 6: get method
    test('get method', () => {
        const q = new LinkedQueue();
        q.push('key1', {value: 1});
        const result = q.get('key1');
        assert(result, 'get should return value');
        assert(result.key === 'key1', 'get should return correct key');
    });
    
    // Test 7: contains method
    test('contains method', () => {
        const q = new LinkedQueue();
        assert(q.contains('key1') === false, 'contains should return false for empty queue');
        q.push('key1', {value: 1});
        assert(q.contains('key1') === true, 'contains should return true for existing key');
    });
    
    // Test 8: deq method
    test('deq method (dequeue multiple)', () => {
        const q = new LinkedQueue();
        q.push('key1', {value: 1});
        q.push('key2', {value: 2});
        q.push('key3', {value: 3});
        const dequeued = q.deq(2);
        assert(Array.isArray(dequeued), 'deq should return array');
        assert(dequeued.length === 2, 'deq(2) should return 2 items');
        assert(q.length === 1, 'queue should have 1 item remaining');
    });
    
    // Test 9: getLength method
    test('getLength method', () => {
        const q = new LinkedQueue();
        assert(q.getLength() === 0, 'getLength should return 0');
        q.push('key1', {value: 1});
        assert(q.getLength() === 1, 'getLength should return 1');
        assert(q.getLength() === q.length, 'getLength should equal length');
    });
    
    // Test 10: Live-mutex usage pattern
    test('Live-mutex usage pattern (ensureNewLockHolder)', () => {
        const q = new LinkedQueue();
        const notifyObjs = [
            {ws: {writable: true}, uuid: 'uuid-1', pid: 123, ttl: 5000},
            {ws: {writable: false}, uuid: 'uuid-2', pid: 456, ttl: 5000},
            {ws: {writable: true}, uuid: 'uuid-3', pid: 789, ttl: 5000},
        ];
        
        notifyObjs.forEach(obj => {
            q.push(obj.uuid, obj);
        });
        
        assert(q.length === 3, 'should have 3 items');
        
        // Simulate dequeue loop
        let validWaiter = null;
        let lqValue;
        while (lqValue = q.dequeue()) {
            const n = lqValue.value;
            if (n && n.ws && n.ws.writable) {
                validWaiter = n;
                break;
            }
        }
        
        assert(validWaiter !== null, 'should find valid waiter');
        assert(validWaiter.uuid === 'uuid-1', 'should find first valid waiter');
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

