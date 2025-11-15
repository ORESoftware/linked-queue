# Development Cycle Instructions

This document outlines the standard development workflow for `@oresoftware/linked-queue`.

## Development Workflow

### 1. Pre-Development Setup

```bash
# Install dependencies
npm install

# Compile TypeScript
npx tsc
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

# 3. Run tests
npm test

# 4. If tests pass, commit
git add -A
git commit -m "Your commit message"
git push
```

## Testing Workflow

### Run All Tests

```bash
npm test
```

### Run Specific Test File

```bash
npx suman test/src/basic-queue.test.js
```

### Test Results

Expected results:
- ✅ 11 JavaScript tests passing
- ⚠️ 3 TypeScript files (source files, not executable)

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

### Compilation Errors

1. Check `tsconfig.json` configuration
2. Verify all dependencies are installed: `npm install`
3. Check TypeScript version compatibility

### Import Errors

1. Ensure `dist/` directory exists and contains compiled files
2. Verify `package.json` main/types fields point to correct files
3. Check import paths in consuming code

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

