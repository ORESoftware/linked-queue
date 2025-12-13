import {LinkedQueue} from '../../dist/esm/linked-queue.js';

const q = new LinkedQueue();

q.unshift('bar');
q.unshift('zoom');
q.unshift('rolo');

console.log('length:', q.length);
console.log('first:', q.first());
console.log('last:', q.last());

console.log(q.pop(), 'length:', q.length);
console.log(q.pop(), 'length:', q.length);
console.log(q.pop(), 'length:', q.length);
console.log(q.pop(), 'length:', q.length);
console.log(q.pop(), 'length:', q.length);

console.log('basic-queue.test passed!');
