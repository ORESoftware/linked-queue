export interface LinkedQueueValue {
  after: LinkedQueueValue,
  before: LinkedQueueValue,
  value: any,
  key: any,
}

export class LinkedQueue {
  
  private lookup = new Map<any, any>();
  private head = null as any;
  private tail = null as any;
  private length = 0;
  
  getLength(): number {
    return this.length;
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
      throw new Error('Please pass an argument.');
    }
    
    if (arguments.length === 1) {
      obj = k;
    }
    
    this.remove(k);
    
    const v = <LinkedQueueValue>{
      value: obj,
      key: k,
    };
    
    this.lookup.set(k, v);
    const h = this.head;
    
    if (h) {
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
      throw new Error('Please pass an argument.');
    }
    
    if (arguments.length === 1) {
      obj = k;
    }
    
    this.remove(k);
    
    const v = <LinkedQueueValue>{
      value: obj,
      key: k,
    };
    
    this.lookup.set(k, v);
    
    const t = this.tail;
    
    if (t) {
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
    return t;
  }
  
}