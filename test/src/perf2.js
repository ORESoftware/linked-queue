

const values = [];

const t = Date.now();

for (let i = 0; i < 20000; i++) {
  values.unshift({});
}

console.log('total time:', Date.now() - t);
