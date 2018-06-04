const {LinkedQueue} = require('../dist/linked-queue');

const l2 = new LinkedQueue();

const t = Date.now();

for (let i = 0; i < 50000; i++) {
  l2.addToFront({});
}

console.log('total time:', Date.now() - t);
