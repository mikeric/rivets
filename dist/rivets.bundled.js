(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["rivets"] = factory();
	else
		root["rivets"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function (global, factory) {
	  if (true) {
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [module, exports, __webpack_require__(1), __webpack_require__(2), __webpack_require__(4), __webpack_require__(8), __webpack_require__(9)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  } else if (typeof exports !== "undefined") {
	    factory(module, exports, require('sightglass'), require('./rivets'), require('./view'), require('./adapter'), require('./binders'));
	  } else {
	    var mod = {
	      exports: {}
	    };
	    factory(mod, mod.exports, global.sightglass, global.rivets, global.view, global.adapter, global.binders);
	    global._export = mod.exports;
	  }
	})(this, function (module, exports, _sightglass, _rivets, _view, _adapter, _binders) {
	  'use strict';

	  Object.defineProperty(exports, "__esModule", {
	    value: true
	  });

	  var _sightglass2 = _interopRequireDefault(_sightglass);

	  var _rivets2 = _interopRequireDefault(_rivets);

	  var _view2 = _interopRequireDefault(_view);

	  var _adapter2 = _interopRequireDefault(_adapter);

	  var _binders2 = _interopRequireDefault(_binders);

	  function _interopRequireDefault(obj) {
	    return obj && obj.__esModule ? obj : {
	      default: obj
	    };
	  }

	  // Module factory. Integrates sightglass and public API methods. Returns the
	  // public interface.
	  var factory = function factory(sightglass) {
	    _rivets2.default.sightglass = sightglass;
	    _rivets2.default.binders = _binders2.default;
	    _rivets2.default.adapters['.'] = _adapter2.default;

	    // Binds some data to a template / element. Retuddrns a Rivets.View instance.
	    _rivets2.default.bind = function (el) {
	      var models = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
	      var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

	      var view = new _view2.default(el, models, options);
	      view.bind();
	      return view;
	    };

	    // Initializes a new instance of a component on the specified element and
	    // returns a Rivets.View instance.
	    _rivets2.default.init = function (_component, el) {
	      var data = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

	      if (!el) {
	        el = document.createElement('div');
	      }

	      var component = _rivets2.default.components[_component];
	      el.innerHTML = component.template.call(_rivets2.default, el);
	      var scope = component.initialize.call(_rivets2.default, el, data);

	      var view = new _view2.default(el, scope);
	      view.bind();
	      return view;
	    };

	    return _rivets2.default;
	  };

	  exports.default = factory(_sightglass2.default);
	  module.exports = exports['default'];
	});

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function (global, factory) {
	  if (true) {
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [module], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  } else if (typeof exports !== "undefined") {
	    factory(module);
	  } else {
	    var mod = {
	      exports: {}
	    };
	    factory(mod);
	    global.index = mod.exports;
	  }
	})(this, function (module) {
	  'use strict';

	  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
	    return typeof obj;
	  } : function (obj) {
	    return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj;
	  };

	  (function () {
	    // Public sightglass interface.
	    function sightglass(obj, keypath, callback, options) {
	      return new Observer(obj, keypath, callback, options);
	    }

	    // Batteries not included.
	    sightglass.adapters = {};

	    // Constructs a new keypath observer and kicks things off.
	    function Observer(obj, keypath, callback, options) {
	      this.options = options || {};
	      this.options.adapters = this.options.adapters || {};
	      this.obj = obj;
	      this.keypath = keypath;
	      this.callback = callback;
	      this.objectPath = [];
	      this.update = this.update.bind(this);
	      this.parse();

	      if (isObject(this.target = this.realize())) {
	        this.set(true, this.key, this.target, this.callback);
	      }
	    }

	    // Tokenizes the provided keypath string into interface + path tokens for the
	    // observer to work with.
	    Observer.tokenize = function (keypath, interfaces, root) {
	      var tokens = [];
	      var current = { i: root, path: '' };
	      var index, chr;

	      for (index = 0; index < keypath.length; index++) {
	        chr = keypath.charAt(index);

	        if (!!~interfaces.indexOf(chr)) {
	          tokens.push(current);
	          current = { i: chr, path: '' };
	        } else {
	          current.path += chr;
	        }
	      }

	      tokens.push(current);
	      return tokens;
	    };

	    // Parses the keypath using the interfaces defined on the view. Sets variables
	    // for the tokenized keypath as well as the end key.
	    Observer.prototype.parse = function () {
	      var interfaces = this.interfaces();
	      var root, path;

	      if (!interfaces.length) {
	        error('Must define at least one adapter interface.');
	      }

	      if (!!~interfaces.indexOf(this.keypath[0])) {
	        root = this.keypath[0];
	        path = this.keypath.substr(1);
	      } else {
	        if (typeof (root = this.options.root || sightglass.root) === 'undefined') {
	          error('Must define a default root adapter.');
	        }

	        path = this.keypath;
	      }

	      this.tokens = Observer.tokenize(path, interfaces, root);
	      this.key = this.tokens.pop();
	    };

	    // Realizes the full keypath, attaching observers for every key and correcting
	    // old observers to any changed objects in the keypath.
	    Observer.prototype.realize = function () {
	      var current = this.obj;
	      var unreached = false;
	      var prev;

	      this.tokens.forEach(function (token, index) {
	        if (isObject(current)) {
	          if (typeof this.objectPath[index] !== 'undefined') {
	            if (current !== (prev = this.objectPath[index])) {
	              this.set(false, token, prev, this.update);
	              this.set(true, token, current, this.update);
	              this.objectPath[index] = current;
	            }
	          } else {
	            this.set(true, token, current, this.update);
	            this.objectPath[index] = current;
	          }

	          current = this.get(token, current);
	        } else {
	          if (unreached === false) {
	            unreached = index;
	          }

	          if (prev = this.objectPath[index]) {
	            this.set(false, token, prev, this.update);
	          }
	        }
	      }, this);

	      if (unreached !== false) {
	        this.objectPath.splice(unreached);
	      }

	      return current;
	    };

	    // Updates the keypath. This is called when any intermediary key is changed.
	    Observer.prototype.update = function () {
	      var next, oldValue;

	      if ((next = this.realize()) !== this.target) {
	        if (isObject(this.target)) {
	          this.set(false, this.key, this.target, this.callback);
	        }

	        if (isObject(next)) {
	          this.set(true, this.key, next, this.callback);
	        }

	        oldValue = this.value();
	        this.target = next;

	        if (this.value() !== oldValue) this.callback();
	      }
	    };

	    // Reads the current end value of the observed keypath. Returns undefined if
	    // the full keypath is unreachable.
	    Observer.prototype.value = function () {
	      if (isObject(this.target)) {
	        return this.get(this.key, this.target);
	      }
	    };

	    // Sets the current end value of the observed keypath. Calling setValue when
	    // the full keypath is unreachable is a no-op.
	    Observer.prototype.setValue = function (value) {
	      if (isObject(this.target)) {
	        this.adapter(this.key).set(this.target, this.key.path, value);
	      }
	    };

	    // Gets the provided key on an object.
	    Observer.prototype.get = function (key, obj) {
	      return this.adapter(key).get(obj, key.path);
	    };

	    // Observes or unobserves a callback on the object using the provided key.
	    Observer.prototype.set = function (active, key, obj, callback) {
	      var action = active ? 'observe' : 'unobserve';
	      this.adapter(key)[action](obj, key.path, callback);
	    };

	    // Returns an array of all unique adapter interfaces available.
	    Observer.prototype.interfaces = function () {
	      var interfaces = Object.keys(this.options.adapters);

	      Object.keys(sightglass.adapters).forEach(function (i) {
	        if (!~interfaces.indexOf(i)) {
	          interfaces.push(i);
	        }
	      });

	      return interfaces;
	    };

	    // Convenience function to grab the adapter for a specific key.
	    Observer.prototype.adapter = function (key) {
	      return this.options.adapters[key.i] || sightglass.adapters[key.i];
	    };

	    // Unobserves the entire keypath.
	    Observer.prototype.unobserve = function () {
	      var obj;

	      this.tokens.forEach(function (token, index) {
	        if (obj = this.objectPath[index]) {
	          this.set(false, token, obj, this.update);
	        }
	      }, this);

	      if (isObject(this.target)) {
	        this.set(false, this.key, this.target, this.callback);
	      }
	    };

	    // Check if a value is an object than can be observed.
	    function isObject(obj) {
	      return (typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) === 'object' && obj !== null;
	    }

	    // Error thrower.
	    function error(message) {
	      throw new Error('[sightglass] ' + message);
	    }

	    // Export module for Node and the browser.
	    if (typeof module !== 'undefined' && module.exports) {
	      module.exports = sightglass;
	    } else if (true) {
	      !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = function () {
	        return this.sightglass = sightglass;
	      }.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	    } else {
	      this.sightglass = sightglass;
	    }
	  }).call(undefined);
	});

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function (global, factory) {
	  if (true) {
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [module, exports, __webpack_require__(3)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  } else if (typeof exports !== "undefined") {
	    factory(module, exports, require('./constants'));
	  } else {
	    var mod = {
	      exports: {}
	    };
	    factory(mod, mod.exports, global.constants);
	    global.rivets = mod.exports;
	  }
	})(this, function (module, exports, _constants) {
	  'use strict';

	  Object.defineProperty(exports, "__esModule", {
	    value: true
	  });


	  var rivets = {
	    // Global binders.
	    binders: {},

	    // Global components.
	    components: {},

	    // Global formatters.
	    formatters: {},

	    // Global sightglass adapters.
	    adapters: {},

	    // Default attribute prefix.
	    prefix: 'rv',

	    // Default template delimiters.
	    templateDelimiters: ['{', '}'],

	    // Default sightglass root interface.
	    rootInterface: '.',

	    // Preload data by default.
	    preloadData: true,

	    // Alias for index in rv-each binder
	    iterationAlias: function iterationAlias(modelName) {
	      return '%' + modelName + '%';
	    },

	    // Default event handler.
	    handler: function handler(context, ev, binding) {
	      this.call(context, ev, binding.view.models);
	    },

	    // Merges an object literal into the corresponding global options.
	    configure: function configure() {
	      var _this = this;

	      var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

	      Object.keys(options).forEach(function (option) {
	        var value = options[option];

	        if (_constants.EXTENSIONS.indexOf(option) > -1) {
	          Object.keys(value).forEach(function (key) {
	            _this[option][key] = value[key];
	          });
	        } else {
	          _this[option] = value;
	        }
	      });
	    }
	  };

	  exports.default = rivets;
	  module.exports = exports['default'];
	});

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function (global, factory) {
	  if (true) {
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [exports], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  } else if (typeof exports !== "undefined") {
	    factory(exports);
	  } else {
	    var mod = {
	      exports: {}
	    };
	    factory(mod.exports);
	    global.constants = mod.exports;
	  }
	})(this, function (exports) {
	  'use strict';

	  Object.defineProperty(exports, "__esModule", {
	    value: true
	  });
	  var OPTIONS = exports.OPTIONS = ['prefix', 'templateDelimiters', 'rootInterface', 'preloadData', 'handler'];

	  var EXTENSIONS = exports.EXTENSIONS = ['binders', 'formatters', 'components', 'adapters'];
	});

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function (global, factory) {
	  if (true) {
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [module, exports, __webpack_require__(2), __webpack_require__(3), __webpack_require__(5), __webpack_require__(6)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  } else if (typeof exports !== "undefined") {
	    factory(module, exports, require('./rivets'), require('./constants'), require('./bindings'), require('./parsers'));
	  } else {
	    var mod = {
	      exports: {}
	    };
	    factory(mod, mod.exports, global.rivets, global.constants, global.bindings, global.parsers);
	    global.view = mod.exports;
	  }
	})(this, function (module, exports, _rivets, _constants, _bindings, _parsers) {
	  'use strict';

	  Object.defineProperty(exports, "__esModule", {
	    value: true
	  });

	  var _rivets2 = _interopRequireDefault(_rivets);

	  function _interopRequireDefault(obj) {
	    return obj && obj.__esModule ? obj : {
	      default: obj
	    };
	  }

	  function _classCallCheck(instance, Constructor) {
	    if (!(instance instanceof Constructor)) {
	      throw new TypeError("Cannot call a class as a function");
	    }
	  }

	  var _createClass = function () {
	    function defineProperties(target, props) {
	      for (var i = 0; i < props.length; i++) {
	        var descriptor = props[i];
	        descriptor.enumerable = descriptor.enumerable || false;
	        descriptor.configurable = true;
	        if ("value" in descriptor) descriptor.writable = true;
	        Object.defineProperty(target, descriptor.key, descriptor);
	      }
	    }

	    return function (Constructor, protoProps, staticProps) {
	      if (protoProps) defineProperties(Constructor.prototype, protoProps);
	      if (staticProps) defineProperties(Constructor, staticProps);
	      return Constructor;
	    };
	  }();

	  var defined = function defined(value) {
	    return value !== undefined && value !== null;
	  };

	  // A collection of bindings built from a set of parent nodes.

	  var View = function () {
	    // The DOM elements and the model objects for binding are passed into the
	    // constructor along with any local options that should be used throughout the
	    // context of the view and it's bindings.
	    function View(els, models) {
	      var _this = this;

	      var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

	      _classCallCheck(this, View);

	      if (els.jquery || els instanceof Array) {
	        this.els = els;
	      } else {
	        this.els = [els];
	      }

	      this.models = models;

	      _constants.EXTENSIONS.forEach(function (extensionType) {
	        _this[extensionType] = {};

	        if (options[extensionType]) {
	          Object.keys(options[extensionType]).forEach(function (key) {
	            _this[extensionType][key] = options[extensionType][key];
	          });
	        }

	        Object.keys(_rivets2.default[extensionType]).forEach(function (key) {
	          if (!defined(_this[extensionType][key])) {
	            _this[extensionType][key] = _rivets2.default[extensionType][key];
	          }
	        });
	      });

	      _constants.OPTIONS.forEach(function (option) {
	        _this[option] = defined(options[option]) ? options[option] : _rivets2.default[option];
	      });

	      this.build();
	    }

	    _createClass(View, [{
	      key: 'options',
	      value: function options() {
	        var _this2 = this;

	        var options = {};

	        _constants.EXTENSIONS.concat(_constants.OPTIONS).forEach(function (option) {
	          options[option] = _this2[option];
	        });

	        return options;
	      }
	    }, {
	      key: 'bindingRegExp',
	      value: function bindingRegExp() {
	        return new RegExp('^' + this.prefix + '-');
	      }
	    }, {
	      key: 'buildBinding',
	      value: function buildBinding(binding, node, type, declaration) {
	        var pipes = declaration.match(/((?:'[^']*')*(?:(?:[^\|']*(?:'[^']*')+[^\|']*)+|[^\|]+))|^$/g).map(function (pipe) {
	          return pipe.trim();
	        });

	        var context = pipes.shift().split('<').map(function (ctx) {
	          return ctx.trim();
	        });

	        var keypath = context.shift();
	        var dependencies = context.shift();
	        var options = { formatters: pipes };

	        if (dependencies) {
	          options.dependencies = dependencies.split(/\s+/);
	        }

	        this.bindings.push(new binding(this, node, type, keypath, options));
	      }
	    }, {
	      key: 'build',
	      value: function build() {
	        var _this3 = this;

	        this.bindings = [];

	        var parse = function parse(node) {
	          var block = false;

	          if (node.nodeType === 3) {
	            var delimiters = _this3.templateDelimiters;

	            if (delimiters) {
	              var tokens = (0, _parsers.parseTemplate)(node.data, delimiters);

	              if (tokens.length) {
	                if (!(tokens.length === 1 && tokens[0].type === 0)) {
	                  tokens.forEach(function (token) {
	                    var text = document.createTextNode(token.value);
	                    node.parentNode.insertBefore(text, node);

	                    if (token.type === 1) {
	                      _this3.buildBinding(_bindings.TextBinding, text, null, token.value);
	                    }
	                  });

	                  node.parentNode.removeChild(node);
	                }
	              }
	            }
	          } else if (node.nodeType === 1) {
	            block = _this3.traverse(node);
	          }

	          if (!block) {
	            Array.prototype.slice.call(node.childNodes).forEach(parse);
	          }
	        };

	        var elements = this.els,
	            i = void 0,
	            len = void 0;
	        for (i = 0, len = elements.length; i < len; i++) {
	          parse(elements[i]);
	        }

	        this.bindings.sort(function (a, b) {
	          var aPriority = defined(a.binder) ? a.binder.priority || 0 : 0;
	          var bPriority = defined(b.binder) ? b.binder.priority || 0 : 0;
	          return bPriority - aPriority;
	        });
	      }
	    }, {
	      key: 'traverse',
	      value: function traverse(node) {
	        var _this4 = this;

	        var bindingRegExp = this.bindingRegExp();
	        var block = node.nodeName === 'SCRIPT' || node.nodeName === 'STYLE';
	        var attributes = null;

	        Array.prototype.slice.call(node.attributes).forEach(function (attribute) {
	          if (bindingRegExp.test(attribute.name)) {
	            (function () {
	              var type = attribute.name.replace(bindingRegExp, '');
	              var binder = _this4.binders[type];

	              if (!binder) {
	                Object.keys(_this4.binders).forEach(function (identifier) {
	                  var value = _this4.binders[identifier];

	                  if (identifier !== '*' && identifier.indexOf('*') > -1) {
	                    var regexp = new RegExp('^' + identifier.replace(/\*/g, '.+') + '$');

	                    if (regexp.test(type)) {
	                      binder = value;
	                    }
	                  }
	                });
	              }

	              if (!defined(binder)) {
	                binder = _this4.binders['*'];
	              }

	              if (binder.block) {
	                block = true;
	                attributes = [attribute];
	              }
	            })();
	          }
	        });

	        attributes = attributes || Array.prototype.slice.call(node.attributes);

	        attributes.forEach(function (attribute) {
	          if (bindingRegExp.test(attribute.name)) {
	            var type = attribute.name.replace(bindingRegExp, '');
	            _this4.buildBinding(_bindings.Binding, node, type, attribute.value);
	          }
	        });

	        if (!block) {
	          var type = node.nodeName.toLowerCase();

	          if (this.components[type] && !node._bound) {
	            this.bindings.push(new _bindings.ComponentBinding(this, node, type));
	            block = true;
	          }
	        }

	        return block;
	      }
	    }, {
	      key: 'select',
	      value: function select(fn) {
	        return this.bindings.filter(fn);
	      }
	    }, {
	      key: 'bind',
	      value: function bind() {
	        this.bindings.forEach(function (binding) {
	          binding.bind();
	        });
	      }
	    }, {
	      key: 'unbind',
	      value: function unbind() {
	        this.bindings.forEach(function (binding) {
	          binding.unbind();
	        });
	      }
	    }, {
	      key: 'sync',
	      value: function sync() {
	        this.bindings.forEach(function (binding) {
	          binding.sync();
	        });
	      }
	    }, {
	      key: 'publish',
	      value: function publish() {
	        var publishes = this.select(function (binding) {
	          if (defined(binding.binder)) {
	            return binding.binder.publishes;
	          }
	        });

	        publishes.forEach(function (binding) {
	          binding.publish();
	        });
	      }
	    }, {
	      key: 'update',
	      value: function update() {
	        var _this5 = this;

	        var models = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

	        Object.keys(models).forEach(function (key) {
	          _this5.models[key] = models[key];
	        });

	        this.bindings.forEach(function (binding) {
	          if (defined(binding.update)) {
	            binding.update(models);
	          }
	        });
	      }
	    }]);

	    return View;
	  }();

	  exports.default = View;
	  module.exports = exports['default'];
	});

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function (global, factory) {
	  if (true) {
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [exports, __webpack_require__(2), __webpack_require__(6), __webpack_require__(7), __webpack_require__(3)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  } else if (typeof exports !== "undefined") {
	    factory(exports, require('./rivets'), require('./parsers'), require('./util'), require('./constants'));
	  } else {
	    var mod = {
	      exports: {}
	    };
	    factory(mod.exports, global.rivets, global.parsers, global.util, global.constants);
	    global.bindings = mod.exports;
	  }
	})(this, function (exports, _rivets, _parsers, _util, _constants) {
	  'use strict';

	  Object.defineProperty(exports, "__esModule", {
	    value: true
	  });
	  exports.TextBinding = exports.ComponentBinding = exports.Binding = undefined;

	  var _rivets2 = _interopRequireDefault(_rivets);

	  function _interopRequireDefault(obj) {
	    return obj && obj.__esModule ? obj : {
	      default: obj
	    };
	  }

	  var _get = function get(object, property, receiver) {
	    if (object === null) object = Function.prototype;
	    var desc = Object.getOwnPropertyDescriptor(object, property);

	    if (desc === undefined) {
	      var parent = Object.getPrototypeOf(object);

	      if (parent === null) {
	        return undefined;
	      } else {
	        return get(parent, property, receiver);
	      }
	    } else if ("value" in desc) {
	      return desc.value;
	    } else {
	      var getter = desc.get;

	      if (getter === undefined) {
	        return undefined;
	      }

	      return getter.call(receiver);
	    }
	  };

	  function _possibleConstructorReturn(self, call) {
	    if (!self) {
	      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
	    }

	    return call && (typeof call === "object" || typeof call === "function") ? call : self;
	  }

	  function _inherits(subClass, superClass) {
	    if (typeof superClass !== "function" && superClass !== null) {
	      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
	    }

	    subClass.prototype = Object.create(superClass && superClass.prototype, {
	      constructor: {
	        value: subClass,
	        enumerable: false,
	        writable: true,
	        configurable: true
	      }
	    });
	    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
	  }

	  function _toConsumableArray(arr) {
	    if (Array.isArray(arr)) {
	      for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
	        arr2[i] = arr[i];
	      }

	      return arr2;
	    } else {
	      return Array.from(arr);
	    }
	  }

	  function _classCallCheck(instance, Constructor) {
	    if (!(instance instanceof Constructor)) {
	      throw new TypeError("Cannot call a class as a function");
	    }
	  }

	  var _createClass = function () {
	    function defineProperties(target, props) {
	      for (var i = 0; i < props.length; i++) {
	        var descriptor = props[i];
	        descriptor.enumerable = descriptor.enumerable || false;
	        descriptor.configurable = true;
	        if ("value" in descriptor) descriptor.writable = true;
	        Object.defineProperty(target, descriptor.key, descriptor);
	      }
	    }

	    return function (Constructor, protoProps, staticProps) {
	      if (protoProps) defineProperties(Constructor.prototype, protoProps);
	      if (staticProps) defineProperties(Constructor, staticProps);
	      return Constructor;
	    };
	  }();

	  var defined = function defined(value) {
	    return value !== undefined && value !== null;
	  };

	  // A single binding between a model attribute and a DOM element.

	  var Binding = exports.Binding = function () {
	    // All information about the binding is passed into the constructor; the
	    // containing view, the DOM node, the type of binding, the model object and the
	    // keypath at which to listen for changes.
	    function Binding(view, el, type, keypath) {
	      var options = arguments.length <= 4 || arguments[4] === undefined ? {} : arguments[4];

	      _classCallCheck(this, Binding);

	      this.view = view;
	      this.el = el;
	      this.type = type;
	      this.keypath = keypath;
	      this.options = options;
	      this.formatters = options.formatters || [];
	      this.dependencies = [];
	      this.formatterObservers = {};
	      this.model = undefined;
	      this.setBinder();

	      this.bind = this.bind.bind(this);
	      this.unbind = this.unbind.bind(this);
	      this.sync = this.sync.bind(this);
	      this.publish = this.publish.bind(this);
	    }

	    // Sets the binder to use when binding and syncing.


	    _createClass(Binding, [{
	      key: 'setBinder',
	      value: function setBinder() {
	        var _this = this;

	        this.binder = this.view.binders[this.type];

	        if (!this.binder) {
	          Object.keys(this.view.binders).forEach(function (identifier) {
	            var value = _this.view.binders[identifier];

	            if (identifier !== '*' && identifier.indexOf('*') > -1) {
	              var regexp = new RegExp('^' + identifier.replace(/\*/g, '.+') + '$');

	              if (regexp.test(_this.type)) {
	                _this.binder = value;
	                _this.args = new RegExp('^' + identifier.replace(/\*/g, '(.+)') + '$').exec(_this.type);
	                _this.args.shift();
	              }
	            }
	          });
	        }

	        if (!defined(this.binder)) {
	          this.binder = this.view.binders['*'];
	        }

	        if (this.binder instanceof Function) {
	          this.binder = { routine: this.binder };
	        }
	      }

	      // Observes the object keypath to run the provided callback.

	    }, {
	      key: 'observe',
	      value: function observe(obj, keypath, callback) {
	        return _rivets2.default.sightglass(obj, keypath, callback, {
	          root: this.view.rootInterface,
	          adapters: this.view.adapters
	        });
	      }
	    }, {
	      key: 'parseTarget',
	      value: function parseTarget() {
	        var token = (0, _parsers.parseType)(this.keypath);

	        if (token.type === _parsers.PRIMITIVE) {
	          this.value = token.value;
	        } else {
	          this.observer = this.observe(this.view.models, this.keypath, this.sync);
	          this.model = this.observer.target;
	        }
	      }
	    }, {
	      key: 'parseFormatterArguments',
	      value: function parseFormatterArguments(args, formatterIndex) {
	        var _this2 = this;

	        return args.map(_parsers.parseType).map(function (_ref, ai) {
	          var type = _ref.type;
	          var value = _ref.value;

	          if (type === _parsers.PRIMITIVE) {
	            return value;
	          } else {
	            if (!defined(_this2.formatterObservers[formatterIndex])) {
	              _this2.formatterObservers[formatterIndex] = {};
	            }

	            var observer = _this2.formatterObservers[formatterIndex][ai];

	            if (!observer) {
	              observer = _this2.observe(_this2.view.models, value, _this2.sync);
	              _this2.formatterObservers[formatterIndex][ai] = observer;
	            }

	            return observer.value();
	          }
	        });
	      }

	      // Applies all the current formatters to the supplied value and returns the
	      // formatted value.

	    }, {
	      key: 'formattedValue',
	      value: function formattedValue(value) {
	        var _this3 = this;

	        this.formatters.forEach(function (formatterStr, fi) {
	          var args = formatterStr.match(/[^\s']+|'([^']|'[^\s])*'|"([^"]|"[^\s])*"/g);
	          var id = args.shift();
	          var formatter = _this3.view.formatters[id];

	          var processedArgs = _this3.parseFormatterArguments(args, fi);

	          if (formatter && formatter.read instanceof Function) {
	            value = formatter.read.apply(formatter, [value].concat(_toConsumableArray(processedArgs)));
	          } else if (formatter instanceof Function) {
	            value = formatter.apply(undefined, [value].concat(_toConsumableArray(processedArgs)));
	          }
	        });

	        return value;
	      }

	      // Returns an event handler for the binding around the supplied function.

	    }, {
	      key: 'eventHandler',
	      value: function eventHandler(fn) {
	        var binding = this;
	        var handler = binding.view.handler;

	        return function (ev) {
	          handler.call(fn, this, ev, binding);
	        };
	      }

	      // Sets the value for the binding. This Basically just runs the binding routine
	      // with the suplied value formatted.

	    }, {
	      key: 'set',
	      value: function set(value) {
	        if (value instanceof Function && !this.binder.function) {
	          value = this.formattedValue(value.call(this.model));
	        } else {
	          value = this.formattedValue(value);
	        }

	        if (this.binder.routine) {
	          this.binder.routine.call(this, this.el, value);
	        }
	      }

	      // Syncs up the view binding with the model.

	    }, {
	      key: 'sync',
	      value: function sync() {
	        var _this4 = this;

	        if (this.observer) {
	          if (this.model !== this.observer.target) {
	            var deps = this.options.dependencies;

	            this.dependencies.forEach(function (observer) {
	              observer.unobserve();
	            });

	            this.dependencies = [];
	            this.model = this.observer.target;

	            if (defined(this.model) && deps && deps.length) {
	              deps.forEach(function (dependency) {
	                var observer = _this4.observe(_this4.model, dependency, _this4.sync);
	                _this4.dependencies.push(observer);
	              });
	            }
	          }

	          this.set(this.observer.value());
	        } else {
	          this.set(this.value);
	        }
	      }

	      // Publishes the value currently set on the input element back to the model.

	    }, {
	      key: 'publish',
	      value: function publish() {
	        var _this5 = this;

	        if (this.observer) {
	          (function () {
	            var value = _this5.getValue(_this5.el);
	            var lastformatterIndex = _this5.formatters.length - 1;

	            _this5.formatters.slice(0).reverse().forEach(function (formatter, fiReversed) {
	              var fi = lastformatterIndex - fiReversed;
	              var args = formatter.split(/\s+/);
	              var id = args.shift();
	              var f = _this5.view.formatters[id];
	              var processedArgs = _this5.parseFormatterArguments(args, fi);

	              if (defined(f) && f.publish) {
	                value = f.publish.apply(f, [value].concat(_toConsumableArray(processedArgs)));
	              }
	            });

	            _this5.observer.setValue(value);
	          })();
	        }
	      }

	      // Subscribes to the model for changes at the specified keypath. Bi-directional
	      // routines will also listen for changes on the element to propagate them back
	      // to the model.

	    }, {
	      key: 'bind',
	      value: function bind() {
	        var _this6 = this;

	        this.parseTarget();

	        if (defined(this.binder.bind)) {
	          this.binder.bind.call(this, this.el);
	        }

	        if (defined(this.model) && defined(this.options.dependencies)) {
	          this.options.dependencies.forEach(function (dependency) {
	            var observer = _this6.observe(_this6.model, dependency, _this6.sync);
	            _this6.dependencies.push(observer);
	          });
	        }

	        if (this.view.preloadData) {
	          this.sync();
	        }
	      }

	      // Unsubscribes from the model and the element.

	    }, {
	      key: 'unbind',
	      value: function unbind() {
	        var _this7 = this;

	        if (defined(this.binder.unbind)) {
	          this.binder.unbind.call(this, this.el);
	        }

	        if (defined(this.observer)) {
	          this.observer.unobserve();
	        }

	        this.dependencies.forEach(function (observer) {
	          observer.unobserve();
	        });

	        this.dependencies = [];

	        Object.keys(this.formatterObservers).forEach(function (fi) {
	          var args = _this7.formatterObservers[fi];

	          Object.keys(args).forEach(function (ai) {
	            args[ai].unobserve();
	          });
	        });

	        this.formatterObservers = {};
	      }

	      // Updates the binding's model from what is currently set on the view. Unbinds
	      // the old model first and then re-binds with the new model.

	    }, {
	      key: 'update',
	      value: function update() {
	        var models = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

	        if (defined(this.observer)) {
	          this.model = this.observer.target;
	        }

	        if (defined(this.binder.update)) {
	          this.binder.update.call(this, models);
	        }
	      }

	      // Returns elements value

	    }, {
	      key: 'getValue',
	      value: function getValue(el) {
	        if (this.binder && defined(this.binder.getValue)) {
	          return this.binder.getValue.call(this, el);
	        } else {
	          return (0, _util.getInputValue)(el);
	        }
	      }
	    }]);

	    return Binding;
	  }();

	  var ComponentBinding = exports.ComponentBinding = function (_Binding) {
	    _inherits(ComponentBinding, _Binding);

	    // Initializes a component binding for the specified view. The raw component
	    // element is passed in along with the component type. Attributes and scope
	    // inflections are determined based on the components defined attributes.
	    function ComponentBinding(view, el, type) {
	      _classCallCheck(this, ComponentBinding);

	      var _this8 = _possibleConstructorReturn(this, Object.getPrototypeOf(ComponentBinding).call(this, view, el, type));

	      _this8.component = _this8.view.components[_this8.type];
	      _this8.static = {};
	      _this8.observers = {};
	      _this8.upstreamObservers = {};

	      var bindingRegExp = view.bindingRegExp();

	      if (_this8.el.attributes) {
	        _this8.el.attributes.forEach(function (attribute) {
	          if (!bindingRegExp.test(attribute.name)) {
	            var propertyName = _this8.camelCase(attribute.name);
	            var stat = _this8.component.static;

	            if (stat && stat.indexOf(propertyName) > -1) {
	              _this8.static[propertyName] = attribute.value;
	            } else {
	              _this8.observers[propertyName] = attribute.value;
	            }
	          }
	        });
	      }
	      return _this8;
	    }

	    // Intercepts `Rivets.Binding::sync` since component bindings are not bound to
	    // a particular model to update it's value.


	    _createClass(ComponentBinding, [{
	      key: 'sync',
	      value: function sync() {}

	      // Intercepts `Rivets.Binding::update` since component bindings are not bound
	      // to a particular model to update it's value.

	    }, {
	      key: 'update',
	      value: function update() {}

	      // Intercepts `Rivets.Binding::publish` since component bindings are not bound
	      // to a particular model to update it's value.

	    }, {
	      key: 'publish',
	      value: function publish() {}

	      // Returns an object map using the component's scope inflections.

	    }, {
	      key: 'locals',
	      value: function locals() {
	        var _this9 = this;

	        var result = {};

	        Object.keys(this.static).forEach(function (key) {
	          result[key] = _this9.static[key];
	        });

	        Object.keys(this.observers).forEach(function (key) {
	          result[key] = _this9.observers[key].value();
	        });

	        return result;
	      }

	      // Returns a camel-cased version of the string. Used when translating an
	      // element's attribute name into a property name for the component's scope.

	    }, {
	      key: 'camelCase',
	      value: function camelCase(string) {
	        return string.replace(/-([a-z])/g, function (grouped) {
	          grouped[1].toUpperCase();
	        });
	      }

	      // Intercepts `Rivets.Binding::bind` to build `@componentView` with a localized
	      // map of models from the root view. Bind `@componentView` on subsequent calls.

	    }, {
	      key: 'bind',
	      value: function bind() {
	        var _this10 = this;

	        if (!this.bound) {
	          Object.keys(this.observers).forEach(function (key) {
	            var keypath = _this10.observers[key];

	            _this10.observers[key] = _this10.observe(_this10.view.models, keypath, function (key) {
	              return function () {
	                _this10.componentView.models[key] = _this10.observers[key].value();
	              };
	            }.call(_this10, key));
	          });

	          this.bound = true;
	        }

	        if (defined(this.componentView)) {
	          this.componentView.bind();
	        } else {
	          (function () {
	            _this10.el.innerHTML = _this10.component.template.call(_this10);
	            var scope = _this10.component.initialize.call(_this10, _this10.el, _this10.locals());
	            _this10.el._bound = true;

	            var options = {};

	            _constants.EXTENSIONS.forEach(function (extensionType) {
	              options[extensionType] = {};

	              if (_this10.component[extensionType]) {
	                Object.keys(_this10.component[extensionType]).forEach(function (key) {
	                  options[extensionType][key] = _this10.component[extensionType][key];
	                });
	              }

	              Object.keys(_this10.view[extensionType]).forEach(function (key) {
	                if (!defined(options[extensionType][key])) {
	                  options[extensionType][key] = _this10.view[extensionType][key];
	                }
	              });
	            });

	            _constants.OPTIONS.forEach(function (option) {
	              if (defined(_this10.component[option])) {
	                options[option] = _this10.component[option];
	              } else {
	                options[option] = _this10.view[option];
	              }
	            });

	            _this10.componentView = new View(_this10.el, scope, options);
	            _this10.componentView.bind();

	            Object.keys(_this10.observers).forEach(function (key) {
	              var observer = _this10.observers[key];
	              var models = _this10.componentView.models;

	              var upstream = _this10.observe(models, key, function (key, observer) {
	                return function () {
	                  observer.setValue(_this10.componentView.models[key]);
	                };
	              }.call(_this10, key, observer));

	              _this10.upstreamObservers[key] = upstream;
	            });
	          })();
	        }
	      }

	      // Intercept `Rivets.Binding::unbind` to be called on `@componentView`.

	    }, {
	      key: 'unbind',
	      value: function unbind() {
	        var _this11 = this;

	        Object.keys(this.upstreamObservers).forEach(function (key) {
	          _this11.upstreamObservers[key].unobserve();
	        });

	        Object.keys(this.observers).forEach(function (key) {
	          _this11.observers[key].unobserve();
	        });

	        if (defined(this.componentView)) {
	          this.componentView.unbind.call(this);
	        }
	      }
	    }]);

	    return ComponentBinding;
	  }(Binding);

	  var TextBinding = exports.TextBinding = function (_Binding2) {
	    _inherits(TextBinding, _Binding2);

	    // Initializes a text binding for the specified view and text node.
	    function TextBinding(view, el, type, keypath) {
	      var options = arguments.length <= 4 || arguments[4] === undefined ? {} : arguments[4];

	      _classCallCheck(this, TextBinding);

	      var _this12 = _possibleConstructorReturn(this, Object.getPrototypeOf(TextBinding).call(this, view, el, type));

	      _this12.keypath = keypath;
	      _this12.options = options;
	      _this12.formatters = _this12.options.formatters || [];
	      _this12.dependencies = [];
	      _this12.formatterObservers = {};

	      _this12.binder = {
	        routine: function routine(node, value) {
	          node.data = defined(value) ? value : '';
	        }
	      };

	      _this12.sync = _this12.sync.bind(_this12);
	      return _this12;
	    }

	    // Wrap the call to `sync` to avoid function context issues.


	    _createClass(TextBinding, [{
	      key: 'sync',
	      value: function sync() {
	        _get(Object.getPrototypeOf(TextBinding.prototype), 'sync', this).call(this);
	      }
	    }]);

	    return TextBinding;
	  }(Binding);
	});

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function (global, factory) {
	  if (true) {
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [exports], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  } else if (typeof exports !== "undefined") {
	    factory(exports);
	  } else {
	    var mod = {
	      exports: {}
	    };
	    factory(mod.exports);
	    global.parsers = mod.exports;
	  }
	})(this, function (exports) {
	  'use strict';

	  Object.defineProperty(exports, "__esModule", {
	    value: true
	  });
	  exports.parseType = parseType;
	  exports.parseTemplate = parseTemplate;
	  var PRIMITIVE = exports.PRIMITIVE = 0;
	  var KEYPATH = 1;
	  var TEXT = 0;
	  var BINDING = 1;

	  // Parser and tokenizer for getting the type and value from a string.
	  function parseType(string) {
	    var type = PRIMITIVE;
	    var value = string;

	    if (/^'.*'$|^".*"$/.test(string)) {
	      value = string.slice(1, -1);
	    } else if (string === 'true') {
	      value = true;
	    } else if (string === 'false') {
	      value = false;
	    } else if (string === 'null') {
	      value = null;
	    } else if (string === 'undefined') {
	      value = undefined;
	    } else if (isNaN(Number(string)) === false) {
	      value = Number(string);
	    } else {
	      type = KEYPATH;
	    }

	    return { type: type, value: value };
	  }

	  // Template parser and tokenizer for mustache-style text content bindings.
	  // Parses the template and returns a set of tokens, separating static portions
	  // of text from binding declarations.
	  function parseTemplate(template, delimiters) {
	    var tokens = [];
	    var length = template.length;
	    var index = 0;
	    var lastIndex = 0;

	    while (lastIndex < length) {
	      index = template.indexOf(delimiters[0], lastIndex);

	      if (index < 0) {
	        tokens.push({
	          type: TEXT,
	          value: template.slice(lastIndex)
	        });

	        break;
	      } else {
	        if (index > 0 && lastIndex < index) {
	          tokens.push({
	            type: TEXT,
	            value: template.slice(lastIndex, index)
	          });
	        }

	        lastIndex = index + delimiters[0].length;
	        index = template.indexOf(delimiters[1], lastIndex);

	        if (index < 0) {
	          var substring = template.slice(lastIndex - delimiters[1].length);
	          var lastToken = tokens[tokens.length - 1];

	          if (lastToken && lastToken.type === TEXT) {
	            lastToken.value += substring;
	          } else {
	            tokens.push({
	              type: TEXT,
	              value: substring
	            });
	          }

	          break;
	        }

	        var value = template.slice(lastIndex, index).trim();

	        tokens.push({
	          type: BINDING,
	          value: value
	        });

	        lastIndex = index + delimiters[1].length;
	      }
	    }

	    return tokens;
	  }
	});

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function (global, factory) {
	  if (true) {
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [exports], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  } else if (typeof exports !== "undefined") {
	    factory(exports);
	  } else {
	    var mod = {
	      exports: {}
	    };
	    factory(mod.exports);
	    global.util = mod.exports;
	  }
	})(this, function (exports) {
	  'use strict';

	  Object.defineProperty(exports, "__esModule", {
	    value: true
	  });
	  exports.bindEvent = bindEvent;
	  exports.unbindEvent = unbindEvent;
	  exports.getInputValue = getInputValue;

	  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
	    return typeof obj;
	  } : function (obj) {
	    return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj;
	  };

	  var $ = window.jQuery || window.$;

	  function bindEvent(el, event, handler) {
	    if ($) {
	      $(el).on(event, handler);
	    } else {
	      el.addEventListener(event, handler, false);
	    }
	  }

	  function unbindEvent(el, event, handler) {
	    if ($) {
	      $(el).off(event, handler);
	    } else {
	      el.removeEventListener(event, handler, false);
	    }
	  }

	  function getInputValue(el) {
	    if ($) {
	      var $el = $(el);

	      if ($el.attr('type') === 'checkbox') {
	        return $el.is(':checked');
	      } else {
	        return $el.val();
	      }
	    } else {
	      if (el.type === 'checkbox') {
	        return el.checked;
	      } else if (el.type === 'select-multiple') {
	        var _ret = function () {
	          var results = [];

	          el.options.forEach(function (option) {
	            if (option.selected) {
	              results.push(option.value);
	            }
	          });

	          return {
	            v: results
	          };
	        }();

	        if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
	      } else {
	        return el.value;
	      }
	    }
	  }
	});

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function (global, factory) {
	  if (true) {
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [module, exports], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  } else if (typeof exports !== "undefined") {
	    factory(module, exports);
	  } else {
	    var mod = {
	      exports: {}
	    };
	    factory(mod, mod.exports);
	    global.adapter = mod.exports;
	  }
	})(this, function (module, exports) {
	  'use strict';

	  Object.defineProperty(exports, "__esModule", {
	    value: true
	  });
	  // The default `.` adapter thats comes with Rivets.js. Allows subscribing to
	  // properties on plain objects, implemented in ES5 natives using
	  // `Object.defineProperty`.

	  var defined = function defined(value) {
	    return value !== undefined && value !== null;
	  };

	  var ARRAY_METHODS = ['push', 'pop', 'shift', 'unshift', 'sort', 'reverse', 'splice'];

	  var adapter = {
	    id: '_rv',
	    counter: 0,
	    weakmap: {},

	    weakReference: function weakReference(obj) {
	      if (!obj.hasOwnProperty(this.id)) {
	        var id = this.counter++;

	        Object.defineProperty(obj, this.id, {
	          value: id
	        });
	      }

	      if (!this.weakmap[obj[this.id]]) {
	        this.weakmap[obj[this.id]] = {
	          callbacks: {}
	        };
	      }

	      return this.weakmap[obj[this.id]];
	    },

	    cleanupWeakReference: function cleanupWeakReference(ref, id) {
	      if (!Object.keys(ref.callbacks).length) {
	        if (!(ref.pointers && Object.keys(ref.pointers).length)) {
	          delete this.weakmap[id];
	        }
	      }
	    },

	    stubFunction: function stubFunction(obj, fn) {
	      var original = obj[fn];
	      var map = this.weakReference(obj);
	      var weakmap = this.weakmap;

	      obj[fn] = function () {
	        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	          args[_key] = arguments[_key];
	        }

	        var response = original.apply(obj, args);

	        Object.keys(map.pointers).forEach(function (r) {
	          var k = map.pointers[r];

	          if (defined(weakmap[r])) {
	            if (weakmap[r].callbacks[k] instanceof Array) {
	              weakmap[r].callbacks[k].forEach(function (callback) {
	                callback();
	              });
	            }
	          }
	        });

	        return response;
	      };
	    },

	    observeMutations: function observeMutations(obj, ref, keypath) {
	      var _this = this;

	      if (obj instanceof Array) {
	        var map = this.weakReference(obj);

	        if (!defined(map.pointers)) {
	          map.pointers = {};

	          ARRAY_METHODS.forEach(function (fn) {
	            _this.stubFunction(obj, fn);
	          });
	        }

	        if (!defined(map.pointers[ref])) {
	          map.pointers[ref] = [];
	        }

	        if (map.pointers[ref].indexOf(keypath) === -1) {
	          map.pointers[ref].push(keypath);
	        }
	      }
	    },

	    unobserveMutations: function unobserveMutations(obj, ref, keypath) {
	      if (obj instanceof Array && defined(obj[this.id])) {
	        var map = this.weakmap[obj[this.id]];

	        if (map) {
	          var pointers = map.pointers[ref];

	          if (pointers) {
	            var idx = pointers.indexOf(keypath);

	            if (idx > -1) {
	              pointers.splice(idx, 1);
	            }

	            if (!pointers.length) {
	              delete map.pointers[ref];
	            }

	            this.cleanupWeakReference(map, obj[this.id]);
	          }
	        }
	      }
	    },

	    observe: function observe(obj, keypath, callback) {
	      var _this2 = this;

	      var callbacks = this.weakReference(obj).callbacks;

	      if (!defined(callbacks[keypath])) {
	        callbacks[keypath] = [];
	        var desc = Object.getOwnPropertyDescriptor(obj, keypath);

	        if (!(desc && (desc.get || desc.set))) {
	          (function () {
	            var value = obj[keypath];

	            Object.defineProperty(obj, keypath, {
	              enumerable: true,

	              get: function get() {
	                return value;
	              },

	              set: function set(newValue) {
	                if (newValue !== value) {
	                  _this2.unobserveMutations(value, obj[_this2.id], keypath);
	                  value = newValue;
	                  var map = _this2.weakmap[obj[_this2.id]];

	                  if (map) {
	                    var _callbacks = map.callbacks;

	                    if (_callbacks[keypath]) {
	                      _callbacks[keypath].forEach(function (cb) {
	                        cb();
	                      });
	                    }

	                    _this2.observeMutations(newValue, obj[_this2.id], keypath);
	                  }
	                }
	              }
	            });
	          })();
	        }
	      }

	      if (callbacks[keypath].indexOf(callback) === -1) {
	        callbacks[keypath].push(callback);
	      }

	      this.observeMutations(obj[keypath], obj[this.id], keypath);
	    },

	    unobserve: function unobserve(obj, keypath, callback) {
	      var map = this.weakmap[obj[this.id]];

	      if (map) {
	        var callbacks = map.callbacks[keypath];

	        if (callbacks) {
	          var idx = callbacks.indexOf(callback);

	          if (idx > -1) {
	            callbacks.splice(idx, 1);

	            if (!callbacks.length) {
	              delete map.callbacks[keypath];
	            }
	          }

	          this.unobserveMutations(obj[keypath], obj[this.id], keypath);
	          this.cleanupWeakReference(map, obj[this.id]);
	        }
	      }
	    },

	    get: function get(obj, keypath) {
	      return obj[keypath];
	    },

	    set: function set(obj, keypath, value) {
	      obj[keypath] = value;
	    }
	  };

	  exports.default = adapter;
	  module.exports = exports['default'];
	});

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function (global, factory) {
	  if (true) {
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [module, exports, __webpack_require__(2), __webpack_require__(7)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  } else if (typeof exports !== "undefined") {
	    factory(module, exports, require('./rivets'), require('./util'));
	  } else {
	    var mod = {
	      exports: {}
	    };
	    factory(mod, mod.exports, global.rivets, global.util);
	    global.binders = mod.exports;
	  }
	})(this, function (module, exports, _rivets, _util) {
	  'use strict';

	  Object.defineProperty(exports, "__esModule", {
	    value: true
	  });

	  var _rivets2 = _interopRequireDefault(_rivets);

	  function _interopRequireDefault(obj) {
	    return obj && obj.__esModule ? obj : {
	      default: obj
	    };
	  }

	  var _templateObject = _taggedTemplateLiteral([' rivets: ', ' ', ' '], [' rivets: ', ' ', ' ']),
	      _templateObject2 = _taggedTemplateLiteral([' rivets: ', ' '], [' rivets: ', ' ']);

	  function _taggedTemplateLiteral(strings, raw) {
	    return Object.freeze(Object.defineProperties(strings, {
	      raw: {
	        value: Object.freeze(raw)
	      }
	    }));
	  }

	  var CHANGE_EVENT = 'change';

	  var defined = function defined(value) {
	    return value !== undefined && value !== null;
	  };

	  var getString = function getString(value) {
	    return defined(value) ? value.toString() : undefined;
	  };

	  var times = function times(n, cb) {
	    for (var i = 0; i < n; i++) {
	      cb();
	    }
	  };

	  var binders = {
	    // Sets the element's text value.
	    text: function text(el, value) {
	      el.textContent = defined(value) ? value : '';
	    },

	    // Sets the element's HTML content.
	    html: function html(el, value) {
	      el.innerHTML = defined(value) ? value : '';
	    },

	    // Shows the element when value is true.
	    show: function show(el, value) {
	      el.style.display = value ? '' : 'none';
	    },

	    // Hides the element when value is true (negated version of `show` binder).
	    hide: function hide(el, value) {
	      el.style.display = value ? 'none' : '';
	    },

	    // Enables the element when value is true.
	    enabled: function enabled(el, value) {
	      el.disabled = !value;
	    },

	    // Disables the element when value is true (negated version of `enabled` binder).
	    disabled: function disabled(el, value) {
	      el.disabled = !!value;
	    },

	    // Checks a checkbox or radio input when the value is true. Also sets the model
	    // property when the input is checked or unchecked (two-way binder).
	    checked: {
	      publishes: true,
	      priority: 2000,

	      bind: function bind(el) {
	        (0, _util.bindEvent)(el, CHANGE_EVENT, this.publish);
	      },

	      unbind: function unbind(el) {
	        (0, _util.unbindEvent)(el, CHANGE_EVENT, this.publish);
	      },

	      routine: function routine(el, value) {
	        if (el.type === 'radio') {
	          el.checked = getString(el.value) === getString(value);
	        } else {
	          el.checked = !!value;
	        }
	      }
	    },

	    // Unchecks a checkbox or radio input when the value is true (negated version of
	    // `checked` binder). Also sets the model property when the input is checked or
	    // unchecked (two-way binder).
	    unchecked: {
	      publishes: true,
	      priority: 2000,

	      bind: function bind(el) {
	        (0, _util.bindEvent)(el, CHANGE_EVENT, this.publish);
	      },

	      unbind: function unbind(el) {
	        (0, _util.unbindEvent)(el, CHANGE_EVENT, this.publish);
	      },

	      routine: function routine(el, value) {
	        if (el.type === 'radio') {
	          el.checked = getString(el.value) !== getString(value);
	        } else {
	          el.checked = !value;
	        }
	      }
	    },

	    // Sets the element's value. Also sets the model property when the input changes
	    // (two-way binder).
	    value: {
	      publishes: true,
	      priority: 3000,

	      bind: function bind(el) {
	        if (!(el.tagName === 'INPUT' && el.type === 'radio')) {
	          this.event = el.tagName === 'SELECT' ? 'change' : 'input';

	          (0, _util.bindEvent)(el, this.event, this.publish);
	        }
	      },

	      unbind: function unbind(el) {
	        if (!(el.tagName === 'INPUT' && el.type === 'radio')) {
	          (0, _util.unbindEvent)(el, this.event, this.publish);
	        }
	      },

	      routine: function routine(el, value) {
	        if (el.tagName === 'INPUT' && el.type === 'radio') {
	          el.setAttribute('value', value);
	        } else if (window.jQuery) {
	          el = jQuery(el);

	          if (getString(value) !== getString(el.val())) {
	            el.val(defined(value) ? value : '');
	          }
	        } else {
	          if (el.type === 'select-multiple') {
	            if (value instanceof Array) {
	              Array.from(el.options).forEach(function (option) {
	                option.selected = value.indexOf(option.value) > -1;
	              });
	            }
	          } else if (getString(value) !== getString(el.value)) {
	            el.value = defined(value) ? value : '';
	          }
	        }
	      }
	    },

	    // Inserts and binds the element and it's child nodes into the DOM when true.
	    if: {
	      block: true,
	      priority: 4000,

	      bind: function bind(el) {
	        if (!defined(this.marker)) {
	          var attr = [this.view.prefix, this.type].join('-').replace('--', '-');
	          var declaration = el.getAttribute(attr);

	          this.marker = document.createComment(_templateObject, this.type, declaration);
	          this.bound = false;

	          el.removeAttribute(attr);
	          el.parentNode.insertBefore(this.marker, el);
	          el.parentNode.removeChild(el);
	        }
	      },

	      unbind: function unbind() {
	        if (defined(this.nested)) {
	          this.nested.unbind();
	          this.bound = false;
	        }
	      },

	      routine: function routine(el, value) {
	        var _this = this;

	        if (!!value === !this.bound) {
	          if (value) {
	            (function () {
	              var models = {};

	              Object.keys(_this.view.models).forEach(function (key) {
	                models[key] = _this.view.models[key];
	              });

	              if (defined(_this.nested)) {
	                _this.nested.bind();
	              } else {
	                _this.nested = _rivets2.default.bind(el, models, _this.view.options());
	              }

	              _this.marker.parentNode.insertBefore(el, _this.marker.nextSibling);
	              _this.bound = true;
	            })();
	          } else {
	            el.parentNode.removeChild(el);
	            this.nested.unbind();
	            this.bound = false;
	          }
	        }
	      },

	      update: function update(models) {
	        if (defined(this.nested)) {
	          this.nested.update(models);
	        }
	      }
	    },

	    // Removes and unbinds the element and it's child nodes into the DOM when true
	    // (negated version of `if` binder).
	    unless: {
	      block: true,
	      priority: 4000,

	      bind: function bind(el) {
	        _rivets2.default.binders.if.bind.call(this, el);
	      },

	      unbind: function unbind() {
	        _rivets2.default.binders.if.unbind.call(this);
	      },

	      routine: function routine(el, value) {
	        _rivets2.default.binders.if.routine.call(this, el, !value);
	      },

	      update: function update(models) {
	        _rivets2.default.binders.if.update.call(this, models);
	      }
	    },

	    // Binds an event handler on the element.
	    'on-*': {
	      function: true,
	      priority: 1000,

	      unbind: function unbind(el) {
	        if (defined(this.handler)) {
	          (0, _util.unbindEvent)(el, this.args[0], this.handler);
	        }
	      },

	      routine: function routine(el, value) {
	        if (defined(this.handler)) {
	          (0, _util.unbindEvent)(el, this.args[0], this.handler);
	        }

	        this.handler = this.eventHandler(value);
	        (0, _util.bindEvent)(el, this.args[0], this.handler);
	      }
	    },

	    // Appends bound instances of the element in place for each item in the array.
	    'each-*': {
	      block: true,
	      priority: 4000,

	      bind: function bind(el) {
	        if (!defined(this.marker)) {
	          var attr = [this.view.prefix, this.type].join('-').replace('--', '-');
	          this.marker = document.createComment(_templateObject2, this.type);
	          this.iterated = [];

	          el.removeAttribute(attr);
	          el.parentNode.insertBefore(this.marker, el);
	          el.parentNode.removeChild(el);
	        } else {
	          this.iterated.forEach(function (view) {
	            view.bind();
	          });
	        }
	      },

	      unbind: function unbind(el) {
	        if (defined(this.iterated)) {
	          this.iterated.forEach(function (view) {
	            view.unbind();
	          });
	        }
	      },

	      routine: function routine(el, _collection) {
	        var _this2 = this;

	        var modelName = this.args[0];
	        var collection = _collection || [];

	        if (this.iterated.length > collection.length) {
	          times(this.iterated.length - collection.length, function () {
	            var view = _this2.iterated.pop();
	            view.unbind();
	            _this2.marker.parentNode.removeChild(view.els[0]);
	          });
	        }

	        collection.forEach(function (model, index) {
	          var data = { index: index };
	          data[_rivets2.default.iterationAlias(modelName)] = index;
	          data[modelName] = model;

	          if (!defined(_this2.iterated[index])) {
	            Object.keys(_this2.view.models).forEach(function (key) {
	              if (!defined(data[key])) {
	                data[key] = _this2.view.models[key];
	              }
	            });

	            var previous = _this2.marker;

	            if (_this2.iterated.length) {
	              previous = _this2.iterated[_this2.iterated.length - 1].els[0];
	            }

	            var options = _this2.view.options();
	            options.preloadData = true;

	            var template = el.cloneNode(true);
	            var view = _rivets2.default.bind(template, data, options);
	            _this2.iterated.push(view);
	            _this2.marker.parentNode.insertBefore(template, previous.nextSibling);
	          } else if (_this2.iterated[index].models[modelName] !== model) {
	            _this2.iterated[index].update(data);
	          }
	        });

	        if (el.nodeName === 'OPTION') {
	          this.view.bindings.forEach(function (binding) {
	            if (binding.el === _this2.marker.parentNode && binding.type === 'value') {
	              binding.sync();
	            }
	          });
	        }
	      },

	      update: function update(models) {
	        var _this3 = this;

	        var data = {};

	        Object.keys(models).forEach(function (key) {
	          if (key !== _this3.args[0]) {
	            data[key] = models[key];
	          }
	        });

	        this.iterated.forEach(function (view) {
	          view.update(data);
	        });
	      }
	    },

	    // Adds or removes the class from the element when value is true or false.
	    'class-*': function _class(el, value) {
	      var elClass = ' ' + el.className + ' ';

	      if (!value === elClass.indexOf(' ' + this.args[0] + ' ') > -1) {
	        if (value) {
	          el.className = el.className + ' ' + this.args[0];
	        } else {
	          el.className = elClass.replace(' ' + this.args[0] + ' ', ' ').trim();
	        }
	      }
	    },

	    // Sets the attribute on the element. If no binder above is matched it will fall
	    // back to using this binder.
	    '*': function _(el, value) {
	      if (defined(value)) {
	        el.setAttribute(this.type, value);
	      } else {
	        el.removeAttribute(this.type);
	      }
	    }
	  };

	  exports.default = binders;
	  module.exports = exports['default'];
	});

/***/ }
/******/ ])
});
;