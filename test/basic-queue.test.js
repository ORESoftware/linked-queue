const {Queue} = require('../dist/queue');

const q = new Queue();

q.unshift('bar');
q.unshift('zoom');
q.unshift('rolo');

console.log('length:', q.length);
console.log('first:', q.first);
console.log('last:', q.last);

console.log(q.pop(), 'length:', q.length);
console.log(q.pop(), 'length:', q.length);
console.log(q.pop(), 'length:', q.length);
console.log(q.pop(), 'length:', q.length);
