
  window.rivets = (function() {
    var attr, bindableAttributes, bindings, getInputValue, registerBinding, setAttribute, _fn, _i, _len;
    registerBinding = function(el, interface, contexts, type, callback) {
      return $("*[data-" + type + "]", el).each(function() {
        var context, inputValue, keypath, path;
        var _this = this;
        path = $(this).attr("data-" + type).split('.');
        context = path.shift();
        keypath = path.join('.');
        callback(this, interface.read(contexts[context], keypath));
        interface.subscribe(contexts[context], keypath, function(value) {
          return callback(_this, value);
        });
        if (inputValue = getInputValue(this)) {
          return interface.publish(contexts[context], keypath, inputValue);
        }
      });
    };
    setAttribute = function(el, attr, value, mirrored) {
      if (mirrored == null) mirrored = false;
      if (value) {
        return $(el).attr(attr, mirrored ? attr : value);
      } else {
        return $(el).removeAttr(attr);
      }
    };
    getInputValue = function(el) {
      switch ($(el).attr('type')) {
        case 'text':
        case 'textarea':
        case 'password':
        case 'select-one':
          return $(this).val();
        case 'checkbox':
          return $(this).is(':checked');
      }
    };
    bindings = {
      show: function(el, value) {
        if (value) {
          return $(el).show();
        } else {
          return $(el).hide();
        }
      },
      hide: function(el, value) {
        if (value) {
          return $(el).hide();
        } else {
          return $(el).show();
        }
      },
      enabled: function(el, value) {
        return setAttribute(el, 'disabled', !value, true);
      },
      disabled: function(el, value) {
        return setAttribute(el, 'disabled', value, true);
      },
      checked: function(el, value) {
        return setAttribute(el, 'checked', value, true);
      },
      unchecked: function(el, value) {
        return setAttribute(el, 'checked', !value, true);
      },
      selected: function(el, value) {
        return setAttribute(el, 'selected', value, true);
      },
      unselected: function(el, value) {
        return setAttribute(el, 'checked', !value, true);
      },
      text: function(el, value) {
        return $(el).text(value || '');
      },
      value: function(el, value) {
        return $(el).val(value);
      }
    };
    bindableAttributes = ['id', 'class', 'name', 'src', 'href', 'alt', 'title', 'placeholder'];
    _fn = function(attr) {
      return bindings[attr] = function(el, value) {
        return setAttribute(el, attr, value);
      };
    };
    for (_i = 0, _len = bindableAttributes.length; _i < _len; _i++) {
      attr = bindableAttributes[_i];
      _fn(attr);
    }
    return {
      bind: function(el, interface, contexts) {
        var callback, type, _results;
        if (contexts == null) contexts = {};
        _results = [];
        for (type in bindings) {
          callback = bindings[type];
          _results.push(registerBinding(el, interface, contexts, type, callback));
        }
        return _results;
      }
    };
  })();
