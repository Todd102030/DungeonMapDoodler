"use strict";
/**
 * Thin wrapper around Array, so the indexOn method is stored here and searching
 * is built in, also wrapperFunc is for a method to enhance json data object
 * with methods.
 */
var KeyedArray = (function(indexOn, wrapperFunc) {
  var Constructor = function(indexOn, wrapperFunc) {
    this.values = [];
    this.keyFn = indexOn;
    this.wrapFn = wrapperFunc || function(r) {return r;};
    if (typeof (indexOn) == "string") {
      this.keyFn = function(o) {
        return o == null ? "" : o[indexOn] || "";
      };
    }
  };
  Constructor.prototype = {
    constructor : KeyedArray,
    /** adds an entry or an array of entries - DOES not check keys */
    add : function(newEntry) {
      if (newEntry == undefined) {
        return;
      }
      var wrap = this.wrapFn;
      var vals = this.values;
      if (newEntry.splice) {
        newEntry.forEach(function(r) {
          var wrapped = wrap(r);
          vals.push(wrapped);
        });
      } else {
        var wrapped = wrap(newEntry);
        vals.push(wrapped);
      }
    },
    /**
     * applies passed function to all elements, optionally, retains function as
     * this.wrapFn to be applied to subsequent additions
     */
    apply : function(func, optionalBooleanRetain) {
      var a = this.values;
      for (var i = 0, z = a.length; i < z; i++) {
        a[i] = func(a[i]);
      }
      if (optionalBooleanRetain) {
        this.wrapFn = func;
      }
    },
    /** clears elements */
    clear : function() {
      this.values = [];
    },
    copy : function() {
      var that = new KeyedArray(this.keyFn, this.wrapFn);
      that.add(this.values.slice());
      return that;
    },
    /**
     * returns an array of elements where filterFunction(element)==true <br>
     * sorts result by comparator if comparator is not null
     */
    filter : function(filterFunction, comparator) {
      var result = filterFunction == null ? this.values.slice() : this.values.filter(filterFunction);
      if (comparator != null) {
        result.sort(comparator);
      }
      return result;
    },
    /**
     * returns boolean, whether any element has been found that evaluates
     * checkFunction(e) to true
     */
    findOne : function(checkFunction) {
      return -1 < this.values.findIndex(checkFunction);
    },
    /**
     * executes passed function on all elements of this.values
     */
    forEach : function(func) {
      this.values.forEach(func);
    },
    /** return element with passed key, or null if not found */
    get : function(k) {
      var kfn = this.keyFn;
      return this.values.find(function(r) {
        return k == kfn(r);
      });
    },
    /** returns element at the passed index */
    getAt : function(index) {
      return this.values[index];
    },
    /** return the index at which the key is found, or -1 */
    indexOf : function(searchKey) {
      var kfn = this.keyFn;
      return this.values.findIndex(function(r) {
        return searchKey == kfn(r);
      });
    },
    /** removes element for key passed */
    remove : function(k) {
      var idx = this.indexOf(k);
      if (idx > -1) {
        this.values.splice(idx, 1);
      }
    },
    /** KeyedArray.set  sets an entry after it may have been changed */
    set : function(entry) {
      var r = this.wrapFn(entry);
      var idx = this.indexOf(this.keyFn(r));
      if (idx > -1) {
        this.values.splice(idx, 1, r);
      } else {
        this.values.push(r);
      }
    },
    /** returns this.values.length */
    size : function() {
      return this.values.length;
    },
    /** @return array of elements sorted by comparator */
    sort : function(comparator) {
      var result = this.values.slice(0);
      result.sort(comparator);
      return result;
    },
    /** sorts this.values by comparator */
    sortInPlace : function(comparator) {
      this.values.sort(comparator);
    },
    /** KeyedArray.toJSON should provide custom output for JSON.stringify */
    toJSON : function() {
      return this.values;
    },
    zzkeyedarray : 0
  };
  return Constructor;
})();