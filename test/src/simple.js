
const {LinkedQueue} = require('../../dist/linked-queue');

const l2 = new LinkedQueue();

l2.enq(String({}));
// l2.enq(String({}));

// l2.enq({});

l2.enq({});

console.log(l2.getOrderedList().map(v => v.key));
console.log(l2.getReverseOrderedList().map(v => v.key));
