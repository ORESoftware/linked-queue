# Compilation Guide

## Building the Project

This project supports both CommonJS and ES Module formats.

### Prerequisites

- Node.js (v12 or higher)
- npm or yarn
- TypeScript (installed as dev dependency)

### Build Commands

```bash
# Install dependencies
npm install

# Build both CommonJS and ESM formats
npm run build

# This compiles:
# - CommonJS: dist/linked-queue.js
# - ESM: dist/esm/linked-queue.js
# - TypeScript definitions: dist/linked-queue.d.ts
```

### Build Process

The build process uses two TypeScript configurations:

1. **tsconfig.json** - Compiles to CommonJS in `dist/`
2. **tsconfig.esm.json** - Compiles to ES2020 modules in `dist/esm/`

### Output Files

- `dist/linked-queue.js` - CommonJS build
- `dist/esm/linked-queue.js` - ES Module build
- `dist/linked-queue.d.ts` - TypeScript definitions (shared)

### Testing the Build

```bash
# Test CommonJS
node -e "const {LinkedQueue} = require('@oresoftware/linked-queue'); console.log('CommonJS works!');"

# Test ESM
node --input-type=module -e "import {LinkedQueue} from '@oresoftware/linked-queue'; console.log('ESM works!');"
```

