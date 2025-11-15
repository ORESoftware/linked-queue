# Development Cycle Instructions

This document outlines the standard development workflow for `@oresoftware/linked-queue`.

## Standard Development Workflow

### 1. Pre-Development Setup

```bash
# Install dependencies
npm install

# Compile TypeScript
npx tsc
# Or if npm run build is configured:
npm run build
```

### 2. Make Changes

Edit files in `src/` directory:
- `src/linked-queue.ts` - Main queue implementation
- `src/iterator.ts` - Iterator utilities
- `src/example.ts` - Example usage

### 3. Compile Changes

After making changes to TypeScript files:

```bash
npx tsc
```

Or use watch mode for automatic recompilation:

```bash
npx tsc --watch
```

Or if `npm run build` is configured:

```bash
npm run build
```

### 4. Run Tests

Test your changes:

```bash
npm test
```

This runs all tests in `test/src/` using Suman.

### 5. Verify Tests Pass

Ensure all tests pass:
- 11 JavaScript test files should pass
- TypeScript test files may show execution warnings (expected)

### 6. Stage and Commit Changes

```bash
# Stage all changes
git add -A

# Commit with descriptive message
git commit -m "Description of changes"
```

### 7. Push to Remote

```bash
git push
```

## Complete Development Cycle

Here's the complete cycle in one flow:

```bash
# 1. Install/update dependencies
npm install

# 2. Compile TypeScript
npx tsc
# Or: npm run build

# 3. Run tests
npm test

# 4. If tests pass, commit
git add -A
git commit -m "Your commit message"
git push
```

## Full Cycle Checklist

- [ ] Make code changes in `src/`
- [ ] Run `npx tsc` or `npm run build` to compile
- [ ] Run `npm test` to verify tests pass
- [ ] Run `npm install --save-dev .` to update local package (if needed)
- [ ] Test both CommonJS and ESM imports work (if ESM is configured)
- [ ] Commit changes
- [ ] Push to remote

## Testing Workflow

### Run All Tests

```bash
npm test
```

### Run Specific Test File

```bash
npx suman test/src/basic-queue.test.js
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

### Test Results

Expected results:
- ✅ 11 JavaScript tests passing
- ⚠️ 3 TypeScript files (source files, not executable)

## Module Support

This package supports:
- **CommonJS**: `require('@oresoftware/linked-queue')`
- **ES Modules**: `import {LinkedQueue} from '@oresoftware/linked-queue'` (if ESM build is configured)

The `exports` field in `package.json` automatically selects the correct format (if configured).

## Code Quality Checks

### Type Checking

TypeScript compiler performs type checking during compilation:

```bash
npx tsc --noEmit
```

This checks types without generating output files.

### Linting

Check for linting errors (if configured):

```bash
# Check if linter is configured
npm run lint  # if available
```

## Build Process

### Production Build

1. Clean previous build:
   ```bash
   rm -rf dist/
   ```

2. Compile:
   ```bash
   npx tsc
   # Or: npm run build
   ```

3. Verify output:
   ```bash
   ls -la dist/
   ```

### Development Build

Use watch mode for continuous compilation:

```bash
npx tsc --watch
```

## Version Management

### Update Version

Edit `package.json`:

```json
{
  "version": "2.1.130"  // increment version
}
```

### Tag Release

After committing version bump:

```bash
git tag v2.1.130
git push --tags
```

## Troubleshooting

### Tests Failing

1. Check compilation errors:
   ```bash
   npx tsc
   ```

2. Verify test files are in `test/src/`
3. Check import paths in test files
4. Ensure `npm run build` completed successfully (if configured)
5. Run `npm install --save-dev .` to update local package
6. Check that both `dist/` and `dist/esm/` directories exist (if ESM is configured)

### Compilation Errors

1. Check `tsconfig.json` configuration (and `tsconfig.esm.json` if ESM is configured)
2. Verify all dependencies are installed: `npm install`
3. Check TypeScript version compatibility
4. Run `npx tsc --noEmit` to check for type errors

### Import Errors

1. Ensure `dist/` directory exists and contains compiled files
2. Verify `package.json` main/types fields point to correct files
3. Check import paths in consuming code
4. Verify `package.json` has correct `exports` field (if ESM is configured)
5. Check `main`, `module`, and `types` fields are set correctly
6. Ensure `files` field includes `dist` directory

### Module Resolution Issues

1. Verify `package.json` has correct `exports` field (if ESM is configured)
2. Check `main`, `module`, and `types` fields are set correctly
3. Ensure `files` field includes `dist` directory

## Best Practices

1. **Always compile before committing**: Run `npx tsc` to ensure no compilation errors
2. **Run tests before pushing**: Ensure `npm test` passes
3. **Write descriptive commit messages**: Explain what and why
4. **Keep tests updated**: Update tests when adding new features
5. **Follow TypeScript best practices**: Use proper types, avoid `any` where possible

## Quick Reference

| Task | Command |
|------|---------|
| Install dependencies | `npm install` |
| Compile TypeScript | `npx tsc` |
| Watch mode | `npx tsc --watch` |
| Run tests | `npm test` |
| Stage changes | `git add -A` |
| Commit | `git commit -m "message"` |
| Push | `git push` |

## Continuous Integration

The project may use CI/CD. Common checks:
- TypeScript compilation
- Test execution
- Code quality checks

Ensure local development matches CI requirements.
