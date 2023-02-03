// class MyIterable {
//
//   val = 1;
//
//   iterator(v: any){
//
//     return {
//       [Symbol.iterator]() {
//
//         return {
//           next: () => {
//             const {a,b,c} = v; // get new ref to abc if they change
//             return {
//               done: this.val > 3,
//               value: this.val++
//             }
//           }
//         }
//       }
//     }
//   }
//
// }
//
// const z = {a: 3, b: 4, c: 5}
// for(const v of new MyIterable().iterator(z)){
//   z.a = 4;
//   console.log(v);
// }
//
//
// const generate = function*(iterator: Iterator<any>, a: number, b: number, c: number ) {
//
//   while(1){
//     const {done,value} = iterator.next.apply(iterator,[a,b,c]);
//     if(done){
//       return;
//     }
//     yield value;
//   }
//
// };
//
// const m = new MyIterable();
// // const z = ;
//
// for(const v of generate(m.iterator(5)[Symbol.iterator](), 3,4,5)){
//   console.log(v);
// }
//
// for(const v of generate(m.iterator(5)[Symbol.iterator](), 3,4,5)){
//   console.log(v);
// }
// throw 'age'

// class MyQueue {
//
//   vals = [1,2,3];
//   indexOfFirst = 0;
//
//   shift(){
//     const val = this.vals[this.indexOfFirst];
//     delete this.vals[this.indexOfFirst];
//     this.indexOfFirst++;
//     return val;
//   }
//
//   unshift(val: any){
//     this.indexOfFirst--;
//     this.vals[this.indexOfFirst] = val;
//   }
//
//   pop(){
//     return this.vals.pop()
//   }
//
//   push(v: any){
//     return this.vals.push(v);
//   }
//
// }
//
// const q = new MyQueue();
//
// const one =q.shift();
// const two =q.shift();
// console.log({one,two});
// q.unshift(8);
//
// q.push('4')
// q.unshift(4);
// q.unshift(5);
// q.unshift(6);
// const oo = q.shift();
// console.log({oo,q});
//
// console.log(q.vals[0]);
// console.log(q.vals[-1]);
// console.log(q.vals[-2]);
//
// throw 'agea'

class IterableWMapFilter<T> {

  vals: T[] = [];
  operations: Iterator<T>[] = []

  constructor(intialVals: T[]) {
    // add initial values
    for (const v in intialVals) { // faster than for..of, in theory
      this.vals.push(intialVals[v]);
    }
  }

  add(v: any) {
    this.vals.push(v);
  }

  map(fn: (val: number) => any): IterableWMapFilter<T> {

    const ret = new IterableWMapFilter(this.vals.slice(0));

    ret.operations = this.operations.concat(<any>{  // store new ref
      next(value: number, done: boolean) {

        if (done === true) {
          return {done: true, value: null} as any;
        }

        return {done: false, value: fn(value)}
      }
    });

    return ret;
  }

  filter(fn: (val: number) => any): IterableWMapFilter<T> {

    const ret = new IterableWMapFilter(this.vals.slice(0));

    ret.operations = this.operations.concat(<any>{ // store new ref
      next(val: any, done: boolean) {

        if (done === true) {
          return {done: true, value: null} as any;
        }

        if (Boolean(fn(val))) {
          return {done: false, value: val};
        } else {
          return {done: false, ignore: true};
        }
      }
    });

    return ret;
  }

  private next(): { done: boolean, value: any } {

    if (this.vals.length < 1) {
      return {done: true, value: null};
    }

    // using Array.prototype.shift() is O(N), (Array is a bad queue)
    let n: any = this.vals.shift();

    for (let v of this.operations) {
      const z = v.next(n);
      if ((z as any).ignore === true) {
        // ignore means its filtered out, so we get next value
        return this.next();
      }
      n = z.value; // reset n with new val
    }

    return {done: false, value: n};
  }

  [Symbol.iterator]() {
    return this;
  }

}


const v = new IterableWMapFilter<number>([1, 2, 3])
  .filter((v) => {
    // console.log('v in filter:', v);
    return true;
  })
  .map(v => {
    // console.log('v in map:', v);
    return v + 11;
  });

const z = v.filter((v) => {
  // console.log('v in filter:', v);
  return false;
});



v.add(4);
v.add(5);
v.add(6);

z.add(4);
z.add(5);
z.add(6);

for (let x of v) {
  console.log('result from v:', x);
}

for (let x of z) {
  console.log('result from z:', x);
}

// const iter = v.forEach((v) => {
//   console.log(v);
// });









