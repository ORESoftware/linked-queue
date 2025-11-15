# LinkedQueue Version Comparison & Upgrade Analysis

## Summary

**Current Version Used by live-mutex:** 0.1.106  
**Latest Version Available:** 2.1.129  
**Status:** ⚠️ **Breaking Changes Detected**

## Test Results

✅ **All 12 tests passed** for current version (0.1.106)

### Current Version (0.1.106) - API Methods Used by live-mutex

All methods used in live-mutex broker code are present and working:

- ✅ `constructor()` - Works
- ✅ `length` (property) - Works
- ✅ `push(key, value)` - **Present and working**
- ✅ `unshift(key, value)` - **Present and working**
- ✅ `remove(key)` - Works
- ✅ `dequeue()` - Works
- ✅ `get(key)` - Works
- ✅ `contains(key)` - Works
- ✅ `deq(n)` - Works
- ✅ `getLength()` - Works

## Breaking Changes in Latest Version (2.1.129)

### ❌ Missing Methods

The latest version (2.1.129) **does NOT have** these methods that live-mutex uses:

- ❌ `push()` - **MISSING** (use `enqueue()` instead)
- ❌ `unshift()` - **MISSING** (use `addToFront()` instead)
- ❌ `pop()` - **MISSING**
- ❌ `shift()` - **MISSING**
- ❌ `clear()` - **MISSING** (use `removeAll()` instead)

### ✅ Available Alternatives

The latest version has these equivalent methods:

- `enqueue(key, value)` - Equivalent to `push(key, value)`
- `addToFront(key, value)` - Equivalent to `unshift(key, value)`
- `removeLast()` - Similar to `pop()` but returns `[K, V] | [IsVoidVal]`
- `dequeue()` - Similar to `shift()` but returns `[K, V] | [IsVoidVal]`
- `removeAll()` - Equivalent to `clear()`

## Upgrade Path

If upgrading from 0.1.106 to 2.1.129, the following changes are required in live-mutex:

### Files to Update

1. **src/broker.ts**
2. **src/broker-1.ts**
3. **src/broker-old.ts**

### Required Code Changes

#### Change 1: Replace `push()` with `enqueue()`

**Before:**
```typescript
lck.notify.push(uuid, {ws, uuid, pid, ttl, keepLocksAfterDeath});
```

**After:**
```typescript
lck.notify.enqueue(uuid, {ws, uuid, pid, ttl, keepLocksAfterDeath});
```

**Locations:**
- `src/broker.ts`: Lines 1120, 1217, 1379
- `src/broker-1.ts`: Lines 1116, 1340

#### Change 2: Replace `unshift()` with `addToFront()`

**Before:**
```typescript
lck.notify.unshift(uuid, {ws, uuid, pid, ttl, keepLocksAfterDeath});
```

**After:**
```typescript
lck.notify.addToFront(uuid, {ws, uuid, pid, ttl, keepLocksAfterDeath});
```

**Locations:**
- `src/broker.ts`: Lines 1366, 1376
- `src/broker-1.ts`: Lines 1327, 1337

### Return Type Changes

The latest version may have different return types for some methods:

- `dequeue()` returns `[K, V] | [typeof IsVoidVal]` instead of `LinkedQueueValue<T>`
- Need to check `IsVoid` utility: `LinkedQueue.IsVoid(value[0])`

## Recommendations

### Option 1: Stay on Current Version (Recommended for now)

✅ **Pros:**
- No code changes required
- All tests passing
- Stable and working

❌ **Cons:**
- Missing latest features/bug fixes
- May have security vulnerabilities (check npm audit)

### Option 2: Upgrade to Latest Version

✅ **Pros:**
- Latest features and bug fixes
- Better TypeScript support
- More modern codebase

❌ **Cons:**
- Requires code changes in 3 broker files
- Need to test thoroughly
- Return type changes may require additional updates

### Option 3: Request Feature Addition

If the maintainer is open to it, request adding `push()` and `unshift()` as aliases to maintain backward compatibility.

## Testing Checklist (if upgrading)

- [ ] Update all `push()` calls to `enqueue()`
- [ ] Update all `unshift()` calls to `addToFront()`
- [ ] Test `dequeue()` return type handling
- [ ] Test `deq()` return type handling
- [ ] Run all live-mutex tests
- [ ] Test semaphore functionality
- [ ] Test lock/unlock operations
- [ ] Test concurrent access patterns

## Files Modified in live-mutex (if upgrading)

1. `src/broker.ts` - ~5 changes
2. `src/broker-1.ts` - ~4 changes
3. `src/broker-old.ts` - Check if still used

## Conclusion

The current version (0.1.106) is **working correctly** and all tests pass. The latest version (2.1.129) has breaking changes that require code modifications. 

**Recommendation:** Stay on 0.1.106 unless there are specific features or bug fixes in 2.1.129 that are needed. If upgrading, follow the migration path above and test thoroughly.

