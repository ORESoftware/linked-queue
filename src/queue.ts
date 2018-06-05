export class Queue {

  lookup = new Map<number, any>();
  first = 0;
  last = 0;
  length = 0;
  hasElementAtZero = false;

  peek() {
    return this.lookup.get(this.first);
  }

  getByIndex(v: number) {
    return this.lookup.get(v);
  }

  pop() {
    const last = this.last;
    this.last = Math.max(this.first, --this.last);
    const v = this.lookup.get(last);
    this.lookup.delete(last);
    this.length = this.last - this.first;
    return v;
  }

  push(v: any) {

    if (this.length === 0) {
      if (this.first !== this.last) {
        throw new Error(`first should equal last => first => [${this.first}] and last => [${this.last}]`)
      }
      this.length = 1;
      return this.lookup.set(this.last, v);
    }

    this.length = (++this.last) - this.first;
    return this.lookup.set(this.last, v);
  }

  unshift(v: any) {

    if (this.length === 0) {
      if (this.first !== this.last) {
        throw new Error(`first should equal last => first => [${this.first}] and last => [${this.last}]`)
      }
      this.length = 1;
      return this.lookup.set(this.first, v);
    }

    this.length = this.last - (--this.first);
    return this.lookup.set(this.first, v);
  }

  shift() {
    const first = this.first;
    this.first = Math.min(this.last, ++this.first);
    const v = this.lookup.get(first);
    this.lookup.delete(first);
    this.length = this.last - this.first;
    return v;
  }

  getLength() {
    return this.length;
  }

}
