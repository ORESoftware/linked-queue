'use strict';


const {LinkedQueue} = require('@oresoftware/linked-queue');
const assert = require('assert');
const q = new LinkedQueue();


q.push('hello')
q.push('goodbye')
q.push('4')
q.push('5')

q.push('turd')

console.log(q.size);

for(const z of q){
  console.log({z});
}
