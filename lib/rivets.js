// rivets.js
// version: 0.4.5
// author: Michael Richards
// license: MIT
(function() {
  var Rivets, bindEvent, getInputValue, rivets, unbindEvent,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __slice = [].slice,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  Rivets = {};

  if (!String.prototype.trim) {
    String.prototype.trim = function() {
      return this.replace(/^\s+|\s+$/g, '');
    };
  }

  Rivets.Binding = (function() {

    function Binding(el, type, model, keypath, options, bindContext) {
      var identifier, regexp, value, _ref;
      this.el = el;
      this.type = type;
      this.model = model;
      this.keypath = keypath;
      this.options = options != null ? options : {};
      this.bindContext = bindContext;
      this.unbind = __bind(this.unbind, this);

      this.bind = __bind(this.bind, this);

      this.publish = __bind(this.publish, this);

      this.sync = __bind(this.sync, this);

      this.set = __bind(this.set, this);

      this.formattedValue = __bind(this.formattedValue, this);

      if (!(this.binder = Rivets.binders[type])) {
        _ref = Rivets.binders;
        for (identifier in _ref) {
          value = _ref[identifier];
          if (identifier !== '*' && identifier.indexOf('*') !== -1) {
            regexp = new RegExp("^" + (identifier.replace('*', '.+')) + "$");
            if (regexp.test(type)) {
              this.binder = value;
              this.args = new RegExp("^" + (identifier.replace('*', '(.+)')) + "$").exec(type);
              this.args.shift();
            }
          }
        }
      }
      this.binder || (this.binder = Rivets.binders['*']);
      if (this.binder instanceof Function) {
        this.binder = {
          routine: this.binder
        };
      }
      this.formatters = this.options.formatters || [];
    }

    Binding.prototype.formattedValue = function(value) {
      var args, formatter, id, _i, _len, _ref;
      _ref = this.formatters;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        formatter = _ref[_i];
        args = formatter.split(/\s+/);
        id = args.shift();
        formatter = this.model[id] instanceof Function ? this.model[id] : Rivets.formatters[id];
        if ((formatter != null ? formatter.read : void 0) instanceof Function) {
          value = formatter.read.apply(formatter, [value].concat(__slice.call(args)));
        } else if (formatter instanceof Function) {
          value = formatter.apply(null, [value].concat(__slice.call(args)));
        }
      }
      return value;
    };

    Binding.prototype.set = function(value) {
      var _ref;
      value = value instanceof Function && !this.binder["function"] ? this.formattedValue(value.call(this.model)) : this.formattedValue(value);
      return (_ref = this.binder.routine) != null ? _ref.call(this, this.el, value) : void 0;
    };

    Binding.prototype.sync = function() {
      return this.set(this.options.bypass ? this.model[this.keypath] : Rivets.config.adapter.read(this.model, this.keypath));
    };

    Binding.prototype.publish = function() {
      var args, formatter, id, value, _i, _len, _ref, _ref1, _ref2;
      value = getInputValue(this.el);
      _ref = this.formatters.slice(0).reverse();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        formatter = _ref[_i];
        args = formatter.split(/\s+/);
        id = args.shift();
        if ((_ref1 = Rivets.formatters[id]) != null ? _ref1.publish : void 0) {
          value = (_ref2 = Rivets.formatters[id]).publish.apply(_ref2, [value].concat(__slice.call(args)));
        }
      }
      return Rivets.config.adapter.publish(this.model, this.keypath, value);
    };

    Binding.prototype.bind = function() {
      var dependency, keypath, model, _i, _len, _ref, _ref1, _ref2, _results;
      if ((_ref = this.binder.bind) != null) {
        _ref.call(this, this.el);
      }
      if (this.options.bypass) {
        this.sync();
      } else {
        Rivets.config.adapter.subscribe(this.model, this.keypath, this.sync);
        if (Rivets.config.preloadData) {
          this.sync();
        }
      }
      if ((_ref1 = this.options.dependencies) != null ? _ref1.length : void 0) {
        _ref2 = this.options.dependencies;
        _results = [];
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          dependency = _ref2[_i];
          if (/^\./.test(dependency)) {
            model = this.model;
            keypath = dependency.substr(1);
          } else {
            dependency = dependency.split('.');
            model = this.view.models[dependency.shift()];
            keypath = dependency.join('.');
          }
          _results.push(Rivets.config.adapter.subscribe(model, keypath, this.sync));
        }
        return _results;
      }
    };

    Binding.prototype.unbind = function() {
      var dependency, keypath, model, _i, _len, _ref, _ref1, _ref2, _results;
      if ((_ref = this.binder.unbind) != null) {
        _ref.call(this, this.el);
      }
      if (!this.options.bypass) {
        Rivets.config.adapter.unsubscribe(this.model, this.keypath, this.sync);
      }
      if ((_ref1 = this.options.dependencies) != null ? _ref1.length : void 0) {
        _ref2 = this.options.dependencies;
        _results = [];
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          dependency = _ref2[_i];
          if (/^\./.test(dependency)) {
            model = this.model;
            keypath = dependency.substr(1);
          } else {
            dependency = dependency.split('.');
            model = this.view.models[dependency.shift()];
            keypath = dependency.join('.');
          }
          _results.push(Rivets.config.adapter.unsubscribe(model, keypath, this.sync));
        }
        return _results;
      }
    };

    return Binding;

  })();

  Rivets.View = (function() {

    function View(els, models) {
      this.els = els;
      this.models = models;
      this.publish = __bind(this.publish, this);

      this.sync = __bind(this.sync, this);

      this.unbind = __bind(this.unbind, this);

      this.bind = __bind(this.bind, this);

      this.select = __bind(this.select, this);

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
      var bindingRegExp, el, node, parse, skipNodes, _i, _j, _len, _len1, _ref, _ref1,
        _this = this;
      this.bindings = [];
      skipNodes = [];
      bindingRegExp = this.bindingRegExp();
      parse = function(node) {
        var attribute, attributes, binder, binding, context, ctx, dependencies, identifier, keypath, model, n, options, path, pipe, pipes, regexp, splitPath, type, value, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2, _ref3;
        if (__indexOf.call(skipNodes, node) < 0) {
          _ref = node.attributes;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            attribute = _ref[_i];
            if (bindingRegExp.test(attribute.name)) {
              type = attribute.name.replace(bindingRegExp, '');
              if (!(binder = Rivets.binders[type])) {
                _ref1 = Rivets.binders;
                for (identifier in _ref1) {
                  value = _ref1[identifier];
                  if (identifier !== '*' && identifier.indexOf('*') !== -1) {
                    regexp = new RegExp("^" + (identifier.replace('*', '.+')) + "$");
                    if (regexp.test(type)) {
                      binder = value;
                    }
                  }
                }
              }
              binder || (binder = Rivets.binders['*']);
              if (binder.block) {
                _ref2 = node.getElementsByTagName('*');
                for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
                  n = _ref2[_j];
                  skipNodes.push(n);
                }
                attributes = [attribute];
              }
            }
          }
          _ref3 = attributes || node.attributes;
          for (_k = 0, _len2 = _ref3.length; _k < _len2; _k++) {
            attribute = _ref3[_k];
            if (bindingRegExp.test(attribute.name)) {
              options = {};
              type = attribute.name.replace(bindingRegExp, '');
              pipes = (function() {
                var _l, _len3, _ref4, _results;
                _ref4 = attribute.value.split('|');
                _results = [];
                for (_l = 0, _len3 = _ref4.length; _l < _len3; _l++) {
                  pipe = _ref4[_l];
                  _results.push(pipe.trim());
                }
                return _results;
              })();
              context = (function() {
                var _l, _len3, _ref4, _results;
                _ref4 = pipes.shift().split('<');
                _results = [];
                for (_l = 0, _len3 = _ref4.length; _l < _len3; _l++) {
                  ctx = _ref4[_l];
                  _results.push(ctx.trim());
                }
                return _results;
              })();
              path = context.shift();
              splitPath = path.split(/\.|:/);
              options.formatters = pipes;
              options.bypass = path.indexOf(':') !== -1;
              if (splitPath[0]) {
                model = _this.models[splitPath.shift()];
              } else {
                model = _this.models;
                splitPath.shift();
              }
              keypath = splitPath.join('.');
              if (model) {
                if (dependencies = context.shift()) {
                  options.dependencies = dependencies.split(/\s+/);
                }
                binding = new Rivets.Binding(node, type, model, keypath, options, _this.models);
                binding.view = _this;
                _this.bindings.push(binding);
              }
            }
          }
          if (attributes) {
            attributes = null;
          }
        }
      };
      _ref = this.els;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        el = _ref[_i];
        parse(el);
        _ref1 = el.getElementsByTagName('*');
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          node = _ref1[_j];
          if (node.attributes != null) {
            parse(node);
          }
        }
      }
    };

    View.prototype.select = function(fn) {
      var binding, _i, _len, _ref, _results;
      _ref = this.bindings;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        binding = _ref[_i];
        if (fn(binding)) {
          _results.push(binding);
        }
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

    View.prototype.sync = function() {
      var binding, _i, _len, _ref, _results;
      _ref = this.bindings;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        binding = _ref[_i];
        _results.push(binding.sync());
      }
      return _results;
    };

    View.prototype.publish = function() {
      var binding, _i, _len, _ref, _results;
      _ref = this.select(function(b) {
        return b.binder.publishes;
      });
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        binding = _ref[_i];
        _results.push(binding.publish());
      }
      return _results;
    };

    return View;

  })();

  bindEvent = function(el, event, handler, context, bindContext) {
    var fn;
    fn = function(e) {
      return handler.call(context, e, bindContext);
    };
    if (window.jQuery != null) {
      el = jQuery(el);
      if (el.on != null) {
        el.on(event, fn);
      } else {
        el.bind(event, fn);
      }
    } else if (window.addEventListener != null) {
      el.addEventListener(event, fn, false);
    } else {
      event = 'on' + event;
      el.attachEvent(event, fn);
    }
    return fn;
  };

  unbindEvent = function(el, event, fn) {
    if (window.jQuery != null) {
      el = jQuery(el);
      if (el.off != null) {
        return el.off(event, fn);
      } else {
        return el.unbind(event, fn);
      }
    } else if (window.removeEventListener) {
      return el.removeEventListener(event, fn, false);
    } else {
      event = 'on' + event;
      return el.detachEvent(event, fn);
    }
  };

  getInputValue = function(el) {
    var o, _i, _len, _results;
    switch (el.type) {
      case 'checkbox':
        return el.checked;
      case 'select-multiple':
        _results = [];
        for (_i = 0, _len = el.length; _i < _len; _i++) {
          o = el[_i];
          if (o.selected) {
            _results.push(o.value);
          }
        }
        return _results;
        break;
      default:
        return el.value;
    }
  };

  Rivets.binders = {
    enabled: function(el, value) {
      return el.disabled = !value;
    },
    disabled: function(el, value) {
      return el.disabled = !!value;
    },
    checked: {
      publishes: true,
      bind: function(el) {
        return this.currentListener = bindEvent(el, 'change', this.publish);
      },
      unbind: function(el) {
        return unbindEvent(el, 'change', this.currentListener);
      },
      routine: function(el, value) {
        if (el.type === 'radio') {
          return el.checked = el.value === value;
        } else {
          return el.checked = !!value;
        }
      }
    },
    unchecked: {
      publishes: true,
      bind: function(el) {
        return this.currentListener = bindEvent(el, 'change', this.publish);
      },
      unbind: function(el) {
        return unbindEvent(el, 'change', this.currentListener);
      },
      routine: function(el, value) {
        if (el.type === 'radio') {
          return el.checked = el.value !== value;
        } else {
          return el.checked = !value;
        }
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
    value: {
      publishes: true,
      bind: function(el) {
        return this.currentListener = bindEvent(el, 'change', this.publish);
      },
      unbind: function(el) {
        return unbindEvent(el, 'change', this.currentListener);
      },
      routine: function(el, value) {
        var o, _i, _len, _ref, _results;
        if (el.type === 'select-multiple') {
          if (value != null) {
            _results = [];
            for (_i = 0, _len = el.length; _i < _len; _i++) {
              o = el[_i];
              _results.push(o.selected = (_ref = o.value, __indexOf.call(value, _ref) >= 0));
            }
            return _results;
          }
        } else {
          return el.value = value != null ? value : '';
        }
      }
    },
    text: function(el, value) {
      if (el.innerText != null) {
        return el.innerText = value != null ? value : '';
      } else {
        return el.textContent = value != null ? value : '';
      }
    },
    "on-*": {
      "function": true,
      routine: function(el, value) {
        if (this.currentListener) {
          unbindEvent(el, this.args[0], this.currentListener);
        }
        return this.currentListener = bindEvent(el, this.args[0], value, this.model, this.bindContext);
      }
    },
    "each-*": {
      block: true,
      bind: function(el, collection) {
        return el.removeAttribute(['data', rivets.config.prefix, this.type].join('-').replace('--', '-'));
      },
      routine: function(el, collection) {
        var data, e, item, itemEl, m, n, previous, view, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2, _ref3, _results;
        if (this.iterated != null) {
          _ref = this.iterated;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            view = _ref[_i];
            view.unbind();
            _ref1 = view.els;
            for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
              e = _ref1[_j];
              e.parentNode.removeChild(e);
            }
          }
        } else {
          this.marker = document.createComment(" rivets: " + this.type + " ");
          el.parentNode.insertBefore(this.marker, el);
          el.parentNode.removeChild(el);
        }
        this.iterated = [];
        if (collection) {
          _results = [];
          for (_k = 0, _len2 = collection.length; _k < _len2; _k++) {
            item = collection[_k];
            data = {};
            _ref2 = this.view.models;
            for (n in _ref2) {
              m = _ref2[n];
              data[n] = m;
            }
            data[this.args[0]] = item;
            itemEl = el.cloneNode(true);
            if (this.iterated.length > 0) {
              previous = this.iterated[this.iterated.length - 1].els[0];
            } else {
              previous = this.marker;
            }
            this.marker.parentNode.insertBefore(itemEl, (_ref3 = previous.nextSibling) != null ? _ref3 : null);
            _results.push(this.iterated.push(rivets.bind(itemEl, data)));
          }
          return _results;
        }
      }
    },
    "class-*": function(el, value) {
      var elClass;
      elClass = " " + el.className + " ";
      if (!value === (elClass.indexOf(" " + this.args[0] + " ") !== -1)) {
        return el.className = value ? "" + el.className + " " + this.args[0] : elClass.replace(" " + this.args[0] + " ", ' ').trim();
      }
    },
    "*": function(el, value) {
      if (value) {
        return el.setAttribute(this.type, value);
      } else {
        return el.removeAttribute(this.type);
      }
    }
  };

  Rivets.config = {
    preloadData: true
  };

  Rivets.formatters = {};

  rivets = {
    binders: Rivets.binders,
    formatters: Rivets.formatters,
    config: Rivets.config,
    configure: function(options) {
      var property, value;
      if (options == null) {
        options = {};
      }
      for (property in options) {
        value = options[property];
        Rivets.config[property] = value;
      }
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
