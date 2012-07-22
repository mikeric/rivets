(function() {
  var Rivets, attributeBinding, bidirectionals, bindEvent, eventBinding, getInputValue, rivets, unbindEvent,
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

    function Binding(el, type, bindType, model, keypath, formatters) {
      this.el = el;
      this.type = type;
      this.bindType = bindType;
      this.model = model;
      this.keypath = keypath;
      this.formatters = formatters != null ? formatters : [];
      this.unbind = __bind(this.unbind, this);

      this.publish = __bind(this.publish, this);

      this.bind = __bind(this.bind, this);

      this.set = __bind(this.set, this);

      this.formattedValue = __bind(this.formattedValue, this);

      if (this.bindType === "event") {
        this.routine = eventBinding(this.type);
      } else {
        this.routine = Rivets.routines[this.type] || attributeBinding(this.type);
      }
    }

    Binding.prototype.formattedValue = function(value) {
      var args, formatter, id, _i, _len, _ref, _ref1;
      _ref = this.formatters;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        formatter = _ref[_i];
        args = formatter.split(/\s+/);
        id = args.shift();
        value = (_ref1 = Rivets.config.formatters)[id].apply(_ref1, [value].concat(__slice.call(args)));
      }
      return value;
    };

    Binding.prototype.set = function(value) {
      value = this.formattedValue(value);
      if (this.bindType === "event") {
        this.routine(this.el, value, this.currentListener);
        return this.currentListener = value;
      } else {
        return this.routine(this.el, value);
      }
    };

    Binding.prototype.bind = function() {
      Rivets.config.adapter.subscribe(this.model, this.keypath, this.set);
      if (Rivets.config.preloadData) {
        this.set(Rivets.config.adapter.read(this.model, this.keypath));
      }
      if (this.bindType === "bidirectional") {
        return bindEvent(this.el, 'change', this.publish);
      }
    };

    Binding.prototype.publish = function(e) {
      var el;
      el = e.target || e.srcElement;
      return Rivets.config.adapter.publish(this.model, this.keypath, getInputValue(el));
    };

    Binding.prototype.unbind = function() {
      Rivets.config.adapter.unsubscribe(this.model, this.keypath, this.set);
      if (this.bindType === "bidirectional") {
        return this.el.removeEventListener('change', this.publish);
      }
    };

    return Binding;

  })();

  Rivets.View = (function() {

    function View(el, models) {
      this.el = el;
      this.models = models;
      this.unbind = __bind(this.unbind, this);

      this.bind = __bind(this.bind, this);

      this.build = __bind(this.build, this);

      this.bindingRegExp = __bind(this.bindingRegExp, this);

      if (this.el.jquery) {
        this.el = this.el.get(0);
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
      var bindingRegExp, eventRegExp, node, parseNode, _i, _len, _ref, _results,
        _this = this;
      this.bindings = [];
      bindingRegExp = this.bindingRegExp();
      eventRegExp = /^on-/;
      parseNode = function(node) {
        var attribute, bindType, keypath, model, path, pipe, pipes, type, _i, _len, _ref, _results;
        _ref = node.attributes;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          attribute = _ref[_i];
          if (bindingRegExp.test(attribute.name)) {
            bindType = "attribute";
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
            path = pipes.shift().split('.');
            model = _this.models[path.shift()];
            keypath = path.join('.');
            if (eventRegExp.test(type)) {
              type = type.replace(eventRegExp, '');
              bindType = "event";
            } else if (__indexOf.call(bidirectionals, type) >= 0) {
              bindType = "bidirectional";
            }
            _results.push(_this.bindings.push(new Rivets.Binding(node, type, bindType, model, keypath, pipes)));
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      };
      parseNode(this.el);
      _ref = this.el.getElementsByTagName('*');
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        node = _ref[_i];
        _results.push(parseNode(node));
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
      return el.addEventListener(event, fn);
    } else {
      return el.attachEvent(event, fn);
    }
  };

  unbindEvent = function(el, event, fn) {
    if (window.removeEventListener) {
      return el.removeEventListener(event, fn);
    } else {
      return el.detachEvent(event, fn);
    }
  };

  getInputValue = function(el) {
    switch (el.type) {
      case 'text':
      case 'textarea':
      case 'password':
      case 'select-one':
      case 'radio':
        return el.value;
      case 'checkbox':
        return el.checked;
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

  bidirectionals = ['value', 'checked', 'unchecked'];

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
      return el.innerHTML = value || '';
    },
    value: function(el, value) {
      return el.value = value;
    },
    text: function(el, value) {
      if (el.innerText != null) {
        return el.innerText = value || '';
      } else {
        return el.textContent = value || '';
      }
    }
  };

  Rivets.config = {
    preloadData: true
  };

  rivets = {
    routines: Rivets.routines,
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
