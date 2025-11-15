# Development Cycle Instructions

## Standard Development Workflow

### 1. Make Changes
Edit files in `src/` directory (TypeScript source files)

### 2. Compile
```bash
npm run build
```

### 3. Test
```bash
npm test
```

### 4. Commit
```bash
git add -A
git commit -m "Your commit message"
```

### 5. Push
```bash
git push
```

## Full Cycle Checklist

- [ ] Make code changes in `src/`
- [ ] Run `npm run build` to compile
- [ ] Run `npm test` to verify tests pass
- [ ] Run `npm install --save-dev .` to update local package
- [ ] Test both CommonJS and ESM imports work
- [ ] Commit changes
- [ ] Push to remote

## Testing

### Run All Tests
```bash
npm test
```

### Run Individual Test Files
```bash
node test/src/simple.js
node test/src/basic-queue.test.js
```

### Fuzz Tests
The fuzz tests run 1,000,000 iterations to stress test the queue:
- `test/src/basic-queue-fuzz.js`
- `test/src/linked-queue-fuzz.js`
- `test/src/queue-fuzz.js`

## Module Support

This package supports both:
- **CommonJS**: `require('@oresoftware/linked-queue')`
- **ES Modules**: `import {LinkedQueue} from '@oresoftware/linked-queue'`

The `exports` field in `package.json` automatically selects the correct format.

## Troubleshooting

### Tests Failing
1. Ensure `npm run build` completed successfully
2. Run `npm install --save-dev .` to update local package
3. Check that both `dist/` and `dist/esm/` directories exist

### TypeScript Errors
1. Check `tsconfig.json` and `tsconfig.esm.json` are valid
2. Ensure all dependencies are installed: `npm install`
3. Run `npx tsc --noEmit` to check for type errors

### Module Resolution Issues
1. Verify `package.json` has correct `exports` field
2. Check `main`, `module`, and `types` fields are set correctly
3. Ensure `files` field includes `dist` directory

