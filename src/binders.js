var __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

Rivets.binders.enabled = function(el, value) {
  return el.disabled = !value;
};

Rivets.binders.disabled = function(el, value) {
  return el.disabled = !!value;
};

Rivets.binders.checked = {
  publishes: true,
  bind: function(el) {
    return Rivets.Util.bindEvent(el, 'change', this.publish);
  },
  unbind: function(el) {
    return Rivets.Util.unbindEvent(el, 'change', this.publish);
  },
  routine: function(el, value) {
    var _ref;
    if (el.type === 'radio') {
      return el.checked = ((_ref = el.value) != null ? _ref.toString() : void 0) === (value != null ? value.toString() : void 0);
    } else {
      return el.checked = !!value;
    }
  }
};

Rivets.binders.unchecked = {
  publishes: true,
  bind: function(el) {
    return Rivets.Util.bindEvent(el, 'change', this.publish);
  },
  unbind: function(el) {
    return Rivets.Util.unbindEvent(el, 'change', this.publish);
  },
  routine: function(el, value) {
    var _ref;
    if (el.type === 'radio') {
      return el.checked = ((_ref = el.value) != null ? _ref.toString() : void 0) !== (value != null ? value.toString() : void 0);
    } else {
      return el.checked = !value;
    }
  }
};

Rivets.binders.show = function(el, value) {
  return el.style.display = value ? '' : 'none';
};

Rivets.binders.hide = function(el, value) {
  return el.style.display = value ? 'none' : '';
};

Rivets.binders.html = function(el, value) {
  return el.innerHTML = value != null ? value : '';
};

Rivets.binders.value = {
  publishes: true,
  bind: function(el) {
    return Rivets.Util.bindEvent(el, 'change', this.publish);
  },
  unbind: function(el) {
    return Rivets.Util.unbindEvent(el, 'change', this.publish);
  },
  routine: function(el, value) {
    var o, _i, _len, _ref, _ref1, _ref2, _results;
    if (window.jQuery != null) {
      el = jQuery(el);
      if ((value != null ? value.toString() : void 0) !== ((_ref = el.val()) != null ? _ref.toString() : void 0)) {
        return el.val(value != null ? value : '');
      }
    } else {
      if (el.type === 'select-multiple') {
        if (value != null) {
          _results = [];
          for (_i = 0, _len = el.length; _i < _len; _i++) {
            o = el[_i];
            _results.push(o.selected = (_ref1 = o.value, __indexOf.call(value, _ref1) >= 0));
          }
          return _results;
        }
      } else if ((value != null ? value.toString() : void 0) !== ((_ref2 = el.value) != null ? _ref2.toString() : void 0)) {
        return el.value = value != null ? value : '';
      }
    }
  }
};

Rivets.binders.text = function(el, value) {
  if (el.innerText != null) {
    return el.innerText = value != null ? value : '';
  } else {
    return el.textContent = value != null ? value : '';
  }
};

Rivets.binders["if"] = {
  block: true,
  bind: function(el) {
    var attr, declaration;
    if (this.marker == null) {
      attr = [this.view.config.prefix, this.type].join('-').replace('--', '-');
      declaration = el.getAttribute(attr);
      this.marker = document.createComment(" rivets: " + this.type + " " + declaration + " ");
      el.removeAttribute(attr);
      el.parentNode.insertBefore(this.marker, el);
      return el.parentNode.removeChild(el);
    }
  },
  unbind: function() {
    var _ref;
    return (_ref = this.nested) != null ? _ref.unbind() : void 0;
  },
  routine: function(el, value) {
    var key, model, models, options, _ref;
    if (!!value === (this.nested == null)) {
      if (value) {
        models = {};
        _ref = this.view.models;
        for (key in _ref) {
          model = _ref[key];
          models[key] = model;
        }
        options = {
          binders: this.view.options.binders,
          formatters: this.view.options.formatters,
          adapters: this.view.options.adapters,
          config: this.view.options.config
        };
        (this.nested = new Rivets.View(el, models, options)).bind();
        return this.marker.parentNode.insertBefore(el, this.marker.nextSibling);
      } else {
        el.parentNode.removeChild(el);
        this.nested.unbind();
        return delete this.nested;
      }
    }
  },
  update: function(models) {
    var _ref;
    return (_ref = this.nested) != null ? _ref.update(models) : void 0;
  }
};

Rivets.binders.unless = {
  block: true,
  bind: function(el) {
    return Rivets.binders["if"].bind.call(this, el);
  },
  unbind: function() {
    return Rivets.binders["if"].unbind.call(this);
  },
  routine: function(el, value) {
    return Rivets.binders["if"].routine.call(this, el, !value);
  },
  update: function(models) {
    return Rivets.binders["if"].update.call(this, models);
  }
};

Rivets.binders['on-*'] = {
  "function": true,
  unbind: function(el) {
    if (this.handler) {
      return Rivets.Util.unbindEvent(el, this.args[0], this.handler);
    }
  },
  routine: function(el, value) {
    if (this.handler) {
      Rivets.Util.unbindEvent(el, this.args[0], this.handler);
    }
    return Rivets.Util.bindEvent(el, this.args[0], this.handler = this.eventHandler(value));
  }
};

Rivets.binders['each-*'] = {
  block: true,
  bind: function(el) {
    var attr;
    if (this.marker == null) {
      attr = [this.view.config.prefix, this.type].join('-').replace('--', '-');
      this.marker = document.createComment(" rivets: " + this.type + " ");
      this.iterated = [];
      el.removeAttribute(attr);
      el.parentNode.insertBefore(this.marker, el);
      return el.parentNode.removeChild(el);
    }
  },
  unbind: function(el) {
    var view, _i, _len, _ref, _results;
    if (this.iterated != null) {
      _ref = this.iterated;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        view = _ref[_i];
        _results.push(view.unbind());
      }
      return _results;
    }
  },
  routine: function(el, collection) {
    var binding, data, i, index, k, key, model, modelName, options, previous, template, v, view, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2, _ref3, _results;
    modelName = this.args[0];
    collection = collection || [];
    if (this.iterated.length > collection.length) {
      _ref = Array(this.iterated.length - collection.length);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        i = _ref[_i];
        view = this.iterated.pop();
        view.unbind();
        this.marker.parentNode.removeChild(view.els[0]);
      }
    }
    for (index = _j = 0, _len1 = collection.length; _j < _len1; index = ++_j) {
      model = collection[index];
      data = {};
      data[modelName] = model;
      if (this.iterated[index] == null) {
        _ref1 = this.view.models;
        for (key in _ref1) {
          model = _ref1[key];
          if (data[key] == null) {
            data[key] = model;
          }
        }
        previous = this.iterated.length ? this.iterated[this.iterated.length - 1].els[0] : this.marker;
        options = {
          binders: this.view.options.binders,
          formatters: this.view.options.formatters,
          adapters: this.view.options.adapters,
          config: {}
        };
        _ref2 = this.view.options.config;
        for (k in _ref2) {
          v = _ref2[k];
          options.config[k] = v;
        }
        options.config.preloadData = true;
        template = el.cloneNode(true);
        view = new Rivets.View(template, data, options);
        view.bind();
        this.iterated.push(view);
        this.marker.parentNode.insertBefore(template, previous.nextSibling);
      } else if (this.iterated[index].models[modelName] !== model) {
        this.iterated[index].update(data);
      }
    }
    if (el.nodeName === 'OPTION') {
      _ref3 = this.view.bindings;
      _results = [];
      for (_k = 0, _len2 = _ref3.length; _k < _len2; _k++) {
        binding = _ref3[_k];
        if (binding.el === this.marker.parentNode && binding.type === 'value') {
          _results.push(binding.sync());
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    }
  },
  update: function(models) {
    var data, key, model, view, _i, _len, _ref, _results;
    data = {};
    for (key in models) {
      model = models[key];
      if (key !== this.args[0]) {
        data[key] = model;
      }
    }
    _ref = this.iterated;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      view = _ref[_i];
      _results.push(view.update(data));
    }
    return _results;
  }
};

Rivets.binders['class-*'] = function(el, value) {
  var elClass;
  elClass = " " + el.className + " ";
  if (!value === (elClass.indexOf(" " + this.args[0] + " ") !== -1)) {
    return el.className = value ? "" + el.className + " " + this.args[0] : elClass.replace(" " + this.args[0] + " ", ' ').trim();
  }
};

Rivets.binders['*'] = function(el, value) {
  if (value) {
    return el.setAttribute(this.type, value);
  } else {
    return el.removeAttribute(this.type);
  }
};
