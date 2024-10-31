'use strict';

import {LinkedQueue} from "./linked-queue";

(async () => {
  const queue = new LinkedQueue<number, string>();

  queue.enqueue('a', 1);
  queue.enqueue('b', 2);
  queue.enqueue('c', 3);

  console.log('Forward Async Iteration:');
  for await (const [key, value] of queue.asyncIterator()) {
    console.log(`Key: ${key}, Processed Value: ${value}`);
  }

  console.log('Reverse Async Iteration:');
  for await (const [key, value] of queue.asyncReverseIterator()) {
    console.log(`Key: ${key}, Processed Value: ${value}`);
  }
})();
