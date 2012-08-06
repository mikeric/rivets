// rivets.js
// version: 0.3.1
// author: Michael Richards
// license: MIT
(function() {
  var Rivets, attributeBinding, bindEvent, eventBinding, getInputValue, rivets, unbindEvent,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __slice = [].slice,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  Rivets = {};

  if (!String.prototype.trim) {
    String.prototype.trim = function() {
      return this.replace(/^\s+|\s+$/g, "");
    };
  }

  Rivets.Binding = (function() {

    function Binding(el, type, model, keypath, options) {
      this.el = el;
      this.type = type;
      this.model = model;
      this.keypath = keypath;
      this.options = options != null ? options : {};
      this.unbind = __bind(this.unbind, this);

      this.publish = __bind(this.publish, this);

      this.bind = __bind(this.bind, this);

      this.set = __bind(this.set, this);

      this.formattedValue = __bind(this.formattedValue, this);

      if (this.options.special === "event") {
        this.routine = eventBinding(this.type);
      } else {
        this.routine = Rivets.routines[this.type] || attributeBinding(this.type);
      }
      this.formatters = this.options.formatters || [];
    }

    Binding.prototype.bidirectionals = ['value', 'checked', 'unchecked'];

    Binding.prototype.formattedValue = function(value) {
      var args, formatter, id, _i, _len, _ref, _ref1, _ref2;
      _ref = this.formatters;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        formatter = _ref[_i];
        args = formatter.split(/\s+/);
        id = args.shift();
        value = this.model[id] instanceof Function ? (_ref1 = this.model)[id].apply(_ref1, [value].concat(__slice.call(args))) : Rivets.formatters[id] ? (_ref2 = Rivets.formatters)[id].apply(_ref2, [value].concat(__slice.call(args))) : void 0;
      }
      return value;
    };

    Binding.prototype.set = function(value) {
      value = this.formattedValue(value);
      if (this.options.special === "event") {
        this.routine(this.el, value, this.currentListener);
        return this.currentListener = value;
      } else {
        if (value instanceof Function) {
          value = value();
        }
        return this.routine(this.el, value);
      }
    };

    Binding.prototype.bind = function() {
      var callback, keypath, _i, _len, _ref, _ref1, _ref2,
        _this = this;
      if (this.options.bypass) {
        this.set(this.model[this.keypath]);
      } else {
        Rivets.config.adapter.subscribe(this.model, this.keypath, this.set);
        if (Rivets.config.preloadData) {
          this.set(Rivets.config.adapter.read(this.model, this.keypath));
        }
      }
      if ((_ref = this.options.dependencies) != null ? _ref.length : void 0) {
        this.dependencyCallbacks = {};
        _ref1 = this.options.dependencies;
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          keypath = _ref1[_i];
          callback = this.dependencyCallbacks[keypath] = function(value) {
            return _this.set(_this.options.bypass ? _this.model[_this.keypath] : Rivets.config.adapter.read(_this.model, _this.keypath));
          };
          Rivets.config.adapter.subscribe(this.model, keypath, callback);
        }
      }
      if (_ref2 = this.type, __indexOf.call(this.bidirectionals, _ref2) >= 0) {
        return bindEvent(this.el, 'change', this.publish);
      }
    };

    Binding.prototype.publish = function(e) {
      var el;
      el = e.target || e.srcElement;
      return Rivets.config.adapter.publish(this.model, this.keypath, getInputValue(el));
    };

    Binding.prototype.unbind = function() {
      var callback, keypath, _i, _len, _ref, _ref1, _ref2;
      Rivets.config.adapter.unsubscribe(this.model, this.keypath, this.set);
      if ((_ref = this.options.dependencies) != null ? _ref.length : void 0) {
        _ref1 = this.options.dependencies;
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          keypath = _ref1[_i];
          callback = this.dependencyCallbacks[keypath];
          Rivets.config.adapter.unsubscribe(this.model, keypath, callback);
        }
      }
      if (_ref2 = this.type, __indexOf.call(this.bidirectionals, _ref2) >= 0) {
        return this.el.removeEventListener('change', this.publish);
      }
    };

    return Binding;

  })();

  Rivets.View = (function() {

    function View(els, models) {
      this.els = els;
      this.models = models;
      this.unbind = __bind(this.unbind, this);

      this.bind = __bind(this.bind, this);

      this.build = __bind(this.build, this);

      this.bindingRegExp = __bind(this.bindingRegExp, this);

      if (!(this.els.jquery || this.els instanceof Array)) {
        this.els = [this.els];
      }
      this.build();
    }

    View.prototype.bindingRegExp = function() {
      var prefix;
      prefix = Rivets.config.prefix;
      if (prefix) {
        return new RegExp("^data-" + prefix + "-");
      } else {
        return /^data-/;
      }
    };

    View.prototype.build = function() {
      var bindingRegExp, el, eventRegExp, node, parseNode, _i, _len, _ref, _results,
        _this = this;
      this.bindings = [];
      bindingRegExp = this.bindingRegExp();
      eventRegExp = /^on-/;
      parseNode = function(node) {
        var attribute, context, ctx, dependencies, keypath, model, options, path, pipe, pipes, splitPath, type, _i, _len, _ref, _results;
        _ref = node.attributes;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          attribute = _ref[_i];
          if (bindingRegExp.test(attribute.name)) {
            options = {};
            type = attribute.name.replace(bindingRegExp, '');
            pipes = (function() {
              var _j, _len1, _ref1, _results1;
              _ref1 = attribute.value.split('|');
              _results1 = [];
              for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
                pipe = _ref1[_j];
                _results1.push(pipe.trim());
              }
              return _results1;
            })();
            context = (function() {
              var _j, _len1, _ref1, _results1;
              _ref1 = pipes.shift().split('>');
              _results1 = [];
              for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
                ctx = _ref1[_j];
                _results1.push(ctx.trim());
              }
              return _results1;
            })();
            path = context.shift();
            splitPath = path.split(/\.|:/);
            options.formatters = pipes;
            model = _this.models[splitPath.shift()];
            options.bypass = path.indexOf(":") !== -1;
            keypath = splitPath.join();
            if (dependencies = context.shift()) {
              options.dependencies = dependencies.split(/\s+/);
            }
            if (eventRegExp.test(type)) {
              type = type.replace(eventRegExp, '');
              options.special = "event";
            }
            _results.push(_this.bindings.push(new Rivets.Binding(node, type, model, keypath, options)));
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      };
      _ref = this.els;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        el = _ref[_i];
        parseNode(el);
        _results.push((function() {
          var _j, _len1, _ref1, _results1;
          _ref1 = el.getElementsByTagName('*');
          _results1 = [];
          for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
            node = _ref1[_j];
            _results1.push(parseNode(node));
          }
          return _results1;
        })());
      }
      return _results;
    };

    View.prototype.bind = function() {
      var binding, _i, _len, _ref, _results;
      _ref = this.bindings;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        binding = _ref[_i];
        _results.push(binding.bind());
      }
      return _results;
    };

    View.prototype.unbind = function() {
      var binding, _i, _len, _ref, _results;
      _ref = this.bindings;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        binding = _ref[_i];
        _results.push(binding.unbind());
      }
      return _results;
    };

    return View;

  })();

  bindEvent = function(el, event, fn) {
    if (window.addEventListener) {
      return el.addEventListener(event, fn, false);
    } else {
      event = "on" + event;
      return el.attachEvent(event, fn);
    }
  };

  unbindEvent = function(el, event, fn) {
    if (window.removeEventListener) {
      return el.removeEventListener(event, fn, false);
    } else {
      event = "on" + event;
      return el.detachEvent(event, fn);
    }
  };

  getInputValue = function(el) {
    switch (el.type) {
      case 'checkbox':
        return el.checked;
      default:
        return el.value;
    }
  };

  eventBinding = function(event) {
    return function(el, bind, unbind) {
      if (bind) {
        bindEvent(el, event, bind);
      }
      if (unbind) {
        return unbindEvent(el, event, unbind);
      }
    };
  };

  attributeBinding = function(attr) {
    return function(el, value) {
      if (value) {
        return el.setAttribute(attr, value);
      } else {
        return el.removeAttribute(attr);
      }
    };
  };

  Rivets.routines = {
    enabled: function(el, value) {
      return el.disabled = !value;
    },
    disabled: function(el, value) {
      return el.disabled = !!value;
    },
    checked: function(el, value) {
      if (el.type === 'radio') {
        return el.checked = el.value === value;
      } else {
        return el.checked = !!value;
      }
    },
    unchecked: function(el, value) {
      if (el.type === 'radio') {
        return el.checked = el.value !== value;
      } else {
        return el.checked = !value;
      }
    },
    show: function(el, value) {
      return el.style.display = value ? '' : 'none';
    },
    hide: function(el, value) {
      return el.style.display = value ? 'none' : '';
    },
    html: function(el, value) {
      return el.innerHTML = value != null ? value : '';
    },
    value: function(el, value) {
      return el.value = value != null ? value : '';
    },
    text: function(el, value) {
      if (el.innerText != null) {
        return el.innerText = value != null ? value : '';
      } else {
        return el.textContent = value != null ? value : '';
      }
    }
  };

  Rivets.config = {
    preloadData: true
  };

  Rivets.formatters = {};

  rivets = {
    routines: Rivets.routines,
    formatters: Rivets.formatters,
    config: Rivets.config,
    configure: function(options) {
      var property, value, _results;
      if (options == null) {
        options = {};
      }
      _results = [];
      for (property in options) {
        value = options[property];
        _results.push(Rivets.config[property] = value);
      }
      return _results;
    },
    bind: function(el, models) {
      var view;
      if (models == null) {
        models = {};
      }
      view = new Rivets.View(el, models);
      view.bind();
      return view;
    }
  };

  if (typeof module !== "undefined" && module !== null) {
    module.exports = rivets;
  } else {
    this.rivets = rivets;
  }

}).call(this);
