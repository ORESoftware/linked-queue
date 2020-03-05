'use strict';

export class BasicQueue {
  
  // this is a queue implemented with a POJSO as a map, but without a doubly-linked list
  // this is slightly more performant than doubly-linked list, but LESS performant than using a Map instance
  
  lookup = <{ [key: number]: any }>{};
  first = 0;
  last = 0;
  length = 0;
  elementExists = false;
  
  
  peek() {
    return this.lookup[this.first];
  }
  
  getByIndex(v: number) {
    return this.lookup[v];
  }
  
  getLength() {
    return this.length;
  }
  
  pop() {
    
    const last = this.last;
    
    if (this.elementExists && this.first === this.last) {
      this.length--;
      this.elementExists = false;
    } else if (this.last > this.first) {
      this.length--;
      this.last--;
    }
    
    const v = this.lookup[last];
    delete this.lookup[last];
    return v;
  }
  
  shift() {
    
    const first = this.first;
    
    if (this.elementExists && this.first === this.last) {
      this.length--;
      this.elementExists = false;
    } else if (this.first < this.last) {
      this.length--;
      this.first++;
    }
    
    const v = this.lookup[first];
    delete this.lookup[first];
    return v;
  }
  
  push(v: any) {
    
    this.length++;
    
    if (this.elementExists && this.first === this.last) {
      this.last++;
    } else if (this.first === this.last) {
      this.elementExists = true;
    } else {
      this.last++;
    }
    
    return this.lookup[this.last] = v;
  }
  
  unshift(v: any) {
    
    this.length++;
    
    if (this.elementExists && this.first === this.last) {
      this.first--;
    } else if (this.first === this.last) {
      this.elementExists = true;
    } else {
      this.first--;
    }
    
    return this.lookup[this.first] = v;
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
  
  
  addToFront(v: any) {
    return this.unshift.apply(this, arguments);
  }
  
  removeAll() {
    return this.clear.apply(this, arguments);
  }
  
  clear(): void {
    this.length = 0;
    this.elementExists = false;
    this.first = 0;
    this.last = 0;
    this.lookup = {};
  }
  
}
