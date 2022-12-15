export interface KeyVal<V, K> {
  key?: K,
  val: V
}

class Node<V, K> {
  key: K;
  val: V;
  left: Node<V, K> = null;
  right: Node<V, K> = null;

  constructor({key, val}: KeyVal<V, K>, left?: Node<V, K>, right?: Node<V, K>) {
    this.val = val;
    this.key = key;
    if (arguments.length > 2) {
      if (!(left && left instanceof Node)) {
        throw new Error('Argument for left node, should be instance of Node.')
      }
    }
    if (arguments.length > 3) {
      if (!(right && right instanceof Node)) {
        throw new Error('argument for right node, should be instance of Node.')
      }
    }
    this.left = left;
    this.right = right;
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

  rootNode: Node<V, K> = null;
  compareByNum: SortedQueueOpts<V, K>['compareByNum'];
  compareByBoolean: SortedQueueOpts<V, K>['compareByBoolean'];
  map = new Map<K, V>();

  constructor(rootNodeVal: Node<V, K>, opts: SortedQueueOpts<V, K>) {
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

    const newNode = new Node<V, K>({val, key});
    let currentNode = this.rootNode;

    let numOfSearches = 0;

    while (true) {

      numOfSearches++;

      const v = this.compareByNum(newNode.getValue(), currentNode.getValue());

      if (v <= 0) {

        if (!currentNode.left) {
          currentNode.left = newNode;
          break;
        }

        currentNode = currentNode.left;
        continue;


      } else {


        if (!currentNode.right) {
          currentNode.right = newNode;
          break;
        }

        currentNode = currentNode.right;
        continue;
      }

    }

    console.log({numOfSearches});

  }


  compareNodesByBoolean(a: Node<V, K>, b: Node<V, K>) {
    return this.compareByBoolean(a.getValue(), b.getValue())
  }

}


const rootNode = new Node<number, number>(
  {val: 0.5},

  new Node<number, number>(
    {val: 0.25},
    new Node<number, number>(
      {val: 0.125},
      new Node<number, number>(
        {val: 0.0625},
      ),
      new Node<number, number>(
        {val: 0.1875},
      ),
    ),
    new Node<number, number>(
      {val: 0.375},
      new Node<number, number>(
        {val: 0.3125},
      ),
      new Node<number, number>(
        {val: 0.4375},
      ),
    ),
  ),
  new Node<number, number>(
    {val: 0.75},

    new Node<number, number>(
      {val: 0.625},
      new Node<number, number>(
        {val: 0.5625},
      ),
      new Node<number, number>(
        {val: 0.6875},
      ),
    ),

    new Node<number, number>(
      {val: 0.875},
      new Node<number, number>(
        {val: 0.8125},
      ),
      new Node<number, number>(
        {val: 0.9375},
      ),
    ),
  )
);

const sq = new SortedQueue(rootNode, {
  compareByBoolean: ((a, b) => a > b),
  compareByNum: ((a, b) => a - b),
});

const vals = [];

console.time('start');
for (let i = 0; i < 10000; i++) {
  const r = Math.random();
  console.time(String(r));
  sq.insert(r);
  console.timeEnd(String(r));
  vals.push(r);
}
console.timeEnd('start');


const doRecurse = <K, V>(n: Node<V, K>, count: number) => {

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

  if (count < 50) {
    console.log({numLeft, numRight});
  }

  return {
    numLeft: count, numRight: count
  }
};

doRecurse(rootNode, 0);
// console.log(sq);
//
// for (const v of vals) {
//   console.log(sq.find(v).numOfSearches);
// }
// console.log(sq.find(0.375));
// console.log(sq.find(0.8125));
//
// console.log(sq.findNextBiggest(0.11));
