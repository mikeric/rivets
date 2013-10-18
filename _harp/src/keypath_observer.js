var KeypathObserver,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

KeypathObserver = (function() {
  function KeypathObserver(view, model, keypath, callback) {
    this.view = view;
    this.model = model;
    this.keypath = keypath;
    this.callback = callback;
    this.realize = __bind(this.realize, this);
    this.update = __bind(this.update, this);
    this.parse = __bind(this.parse, this);
    this.parse();
    this.objectPath = [];
    this.target = this.realize();
  }

  KeypathObserver.prototype.parse = function() {
    var interfaces, k, path, root, v, _ref;
    interfaces = (function() {
      var _ref, _results;
      _ref = this.view.adapters;
      _results = [];
      for (k in _ref) {
        v = _ref[k];
        _results.push(k);
      }
      return _results;
    }).call(this);
    if (_ref = this.keypath[0], __indexOf.call(interfaces, _ref) >= 0) {
      root = this.keypath[0];
      path = this.keypath.substr(1);
    } else {
      root = this.view.config.rootInterface;
      path = this.keypath;
    }
    this.tokens = Rivets.KeypathParser.parse(path, interfaces, root);
    return this.key = this.tokens.pop();
  };

  KeypathObserver.prototype.update = function() {
    var next, prev;
    if ((next = this.realize()) !== this.target) {
      prev = this.target;
      this.target = next;
      return this.callback(this, prev);
    }
  };

  KeypathObserver.prototype.realize = function() {
    var current, index, prev, token, _i, _len, _ref;
    current = this.model;
    _ref = this.tokens;
    for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
      token = _ref[index];
      if (this.objectPath[index] != null) {
        if (current !== (prev = this.objectPath[index])) {
          this.view.adapters[token["interface"]].unsubscribe(prev, token.path, this.update);
          this.view.adapters[token["interface"]].subscribe(current, token.path, this.update);
          this.objectPath[index] = current;
        }
      } else {
        this.view.adapters[token["interface"]].subscribe(current, token.path, this.update);
        this.objectPath[index] = current;
      }
      current = this.view.adapters[token["interface"]].read(current, token.path);
    }
    return current;
  };

  return KeypathObserver;

})();
