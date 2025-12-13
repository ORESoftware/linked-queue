// Simple array performance test for comparison

const values = [];

const t = Date.now();

for (let i = 0; i < 20000; i++) {
  values.unshift({});
}

console.log('perf2.js - array unshift time:', Date.now() - t, 'ms');
