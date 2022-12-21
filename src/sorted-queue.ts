#!/usr/bin/env ts-node
'use strict';

export interface KeyVal<V, K> {
  key?: K,
  val: V,
  leftOrRight?: 'left' | 'right'
}

export interface NumericCompare {

}

const emptyNodeSymbol = Symbol('empty.node');

class SortedQueueNode<V, K> {
  key: K;
  val: V;
  parent: SortedQueueNode<V, K> = null;
  left: SortedQueueNode<V, K> = null;
  right: SortedQueueNode<V, K> = null;
  leftOrRight: 'left' | 'right' = null;

  constructor({
                key,
                val,
                leftOrRight
              }: KeyVal<V, K>, left?: SortedQueueNode<V, K> | Symbol, right?: SortedQueueNode<V, K> | Symbol) {
    this.val = val;
    this.key = key;
    if (arguments.length > 1) {
      if (left !== emptyNodeSymbol) {
        if (!(left && left instanceof SortedQueueNode)) {
          throw new Error('Argument for left node, should be instance of Node.')
        }
        this.left = left;
        this.left.parent = this;
      }

    }
    if (arguments.length > 2) {
      if (right !== emptyNodeSymbol) {
        if (!(right && right instanceof SortedQueueNode)) {
          throw new Error('argument for right node, should be instance of Node.')
        }
        this.right = right;
        this.right.parent = this;
      }
    }

  }

  getValue() {
    return this.val;
  }
}

export interface SortedQueueOpts<V, K> {
  compareByNum: (a: V, b: V) => number,
  compareByBoolean: (a: V, b: V) => boolean
}

class SortedQueue<V, K = any> {

  rootNode: SortedQueueNode<V, K> = null;
  compareByNum: SortedQueueOpts<V, K>['compareByNum'];
  compareByBoolean: SortedQueueOpts<V, K>['compareByBoolean'];
  map = new Map<K, V>();
  head: SortedQueueNode<V, K> = null;
  tail: SortedQueueNode<V, K> = null;

  constructor(rootNodeVal: SortedQueueNode<V, K>, opts: SortedQueueOpts<V, K>) {
    this.rootNode = rootNodeVal;
    this.compareByNum = opts.compareByNum;
    this.compareByBoolean = opts.compareByBoolean;
  }

  removeByKey() {
    // this can remove in O(1)
  }

  removeByValue() {
    // this can remove in O(log_2(n))

  }

  remove(node: SortedQueueNode<V, K>): SortedQueueNode<V, K> {
    // this can remove in O(log_2(n))

    if (!node) {
      return null;
    }

    if (!(node && 'val' in node)) {
      throw new Error('node is not defined, or wrong type.')
    }

    const isTail = this.head === node;
    const isHead = this.tail === node;
    const parent = node.parent;

    const makeRet = () => {
      // node.parent = null;
      // node.right = null;
      // node.left = null;
      return parent;
    };

    if (!parent) {
      if (this.rootNode !== node) {
        throw new Error('root node should be parent.')
      }
    }

    // TODO: redefine rootNode as needed

    if (!node.left && !node.right) {

      throw 'neither!'

      if (!parent) {
        // root node...
        this.head = null;
        this.tail = null;
        this.rootNode = null;
        return makeRet();
      }

      if (parent.left === node) {
        parent.left = null;
        if (isHead) {
          this.head = parent;
        }
      }

      if (parent.right === node) {
        parent.right = null;
        if (isTail) {
          this.tail = parent;
        }
      }
      return makeRet();
    }

    if (!node.left) {

      throw 'left'

      if (isTail) {
        throw new Error('should not be tail if node.right is defined.');
      }

      if (isHead) {
        this.head = node.right;
      }

      // assign even if parent is null
      node.right.parent = parent;

      if (!parent) {
        this.rootNode = node.right;
        return parent;
      }

      if (parent.left === node) {
        parent.left = node.right;
      } else if (parent.right === node) {
        parent.right = node.right;
      } else {
        throw new Error('neither left or right hmmm')
      }

      return makeRet();
    }

    if (!node.right) {

      throw 'right'

      if (isHead) {
        throw new Error('if left is defined, node should not be head.')
      }

      if (isTail) {
        this.tail = node.left;
      }

      // assign even if parent is null
      node.left.parent = parent;

      if (!parent) {
        this.rootNode = node.left;
        return parent;
      }

      if (parent.left === node) {
        parent.left = node.left;
      } else if (parent.right === node) {
        parent.right = node.left;
      } else {
        throw new Error('neither left nor right hmmm.')
      }

      return makeRet();
    }

    if (!(node.left && node.right)) {
      throw new Error('both left and right should be defined.')
    }

    if (!node.left.right) {
      // throw 'boof right';
      node.left.right = node.right;
      node.left.parent = parent; // ok if parent is null
      node.right.parent = node.left;

      if (parent) {
        if (parent.right === node) {
          parent.right = node.left;
        } else if (parent.left === node) {
          parent.left = node.left;
        } else {
          throw new Error('missing children.')
        }
      }
      return makeRet();
    }

    if (!node.right.left) {
      // throw 'boof left'
      node.right.left = node.left;
      node.right.parent = parent; // ok if parent is null
      node.left.parent = node.right;

      if (parent) {
        if (parent.right === node) {
          parent.right = node.right;
        } else if (parent.right === node) {
          parent.right = node.right;
        } else {
          throw new Error('missing children.');
        }
      }

      return makeRet();
    }

    const rightMost = this.findLargestGivenVal(node.left);
    const leftMost = this.findSmallestGivenVal(node.right);

    if (!(rightMost && leftMost)) {
      throw new Error('both of these should be defined!')
    }


    if (true) {

      if(rightMost.parent === node){
        throw new Error('rightMost.parent cannot be node, here.')
      }

      rightMost.parent.right = rightMost.left;

      if(rightMost.right){
        throw new Error('rightMost.right should not be defined.');
      }

      if (rightMost.left) {
        rightMost.left.parent = rightMost.parent
      }

      rightMost.left = node.left;
      rightMost.right = node.right;
      node.right.parent = rightMost;
      node.left.parent = rightMost;
      rightMost.parent = parent;

      if (!parent) {
        this.rootNode = rightMost;
        return makeRet();
      }

      if (parent.left === node) {
        parent.left = rightMost;
      } else if (parent.right === node) {
        parent.right = rightMost;
      } else {
        console.log(parent.val);
        console.log(node.parent.val);
        throw new Error('this is unexpected.')
      }

    } else {

      // TODO: do leftMost

    }


    return makeRet();


  }

  peek() {
    if (this.head) {
      return this.head;
    }
    return this.head = this.findSmallestValFromRoot();
  }

  findNextBiggest(val: number) {

    let currentNode = this.rootNode;
    let numOfSearches = 0;

    while (true) {

      numOfSearches++;

      if (val <= Number(currentNode.getValue())) {
        return {numOfSearches, currentNode};
      }

      if (!currentNode.right) {
        return null;
      }

      currentNode = currentNode.right;
      continue;

    }

  }

  doLeftRotation(n: SortedQueueNode<V, K>) {

    if (!n.left) {
      throw new Error('missing left node');
    }

    if (n.left.left) {
      throw new Error('left.left should not be defined yet.')
    }

    if (n.left.right) {
      throw new Error('left.right should not be defined yet.')
    }

    if (!n.parent) {
      if (!((n as any).isRoot)) {
        throw new Error('no parent?')
      }
      return;
    }

    const parentVal = n.parent.val;
    const halfVal = (parentVal as any) / 2;
    const diffCurr = Math.abs((n.val as any) - (halfVal as any));
    const diffPotential = Math.abs((n.left.val as any) - (halfVal));

    console.log({diffCurr, diffPotential});

    if (diffPotential < diffCurr) {
      return; // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!
      // throw new Error('doing?')
      const parent = n.parent;
      const right = n.right;
      const left = n.left;
      n.left = null;
      n.right = null;
      n.parent = left;
      left.parent = parent;
      left.right = right;
      left.left = n;
      parent.left = left;

    }

  }

  doRightRotation(n: SortedQueueNode<V, K>) {

  }

  logInOrder(node: SortedQueueNode<any, any>, count = {val: 0}) {

    if (node === null) {
      return;
    }

    if (node.left) {
      if (node.left.parent !== node) {
        node.left.parent = node;
        // throw new Error('this is wrong / left.');
      }
      this.logInOrder(node.left, count);
    }

    console.log(count.val++, node.val);

    if (node.right) {
      if (node.right.parent !== node) {
        node.right.parent = node;
        // throw new Error('this is wrong / right.');
      }
      this.logInOrder(node.right, count);
    }
  }

  inOrderCallback(node: SortedQueueNode<any, any>, cb: (v: number) => void): any {

    if (node === null) {
      return;
    }

    if (node.left) {
      this.inOrderCallback(node.left, cb);
    }

    cb(node.val);

    if (node.right) {
      this.inOrderCallback(node.right, cb);
    }

  }

  * inOrder(node: SortedQueueNode<any, any> = this.rootNode): any {

    if (node === null) {
      return;
    }

    if (node.left) {
      yield* this.inOrder(node.left);
    }

    yield node.val;

    if (node.right) {
      yield* this.inOrder(node.right);
    }

  }

  findSmallestValFromRoot(): SortedQueueNode<V, K> {
    let currentNode = this.rootNode;

    while (currentNode.left) {
      currentNode = currentNode.left
    }

    return currentNode;
  }

  findLargestGivenVal(node: SortedQueueNode<any, any>) {

    while (node.right) {
      node = node.right
    }

    return node;
  }

  findSmallestGivenVal(node: SortedQueueNode<any, any>) {

    while (node.left) {
      node = node.left
    }

    return node;
  }

  findNextLargestOld(node: SortedQueueNode<any, any> = this.findSmallestValFromRoot()) {

    if (!node) {
      throw new Error('no current node.');
    }

    if (node.right) {
      return this.findSmallestGivenVal(node.right);
    }

    if (!node.parent) {
      return null;
    }

    if (node.parent.right && node.parent.right !== node) {
      return this.findSmallestGivenVal(node.parent.right);
    }

    while ((node = node.parent)) {
      if (node.parent.right && node.parent.right !== node) {
        return this.findSmallestGivenVal(node.parent.right);
      }
    }

    return node;
  }

  findNextLargest(node: SortedQueueNode<any, any> = this.findSmallestValFromRoot()): SortedQueueNode<any, any> {

    if (!node) {
      throw new Error('no current node.');
    }

    if (node.right) {
      return this.findSmallestGivenVal(node.right);
    }

    if (!node.parent) {
      return null;
    }

    if (node.parent.left === node) {
      return node.parent;
    }

    let n = node.parent;

    // if (n.parent && n.parent.right && n.parent.right !== n) {
    //   return this.findSmallestGivenVal(n.parent.right);
    // } else {
    //   return n.parent;
    // }


    while (n.parent) {
      if (n.parent.right && n.parent.right === n) {
        n = n.parent;
      } else {
        // if (n.parent.left !== n) {
        //   throw new Error('oddd');
        // }
        return n.parent;
      }

      // if(!n.parent){
      //   return this.findSmallestGivenVal(n);
      // }
    }

    return null;
    // return this.findSmallestGivenVal(n);
    // return this.findSmallestGivenVal(n.parent || n);
  }

  iterator() {
    return this;
  }

  iterateAll(cb: (v: number) => void) {

    const nodes = [this.rootNode];

    while (nodes.length) {

      const n = nodes.pop();

      if (!n) {
        throw new Error('wtf')
      }

      cb(n.val as any);

      if (n.right) {
        nodes.push(n.right);
      }

      if (n.left) {
        nodes.push(n.left);
      }

    }
  }


  [Symbol.iterator]() {
    //  iterates through all nodes in ascending fashion
    const stack: any[] = [];
    let currentNode = this.rootNode;

    return {
      next() {

        while (currentNode !== null) {
          stack.push(currentNode);
          currentNode = currentNode.left || null;
        }

        if (stack.length < 1) {
          return {done: true, value: null};
        }

        const node = stack.pop();
        currentNode = node.right || null;
        return {done: false, value: node.val};

      }
    };
  }

  find(val: V) {

    let currentNode = this.rootNode;
    let numOfSearches = 0;

    while (true) {

      numOfSearches++;

      if (val === currentNode.getValue()) {
        return {numOfSearches, currentNode};
      }

      const v = this.compareByNum(val, currentNode.getValue());

      if (v <= 0) {

        if (!currentNode.left) {
          return null;
        }

        currentNode = currentNode.left;
        continue;


      } else {


        if (!currentNode.right) {
          return null;
        }

        currentNode = currentNode.right;
        continue;
      }

    }

  }

  insert(val: V, key?: K) {

    const newNode = new SortedQueueNode<V, K>({val, key});
    let currentNode = this.rootNode;
    let numOfSearches = 0;

    while (true) {

      numOfSearches++;

      const v = this.compareByNum(newNode.getValue(), currentNode.getValue());

      if (v <= 0) {

        if (!currentNode.left) {
          newNode.parent = currentNode;
          currentNode.left = newNode;
          if (this.head === currentNode) {
            this.head = newNode;
          }
          // newNode.leftOrRight = 'left';
          // this.doLeftRotation(currentNode);
          break;
        }

        currentNode = currentNode.left;
        continue;


      } else {


        if (!currentNode.right) {
          newNode.parent = currentNode;
          currentNode.right = newNode;
          if (this.tail === currentNode) {
            this.tail = newNode;
          }
          // newNode.leftOrRight = 'right';
          // this.doRightRotation(currentNode);
          break;
        }

        currentNode = currentNode.right;
        continue;
      }

    }

    // console.log({numOfSearches});
  }

  compareNodesByBoolean(a: SortedQueueNode<V, K>, b: SortedQueueNode<V, K>) {
    return this.compareByBoolean(a.getValue(), b.getValue())
  }

}

const getNode = <V, K>(v: number, diff: number, count: number): SortedQueueNode<V, K> => {
  // console.log(v, count);
  return new SortedQueueNode<V, K>(
    {val: v as any, key: v as any},
    count > 4 ? emptyNodeSymbol : getNode(v - diff, diff / 2, count + 1),
    count > 4 ? emptyNodeSymbol : getNode(v + diff, diff / 2, count + 1),
  );
}

console.time('foo')
const rootNode = getNode(0.5, 0.25, 1);
(rootNode as any).isRoot = true;
console.timeEnd('foo');
// process.exit(0);


const rootNode2 = new SortedQueueNode<number, number>(
  {val: 0.5},

  new SortedQueueNode<number, number>(
    {val: 0.25},
    new SortedQueueNode<number, number>(
      {val: 0.125},
      new SortedQueueNode<number, number>(
        {val: 0.0625},
      ),
      new SortedQueueNode<number, number>(
        {val: 0.1875},
      ),
    ),
    new SortedQueueNode<number, number>(
      {val: 0.375},
      new SortedQueueNode<number, number>(
        {val: 0.3125},
        new SortedQueueNode<number, number>(
          {val: 0.3025},
          new SortedQueueNode<number, number>(
            {val: 0.3005},
          ),
        ),
      ),
      new SortedQueueNode<number, number>(
        {val: 0.4375},
        emptyNodeSymbol,
        new SortedQueueNode<number, number>(
          {val: 0.4385},
          emptyNodeSymbol,
          new SortedQueueNode<number, number>(
            {val: 0.4395},
          ),
        ),
      ),
    ),
  ),
  new SortedQueueNode<number, number>(
    {val: 0.75},

    new SortedQueueNode<number, number>(
      {val: 0.625},
      new SortedQueueNode<number, number>(
        {val: 0.5625},
      ),
      new SortedQueueNode<number, number>(
        {val: 0.6875},
      ),
    ),

    new SortedQueueNode<number, number>(
      {val: 0.875},
      new SortedQueueNode<number, number>(
        {val: 0.8125},
      ),
      new SortedQueueNode<number, number>(
        {val: 0.9375},
      ),
    ),
  )
);

const sq = new SortedQueue(rootNode, {
  compareByBoolean: ((a, b) => a > b),
  compareByNum: ((a, b) => (a as number) - (b as number)),
});


const vals = [];

console.time('start');

for (let i = 0; i < 0; i++) {
  const r = Math.random();
  // console.time(String(r));
  sq.insert(r);
  // console.timeEnd(String(r));
  vals.push(r);
}

console.timeEnd('start');


const runLog0 = () => {
  let count = 0;
  let prev: any = 0;
  console.time('bar0')
  for (const v of sq) {
    if (v <= prev) {
      console.log(count++, v);
      throw 'smaller 2';
    }
    prev = v;
    // console.log(count++, v);
  }
  console.timeEnd('bar0');

}

// runLog0();
// throw 'foo'

const runLog1 = () => {

  let previous = 0;
  let count = 0;

  console.time('bar1')
  for (const z of sq.inOrder()) {
    if (z < previous) {
      throw new Error('smaller.');
    }
    count++
    previous = z;
    // console.log('val:', z);
  }
  console.timeEnd('bar1');

  console.log({count});
}

const runLog2 = () => {

  let previous = 0;
  let count = 0;

  console.time('bar2')
  sq.inOrderCallback(sq.rootNode, z => {
    if (z <= previous) {
      throw new Error('smaller.');
    }
    count++
    previous = z;
    // console.log('val:', z);
  });

  console.timeEnd('bar2')
  console.log({count});
}

const runLog3 = () => {

  let previous = 0;
  let count = 0;

  console.time('bar3')
  sq.iterateAll(z => {
    if (z <= previous) {
      // throw new Error('smaller.');
    }
    count++
    previous = z;
    // console.log('val:', z);
  });
  console.timeEnd('bar3')
  console.log({count});
}

runLog0();
runLog1();
runLog2();
runLog3();
// throw 'fpoo'


const doRecurse = <K, V>(n: SortedQueueNode<V, K>, count: number) => {

  if (!n) {
    return {numRight: count, numLeft: count};
  }

  let numLeft = count;
  let numRight = count;

  if (n.left) {
    numLeft = doRecurse(n.left, count + 1).numLeft;
  }

  if (n.right) {
    numRight = doRecurse(n.right, count + 1).numRight;
  }

  if (count < 5) {
    if (true || numLeft !== numRight) {
      // console.log({numLeft, numRight});
    }
  }

  return {
    numLeft: count, numRight: count
  }
};

// doRecurse(rootNode, 0);
// console.log(sq);


for (const v of vals) {
  console.log(sq.find(v).numOfSearches);
}
//
// console.log(sq.find(0.5).numOfSearches);
// console.log(sq.find(0.25).numOfSearches);
// console.log(sq.find(0.375).numOfSearches);
// console.log(sq.find(0.8125).numOfSearches);
//
// //TODO: fix this method
// console.log(sq.findNextBiggest(0.11).currentNode.val);
//
// console.log(sq.findNextLargest().val);
//
// console.log(
//   'zzz:',
//   sq.findNextLargest(sq.findNextLargest(sq.findNextLargest())).val
// );
//
// console.log(
//   'zzz:',
//   sq.findNextLargest(sq.findNextLargest(sq.findNextLargest(sq.findNextLargest()))).val
// );

console.log('///////');
sq.logInOrder(sq.rootNode);
console.log('////////');

const x = sq.remove(sq.rootNode);
console.log('1111:',sq.rootNode.val);
const x2 = sq.remove(sq.rootNode);
console.log('2222:',sq.rootNode.val);
const x6 = sq.remove(sq.rootNode.right);
const x3 = sq.remove(sq.rootNode.right?.left);
const x4 = sq.remove(sq.rootNode.left?.right);
console.log({x});
console.log('new root-node val:', sq.rootNode.val);

if (sq.rootNode.left) {
  console.log('new root-node left val:', sq.rootNode.left.val);
}

if (sq.rootNode.right) {
  console.log('new root-node right val:', sq.rootNode.right.val);
}

console.log('///////')
sq.logInOrder(sq.rootNode);
console.log('////////')

let count = 0;
let next1 = sq.findSmallestValFromRoot();
const nxx = sq.findSmallestValFromRoot().parent.parent;
const rm = nxx.left.right;
console.log('VAL:', nxx.val);
console.log('VAL parent:', nxx.parent.val);
console.log('VAL left:', nxx.left.val);
console.log('VAL left.right:', nxx.left.right.val);
console.log('VAL right:', nxx.right.val);
debugger;
let nextX = sq.remove(nxx);

if(rm.right !== nxx.right){
  throw 'hmmm'
}

if(rm.left !== nxx.left){
  throw 'hmmm'
}

if(rm.right !== nxx.right){
  throw 'hmmm'
}

console.log('///////')
console.log('VAL:', rm.val);
console.log('VAL parent:', rm.parent.val);
console.log('VAL parent.left:', rm.parent.left.val);
console.log('VAL parent.right:', rm.parent.right.val);
console.log('VAL parent.parent:', rm.parent.parent.val);
console.log('VAL parent.parent.left:', rm.parent.parent.left.val);
console.log('VAL parent.parent.right:', rm.parent.parent.right.val);
console.log('VAL parent left:', rm.parent.left.val);
console.log('VAL parent right:', rm.parent.right.val);
console.log('VAL left:', rm.left.val);
console.log('VAL left.left:', rm.left.left.val);
console.log('VAL right:', rm.right.val);

// console.log(smallest.val);
// let next = sq.findNextLargest();
// console.log(next.val);

let next = sq.findSmallestValFromRoot();

let prev = 0;
while (next) {
  next = sq.findNextLargest(next);
  if (!next) {
    continue;
  }
  console.log(count++, next && next.val);
  // console.error('breaking?', count);
  if (next.val <= prev) {
    throw 'smaller!'
  }
  prev = <number>next.val;
  if (false) {
    break;
  }
}

console.log(sq.findNextLargest(sq.rootNode).val);


