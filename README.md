

# @oresoftware/linked-queue

### Constant/linear time queue

This an implementation of a FIFO queue, where all methods/operations are linear/constant in time complexity.

The key proposition of this library is that it will allow you to remove or insert items from/in the middle of the queue,
in constant time. It also allows you to add/remove items to the front of the queue in constant time.  Whereas, `Array.prototype.shift/Array.prototype.unshift`
are of O(N), because they have to update the indices of the entire array, etc.




### Examples

```js
const {LinkedQueue} from '@oresoftware/linked-queue';
const q = new LinkedQueue();

q.enq({task:'foo'});  // adds item to the end/tail of the queue
q.enqueue({task:'bar'});  // adds item to the end/tail of the queue
q.push({task:'far'}); // adds item to the end/tail of the queue

q.enq('foo', {task:'bbb'}); // adds item to the end/tail of the queue, with id/key = 'foo'
q.get('foo'); // => {key: 'foo', value: {task:'bbb'}}


q.enq({whatever:'is clever'}, {task:'bbb'}); // adds task to the end/tail of the queue, with id/key = {whatever:'is clever'}


q.deq(); // => removes and returns the head of the queue, or null.
q.dequeue(); // => removes and returns the head of the queue, or null.
q.shift(); // => removes and returns the head of the queue, or null.


q.peek(); // => returns the head of the queue, but does not remove it.

```


### Tricks

This is a FIFO queue, but if you wanted to dequeue a item that was not the head of the queue, instead of using `q.deq()`, you
could just use `q.remove(id)`. Where id is the key/id of the item you wish to retrieve. And this would be
in constant time.



