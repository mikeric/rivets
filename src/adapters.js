var __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

Rivets.adapters['.'] = {
  id: '_rv',
  counter: 0,
  weakmap: {},
  weakReference: function(obj) {
    var id;
    if (obj[this.id] == null) {
      id = this.counter++;
      this.weakmap[id] = {
        callbacks: {}
      };
      Object.defineProperty(obj, this.id, {
        value: id
      });
    }
    return this.weakmap[obj[this.id]];
  },
  stubFunction: function(obj, fn) {
    var map, original, weakmap;
    original = obj[fn];
    map = this.weakReference(obj);
    weakmap = this.weakmap;
    return obj[fn] = function() {
      var callback, k, r, response, _i, _len, _ref, _ref1, _ref2, _ref3;
      response = original.apply(obj, arguments);
      _ref = map.pointers;
      for (r in _ref) {
        k = _ref[r];
        _ref3 = (_ref1 = (_ref2 = weakmap[r]) != null ? _ref2.callbacks[k] : void 0) != null ? _ref1 : [];
        for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
          callback = _ref3[_i];
          callback();
        }
      }
      return response;
    };
  },
  observeMutations: function(obj, ref, keypath) {
    var fn, functions, map, _base, _i, _len;
    if (Array.isArray(obj)) {
      map = this.weakReference(obj);
      if (map.pointers == null) {
        map.pointers = {};
        functions = ['push', 'pop', 'shift', 'unshift', 'sort', 'reverse', 'splice'];
        for (_i = 0, _len = functions.length; _i < _len; _i++) {
          fn = functions[_i];
          this.stubFunction(obj, fn);
        }
      }
      if ((_base = map.pointers)[ref] == null) {
        _base[ref] = [];
      }
      if (__indexOf.call(map.pointers[ref], keypath) < 0) {
        return map.pointers[ref].push(keypath);
      }
    }
  },
  unobserveMutations: function(obj, ref, keypath) {
    var keypaths, _ref;
    if (Array.isArray(obj && (obj[this.id] != null))) {
      if (keypaths = (_ref = this.weakReference(obj).pointers) != null ? _ref[ref] : void 0) {
        return keypaths.splice(keypaths.indexOf(keypath), 1);
      }
    }
  },
  subscribe: function(obj, keypath, callback) {
    var callbacks, value,
      _this = this;
    callbacks = this.weakReference(obj).callbacks;
    if (callbacks[keypath] == null) {
      callbacks[keypath] = [];
      value = obj[keypath];
      Object.defineProperty(obj, keypath, {
        get: function() {
          return value;
        },
        set: function(newValue) {
          var _i, _len, _ref;
          if (newValue !== value) {
            value = newValue;
            _ref = callbacks[keypath];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              callback = _ref[_i];
              callback();
            }
            return _this.observeMutations(newValue, obj[_this.id], keypath);
          }
        }
      });
    }
    if (__indexOf.call(callbacks[keypath], callback) < 0) {
      callbacks[keypath].push(callback);
    }
    return this.observeMutations(obj[keypath], obj[this.id], keypath);
  },
  unsubscribe: function(obj, keypath, callback) {
    var callbacks;
    callbacks = this.weakmap[obj[this.id]].callbacks[keypath];
    callbacks.splice(callbacks.indexOf(callback), 1);
    return this.unobserveMutations(obj[keypath], obj[this.id], keypath);
  },
  read: function(obj, keypath) {
    return obj[keypath];
  },
  publish: function(obj, keypath, value) {
    return obj[keypath] = value;
  }
};
