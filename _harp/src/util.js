Rivets.Util = {
  bindEvent: function(el, event, handler) {
    if (window.jQuery != null) {
      el = jQuery(el);
      if (el.on != null) {
        return el.on(event, handler);
      } else {
        return el.bind(event, handler);
      }
    } else if (window.addEventListener != null) {
      return el.addEventListener(event, handler, false);
    } else {
      event = 'on' + event;
      return el.attachEvent(event, handler);
    }
  },
  unbindEvent: function(el, event, handler) {
    if (window.jQuery != null) {
      el = jQuery(el);
      if (el.off != null) {
        return el.off(event, handler);
      } else {
        return el.unbind(event, handler);
      }
    } else if (window.removeEventListener != null) {
      return el.removeEventListener(event, handler, false);
    } else {
      event = 'on' + event;
      return el.detachEvent(event, handler);
    }
  },
  getInputValue: function(el) {
    var o, _i, _len, _results;
    if (window.jQuery != null) {
      el = jQuery(el);
      switch (el[0].type) {
        case 'checkbox':
          return el.is(':checked');
        default:
          return el.val();
      }
    } else {
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
    }
  }
};
