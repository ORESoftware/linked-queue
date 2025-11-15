/**
 * Test LinkedQueue based on how it's used in live-mutex
 * 
 * This test file verifies that LinkedQueue works correctly with the usage patterns
 * found in live-mutex's broker code.
 * 
 * Methods used in live-mutex:
 * - new LinkedQueue()
 * - queue.length (property)
 * - queue.push(key, value)
 * - queue.unshift(key, value)
 * - queue.remove(key)
 * - queue.dequeue()
 * - queue.get(key)
 * - queue.contains(key)
 * - queue.deq(n)
 * - queue.getLength()
 */

const {LinkedQueue, LinkedQueueValue} = require('@oresoftware/linked-queue');
const assert = require('assert');

console.log('========================================');
console.log('LinkedQueue Test - Live-Mutex Usage Patterns');
console.log('========================================\n');

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
        if (err.stack) {
            console.error(err.stack);
        }
    }
}

// Test 1: Basic instantiation
test('Basic instantiation', () => {
    const queue = new LinkedQueue();
    assert(queue instanceof LinkedQueue, 'Queue should be instance of LinkedQueue');
    assert(queue.length === 0, 'New queue should have length 0');
    assert(queue.getLength() === 0, 'getLength() should return 0');
});

// Test 2: enqueue (push equivalent)
test('enqueue method', () => {
    const queue = new LinkedQueue();
    const uuid1 = 'uuid-1';
    const value1 = {ws: null, uuid: uuid1, pid: 123, ttl: 5000};
    
    queue.enqueue(uuid1, value1);
    assert(queue.length === 1, 'Queue should have length 1 after enqueue');
    assert(queue.getLength() === 1, 'getLength() should return 1');
});

// Test 3: Check if push is an alias (used in broker.ts)
test('push method (if exists)', () => {
    const queue = new LinkedQueue();
    const uuid1 = 'uuid-1';
    const value1 = {ws: null, uuid: uuid1, pid: 123, ttl: 5000};
    
    if (typeof queue.push === 'function') {
        queue.push(uuid1, value1);
        assert(queue.length === 1, 'Queue should have length 1 after push');
    } else {
        // If push doesn't exist, use enqueue (which is what should be used)
        queue.enqueue(uuid1, value1);
        assert(queue.length === 1, 'Queue should have length 1 after enqueue');
        console.log('   Note: push() method not found, using enqueue() instead');
    }
});

// Test 4: addToFront (unshift equivalent)
test('addToFront method', () => {
    const queue = new LinkedQueue();
    const uuid1 = 'uuid-1';
    const uuid2 = 'uuid-2';
    const value1 = {ws: null, uuid: uuid1, pid: 123, ttl: 5000};
    const value2 = {ws: null, uuid: uuid2, pid: 456, ttl: 5000};
    
    queue.enqueue(uuid1, value1);
    queue.addToFront(uuid2, value2);
    
    assert(queue.length === 2, 'Queue should have length 2');
    const first = queue.first();
    assert(!LinkedQueue.IsVoid(first[0]), 'First should not be void');
    assert(first[0] === uuid2, 'First item should be uuid2 (added to front)');
});

// Test 5: Check if unshift is an alias (used in broker.ts)
test('unshift method (if exists)', () => {
    const queue = new LinkedQueue();
    const uuid1 = 'uuid-1';
    const uuid2 = 'uuid-2';
    const value1 = {ws: null, uuid: uuid1, pid: 123, ttl: 5000};
    const value2 = {ws: null, uuid: uuid2, pid: 456, ttl: 5000};
    
    queue.enqueue(uuid1, value1);
    
    if (typeof queue.unshift === 'function') {
        queue.unshift(uuid2, value2);
        assert(queue.length === 2, 'Queue should have length 2 after unshift');
        const first = queue.first();
        assert(first[0] === uuid2, 'First item should be uuid2');
    } else {
        // If unshift doesn't exist, use addToFront
        queue.addToFront(uuid2, value2);
        assert(queue.length === 2, 'Queue should have length 2 after addToFront');
        console.log('   Note: unshift() method not found, using addToFront() instead');
    }
});

// Test 6: get method
test('get method', () => {
    const queue = new LinkedQueue();
    const uuid1 = 'uuid-1';
    const value1 = {ws: null, uuid: uuid1, pid: 123, ttl: 5000};
    
    queue.enqueue(uuid1, value1);
    const result = queue.get(uuid1);
    
    assert(!LinkedQueue.IsVoid(result[0]), 'get() should return non-void result');
    assert(result[0] === uuid1, 'get() should return correct key');
    assert(result[1].uuid === uuid1, 'get() should return correct value');
    
    const notFound = queue.get('non-existent');
    assert(LinkedQueue.IsVoid(notFound[0]), 'get() should return void for non-existent key');
});

// Test 7: contains method
test('contains method', () => {
    const queue = new LinkedQueue();
    const uuid1 = 'uuid-1';
    const value1 = {ws: null, uuid: uuid1, pid: 123, ttl: 5000};
    
    assert(queue.contains(uuid1) === false, 'contains() should return false for empty queue');
    
    queue.enqueue(uuid1, value1);
    assert(queue.contains(uuid1) === true, 'contains() should return true for existing key');
    assert(queue.contains('non-existent') === false, 'contains() should return false for non-existent key');
});

// Test 8: remove method
test('remove method', () => {
    const queue = new LinkedQueue();
    const uuid1 = 'uuid-1';
    const uuid2 = 'uuid-2';
    const value1 = {ws: null, uuid: uuid1, pid: 123, ttl: 5000};
    const value2 = {ws: null, uuid: uuid2, pid: 456, ttl: 5000};
    
    queue.enqueue(uuid1, value1);
    queue.enqueue(uuid2, value2);
    assert(queue.length === 2, 'Queue should have length 2');
    
    const removed = queue.remove(uuid1);
    assert(!LinkedQueue.IsVoid(removed[0]), 'remove() should return non-void result');
    assert(removed[0] === uuid1, 'remove() should return correct key');
    assert(queue.length === 1, 'Queue should have length 1 after remove');
    assert(queue.contains(uuid1) === false, 'Removed key should not be in queue');
    assert(queue.contains(uuid2) === true, 'Other key should still be in queue');
});

// Test 9: dequeue method
test('dequeue method', () => {
    const queue = new LinkedQueue();
    const uuid1 = 'uuid-1';
    const uuid2 = 'uuid-2';
    const value1 = {ws: null, uuid: uuid1, pid: 123, ttl: 5000};
    const value2 = {ws: null, uuid: uuid2, pid: 456, ttl: 5000};
    
    queue.enqueue(uuid1, value1);
    queue.enqueue(uuid2, value2);
    
    const dequeued = queue.dequeue();
    assert(!LinkedQueue.IsVoid(dequeued[0]), 'dequeue() should return non-void result');
    assert(dequeued[0] === uuid1, 'dequeue() should return first item (FIFO)');
    assert(queue.length === 1, 'Queue should have length 1 after dequeue');
    
    const dequeued2 = queue.dequeue();
    assert(!LinkedQueue.IsVoid(dequeued2[0]), 'Second dequeue() should return non-void result');
    assert(dequeued2[0] === uuid2, 'Second dequeue() should return second item');
    assert(queue.length === 0, 'Queue should be empty after all dequeues');
    
    const empty = queue.dequeue();
    assert(LinkedQueue.IsVoid(empty[0]), 'dequeue() should return void for empty queue');
});

// Test 10: deq method (dequeue multiple)
test('deq method (dequeue multiple)', () => {
    const queue = new LinkedQueue();
    const uuids = ['uuid-1', 'uuid-2', 'uuid-3', 'uuid-4', 'uuid-5'];
    
    uuids.forEach((uuid, i) => {
        queue.enqueue(uuid, {ws: null, uuid, pid: i, ttl: 5000});
    });
    
    assert(queue.length === 5, 'Queue should have length 5');
    
    const dequeued = queue.deq(3);
    assert(Array.isArray(dequeued), 'deq() should return an array');
    assert(dequeued.length === 3, 'deq(3) should return 3 items');
    assert(queue.length === 2, 'Queue should have length 2 after deq(3)');
    
    // Check that items are in FIFO order
    assert(dequeued[0].key === 'uuid-1', 'First item should be uuid-1');
    assert(dequeued[1].key === 'uuid-2', 'Second item should be uuid-2');
    assert(dequeued[2].key === 'uuid-3', 'Third item should be uuid-3');
});

// Test 11: length property
test('length property', () => {
    const queue = new LinkedQueue();
    assert(queue.length === 0, 'Initial length should be 0');
    
    queue.enqueue('uuid-1', {ws: null, uuid: 'uuid-1', pid: 123, ttl: 5000});
    assert(queue.length === 1, 'Length should be 1');
    
    queue.enqueue('uuid-2', {ws: null, uuid: 'uuid-2', pid: 456, ttl: 5000});
    assert(queue.length === 2, 'Length should be 2');
    
    queue.remove('uuid-1');
    assert(queue.length === 1, 'Length should be 1 after remove');
    
    queue.dequeue();
    assert(queue.length === 0, 'Length should be 0 after dequeue');
});

// Test 12: getLength method
test('getLength method', () => {
    const queue = new LinkedQueue();
    assert(queue.getLength() === 0, 'getLength() should return 0');
    
    queue.enqueue('uuid-1', {ws: null, uuid: 'uuid-1', pid: 123, ttl: 5000});
    assert(queue.getLength() === 1, 'getLength() should return 1');
    assert(queue.getLength() === queue.length, 'getLength() should equal length property');
});

// Test 13: Complex scenario - like ensureNewLockHolder
test('Complex scenario - ensureNewLockHolder pattern', () => {
    const queue = new LinkedQueue();
    const notifyObjs = [
        {ws: {writable: true}, uuid: 'uuid-1', pid: 123, ttl: 5000, keepLocksAfterDeath: false},
        {ws: {writable: true}, uuid: 'uuid-2', pid: 456, ttl: 5000, keepLocksAfterDeath: false},
        {ws: {writable: false}, uuid: 'uuid-3', pid: 789, ttl: 5000, keepLocksAfterDeath: false},
        {ws: {writable: true}, uuid: 'uuid-4', pid: 101, ttl: 5000, keepLocksAfterDeath: false},
    ];
    
    // Add all items
    notifyObjs.forEach(obj => {
        if (typeof queue.push === 'function') {
            queue.push(obj.uuid, obj);
        } else {
            queue.enqueue(obj.uuid, obj);
        }
    });
    
    assert(queue.length === 4, 'Queue should have 4 items');
    
    // Simulate the dequeue loop from ensureNewLockHolder
    let validWaiter = null;
    let lqValue;
    
    while (lqValue = queue.dequeue()) {
        const n = lqValue.value;
        if (n && n.ws && n.ws.writable) {
            validWaiter = n;
            break;
        }
    }
    
    assert(validWaiter !== null, 'Should find a valid waiter');
    assert(validWaiter.uuid === 'uuid-1', 'Should find first valid waiter');
    assert(queue.length === 3, 'Queue should have 3 items remaining');
    
    // Put it back if needed (like in broker code)
    if (typeof queue.push === 'function') {
        queue.push(validWaiter.uuid, validWaiter);
    } else {
        queue.enqueue(validWaiter.uuid, validWaiter);
    }
    assert(queue.length === 4, 'Queue should have 4 items after push back');
});

// Test 14: Multiple operations like in broker cleanup
test('Multiple operations - cleanup pattern', () => {
    const queue = new LinkedQueue();
    const uuids = ['uuid-1', 'uuid-2', 'uuid-3', 'uuid-4', 'uuid-5'];
    
    // Add items
    uuids.forEach((uuid, i) => {
        if (typeof queue.push === 'function') {
            queue.push(uuid, {ws: null, uuid, pid: i, ttl: 5000});
        } else {
            queue.enqueue(uuid, {ws: null, uuid, pid: i, ttl: 5000});
        }
    });
    
    assert(queue.length === 5, 'Queue should have 5 items');
    
    // Remove specific items (like cleanupConnection)
    queue.remove('uuid-2');
    queue.remove('uuid-4');
    
    assert(queue.length === 3, 'Queue should have 3 items after removes');
    assert(queue.contains('uuid-1') === true, 'uuid-1 should still be in queue');
    assert(queue.contains('uuid-2') === false, 'uuid-2 should not be in queue');
    assert(queue.contains('uuid-3') === true, 'uuid-3 should still be in queue');
    assert(queue.contains('uuid-4') === false, 'uuid-4 should not be in queue');
    assert(queue.contains('uuid-5') === true, 'uuid-5 should still be in queue');
});

// Test 15: deq with forEach (like in broker re-election)
test('deq with forEach pattern', () => {
    const queue = new LinkedQueue();
    const uuids = ['uuid-1', 'uuid-2', 'uuid-3', 'uuid-4', 'uuid-5'];
    
    uuids.forEach((uuid, i) => {
        queue.enqueue(uuid, {ws: null, uuid, pid: i, ttl: 5000});
    });
    
    // Simulate the deq(5).forEach pattern from broker
    const dequeued = queue.deq(5);
    let count = 0;
    
    dequeued.forEach(lqv => {
        assert(lqv.hasOwnProperty('key'), 'LinkedQueueValue should have key property');
        assert(lqv.hasOwnProperty('value'), 'LinkedQueueValue should have value property');
        assert(typeof lqv.value === 'object', 'Value should be an object');
        count++;
    });
    
    assert(count === 5, 'Should process 5 items');
    assert(queue.length === 0, 'Queue should be empty after deq(5)');
});

// Test 16: Edge case - empty queue operations
test('Edge case - empty queue operations', () => {
    const queue = new LinkedQueue();
    
    assert(queue.length === 0, 'Empty queue should have length 0');
    assert(queue.getLength() === 0, 'getLength() should return 0');
    
    const deqResult = queue.dequeue();
    assert(LinkedQueue.IsVoid(deqResult[0]), 'dequeue() on empty queue should return void');
    
    const deqMultiple = queue.deq(5);
    assert(Array.isArray(deqMultiple), 'deq() should return array');
    assert(deqMultiple.length === 0, 'deq() on empty queue should return empty array');
    
    const getResult = queue.get('non-existent');
    assert(LinkedQueue.IsVoid(getResult[0]), 'get() non-existent should return void');
    
    assert(queue.contains('non-existent') === false, 'contains() should return false');
    
    const removeResult = queue.remove('non-existent');
    assert(LinkedQueue.IsVoid(removeResult[0]), 'remove() non-existent should return void');
});

// Test 17: Order preservation
test('Order preservation - FIFO', () => {
    const queue = new LinkedQueue();
    const uuids = ['uuid-1', 'uuid-2', 'uuid-3'];
    
    uuids.forEach((uuid, i) => {
        queue.enqueue(uuid, {ws: null, uuid, pid: i, ttl: 5000});
    });
    
    // Dequeue should be in FIFO order
    const first = queue.dequeue();
    assert(first[0] === 'uuid-1', 'First dequeue should be uuid-1');
    
    const second = queue.dequeue();
    assert(second[0] === 'uuid-2', 'Second dequeue should be uuid-2');
    
    const third = queue.dequeue();
    assert(third[0] === 'uuid-3', 'Third dequeue should be uuid-3');
});

// Test 18: addToFront order
test('addToFront order preservation', () => {
    const queue = new LinkedQueue();
    
    queue.enqueue('uuid-1', {ws: null, uuid: 'uuid-1', pid: 1, ttl: 5000});
    queue.enqueue('uuid-2', {ws: null, uuid: 'uuid-2', pid: 2, ttl: 5000});
    queue.addToFront('uuid-3', {ws: null, uuid: 'uuid-3', pid: 3, ttl: 5000});
    
    // First should be uuid-3 (added to front)
    const first = queue.dequeue();
    assert(first[0] === 'uuid-3', 'First should be uuid-3 (added to front)');
    
    // Then uuid-1, uuid-2
    const second = queue.dequeue();
    assert(second[0] === 'uuid-1', 'Second should be uuid-1');
    
    const third = queue.dequeue();
    assert(third[0] === 'uuid-2', 'Third should be uuid-2');
});

// Test 19: Stress test - many operations
test('Stress test - many operations', () => {
    const queue = new LinkedQueue();
    const iterations = 1000;
    
    // Add many items
    for (let i = 0; i < iterations; i++) {
        const uuid = `uuid-${i}`;
        if (typeof queue.push === 'function') {
            queue.push(uuid, {ws: null, uuid, pid: i, ttl: 5000});
        } else {
            queue.enqueue(uuid, {ws: null, uuid, pid: i, ttl: 5000});
        }
    }
    
    assert(queue.length === iterations, `Queue should have ${iterations} items`);
    
    // Remove some
    for (let i = 0; i < iterations; i += 2) {
        queue.remove(`uuid-${i}`);
    }
    
    assert(queue.length === iterations / 2, 'Queue should have half items after removes');
    
    // Dequeue remaining
    let count = 0;
    while (!LinkedQueue.IsVoid(queue.dequeue()[0])) {
        count++;
    }
    
    assert(count === iterations / 2, 'Should dequeue all remaining items');
    assert(queue.length === 0, 'Queue should be empty');
});

console.log('\n========================================');
console.log('Test Summary');
console.log('========================================');
console.log(`Passed: ${testsPassed}`);
console.log(`Failed: ${testsFailed}`);
console.log(`Total: ${testsPassed + testsFailed}`);
console.log('========================================\n');

if (testsFailed === 0) {
    console.log('✅ All tests passed!');
    process.exit(0);
} else {
    console.error(`❌ ${testsFailed} test(s) failed!`);
    process.exit(1);
}

