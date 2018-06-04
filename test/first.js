const {LinkedQueue} = require('./linked-queue');
const l2 = new LinkedQueue();

l2.enq('222');
l2.enq('222');

console.log(l2.getLength());

let v = l2.tail;
let before = null;

while (v) {
  console.log(v.key);
  before = v;
  v = v.before;
}

if (before !== l2.peek()) {
  throw new Error('fml');
}

v = l2.head;
before = null;

while (v) {
  console.log(v.key);
  before = v;
  v = v.after;
}

if (before !== l2.tail) {
  throw new Error('fml');
}
