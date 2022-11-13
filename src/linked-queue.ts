'use strict';

import util = require('util');
import chalk from "chalk";

export const r2gSmokeTest = function () {
  return true;
};

export interface LinkedQueueValue<V, K = V> {
  after?: LinkedQueueValue<V>,
  before?: LinkedQueueValue<V>,
  value: V,
  key: any,
}

export type IteratorFunction<T, V> = (val: [T, V], index: number) => V;

const flattenDeep = (arr: Array<any>): Array<any> => {
  return Array.isArray(arr) ? arr.reduce((a, b) => [...flattenDeep(a), ...flattenDeep(b)], []) : [arr];
};

const IsVoidVal = Symbol('null result');

export const IsVoid = {
  check: (v: any) => v === IsVoidVal
}


export class LinkedQueue<V, K = V> {

  private lookup = new Map<K, LinkedQueueValue<V>>();
  private head: LinkedQueueValue<V> | null = null;
  private tail: LinkedQueueValue<V> = null;

  getComputedProperties() {
    return Object.assign({}, this, {
      lookup: {size: this.lookup.size}
    });
  }

  get size() {
    return this.lookup.size;
  }

  get length() {
    return this.lookup.size;
  }

  getLength(): number {
    return this.lookup.size;
  }

  getSize(): number {
    return this.lookup.size;
  }

  iterator() {
    return this;
  }

  getIterator() {
    return this;
  }

  [Symbol.iterator](): Iterator<[K, V]> {

    let v = this.head;

    return {

      next(): IteratorResult<[K, V], any> {

        if (!v) {
          return {value: null, done: true}
        }

        const {key, value} = v;
        v = v.after;

        return {
          value: [key, value],
          done: false
        }
      }
    }
  }


  reverseIterator() {

    return {
      [Symbol.iterator]: (): Iterator<[K, V]> => {

        let v = this.tail;

        return {

          next(): IteratorResult<[K, V], any> {

            const r: { done: boolean, value: [K, V] } = v ? {
              value: [v.key, v.value],
              // empty array [] means we are done,
              // since we return [] instead of null as a pattern here
              done: false
            } : {
              done: true,
              value: null
            }

            if (v) {
              v = v.before;
            }

            return r

          }
        }

      }
    }
  }

  dequeueIterator() {

    const self = this;

    return {
      [Symbol.iterator](): Iterator<[K, V]> {

        return {

          next(): IteratorResult<[K, V], any> {

            const d = self.dequeue() as [K, V];

            return {
              value: d,
              // empty array [] means we are done,
              // since we return [] instead of null as a pattern here
              done: d.length < 1
            }
          }
        }
      }
    }

  }

  getRandomKey() {
    const size = this.lookup.size;

    if (size < 1) {
      throw new Error('Cannot get random key from empty queue.')
    }

    const r = Math.floor(Math.random() * size);
    let i = 0;
    for (var k of this.lookup.keys()) {
      if (i === r) {
        break;
      }
      i++;
    }

    return k;
  }

  getRandomItem() : [K,V] | [typeof IsVoidVal] {
    try {
      var v = this.lookup.get(this.getRandomKey());
    } catch (err) {
      return [IsVoidVal];
    }
    return [v.key, v.value]
  }

  remove(k: K): [K, V] | [typeof IsVoidVal] {

    const v = this.lookup.get(k);
    this.lookup.delete(k);

    if (!v) {
      return [IsVoidVal];
    }

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

    return [v.key, v.value];
  }

  contains(k: K): boolean {
    return Boolean(this.lookup.get(k));
  }

  get(k: K): ([K, V] | [typeof IsVoidVal]) {
    const v = this.lookup.get(k);
    return v ? [v.key, v.value] : [IsVoidVal];
  }

  peek(): [K, V] | [typeof IsVoidVal] {
    return !this.head ? [IsVoidVal] : [
      this.head.key,
      this.head.value
    ];
  }

  getOrderedList(): Array<[K,V]> {
    const ret: [K,V][] = [];
    let v = this.head;

    while (v) {
      ret.push([v.key,v.value]);
      v = v.after;
    }

    return ret;
  }

  map(fn: IteratorFunction<V, any>, ctx?: any): Array<any> {

    let v = this.head;
    let index = 0;
    ctx = ctx || null;

    const ret: Array<any> = [];

    while (v) {
      ret.push(fn.call(ctx, [v.key, v.value], index++));
      v = v.after;
    }

    return ret;
  }

  filter(fn: IteratorFunction<V, boolean>, ctx?: any): [K, V][] {

    let v = this.head;
    let index = 0;
    ctx = ctx || null;

    const ret: [K, V][] = [];

    while (v) {
      if (fn.call(ctx, [v.key, v.value], index++)) {
        ret.push([v.key, v.value]);
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

  first(): ([K, V] | [typeof IsVoidVal]) {
    return !this.head ? [IsVoidVal] : [
      this.head.key,
      this.head.value
    ]
  }

  last(): ([K, V] | [typeof IsVoidVal]) {
    return !this.tail ? [IsVoidVal] : [
      this.tail.key,
      this.tail.value
    ]
  }

  getReverseOrderedList(): Array<LinkedQueueValue<V>> {

    const ret: LinkedQueueValue<V>[] = [];
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

    const v = <LinkedQueueValue<V>>{
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

  }

  enq<K, V>(...args: Array<[K, V]>): void {
    for (let v of args) {
      this.enqueue(v[0], v[1])
    }
  }

  enqueue(k: any, val?: any): void {

    if (arguments.length < 1) {
      throw new Error(`Please pass an argument to '${this.enqueue.name}()'.`);
    }

    if (arguments.length === 1) {
      val = k;
    }

    if (this.lookup.get(k)) {
      throw new Error(
        chalk.magenta(
          `The following object/value already exists in the queue. ${util.inspect(this.lookup.get(k).key).slice(0, 100)}. `) +
        chalk.magenta.bold(
          `Either remove the already enqueued item, or pass a unique value as the first argument to '${this.enq.name || 'unknown'}()'.`));
    }

    const v = <LinkedQueueValue<V>>{
      key: k,
      value: val,
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

  }


  forEach(fn: IteratorFunction<V, void>, ctx?: any): this {
    let v = this.head;
    let index = 0;
    ctx = ctx || null;

    while (v) {
      fn.call(ctx, [v.key, v.value], index++);
      v = v.after;
    }
    return this;
  }

  dequeueEach(fn: IteratorFunction<V, void>, ctx?: any): this {

    let index = 0;
    ctx = ctx || null;

    while (this.head) {
      const h = this.head;
      this.lookup.delete(this.head.key);
      this.head = this.head.after || null;
      if (this.head) {
        this.head.before = null;
      } else {
        this.tail = null;
      }
      fn.call(ctx, [h.key, h.value], index++);
    }

    return this;
  }

  deq(n: number) {
    //TODO update this to return the right sig
    if (!Number.isInteger(n)) {
      throw new Error('Must provide an integer as an argument to deq().');
    }
    if (n < 1) {
      throw new Error('Must provide a positive integer as an argument to deq().');
    }
    const items: LinkedQueueValue<V>[] = [];
    let v = true as any;
    while (v && items.length < n) {
      if ((v = this.dequeue())) {
        items.push(v);
      }
    }
    return items;
  }

  dequeue(): [K, V] | [typeof IsVoidVal] {
    const h = this.head;
    if (!h) {
      if (this.tail) {
        throw new Error('tail should not be defined if there is no head.');
      }
      return [IsVoidVal];
    }
    this.lookup.delete(h.key);
    this.head = h.after || null;
    if (this.head) {
      this.head.before = null;
    } else {
      this.tail = null;
    }
    return [
      h.key,
      h.value
    ];

  }

  removeLast(): ([K, V] | [typeof IsVoidVal]) {

    const t = this.tail;

    if (!t) {
      if (this.head) {
        throw new Error('head should not be defined if there is no tail.');
      }
      return [IsVoidVal];
    }

    this.lookup.delete(t.key);

    this.tail = t.before || null;

    if (this.tail) {
      this.tail.after = null;
    } else {
      this.head = null;
    }

    return [
      t.key,
      t.value
    ];
  }

}

