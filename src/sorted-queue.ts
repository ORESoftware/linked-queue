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

  constructor({key, val, leftOrRight}: KeyVal<V, K>, left?: SortedQueueNode<V, K> | Symbol, right?: SortedQueueNode<V, K> | Symbol) {
    this.val = val;
    this.key = key;
    if (arguments.length > 2) {
      if (left !== emptyNodeSymbol) {
        if (!(left && left instanceof SortedQueueNode)) {
          throw new Error('Argument for left node, should be instance of Node.')
        }
        this.left = left;
        this.left.parent = this;
      }

    }
    if (arguments.length > 3) {
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
          newNode.leftOrRight = 'left';
          this.doLeftRotation(currentNode);
          break;
        }

        currentNode = currentNode.left;
        continue;


      } else {


        if (!currentNode.right) {
          newNode.parent = currentNode;
          currentNode.right = newNode;
          newNode.leftOrRight = 'right';
          this.doRightRotation(currentNode);
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

const getNode = <V, K>(v: number, count: number): SortedQueueNode<V, K> => {
  // console.log(v, count);
  return new SortedQueueNode<V, K>(
    {val: v as any, key: v as any},
    count > 19 ? emptyNodeSymbol : getNode(v / 2, count + 1),
    count > 19 ? emptyNodeSymbol : getNode(v * 3 / 2, count + 1),
  );
}

console.time('foo')
const rootNode = getNode(0.5, 1);
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
      ),
      new SortedQueueNode<number, number>(
        {val: 0.4375},
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
for (let i = 0; i < 1000; i++) {
  const r = Math.random();
  // console.time(String(r));
  sq.insert(r);
  // console.timeEnd(String(r));
  vals.push(r);
}
console.timeEnd('start');


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

doRecurse(rootNode, 0);
console.log(sq);

for (const v of vals) {
  console.log(sq.find(v).numOfSearches);
}
console.log(sq.find(0.375));
console.log(sq.find(0.8125));

console.log(sq.findNextBiggest(0.11));
