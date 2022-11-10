'use strict';

import util = require('util');
import chalk from "chalk";

export const r2gSmokeTest = function () {
  return true;
};

export interface LinkedQueueValue<T> {
  after?: LinkedQueueValue<T>,
  before?: LinkedQueueValue<T>,
  value: T,
  key: any,
}

export type IteratorFunction<T, V> = (val: [T,V], index: number) => V;

const flattenDeep = (arr: Array<any>): Array<any> => {
  return Array.isArray(arr) ? arr.reduce((a, b) => [...flattenDeep(a), ...flattenDeep(b)], []) : [arr];
};

export class LinkedQueue<V, K = any> {

  private lookup = new Map<K, LinkedQueueValue<V>>();
  private head = null as any;
  private tail = null as any;


  get size(){
    return this.lookup.size;
  }

  get length(){
    return this.lookup.size;
  }

  getLength(): number {
    return this.lookup.size;
  }

  getSize(): number {
    return this.lookup.size;
  }

  iterator(){
    return this;
  }

  getIterator(){
    return this;
  }

  [Symbol.iterator](): Iterator<[K, V]> {

    let v = this.head;

    return {

      next(): IteratorResult<[K, V], any> {

        if(!v){
          return {value: null, done:true}
        }

        const {key,value} = v;
        v = v.after;

        return {
          value: [key, value],
          done: false
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
    } catch (err) {
      return null;
    }
  }

  remove(k: K): [K, V] | null {

    const v = this.lookup.get(k);
    this.lookup.delete(k);

    if (!v) {
      return null;
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

  get(k: K): LinkedQueueValue<V> {
    return this.lookup.get(k);
  }

  peek(): [K, V] | null {
    return !this.head ? null : [
      this.head.key,
      this.head.val
    ];
  }

  getOrderedList(): Array<LinkedQueueValue<V>> {
    const ret: LinkedQueueValue<V>[] = [];

    let v = this.head;

    while (v) {
      ret.push(v);
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

  first(): [K, V] | null {
    return !this.head ? null : [
      this.head.key,
      this.head.value
    ]
  }

  last(): [K, V] | null {
    return !this.tail ? null : [
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

  enqueue(k: any, val: any): void {

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
      value: val,
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

  }

  deq(n: number) {
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
      fn.call(ctx, [this.head.key, this.head.value], index++);
      this.lookup.delete(this.head.key);
      this.head = this.head.after || null;
      if (this.head) {
        this.head.before = null;
      } else {
        this.tail = null;
      }
    }

    return this;
  }

  deueueAll() {
    throw 'not implemented yet  - should dequeue all items buffer all items onto an array and return the array.'
  }

  dequeue(): LinkedQueueValue<V> {
    const h = this.head;
    if (!h) {
      if (this.tail) {
        throw new Error('tail should not be defined if there is no head.');
      }
      return null;
    }
    this.lookup.delete(h.key);
    this.head = h.after || null;
    if (this.head) {
      this.head.before = null;
    } else {
      this.tail = null;
    }
    return h;
  }

  removeLast(): LinkedQueueValue<V> {

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
    } else {
      this.head = null;
    }

    return t;
  }

  // aliases

  clear() {
    return this.removeAll.apply(this, arguments);
  }

  unshift(k: any, obj?: any): void {
    return this.addToFront.apply(this, arguments);
  }

  push(k: any, obj?: any): void {
    return this.enqueue.apply(this, arguments);
  }

  add(k: any, obj?: any): void {
    return this.enqueue.apply(this, arguments);
  }

  shift(): LinkedQueueValue<V> {
    return this.dequeue.apply(this, arguments);
  }

  pop(): LinkedQueueValue<V> {
    return this.removeLast.apply(this, arguments);
  }

}

