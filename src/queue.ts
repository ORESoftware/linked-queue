'use strict';

export class Queue {

  // this is a queue implemented with a Map instance, but without a doubly-linked list

  lookup = new Map<number, any>();
  first = 0;
  last = 0;
  length = 0;
  elementExists = false;

  peek() {
    return this.lookup.get(this.first);
  }

  getByIndex(v: number) {
    return this.lookup.get(v);
  }

  getLength() {
    return this.length;
  }

  pop() {

    const last = this.last;

    if (this.elementExists && this.first === this.last) {
      this.length--;
      this.elementExists = false;
    }
    else if (this.last > this.first) {
      this.length--;
      this.last--;
    }

    const v = this.lookup.get(last);
    this.lookup.delete(last);
    return v;
  }

  shift() {

    const first = this.first;

    if (this.elementExists && this.first === this.last) {
      this.length--;
      this.elementExists = false;
    }
    else if (this.first < this.last) {
      this.length--;
      this.first++;
    }

    const v = this.lookup.get(first);
    this.lookup.delete(first);
    return v;
  }

  push(v: any) {

    this.length++;

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

    this.length++;

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

  addToFront(v: any){
    return this.unshift.apply(this,arguments);
  }

  removeAll() {
    return this.clear.apply(this, arguments);
  }

  clear(): void {
    this.length = 0;
    this.elementExists = false;
    this.first = 0;
    this.last = 0;
    this.lookup.clear();
  }

}
