'use strict';

export class SimpleQueue {

  // this is a queue implemented with a Map instance, but without a doubly-linked list

  lookup = new Map<number, any>();
  first = 0;
  last = 0;
  elementExists = false;

  constructor(){

    Object.defineProperty(this, 'length', {
      get:  () => {
        return this.lookup.size;
      }
    });

  }

  peek() {
    return this.lookup.get(this.first);
  }

  getByRawIndex(v: number) {
    return this.lookup.get(v);
  }

  getByIndex(v: number) {

    if (!Number.isInteger(v)) {
      throw new Error('Argument must be an integer.');
    }

    return this.lookup.get(v + this.first);
  }

  getLength() {
    return this.lookup.size;
  }

  getSize() {
    return this.lookup.size;
  }

  pop() {

    const last = this.last;

    if (this.elementExists && this.first === this.last) {
      this.elementExists = false;
    }
    else if (this.last > this.first) {
      this.last--;
    }

    const v = this.lookup.get(last);
    this.lookup.delete(last);
    return v;
  }

  shift() {

    const first = this.first;

    if (this.elementExists && this.first === this.last) {
      this.elementExists = false;
    }
    else if (this.first < this.last) {
      this.first++;
    }

    const v = this.lookup.get(first);
    this.lookup.delete(first);
    return v;
  }

  push(v: any) {

    if (this.elementExists && this.first === this.last) {
      this.last++;
    }
    else if (this.first === this.last) {
      this.elementExists = true;
    }
    else {
      this.last++;
    }

    return this.lookup.set(this.last, v);

  }

  enq(v: any) {
    return this.push.apply(this, arguments);
  }

  enqueue(v: any) {
    return this.push.apply(this, arguments);
  }

  deq() {
    return this.shift.apply(this, arguments);
  }

  dequeue() {
    return this.shift.apply(this, arguments);
  }

  unshift(v: any) {

    if (this.elementExists && this.first === this.last) {
      this.first--;
    }
    else if (this.first === this.last) {
      this.elementExists = true;
    }
    else {
      this.first--;
    }

    return this.lookup.set(this.first, v);
  }

  addToFront(v: any) {
    return this.unshift.apply(this, arguments);
  }

  removeAll() {
    return this.clear.apply(this, arguments);
  }

  clear(): void {
    this.elementExists = false;
    this.first = 0;
    this.last = 0;
    this.lookup.clear();
  }

}
