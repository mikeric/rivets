var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
  __slice = [].slice;

Rivets.View = (function() {
  function View(els, models, options) {
    var k, option, v, _base, _i, _len, _ref, _ref1, _ref2;
    this.els = els;
    this.models = models;
    this.options = options != null ? options : {};
    this.update = __bind(this.update, this);
    this.publish = __bind(this.publish, this);
    this.sync = __bind(this.sync, this);
    this.unbind = __bind(this.unbind, this);
    this.bind = __bind(this.bind, this);
    this.select = __bind(this.select, this);
    this.build = __bind(this.build, this);
    this.componentRegExp = __bind(this.componentRegExp, this);
    this.bindingRegExp = __bind(this.bindingRegExp, this);
    if (!(this.els.jquery || this.els instanceof Array)) {
      this.els = [this.els];
    }
    _ref = ['config', 'binders', 'formatters', 'adapters'];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      option = _ref[_i];
      this[option] = {};
      if (this.options[option]) {
        _ref1 = this.options[option];
        for (k in _ref1) {
          v = _ref1[k];
          this[option][k] = v;
        }
      }
      _ref2 = Rivets[option];
      for (k in _ref2) {
        v = _ref2[k];
        if ((_base = this[option])[k] == null) {
          _base[k] = v;
        }
      }
    }
    this.build();
  }

  View.prototype.bindingRegExp = function() {
    return new RegExp("^" + this.config.prefix + "-");
  };

  View.prototype.componentRegExp = function() {
    return new RegExp("^" + (this.config.prefix.toUpperCase()) + "-");
  };

  View.prototype.build = function() {
    var bindingRegExp, buildBinding, componentRegExp, el, parse, skipNodes, _i, _len, _ref,
      _this = this;
    this.bindings = [];
    skipNodes = [];
    bindingRegExp = this.bindingRegExp();
    componentRegExp = this.componentRegExp();
    buildBinding = function(binding, node, type, declaration) {
      var context, ctx, dependencies, keypath, options, pipe, pipes;
      options = {};
      pipes = (function() {
        var _i, _len, _ref, _results;
        _ref = declaration.split('|');
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          pipe = _ref[_i];
          _results.push(pipe.trim());
        }
        return _results;
      })();
      context = (function() {
        var _i, _len, _ref, _results;
        _ref = pipes.shift().split('<');
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          ctx = _ref[_i];
          _results.push(ctx.trim());
        }
        return _results;
      })();
      keypath = context.shift();
      options.formatters = pipes;
      if (dependencies = context.shift()) {
        options.dependencies = dependencies.split(/\s+/);
      }
      return _this.bindings.push(new Rivets[binding](_this, node, type, keypath, options));
    };
    parse = function(node) {
      var attribute, attributes, binder, childNode, delimiters, identifier, n, parser, regexp, restTokens, startToken, text, token, tokens, type, value, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _m, _ref, _ref1, _ref2, _ref3, _ref4, _results;
      if (__indexOf.call(skipNodes, node) < 0) {
        if (node.nodeType === Node.TEXT_NODE) {
          parser = Rivets.TextTemplateParser;
          if (delimiters = _this.config.templateDelimiters) {
            if ((tokens = parser.parse(node.data, delimiters)).length) {
              if (!(tokens.length === 1 && tokens[0].type === parser.types.text)) {
                startToken = tokens[0], restTokens = 2 <= tokens.length ? __slice.call(tokens, 1) : [];
                node.data = startToken.value;
                if (startToken.type === 0) {
                  node.data = startToken.value;
                } else {
                  buildBinding('TextBinding', node, null, startToken.value);
                }
                for (_i = 0, _len = restTokens.length; _i < _len; _i++) {
                  token = restTokens[_i];
                  text = document.createTextNode(token.value);
                  node.parentNode.appendChild(text);
                  if (token.type === 1) {
                    buildBinding('TextBinding', text, null, token.value);
                  }
                }
              }
            }
          }
        } else if (componentRegExp.test(node.tagName)) {
          type = node.tagName.replace(componentRegExp, '').toLowerCase();
          _this.bindings.push(new Rivets.ComponentBinding(_this, node, type));
        } else if (node.attributes != null) {
          _ref = node.attributes;
          for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
            attribute = _ref[_j];
            if (bindingRegExp.test(attribute.name)) {
              type = attribute.name.replace(bindingRegExp, '');
              if (!(binder = _this.binders[type])) {
                _ref1 = _this.binders;
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
              binder || (binder = _this.binders['*']);
              if (binder.block) {
                _ref2 = node.childNodes;
                for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
                  n = _ref2[_k];
                  skipNodes.push(n);
                }
                attributes = [attribute];
              }
            }
          }
          _ref3 = attributes || node.attributes;
          for (_l = 0, _len3 = _ref3.length; _l < _len3; _l++) {
            attribute = _ref3[_l];
            if (bindingRegExp.test(attribute.name)) {
              type = attribute.name.replace(bindingRegExp, '');
              buildBinding('Binding', node, type, attribute.value);
            }
          }
        }
        _ref4 = node.childNodes;
        _results = [];
        for (_m = 0, _len4 = _ref4.length; _m < _len4; _m++) {
          childNode = _ref4[_m];
          _results.push(parse(childNode));
        }
        return _results;
      }
    };
    _ref = this.els;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      el = _ref[_i];
      parse(el);
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

  View.prototype.update = function(models) {
    var binding, key, model, _i, _len, _ref, _results;
    if (models == null) {
      models = {};
    }
    for (key in models) {
      model = models[key];
      this.models[key] = model;
    }
    _ref = this.bindings;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      binding = _ref[_i];
      _results.push(binding.update(models));
    }
    return _results;
  };

  return View;

})();
