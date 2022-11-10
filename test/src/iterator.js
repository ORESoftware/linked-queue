'use strict';


const {LinkedQueue} = require('@oresoftware/linked-queue');
const assert = require('assert');
const q = new LinkedQueue();


q.addToFront('hello')
q.addToFront('goodbye')
q.addToFront('4')
q.addToFront('5')

q.addToFront('turd')

console.log(q.size);

for(const z of q){
  console.log({z});
}

for(const z of q){
  console.log({z});
}


for(const z of q){
  console.log({z});
}


for(const z of q.dequeueIterator()){
  console.log({'deq':z});
}

console.log({size: q.size});

for(const z of q){
  console.log({z});
}

