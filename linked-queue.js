"use strict";
exports.__esModule = true;
var LinkedQueue = /** @class */ (function () {
    function LinkedQueue() {
        this.lookup = new Map();
        this.head = null;
        this.tail = null;
        this.length = 0;
    }
    LinkedQueue.prototype.getLength = function () {
        return this.length;
    };
    LinkedQueue.prototype.remove = function (k) {
        var v = this.lookup.get(k);
        if (v) {
            this.length--;
            this.lookup["delete"](k);
            var before = v.before;
            var after = v.after;
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
    };
    LinkedQueue.prototype.contains = function (k) {
        return Boolean(this.lookup.get(k));
    };
    LinkedQueue.prototype.get = function (k) {
        return this.lookup.get(k);
    };
    LinkedQueue.prototype.peek = function () {
        return this.head;
    };
    LinkedQueue.prototype.getOrderedList = function () {
        var ret = [];
        var v = this.head;
        while (v) {
            ret.push(v);
            v = v.after;
        }
        return ret;
    };
    LinkedQueue.prototype.getReverseOrderedList = function () {
        var ret = [];
        var v = this.tail;
        while (v) {
            ret.push(v);
            v = v.before;
        }
        return ret;
    };
    LinkedQueue.prototype.removeAll = function () {
        this.head = null;
        this.tail = null;
        this.lookup.clear();
        this.length = 0;
    };
    LinkedQueue.prototype.clear = function () {
        return this.removeAll.apply(this, arguments);
    };
    LinkedQueue.prototype.unshift = function (k, obj) {
        return this.addToFront.apply(this, arguments);
    };
    LinkedQueue.prototype.addToFront = function (k, obj) {
        if (arguments.length < 1) {
            throw new Error('Please pass an argument.');
        }
        if (arguments.length === 1) {
            obj = k;
        }
        this.remove(k);
        var v = {
            value: obj,
            key: k
        };
        this.lookup.set(k, v);
        var h = this.head;
        if (h) {
            h.before = v;
        }
        v.after = h || null;
        this.head = v;
        if (!this.tail) {
            this.tail = v;
        }
        this.length++;
    };
    LinkedQueue.prototype.enq = function (k, obj) {
        if (arguments.length < 1) {
            throw new Error('Please pass an argument.');
        }
        if (arguments.length === 1) {
            obj = k;
        }
        this.remove(k);
        var v = {
            value: obj,
            key: k
        };
        this.lookup.set(k, v);
        var t = this.tail;
        if (t) {
            t.after = v;
        }
        v.before = t || null;
        this.tail = v;
        if (!this.head) {
            this.head = v;
        }
        this.length++;
    };
    LinkedQueue.prototype.enqueue = function (k, obj) {
        return this.enq.apply(this, arguments);
    };
    LinkedQueue.prototype.deq = function () {
        var h = this.head;
        if (!h) {
            if (this.tail) {
                throw new Error('tail should not be defined if there is no head.');
            }
            return null;
        }
        this.length--;
        this.lookup["delete"](h.key);
        this.head = h.after || null;
        return h;
    };
    LinkedQueue.prototype.shift = function () {
        return this.deq.apply(this, arguments);
    };
    LinkedQueue.prototype.dequeue = function () {
        return this.deq.apply(this, arguments);
    };
    LinkedQueue.prototype.pop = function () {
        return this.removeLast.apply(this, arguments);
    };
    LinkedQueue.prototype.removeLast = function () {
        var t = this.tail;
        if (!t) {
            if (this.head) {
                throw new Error('head should not be defined if there is no tail.');
            }
            return null;
        }
        this.lookup["delete"](t.key);
        this.tail = t.before || null;
        return t;
    };
    return LinkedQueue;
}());
exports.LinkedQueue = LinkedQueue;
