
const {LinkedQueue} = require('../dist/linked-list');

const l2 = new LinkedQueue();

l2.enq('222');
l2.addToFront('foo');
l2.addToFront('zz');
l2.enq('kk');

l2.remove('foo');

debugger;

l2.remove('kk');

debugger;
l2.enq('ooo');

l2.enq('222');
l2.enq('222');
l2.addToFront('foo');
l2.addToFront('zz');
l2.enq('kk');

l2.remove('foo');

debugger;

l2.remove('kk');

debugger;
l2.enq('ooo');
l2.addToFront('foo');
l2.addToFront('zz');
l2.enq('222');
l2.addToFront('foo');
l2.addToFront('zz');
l2.enq('kk');

l2.remove('foo');

debugger;

l2.remove('kk');

debugger;
l2.enq('ooo');
l2.enq('kk');
l2.enq('222');
l2.addToFront('foo');
l2.addToFront('zz');
l2.enq('kk');

l2.remove('foo');

debugger;

l2.remove('kk');

debugger;
l2.enq('ooo');

l2.remove('foo');

debugger;

l2.remove('kk');

debugger;
l2.enq('ooo');

l2.enq('222');
l2.addToFront('foo');
l2.addToFront('zz');
l2.enq('222');
l2.addToFront('foo');
l2.addToFront('zz');
l2.enq('kk');

l2.remove('foo');

debugger;

l2.remove('kk');

debugger;
l2.enq('ooo');
l2.enq('kk');

l2.remove('foo');

debugger;

l2.remove('kk');
l2.enq('222');
l2.addToFront('foo');
l2.addToFront('zz');
l2.enq('kk');

l2.remove('foo');

debugger;

l2.remove('kk');

debugger;
l2.enq('ooo');

debugger;
l2.enq('ooo');

l2.enq('222');
l2.addToFront('foo');
l2.addToFront('zz');
l2.enq('222');
l2.addToFront('foo');
l2.addToFront('zz');
l2.enq('kk');

l2.remove('foo');

debugger;

l2.remove('kk');

debugger;
l2.enq('ooo');
l2.enq('kk');

l2.remove('foo');

debugger;

l2.remove('ooo');

debugger;
l2.enq('ooo');

l2.remove('ooo');

l2.clear();

debugger;
console.log(l2.getOrderedList().map(v => v.key));