import util = require('util');
import chalk from "chalk";

export interface LinkedQueueValue {
  after: LinkedQueueValue,
  before: LinkedQueueValue,
  value: any,
  key: any,
}

export type IteratorFunction = (val: LinkedQueueValue, index: number) => void;

export class LinkedQueue {

  private lookup = new Map<any, any>();
  private head = null as any;
  private tail = null as any;
  private length = 0;

  getLength(): number {
    return this.length;
  }

  getRandomKey() {
    const size = this.lookup.size;

    if (size < 1) {
      throw new Error('Cannot get random key from empty queue.')
    }

    const r = Math.floor(Math.random() * size);
    let i = 0, k = null;
    for (k of this.lookup.keys()) {
      if (i === r) {
        break;
      }
      i++;
    }

    return k;
  }

  getRandomItem() {
    try {
      return this.lookup.get(this.getRandomKey());
    }
    catch (err) {
      return null;
    }
  }

  remove(k: any): LinkedQueueValue {

    const v = this.lookup.get(k);

    if (v) {

      this.length--;
      this.lookup.delete(k);

      let before = v.before;
      let after = v.after;

      if (before) {
        before.after = after || null;
      }

      if (after) {
        after.before = before || null;
      }

      if (this.head === v) {
        this.head = v.after || null;
      }

      if (this.tail === v) {
        this.tail = v.before || null;
      }

      delete v.before;
      delete v.after;
    }

    return v || null;
  }

  contains(k: any): boolean {
    return Boolean(this.lookup.get(k));
  }

  get(k: any): LinkedQueueValue {
    return this.lookup.get(k);
  }

  peek(): LinkedQueueValue {
    return this.head;
  }

  getOrderedList(): Array<LinkedQueueValue> {
    const ret = [];

    let v = this.head;

    while (v) {
      ret.push(v);
      v = v.after;
    }

    return ret;
  }

  static getKeyValue(v: LinkedQueueValue) {
    return {
      key: v.key,
      value: v.value
    }
  }

  forEach(fn: IteratorFunction, ctx?: any): this {
    let v = this.head;
    let index = 0;
    ctx = ctx || null;

    while (v) {
      fn.call(ctx, LinkedQueue.getKeyValue(v), index++);
      v = v.after;
    }
    return this;
  }

  map(fn: IteratorFunction, ctx?: any) {

    let v = this.head;
    let index = 0;
    ctx = ctx || null;

    const ret = [];

    while (v) {
      ret.push(fn.call(ctx, LinkedQueue.getKeyValue(v), index++));
      v = v.after;
    }

    return ret;
  }

  filter(fn: IteratorFunction, ctx?: any) {

    let v = this.head;
    let index = 0;
    ctx = ctx || null;

    const ret = [];

    while (v) {
      if (fn.call(ctx, LinkedQueue.getKeyValue(v), index++)) {
        ret.push(v);
      }
      v = v.after;
    }

    return ret;
  }

  insertInFrontOf() {
    throw new Error('not yet implemented.');
  }

  insertBehind() {
    throw new Error('not yet implemented.');
  }

  insertAtIndex() {
    throw new Error('not yet implemented.');
  }

  first(): LinkedQueueValue {
    return this.head || null;
  }

  last(): LinkedQueueValue {
    return this.tail || null;
  }

  getReverseOrderedList(): Array<LinkedQueueValue> {

    const ret = [];
    let v = this.tail;

    while (v) {
      ret.push(v);
      v = v.before;
    }

    return ret;
  }

  removeAll() {
    this.head = null;
    this.tail = null;
    this.lookup.clear();
    this.length = 0;
  }

  clear() {
    return this.removeAll.apply(this, arguments);
  }

  unshift(k: any, obj?: any): void {
    return this.addToFront.apply(this, arguments);
  }

  addToFront(k: any, obj?: any): void {

    if (arguments.length < 1) {
      throw new Error(`Please pass an argument to '${this.addToFront.name}'()`);
    }

    if (!k) {
      throw new Error(`Please pass a truthy value as the first argument to '${this.addToFront.name}'()`);
    }

    if (arguments.length === 1) {
      obj = k;
    }

    if (this.lookup.get(k)) {
      throw new Error(chalk.magenta(`The following object/value already exists in the queue. ${util.inspect(this.lookup.get(k).key).slice(0, 100)}`) +
        chalk.magenta.bold(`Either remove the already enqueued item, or pass a unique value as the first argument to '${this.addToFront.name || 'unknown'}()'.`));
    }

    const v = <LinkedQueueValue>{
      value: obj,
      key: k,
    };

    this.lookup.set(k, v);
    const h = this.head;

    if (h) {
      if (h.before) {
        throw new Error('The queue head should not have an "before" pointer.');
      }
      h.before = v;
    }

    v.after = h || null;
    this.head = v;

    if (!this.tail) {
      this.tail = v;
    }

    this.length++;

  }

  enq(k: any, obj?: any): void {

    if (arguments.length < 1) {
      throw new Error(`Please pass an argument to '${this.enq.name}()'.`);
    }

    if (!k) {
      throw new Error(`Please pass a truthy value as the first argument to '${this.enq.name}()'`);
    }

    if (arguments.length === 1) {
      obj = k;
    }

    if (this.lookup.get(k)) {
      throw new Error(chalk.magenta(`The following object/value already exists in the queue. ${util.inspect(this.lookup.get(k).key).slice(0, 100)}. `) +
        chalk.magenta.bold(`Either remove the already enqueued item, or pass a unique value as the first argument to '${this.enq.name || 'unknown'}()'.`));
    }

    const v = <LinkedQueueValue>{
      value: obj,
      key: k
    };

    this.lookup.set(k, v);

    const t = this.tail;

    if (t) {
      if (t.after) {
        throw new Error('The queue tail should not have an "after" pointer.');
      }
      t.after = v;
    }

    v.before = t || null;
    this.tail = v;

    if (!this.head) {
      this.head = v;
    }

    this.length++;

  }

  enqueue(k: any, obj?: any): void {
    return this.enq.apply(this, arguments);
  }

  push(k: any, obj?: any): void {
    return this.enq.apply(this, arguments);
  }

  add(k: any, obj?: any): void {
    return this.enq.apply(this, arguments);
  }

  deq(): LinkedQueueValue {

    const h = this.head;

    if (!h) {
      if (this.tail) {
        throw new Error('tail should not be defined if there is no head.');
      }
      return null;
    }

    this.length--;
    this.lookup.delete(h.key);
    this.head = h.after || null;
    if (this.head) {
      this.head.before = null;
    }
    else {
      this.tail = null;
    }
    return h;
  }

  shift(): LinkedQueueValue {
    return this.deq.apply(this, arguments);
  }

  dequeue(): LinkedQueueValue {
    return this.deq.apply(this, arguments);
  }

  pop(): LinkedQueueValue {
    return this.removeLast.apply(this, arguments);
  }

  removeLast(): LinkedQueueValue {

    const t = this.tail;

    if (!t) {
      if (this.head) {
        throw new Error('head should not be defined if there is no tail.');
      }
      return null;
    }

    this.lookup.delete(t.key);
    this.tail = t.before || null;
    if (this.tail) {
      this.tail.after = null;
    }
    else {
      this.head = null;
    }
    return t;
  }

}

export const r2gSmokeTest = function () {
  return true;
};
