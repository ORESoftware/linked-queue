import {LinkedQueue} from '../../dist/esm/linked-queue.js';
import * as assert from 'assert';

const q = new LinkedQueue();

q.addToFront('hello')
q.addToFront('goodbye')
q.addToFront('4')
q.addToFront('5')

q.addToFront('turd')

console.log('size:', q.size);

let iterCount = 0;
for(const z of q){
  console.log({z});
  iterCount++;
}
assert.strictEqual(iterCount, 5, 'Should iterate 5 items');

iterCount = 0;
for(const z of q){
  console.log({z});
  iterCount++;
}
assert.strictEqual(iterCount, 5, 'Should iterate 5 items again');


iterCount = 0;
for(const z of q){
  console.log({z});
  iterCount++;
}
assert.strictEqual(iterCount, 5, 'Should iterate 5 items third time');


let deqCount = 0;
for(const z of q.dequeueIterator()){
  console.log({'deq':z});
  deqCount++;
}

console.log({size: q.size});
assert.strictEqual(q.size, 0, 'Queue should be empty after dequeueIterator');

iterCount = 0;
for(const z of q){
  console.log({z});
  iterCount++;
}
assert.strictEqual(iterCount, 0, 'Should iterate 0 items after dequeue');

console.log('iterator.js passed!');
