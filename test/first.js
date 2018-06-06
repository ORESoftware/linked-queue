const {LinkedQueue} = require('../dist/linked-queue');
const q = new LinkedQueue();

q.enq('z');
q.enq('222');
q.push('bar');
q.deq();


let v = q.tail;
let before = null;

while (v) {
  before = v;
  v = v.before;
}

let peek = q.peek();
if (before !== peek) {
  console.error(before.key, peek.key, q.getOrderedList().map(v => v.key));
  throw 'fml-1';
}

v = q.head;
before = null;

while (v) {
  before = v;
  v = v.after;
}

if (before !== q.tail) {
  throw new Error('fml 2');
}
