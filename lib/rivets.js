(function() {
  var Rivets, attributeBinding, bidirectionals, bindEvent, eventBinding, getInputValue, rivets, unbindEvent,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
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
      this.publish = __bind(this.publish, this);

      this.bind = __bind(this.bind, this);

      this.set = __bind(this.set, this);

      if (this.bindType === "event") {
        this.routine = eventBinding(this.type);
      } else {
        this.routine = Rivets.routines[this.type] || attributeBinding(this.type);
      }
    }

    Binding.prototype.set = function(value) {
      var formatter, _i, _len, _ref;
      _ref = this.formatters;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        formatter = _ref[_i];
        value = Rivets.config.formatters[formatter](value);
      }
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

    return Binding;

  })();

  Rivets.View = (function() {

    function View(el, models) {
      this.el = el;
      this.models = models;
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
      var attribute, bindType, bindingRegExp, elements, eventRegExp, keypath, model, node, path, pipe, pipes, type, _i, _j, _len, _len1, _ref;
      this.bindings = [];
      bindingRegExp = this.bindingRegExp();
      eventRegExp = /^on-/;
      elements = [this.el];
      elements.concat(Array.prototype.slice.call(this.el.getElementsByTagName('*')));
      for (_i = 0, _len = elements.length; _i < _len; _i++) {
        node = elements[_i];
        _ref = node.attributes;
        for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
          attribute = _ref[_j];
          if (bindingRegExp.test(attribute.name)) {
            bindType = "attribute";
            type = attribute.name.replace(bindingRegExp, '');
            pipes = (function() {
              var _k, _len2, _ref1, _results;
              _ref1 = attribute.value.split('|');
              _results = [];
              for (_k = 0, _len2 = _ref1.length; _k < _len2; _k++) {
                pipe = _ref1[_k];
                _results.push(pipe.trim());
              }
              return _results;
            })();
            path = pipes.shift().split('.');
            model = this.models[path.shift()];
            keypath = path.join('.');
            if (eventRegExp.test(type)) {
              type = type.replace(eventRegExp, '');
              bindType = "event";
            } else if (__indexOf.call(bidirectionals, type) >= 0) {
              bindType = "bidirectional";
            }
            this.bindings.push(new Rivets.Binding(node, type, bindType, model, keypath, pipes));
          }
        }
      }
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
        return el.value;
      case 'checkbox':
      case 'radio':
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

  bidirectionals = ['value', 'checked', 'unchecked', 'selected', 'unselected'];

  Rivets.routines = {
    enabled: function(el, value) {
      return el.disabled = !value;
    },
    disabled: function(el, value) {
      return el.disabled = !!value;
    },
    checked: function(el, value) {
      return el.checked = !!value;
    },
    unchecked: function(el, value) {
      return el.checked = !value;
    },
    selected: function(el, value) {
      return el.selected = !!value;
    },
    unselected: function(el, value) {
      return el.selected = !value;
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
    register: function(identifier, routine) {
      return Rivets.routines[identifier] = routine;
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
