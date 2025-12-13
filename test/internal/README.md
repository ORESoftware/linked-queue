# Internal Tests for LinkedQueue

This folder contains tests that access the **truly private internal state** of LinkedQueue for deep verification of data structure integrity.

## Why These Tests Exist

The public API tests verify that LinkedQueue behaves correctly from an external perspective. But bugs can hide in internal state - for example:
- Dangling pointers after removals
- Lookup map getting out of sync with the linked list
- Head/tail pointers not being updated correctly
- Memory leaks from orphaned nodes

These internal tests catch such issues by directly inspecting the private `#head`, `#tail`, and `#lookup` fields.

## How Private Field Access Works

LinkedQueue v3.x uses **true JavaScript private fields** (`#` syntax), which are completely inaccessible from outside the class. To enable testing, the class provides:

```javascript
queue.__unsafeGetInternalsForTesting()
// Returns: { head, tail, lookup }
```

This method is intentionally named to discourage production use.

## Test Files

| File | Description | Operations |
|------|-------------|------------|
| `linked-list-integrity.js` | Unit tests for pointer correctness | 15 focused tests |
| `head-tail-fuzz.js` | Random operations with pointer verification | 1M ops |
| `lookup-consistency.js` | Verifies lookup Map stays in sync | 500K ops |

## Running the Tests

```bash
# All internal tests
npm run test:internal

# Individual tests
node test/internal/linked-list-integrity.js
node test/internal/head-tail-fuzz.js  
node test/internal/lookup-consistency.js
```

## What These Tests Verify

### Pointer Consistency
- `head.before` is always `null`
- `tail.after` is always `null`
- `node.after.before === node` (bidirectional links)
- Traversing from head to tail visits all nodes
- Traversing from tail to head visits all nodes in reverse

### Lookup Map Consistency
- Every node in the linked list has an entry in the lookup Map
- Every entry in the lookup Map points to a node in the linked list
- `lookup.size === length` always
- After removal, the key is not in the lookup Map

### Head/Tail Updates
- Single item: `head === tail`
- Empty queue: `head === null && tail === null`
- After dequeue: new `head.before === null`
- After pop: new `tail.after === null`

## Production Builds

If you want to strip the testing helper from production builds, you could:

1. Use a build-time flag to conditionally include it
2. Use a separate "production" vs "development" entry point
3. Trust that V8 will tree-shake unused methods

Currently, the method is included in all builds for simplicity.

