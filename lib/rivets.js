(function() {
  var Rivets, attributeBinding, bidirectionals, getInputValue, rivets,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = Object.prototype.hasOwnProperty,
    __indexOf = Array.prototype.indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (__hasProp.call(this, i) && this[i] === item) return i; } return -1; };

  Rivets = {};

  if (!String.prototype.trim) {
    String.prototype.trim = function() {
      return this.replace(/^\s+|\s+$/g, "");
    };
  }

  Rivets.Binding = (function() {

    function Binding(el, type, model, keypath, formatters) {
      this.el = el;
      this.type = type;
      this.model = model;
      this.keypath = keypath;
      this.formatters = formatters != null ? formatters : [];
      this.publish = __bind(this.publish, this);
      this.bind = __bind(this.bind, this);
      this.set = __bind(this.set, this);
      this.routine = Rivets.routines[this.type] || attributeBinding(this.type);
    }

    Binding.prototype.set = function(value) {
      var formatter, _i, _len, _ref;
      _ref = this.formatters;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        formatter = _ref[_i];
        value = Rivets.config.formatters[formatter](value);
      }
      return this.routine(this.el, value);
    };

    Binding.prototype.bind = function() {
      var _ref;
      Rivets.config.adapter.subscribe(this.model, this.keypath, this.set);
      if (Rivets.config.preloadData) {
        this.set(Rivets.config.adapter.read(this.model, this.keypath));
      }
      if (_ref = this.type, __indexOf.call(bidirectionals, _ref) >= 0) {
        if (window.addEventListener) {
          return this.el.addEventListener('change', this.publish);
        } else {
          return this.el.attachEvent('change', this.publish);
        }
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
      var attribute, bindingRegExp, keypath, model, node, path, pipe, pipes, type, _i, _len, _ref, _results;
      this.bindings = [];
      bindingRegExp = this.bindingRegExp();
      _ref = this.el.children();
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        node = _ref[_i];
        _results.push((function() {
          var _j, _len2, _ref2, _results2;
          _ref2 = node.attributes;
          _results2 = [];
          for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
            attribute = _ref2[_j];
            if (bindingRegExp.test(attribute.name)) {
              type = attribute.name.replace(bindingRegExp, '');
              pipes = (function() {
                var _k, _len3, _ref3, _results3;
                _ref3 = attribute.value.split('|');
                _results3 = [];
                for (_k = 0, _len3 = _ref3.length; _k < _len3; _k++) {
                  pipe = _ref3[_k];
                  _results3.push(pipe.trim());
                }
                return _results3;
              })();
              path = pipes.shift().split('.');
              model = this.models[path.shift()];
              keypath = path.join('.');
              _results2.push(this.bindings.push(new Rivets.Binding(node, type, model, keypath, pipes)));
            } else {
              _results2.push(void 0);
            }
          }
          return _results2;
        }).call(this));
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

    return View;

  })();

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
      if (options == null) options = {};
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
      if (models == null) models = {};
      view = new Rivets.View(el, models);
      view.bind();
      return view;
    }
  };

  if (typeof module !== "undefined" && module !== null) {
    module.exports = rivets;
  } else if (typeof define === 'function' && define.amd) {
    define(function() {
      return rivets;
    });
  } else {
    this.rivets = rivets;
  }

}).call(this);
