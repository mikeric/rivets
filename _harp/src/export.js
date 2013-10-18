Rivets.factory = function(exports) {
  exports._ = Rivets;
  exports.binders = Rivets.binders;
  exports.components = Rivets.components;
  exports.formatters = Rivets.formatters;
  exports.adapters = Rivets.adapters;
  exports.config = Rivets.config;
  exports.configure = function(options) {
    var property, value;
    if (options == null) {
      options = {};
    }
    for (property in options) {
      value = options[property];
      Rivets.config[property] = value;
    }
  };
  return exports.bind = function(el, models, options) {
    var view;
    if (models == null) {
      models = {};
    }
    if (options == null) {
      options = {};
    }
    view = new Rivets.View(el, models, options);
    view.bind();
    return view;
  };
};

if (typeof exports === 'object') {
  Rivets.factory(exports);
} else if (typeof define === 'function' && define.amd) {
  define(['exports'], function(exports) {
    Rivets.factory(this.rivets = exports);
    return exports;
  });
} else {
  Rivets.factory(this.rivets = {});
}
