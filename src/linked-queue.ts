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

export type IteratorFunction<T, V> = (val: LinkedQueueValue<T>, index: number) => V;

const flattenDeep = (arr: Array<any>): Array<any> => {
  return Array.isArray(arr) ? arr.reduce((a, b) => [...flattenDeep(a), ...flattenDeep(b)], []) : [arr];
};

export class LinkedQueue<T, K = any> {

  private lookup = new Map<K, LinkedQueueValue<T>>();
  private head = null as any;
  private tail = null as any;
  public length: number;

  constructor() {

    Object.defineProperty(this, 'length', {
      get: () => {
        return this.lookup.size;
      }
    });

  }

  getLength(): number {
    return this.lookup.size;
  }

  getSize(): number {
    return this.lookup.size;
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

  remove(k: any): LinkedQueueValue<T> {

    const v = this.lookup.get(k);

    if (v) {

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

  get(k: any): LinkedQueueValue<T> {
    return this.lookup.get(k);
  }

  peek(): LinkedQueueValue<T> {
    return this.head;
  }

  getOrderedList(): Array<LinkedQueueValue<T>> {
    const ret: LinkedQueueValue<T>[] = [];

    let v = this.head;

    while (v) {
      ret.push(v);
      v = v.after;
    }

    return ret;
  }

  static getKeyValue(v: LinkedQueueValue<any>) {
    return {
      key: v.key,
      value: v.value
    }
  }



  map(fn: IteratorFunction<T, any>, ctx?: any): Array<any> {

    let v = this.head;
    let index = 0;
    ctx = ctx || null;

    const ret: Array<any> = [];

    while (v) {
      ret.push(fn.call(ctx, LinkedQueue.getKeyValue(v), index++));
      v = v.after;
    }

    return ret;
  }

  filter(fn: IteratorFunction<T, boolean>, ctx?: any): LinkedQueueValue<T>[] {

    let v = this.head;
    let index = 0;
    ctx = ctx || null;

    const ret: LinkedQueueValue<T>[] = [];

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

  first(): LinkedQueueValue<T> {
    return this.head || null;
  }

  last(): LinkedQueueValue<T> {
    return this.tail || null;
  }

  getReverseOrderedList(): Array<LinkedQueueValue<T>> {

    const ret: LinkedQueueValue<T>[] = [];
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

    const v = <LinkedQueueValue<T>>{
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

  enq(...args: Array<any>) : void {
    for (let v of args) {
      v['key'] ? this.enqueue(v.key, v.value) : this.enqueue(v.value)
    }
  }

  deq(n: number) {
    if (!Number.isInteger(n)) {
      throw new Error('Must provide an integer as an argument to deq().');
    }
    if (n < 1) {
      throw new Error('Must provide a positive integer as an argument to deq().');
    }
    const items: LinkedQueueValue<T>[] = [];
    let v = true as any;
    while (v && items.length < n) {
      if (v = this.dequeue()) {
        items.push(v);
      }
    }
    return items;
  }

  forEach(fn: IteratorFunction<T, void>, ctx?: any): this {
    let v = this.head;
    let index = 0;
    ctx = ctx || null;

    while (v) {
      fn.call(ctx, LinkedQueue.getKeyValue(v), index++);
      v = v.after;
    }
    return this;
  }

  dequeueEach(fn: IteratorFunction<T, void>, ctx?: any): this {

    let index = 0;
    ctx = ctx || null;

    while (this.head) {
      fn.call(ctx, LinkedQueue.getKeyValue(this.head), index++);
      this.lookup.delete(this.head.key);
      this.head = this.head.after || null;
      if (this.head) {
        this.head.before = null;
      }
      else {
        this.tail = null;
      }
    }

    return this;
  }

  deueueAll(){
    throw 'not implemented yet  - should dequeu all items buffer all items onto an array and return the array.'
  }

  dequeue(): LinkedQueueValue<T> {
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
    }
    else {
      this.tail = null;
    }
    return h;
  }

  enqueue(k: any, obj?: any): void {

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

    const v = <LinkedQueueValue<T>>{
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

  }

  removeLast(): LinkedQueueValue<T> {

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

  shift(): LinkedQueueValue<T> {
    return this.dequeue.apply(this, arguments);
  }

  pop(): LinkedQueueValue<T> {
    return this.removeLast.apply(this, arguments);
  }

}

