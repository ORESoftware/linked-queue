# Compilation Guide

This guide explains how to compile the TypeScript source code for `@oresoftware/linked-queue`.

## Building the Project

This project supports both CommonJS and ES Module formats.

### Prerequisites

- Node.js (v12 or higher)
- npm or yarn
- TypeScript (installed as dev dependency)

### Installation

```bash
npm install
```

This will install all dependencies including:
- TypeScript (`typescript@^5.9.3`)
- Type definitions (`@types/node@^12.6.1`)
- Development dependencies (suman, uuid)

### Build Commands

```bash
# Install dependencies
npm install

# Build both CommonJS and ESM formats (if npm run build is configured)
npm run build

# Or compile directly with TypeScript
npx tsc
```

### Build Process

The build process uses TypeScript configuration:

- **tsconfig.json** - Compiles to CommonJS in `dist/`
- If ESM support is needed, a separate `tsconfig.esm.json` can compile to ES2020 modules in `dist/esm/`

### Basic Compilation

Compile TypeScript source files to JavaScript:

```bash
npx tsc
```

This will:
- Read `tsconfig.json` configuration
- Compile all `.ts` files from `src/` directory
- Output compiled `.js` and `.d.ts` files to `dist/` directory
- Generate type declarations for TypeScript consumers

### Compilation Details

- **Source Directory**: `src/`
- **Output Directory**: `dist/`
- **Target**: ES2020
- **Module System**: CommonJS
- **Type Declarations**: Enabled (`.d.ts` files generated)

### Output Files

After compilation, you'll find in `dist/`:
- `linked-queue.js` - Main compiled JavaScript file (CommonJS)
- `linked-queue.d.ts` - TypeScript type definitions
- `example.js` - Example file
- `example.d.ts` - Example type definitions
- `iterator.js` - Iterator implementation
- `iterator.d.ts` - Iterator type definitions

If ESM build is configured:
- `dist/esm/linked-queue.js` - ES Module build

### Testing the Build

```bash
# Test CommonJS
node -e "const {LinkedQueue} = require('@oresoftware/linked-queue'); console.log('CommonJS works!');"

# Test ESM (if ESM build exists)
node --input-type=module -e "import {LinkedQueue} from '@oresoftware/linked-queue'; console.log('ESM works!');"
```

## TypeScript Configuration

The project uses `tsconfig.json` with the following key settings:

- **Target**: ES2020
- **Module**: CommonJS
- **Strict Mode**: Enabled (`noImplicitAny: true`)
- **Declaration**: Enabled (generates `.d.ts` files)
- **Root Directory**: `src/`
- **Output Directory**: `dist/`

## Verification

After compilation, verify the output:

```bash
ls -la dist/
```

You should see:
- Compiled JavaScript files (`.js`)
- Type declaration files (`.d.ts`)

## Continuous Compilation

For development, you can use TypeScript's watch mode:

```bash
npx tsc --watch
```

This will automatically recompile when source files change.

## Troubleshooting

### Common Issues

1. **Module not found errors**: Run `npm install` to ensure all dependencies are installed
2. **Type errors**: Check `tsconfig.json` settings and ensure source files are in `src/`
3. **Output directory issues**: Ensure `dist/` directory exists or is writable

### Clean Build

To start fresh:

```bash
rm -rf dist/
npx tsc
```

## Integration with Package.json

The compiled output is referenced in `package.json`:

```json
{
  "main": "dist/linked-queue.js",
  "types": "dist/linked-queue.d.ts",
  "typings": "dist/linked-queue.d.ts"
}
```

This allows the package to be imported as:

```javascript
const {LinkedQueue} = require('@oresoftware/linked-queue');
```

Or in TypeScript:

```typescript
import {LinkedQueue} from '@oresoftware/linked-queue';
```
