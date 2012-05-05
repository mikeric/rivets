
  window.rivets = (function() {
    var attr, bindableAttributes, bindings, getInputValue, registerBinding, setAttribute, _fn, _i, _len;
    registerBinding = function(el, interface, type, context, keypath) {
      var inputValue;
      bindings[type](el, interface.read(context, keypath));
      interface.subscribe(context, keypath, function(value) {
        return bindings[type](el, value);
      });
      if (inputValue = getInputValue(el)) {
        return interface.publish(context, keypath, inputValue);
      }
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
        if (contexts == null) contexts = {};
        return $(el).add($('*', el)).each(function() {
          var nodeMap, target, _j, _ref, _results;
          target = this;
          nodeMap = target.attributes;
          if (nodeMap.length > 0) {
            return (function() {
              _results = [];
              for (var _j = 0, _ref = nodeMap.length - 1; 0 <= _ref ? _j <= _ref : _j >= _ref; 0 <= _ref ? _j++ : _j--){ _results.push(_j); }
              return _results;
            }).apply(this).forEach(function(n) {
              var context, keypath, node, path, type;
              node = nodeMap[n];
              if (/^data-/.test(node.name)) {
                type = node.name.replace('data-', '');
                if (_.include(_.keys(bindings), type)) {
                  path = node.value.split('.');
                  context = path.shift();
                  keypath = path.join('.');
                  return registerBinding($(target), interface, type, contexts[context], keypath);
                }
              }
            });
          }
        });
      }
    };
  })();
