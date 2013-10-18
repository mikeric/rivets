var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __slice = [].slice,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

Rivets.Binding = (function() {
  function Binding(view, el, type, keypath, options) {
    this.view = view;
    this.el = el;
    this.type = type;
    this.keypath = keypath;
    this.options = options != null ? options : {};
    this.update = __bind(this.update, this);
    this.unbind = __bind(this.unbind, this);
    this.bind = __bind(this.bind, this);
    this.publish = __bind(this.publish, this);
    this.sync = __bind(this.sync, this);
    this.set = __bind(this.set, this);
    this.eventHandler = __bind(this.eventHandler, this);
    this.formattedValue = __bind(this.formattedValue, this);
    this.setObserver = __bind(this.setObserver, this);
    this.setBinder = __bind(this.setBinder, this);
    this.formatters = this.options.formatters || [];
    this.dependencies = [];
    this.setBinder();
    this.setObserver();
  }

  Binding.prototype.setBinder = function() {
    var identifier, regexp, value, _ref;
    if (!(this.binder = this.view.binders[this.type])) {
      _ref = this.view.binders;
      for (identifier in _ref) {
        value = _ref[identifier];
        if (identifier !== '*' && identifier.indexOf('*') !== -1) {
          regexp = new RegExp("^" + (identifier.replace('*', '.+')) + "$");
          if (regexp.test(this.type)) {
            this.binder = value;
            this.args = new RegExp("^" + (identifier.replace('*', '(.+)')) + "$").exec(this.type);
            this.args.shift();
          }
        }
      }
    }
    this.binder || (this.binder = this.view.binders['*']);
    if (this.binder instanceof Function) {
      return this.binder = {
        routine: this.binder
      };
    }
  };

  Binding.prototype.setObserver = function() {
    var _this = this;
    this.observer = new KeypathObserver(this.view, this.view.models, this.keypath, function(obs) {
      if (_this.key) {
        _this.unbind(true);
      }
      _this.model = obs.target;
      if (_this.key) {
        _this.bind(true);
      }
      return _this.sync();
    });
    this.key = this.observer.key;
    return this.model = this.observer.target;
  };

  Binding.prototype.formattedValue = function(value) {
    var args, formatter, id, _i, _len, _ref;
    _ref = this.formatters;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      formatter = _ref[_i];
      args = formatter.split(/\s+/);
      id = args.shift();
      formatter = this.view.formatters[id];
      if ((formatter != null ? formatter.read : void 0) instanceof Function) {
        value = formatter.read.apply(formatter, [value].concat(__slice.call(args)));
      } else if (formatter instanceof Function) {
        value = formatter.apply(null, [value].concat(__slice.call(args)));
      }
    }
    return value;
  };

  Binding.prototype.eventHandler = function(fn) {
    var binding, handler;
    handler = (binding = this).view.config.handler;
    return function(ev) {
      return handler.call(fn, this, ev, binding);
    };
  };

  Binding.prototype.set = function(value) {
    var _ref;
    value = value instanceof Function && !this.binder["function"] ? this.formattedValue(value.call(this.model)) : this.formattedValue(value);
    return (_ref = this.binder.routine) != null ? _ref.call(this, this.el, value) : void 0;
  };

  Binding.prototype.sync = function() {
    return this.set(this.key ? this.view.adapters[this.key["interface"]].read(this.model, this.key.path) : this.model);
  };

  Binding.prototype.publish = function() {
    var args, formatter, id, value, _i, _len, _ref, _ref1, _ref2;
    value = Rivets.Util.getInputValue(this.el);
    _ref = this.formatters.slice(0).reverse();
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      formatter = _ref[_i];
      args = formatter.split(/\s+/);
      id = args.shift();
      if ((_ref1 = this.view.formatters[id]) != null ? _ref1.publish : void 0) {
        value = (_ref2 = this.view.formatters[id]).publish.apply(_ref2, [value].concat(__slice.call(args)));
      }
    }
    return this.view.adapters[this.key["interface"]].publish(this.model, this.key.path, value);
  };

  Binding.prototype.bind = function(silent) {
    var dependency, key, observer, _i, _len, _ref, _ref1, _ref2, _results,
      _this = this;
    if (silent == null) {
      silent = false;
    }
    if (!silent) {
      if ((_ref = this.binder.bind) != null) {
        _ref.call(this, this.el);
      }
    }
    if (this.key) {
      this.view.adapters[this.key["interface"]].subscribe(this.model, this.key.path, this.sync);
    }
    if (!silent ? this.view.config.preloadData : void 0) {
      this.sync();
    }
    if ((_ref1 = this.options.dependencies) != null ? _ref1.length : void 0) {
      _ref2 = this.options.dependencies;
      _results = [];
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        dependency = _ref2[_i];
        observer = new KeypathObserver(this.view, this.model, dependency, function(obs, prev) {
          var key;
          key = obs.key;
          _this.view.adapters[key["interface"]].unsubscribe(prev, key.path, _this.sync);
          _this.view.adapters[key["interface"]].subscribe(obs.target, key.path, _this.sync);
          return _this.sync();
        });
        key = observer.key;
        this.view.adapters[key["interface"]].subscribe(observer.target, key.path, this.sync);
        _results.push(this.dependencies.push(observer));
      }
      return _results;
    }
  };

  Binding.prototype.unbind = function(silent) {
    var key, obs, _i, _len, _ref, _ref1;
    if (silent == null) {
      silent = false;
    }
    if (!silent) {
      if ((_ref = this.binder.unbind) != null) {
        _ref.call(this, this.el);
      }
    }
    if (this.key) {
      this.view.adapters[this.key["interface"]].unsubscribe(this.model, this.key.path, this.sync);
    }
    if (this.dependencies.length) {
      _ref1 = this.dependencies;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        obs = _ref1[_i];
        key = obs.key;
        this.view.adapters[key["interface"]].unsubscribe(obs.target, key.path, this.sync);
      }
      return this.dependencies = [];
    }
  };

  Binding.prototype.update = function(models) {
    var _ref;
    if (models == null) {
      models = {};
    }
    return (_ref = this.binder.update) != null ? _ref.call(this, models) : void 0;
  };

  return Binding;

})();

Rivets.ComponentBinding = (function(_super) {
  __extends(ComponentBinding, _super);

  function ComponentBinding(view, el, type) {
    var attribute, _i, _len, _ref, _ref1;
    this.view = view;
    this.el = el;
    this.type = type;
    this.unbind = __bind(this.unbind, this);
    this.bind = __bind(this.bind, this);
    this.update = __bind(this.update, this);
    this.locals = __bind(this.locals, this);
    this.component = Rivets.components[this.type];
    this.attributes = {};
    this.inflections = {};
    _ref = this.el.attributes || [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      attribute = _ref[_i];
      if (_ref1 = attribute.name, __indexOf.call(this.component.attributes, _ref1) >= 0) {
        this.attributes[attribute.name] = attribute.value;
      } else {
        this.inflections[attribute.name] = attribute.value;
      }
    }
  }

  ComponentBinding.prototype.sync = function() {};

  ComponentBinding.prototype.locals = function(models) {
    var inverse, key, model, path, result, _i, _len, _ref, _ref1;
    if (models == null) {
      models = this.view.models;
    }
    result = {};
    _ref = this.inflections;
    for (key in _ref) {
      inverse = _ref[key];
      _ref1 = inverse.split('.');
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        path = _ref1[_i];
        result[key] = (result[key] || models)[path];
      }
    }
    for (key in models) {
      model = models[key];
      if (result[key] == null) {
        result[key] = model;
      }
    }
    return result;
  };

  ComponentBinding.prototype.update = function(models) {
    var _ref;
    return (_ref = this.componentView) != null ? _ref.update(this.locals(models)) : void 0;
  };

  ComponentBinding.prototype.bind = function() {
    var el, _ref;
    if (this.componentView != null) {
      return (_ref = this.componentView) != null ? _ref.bind() : void 0;
    } else {
      el = this.component.build.call(this.attributes);
      (this.componentView = new Rivets.View(el, this.locals(), this.view.options)).bind();
      return this.el.parentNode.replaceChild(el, this.el);
    }
  };

  ComponentBinding.prototype.unbind = function() {
    var _ref;
    return (_ref = this.componentView) != null ? _ref.unbind() : void 0;
  };

  return ComponentBinding;

})(Rivets.Binding);

Rivets.TextBinding = (function(_super) {
  __extends(TextBinding, _super);

  function TextBinding(view, el, type, keypath, options) {
    this.view = view;
    this.el = el;
    this.type = type;
    this.keypath = keypath;
    this.options = options != null ? options : {};
    this.sync = __bind(this.sync, this);
    this.formatters = this.options.formatters || [];
    this.dependencies = [];
    this.setObserver();
  }

  TextBinding.prototype.binder = {
    routine: function(node, value) {
      return node.data = value != null ? value : '';
    }
  };

  TextBinding.prototype.sync = function() {
    return TextBinding.__super__.sync.apply(this, arguments);
  };

  return TextBinding;

})(Rivets.Binding);
