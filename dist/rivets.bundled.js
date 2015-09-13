(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define(factory);
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

	"use strict";

	var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

	var sightglass = _interopRequire(__webpack_require__(1));

	var rivets = _interopRequire(__webpack_require__(2));

	var View = _interopRequire(__webpack_require__(4));

	var adapter = _interopRequire(__webpack_require__(8));

	var binders = _interopRequire(__webpack_require__(9));

	// Module factory. Integrates sightglass and public API methods. Returns the
	// public interface.
	var factory = function (sightglass) {
	  rivets.sightglass = sightglass;
	  rivets.binders = binders;
	  rivets.adapters["."] = adapter;

	  // Binds some data to a template / element. Retuddrns a Rivets.View instance.
	  rivets.bind = function (el) {
	    var models = arguments[1] === undefined ? {} : arguments[1];
	    var options = arguments[2] === undefined ? {} : arguments[2];

	    var view = new View(el, models, options);
	    view.bind();
	    return view;
	  };

	  // Initializes a new instance of a component on the specified element and
	  // returns a Rivets.View instance.
	  rivets.init = function (component, el) {
	    var data = arguments[2] === undefined ? {} : arguments[2];

	    if (!el) {
	      el = document.createElement("div");
	    }

	    var component = rivets.components[component];
	    el.innerHTML = component.template.call(rivets, el);
	    var scope = component.initialize.call(rivets, el, data);

	    var view = new View(el, scope);
	    view.bind();
	    return view;
	  };

	  return rivets;
	};

	module.exports = factory(sightglass);

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;"use strict";

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
	    this.parse();

	    if (isObject(this.target = this.realize())) {
	      this.set(true, this.key, this.target, this.callback);
	    }
	  }

	  // Tokenizes the provided keypath string into interface + path tokens for the
	  // observer to work with.
	  Observer.tokenize = function (keypath, interfaces, root) {
	    var tokens = [];
	    var current = { i: root, path: "" };
	    var index, chr;

	    for (index = 0; index < keypath.length; index++) {
	      chr = keypath.charAt(index);

	      if (!! ~interfaces.indexOf(chr)) {
	        tokens.push(current);
	        current = { i: chr, path: "" };
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
	      error("Must define at least one adapter interface.");
	    }

	    if (!! ~interfaces.indexOf(this.keypath[0])) {
	      root = this.keypath[0];
	      path = this.keypath.substr(1);
	    } else {
	      if (typeof (root = this.options.root || sightglass.root) === "undefined") {
	        error("Must define a default root adapter.");
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
	        if (typeof this.objectPath[index] !== "undefined") {
	          if (current !== (prev = this.objectPath[index])) {
	            this.set(false, token, prev, this.update.bind(this));
	            this.set(true, token, current, this.update.bind(this));
	            this.objectPath[index] = current;
	          }
	        } else {
	          this.set(true, token, current, this.update.bind(this));
	          this.objectPath[index] = current;
	        }

	        current = this.get(token, current);
	      } else {
	        if (unreached === false) {
	          unreached = index;
	        }

	        if (prev = this.objectPath[index]) {
	          this.set(false, token, prev, this.update.bind(this));
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
	    var action = active ? "observe" : "unobserve";
	    this.adapter(key)[action](obj, key.path, callback);
	  };

	  // Returns an array of all unique adapter interfaces available.
	  Observer.prototype.interfaces = function () {
	    var interfaces = Object.keys(this.options.adapters);

	    Object.keys(sightglass.adapters).forEach(function (i) {
	      if (! ~interfaces.indexOf(i)) {
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
	        this.set(false, token, obj, this.update.bind(this));
	      }
	    }, this);

	    if (isObject(this.target)) {
	      this.set(false, this.key, this.target, this.callback);
	    }
	  };

	  // Check if a value is an object than can be observed.
	  function isObject(obj) {
	    return typeof obj === "object" && obj !== null;
	  }

	  // Error thrower.
	  function error(message) {
	    throw new Error("[sightglass] " + message);
	  }

	  // Export module for Node and the browser.
	  if (typeof module !== "undefined" && module.exports) {
	    module.exports = sightglass;
	  } else if (true) {
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = function () {
	      return this.sightglass = sightglass;
	    }.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  } else {
	    this.sightglass = sightglass;
	  }
	}).call(undefined);

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _constants = __webpack_require__(3);

	var OPTIONS = _constants.OPTIONS;
	var EXTENSIONS = _constants.EXTENSIONS;

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
	  prefix: "rv",

	  // Default template delimiters.
	  templateDelimiters: ["{", "}"],

	  // Default sightglass root interface.
	  rootInterface: ".",

	  // Preload data by default.
	  preloadData: true,

	  // Default event handler.
	  handler: function handler(context, ev, binding) {
	    this.call(context, ev, binding.view.models);
	  },

	  // Merges an object literal into the corresponding global options.
	  configure: function configure() {
	    var _this = this;

	    var options = arguments[0] === undefined ? {} : arguments[0];

	    Object.keys(options).forEach(function (option) {
	      var value = options[option];

	      if (EXTENSIONS.indexOf(option) > -1) {
	        Object.keys(value).forEach(function (key) {
	          _this[option][key] = value[key];
	        });
	      } else {
	        _this[option] = value;
	      }
	    });
	  }
	};

	module.exports = rivets;

/***/ },
/* 3 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var OPTIONS = ["prefix", "templateDelimiters", "rootInterface", "preloadData", "handler"];

	exports.OPTIONS = OPTIONS;
	var EXTENSIONS = ["binders", "formatters", "components", "adapters"];
	exports.EXTENSIONS = EXTENSIONS;

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

	var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

	var rivets = _interopRequire(__webpack_require__(2));

	var _constants = __webpack_require__(3);

	var OPTIONS = _constants.OPTIONS;
	var EXTENSIONS = _constants.EXTENSIONS;

	var _bindings = __webpack_require__(5);

	var Binding = _bindings.Binding;
	var TextBinding = _bindings.TextBinding;
	var ComponentBinding = _bindings.ComponentBinding;

	var parseTemplate = __webpack_require__(6).parseTemplate;

	var defined = function (value) {
	  return value !== undefined && value !== null;
	};

	// A collection of bindings built from a set of parent nodes.

	var View = (function () {
	  // The DOM elements and the model objects for binding are passed into the
	  // constructor along with any local options that should be used throughout the
	  // context of the view and it's bindings.

	  function View(els, models) {
	    var _this = this;

	    var options = arguments[2] === undefined ? {} : arguments[2];

	    _classCallCheck(this, View);

	    if (els.jquery || els instanceof Array) {
	      this.els = els;
	    } else {
	      this.els = [els];
	    }

	    this.models = models;

	    EXTENSIONS.forEach(function (extensionType) {
	      _this[extensionType] = {};

	      if (options[extensionType]) {
	        Object.keys(options[extensionType]).forEach(function (key) {
	          _this[extensionType][key] = options[extensionType][key];
	        });
	      }

	      Object.keys(rivets[extensionType]).forEach(function (key) {
	        if (!defined(_this[extensionType][key])) {
	          _this[extensionType][key] = rivets[extensionType][key];
	        }
	      });
	    });

	    OPTIONS.forEach(function (option) {
	      _this[option] = defined(options[option]) ? options[option] : rivets[option];
	    });

	    this.build();
	  }

	  _createClass(View, {
	    options: {
	      value: function options() {
	        var _this = this;

	        var options = {};

	        EXTENSIONS.concat(OPTIONS).forEach(function (option) {
	          options[option] = _this[option];
	        });

	        return options;
	      }
	    },
	    bindingRegExp: {

	      // Regular expression used to match binding attributes.

	      value: function bindingRegExp() {
	        return new RegExp("^" + this.prefix + "-");
	      }
	    },
	    buildBinding: {
	      value: function buildBinding(binding, node, type, declaration) {
	        var pipes = declaration.split("|").map(function (pipe) {
	          return pipe.trim();
	        });

	        var context = pipes.shift().split("<").map(function (ctx) {
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
	    },
	    build: {

	      // Parses the DOM tree and builds `Binding` instances for every matched
	      // binding declaration.

	      value: function build() {
	        var _this = this;

	        this.bindings = [];

	        var parse = function (node) {
	          var block = false;

	          if (node.nodeType === 3) {
	            var delimiters = _this.templateDelimiters;

	            if (delimiters) {
	              var tokens = parseTemplate(node.data, delimiters);

	              if (tokens.length) {
	                if (!(tokens.length === 1 && tokens[0].type === 0)) {
	                  tokens.forEach(function (token) {
	                    var text = document.createTextNode(token.value);
	                    node.parentNode.insertBefore(text, node);

	                    if (token.type === 1) {
	                      _this.buildBinding(TextBinding, text, null, token.value);
	                    }
	                  });

	                  node.parentNode.removeChild(node);
	                }
	              }
	            }
	          } else if (node.nodeType === 1) {
	            block = _this.traverse(node);
	          }

	          if (!block) {
	            Array.prototype.slice.call(node.childNodes).forEach(parse);
	          }
	        };

	        this.els.forEach(parse);

	        this.bindings.sort(function (a, b) {
	          var aPriority = defined(a.binder) ? a.binder.priority || 0 : 0;
	          var bPriority = defined(b.binder) ? b.binder.priority || 0 : 0;
	          return bPriority - aPriority;
	        });
	      }
	    },
	    traverse: {
	      value: function traverse(node) {
	        var _this = this;

	        var bindingRegExp = this.bindingRegExp();
	        var block = node.nodeName === "SCRIPT" || node.nodeName === "STYLE";
	        var attributes = null;

	        Array.prototype.slice.call(node.attributes).forEach(function (attribute) {
	          if (bindingRegExp.test(attribute.name)) {
	            (function () {
	              var type = attribute.name.replace(bindingRegExp, "");
	              var binder = _this.binders[type];

	              if (!binder) {
	                Object.keys(_this.binders).forEach(function (identifier) {
	                  var value = _this.binders[identifier];

	                  if (identifier !== "*" && identifier.indexOf("*") > -1) {
	                    var regexp = new RegExp("^" + identifier.replace(/\*/g, ".+") + "$");

	                    if (regexp.test(type)) {
	                      binder = value;
	                    }
	                  }
	                });
	              }

	              if (!defined(binder)) {
	                binder = _this.binders["*"];
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
	            var type = attribute.name.replace(bindingRegExp, "");
	            _this.buildBinding(Binding, node, type, attribute.value);
	          }
	        });

	        if (!block) {
	          var type = node.nodeName.toLowerCase();

	          if (this.components[type] && !node._bound) {
	            this.bindings.push(new ComponentBinding(this, node, type));
	            block = true;
	          }
	        }

	        return block;
	      }
	    },
	    select: {

	      // Returns an array of bindings where the supplied function evaluates to true.

	      value: function select(fn) {
	        return this.bindings.filter(fn);
	      }
	    },
	    bind: {

	      // Binds all of the current bindings for this view.

	      value: function bind() {
	        this.bindings.forEach(function (binding) {
	          binding.bind();
	        });
	      }
	    },
	    unbind: {

	      // Unbinds all of the current bindings for this view.

	      value: function unbind() {
	        this.bindings.forEach(function (binding) {
	          binding.unbind();
	        });
	      }
	    },
	    sync: {

	      // Syncs up the view with the model by running the routines on all bindings.

	      value: function sync() {
	        this.bindings.forEach(function (binding) {
	          binding.sync();
	        });
	      }
	    },
	    publish: {

	      // Publishes the input values from the view back to the model (reverse sync).

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
	    },
	    update: {

	      // Updates the view's models along with any affected bindings.

	      value: function update() {
	        var _this = this;

	        var models = arguments[0] === undefined ? {} : arguments[0];

	        Object.keys(models).forEach(function (key) {
	          _this.models[key] = models[key];
	        });

	        this.bindings.forEach(function (binding) {
	          if (defined(binding.update)) {
	            binding.update(models);
	          }
	        });
	      }
	    }
	  });

	  return View;
	})();

	module.exports = View;

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

	var _toConsumableArray = function (arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } };

	var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

	var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

	var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var rivets = _interopRequire(__webpack_require__(2));

	var parseType = __webpack_require__(6).parseType;

	var getInputValue = __webpack_require__(7).getInputValue;

	var defined = function (value) {
	  return value !== undefined && value !== null;
	};

	// A single binding between a model attribute and a DOM element.

	var Binding = exports.Binding = (function () {
	  // All information about the binding is passed into the constructor; the
	  // containing view, the DOM node, the type of binding, the model object and the
	  // keypath at which to listen for changes.

	  function Binding(view, el, type, keypath) {
	    var options = arguments[4] === undefined ? {} : arguments[4];

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

	  _createClass(Binding, {
	    setBinder: {

	      // Sets the binder to use when binding and syncing.

	      value: function setBinder() {
	        var _this = this;

	        this.binder = this.view.binders[this.type];

	        if (!this.binder) {
	          Object.keys(this.view.binders).forEach(function (identifier) {
	            var value = _this.view.binders[identifier];

	            if (identifier !== "*" && identifier.indexOf("*") > -1) {
	              var regexp = new RegExp("^" + identifier.replace(/\*/g, ".+") + "$");

	              if (regexp.test(_this.type)) {
	                _this.binder = value;
	                _this.args = new RegExp("^" + identifier.replace(/\*/g, "(.+)") + "$").exec(_this.type);
	                _this.args.shift();
	              }
	            }
	          });
	        }

	        if (!defined(this.binder)) {
	          this.binder = this.view.binders["*"];
	        }

	        if (this.binder instanceof Function) {
	          this.binder = { routine: this.binder };
	        }
	      }
	    },
	    observe: {

	      // Observes the object keypath to run the provided callback.

	      value: function observe(obj, keypath, callback) {
	        return rivets.sightglass(obj, keypath, callback, {
	          root: this.view.rootInterface,
	          adapters: this.view.adapters
	        });
	      }
	    },
	    parseTarget: {
	      value: function parseTarget() {
	        var token = parseType(this.keypath);

	        if (token.type === 0) {
	          this.value = token.value;
	        } else {
	          this.observer = this.observe(this.view.models, this.keypath, this.sync);
	          this.model = this.observer.target;
	        }
	      }
	    },
	    formattedValue: {

	      // Applies all the current formatters to the supplied value and returns the
	      // formatted value.

	      value: function formattedValue(value) {
	        var _this = this;

	        this.formatters.forEach(function (formatterStr, fi) {
	          var args = formatterStr.match(/[^\s']+|'([^']|'[^\s])*'|"([^"]|"[^\s])*"/g);
	          var id = args.shift();
	          var formatter = _this.view.formatters[id];
	          var processedArgs = [];

	          args = args.map(parseType);

	          args.forEach(function (arg, ai) {
	            if (arg.type === 0) {
	              processedArgs.push(arg.value);
	            } else {
	              if (!defined(_this.formatterObservers[fi])) {
	                _this.formatterObservers[fi] = {};
	              }

	              var observer = _this.formatterObservers[fi][ai];

	              if (!observer) {
	                observer = _this.observe(_this.view.models, arg.value, _this.sync);
	                _this.formatterObservers[fi][ai] = observer;
	              }

	              processedArgs.push(observer.value());
	            }
	          });

	          if (formatter && formatter.read instanceof Function) {
	            value = formatter.read.apply(formatter, [value].concat(processedArgs));
	          } else if (formatter instanceof Function) {
	            value = formatter.apply(undefined, [value].concat(processedArgs));
	          }
	        });

	        return value;
	      }
	    },
	    eventHandler: {

	      // Returns an event handler for the binding around the supplied function.

	      value: function eventHandler(fn) {
	        var binding = this;
	        var handler = binding.view.handler;

	        return function (ev) {
	          handler.call(fn, this, ev, binding);
	        };
	      }
	    },
	    set: {

	      // Sets the value for the binding. This Basically just runs the binding routine
	      // with the suplied value formatted.

	      value: function set(value) {
	        if (value instanceof Function && !this.binder["function"]) {
	          value = this.formattedValue(value.call(this.model));
	        } else {
	          value = this.formattedValue(value);
	        }

	        if (this.binder.routine) {
	          this.binder.routine.call(this, this.el, value);
	        }
	      }
	    },
	    sync: {

	      // Syncs up the view binding with the model.

	      value: function sync() {
	        var _this = this;

	        if (this.observer) {
	          if (this.model !== this.observer.target) {
	            var deps = this.options.dependencies;

	            this.dependencies.forEach(function (observer) {
	              observer.unobserve();
	            });

	            this.dependencies = [];
	            this.model = this.observer.target;

	            if (defined(model) && deps && deps.length) {
	              deps.forEach(function (dependency) {
	                var observer = _this.observe(_this.model, dependency, _this.sync);
	                _this.dependencies.push(observer);
	              });
	            }
	          }

	          this.set(this.observer.value());
	        } else {
	          this.set(this.value);
	        }
	      }
	    },
	    publish: {

	      // Publishes the value currently set on the input element back to the model.

	      value: function publish() {
	        var _this = this;

	        if (this.observer) {
	          (function () {
	            var value = _this.getValue(_this.el);

	            _this.formatters.slice(0).reverse().forEach(function (formatter) {
	              var args = formatter.split(/\s+/);
	              var id = args.shift();
	              var f = _this.view.formatters[id];

	              if (defined(f) && f.publish) {
	                value = f.publish.apply(f, [value].concat(_toConsumableArray(args)));
	              }
	            });

	            _this.observer.setValue(value);
	          })();
	        }
	      }
	    },
	    bind: {

	      // Subscribes to the model for changes at the specified keypath. Bi-directional
	      // routines will also listen for changes on the element to propagate them back
	      // to the model.

	      value: function bind() {
	        var _this = this;

	        this.parseTarget();

	        if (defined(this.binder.bind)) {
	          this.binder.bind.call(this, this.el);
	        }

	        if (defined(this.model) && defined(this.options.dependencies)) {
	          this.options.dependencies.forEach(function (dependency) {
	            var observer = _this.observe(_this.model, dependency, _this.sync);
	            _this.dependencies.push(observer);
	          });
	        }

	        if (this.view.preloadData) {
	          this.sync();
	        }
	      }
	    },
	    unbind: {

	      // Unsubscribes from the model and the element.

	      value: function unbind() {
	        var _this = this;

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
	          var args = _this.formatterObservers[fi];

	          Object.keys(args).forEach(function (ai) {
	            args[ai].unobserve();
	          });
	        });

	        this.formatterObservers = {};
	      }
	    },
	    update: {

	      // Updates the binding's model from what is currently set on the view. Unbinds
	      // the old model first and then re-binds with the new model.

	      value: function update() {
	        var models = arguments[0] === undefined ? {} : arguments[0];

	        if (defined(this.observer)) {
	          this.model = this.observer.target;
	        }

	        if (defined(this.binder.update)) {
	          this.binder.update.call(this, models);
	        }
	      }
	    },
	    getValue: {

	      // Returns elements value

	      value: function getValue(el) {
	        if (this.binder && defined(this.binder.getValue)) {
	          return this.binder.getValue.call(this, el);
	        } else {
	          return getInputValue(el);
	        }
	      }
	    }
	  });

	  return Binding;
	})();

	// component view encapsulated as a binding within it's parent view.

	var ComponentBinding = exports.ComponentBinding = (function (_Binding) {
	  // Initializes a component binding for the specified view. The raw component
	  // element is passed in along with the component type. Attributes and scope
	  // inflections are determined based on the components defined attributes.

	  function ComponentBinding(view, el, type) {
	    var _this = this;

	    _classCallCheck(this, ComponentBinding);

	    this.view = view;
	    this.el = el;
	    this.type = type;
	    this.component = this.view.components[this.type];
	    this["static"] = {};
	    this.observers = {};
	    this.upstreamObservers = {};

	    var bindingRegExp = view.bindingRegExp();

	    if (this.el.attributes) {
	      this.el.attributes.forEach(function (attribute) {
	        if (!bindingRegExp.test(attribute.name)) {
	          var propertyName = _this.camelCase(attribute.name);
	          var stat = _this.component["static"];

	          if (stat && stat.indexOf(propertyName) > -1) {
	            _this["static"][propertyName] = attribute.value;
	          } else {
	            _this.observers[propertyName] = attribute.value;
	          }
	        }
	      });
	    }
	  }

	  _inherits(ComponentBinding, _Binding);

	  _createClass(ComponentBinding, {
	    sync: {

	      // Intercepts `Rivets.Binding::sync` since component bindings are not bound to
	      // a particular model to update it's value.

	      value: function sync() {}
	    },
	    update: {

	      // Intercepts `Rivets.Binding::update` since component bindings are not bound
	      // to a particular model to update it's value.

	      value: function update() {}
	    },
	    publish: {

	      // Intercepts `Rivets.Binding::publish` since component bindings are not bound
	      // to a particular model to update it's value.

	      value: function publish() {}
	    },
	    locals: {

	      // Returns an object map using the component's scope inflections.

	      value: function locals() {
	        var _this = this;

	        var result = {};

	        Object.keys(this["static"]).forEach(function (key) {
	          result[key] = _this["static"][key];
	        });

	        Object.keys(this.observers).forEach(function (key) {
	          result[key] = _this.observers[key].value();
	        });

	        return result;
	      }
	    },
	    camelCase: {

	      // Returns a camel-cased version of the string. Used when translating an
	      // element's attribute name into a property name for the component's scope.

	      value: function camelCase(string) {
	        return string.replace(/-([a-z])/g, function (grouped) {
	          grouped[1].toUpperCase();
	        });
	      }
	    },
	    bind: {

	      // Intercepts `Rivets.Binding::bind` to build `@componentView` with a localized
	      // map of models from the root view. Bind `@componentView` on subsequent calls.

	      value: function bind() {
	        var _this = this;

	        if (!this.bound) {
	          Object.keys(this.observers).forEach(function (key) {
	            var keypath = _this.observers[key];

	            _this.observers[key] = _this.observe(_this.view.models, keypath, (function (key) {
	              return function () {
	                _this.componentView.models[key] = _this.observers[key].value();
	              };
	            }).call(_this, key));
	          });

	          this.bound = true;
	        }

	        if (defined(this.componentView)) {
	          this.componentView.bind();
	        } else {
	          (function () {
	            _this.el.innerHTML = _this.component.template.call(_this);
	            var scope = _this.component.initialize.call(_this, _this.el, _this.locals());
	            _this.el._bound = true;

	            var options = {};

	            EXTENSIONS.forEach(function (extensionType) {
	              options[extensionType] = {};

	              if (_this.component[extensionType]) {
	                Object.keys(_this.component[extensionType]).forEach(function (key) {
	                  options[extensionType][key] = _this.component[extensionType][key];
	                });
	              }

	              Object.keys(_this.view[extensionType]).forEach(function (key) {
	                if (!defined(options[extensionType][key])) {
	                  options[extensionType][key] = _this.view[extensionType][key];
	                }
	              });
	            });

	            OPTIONS.forEach(function (option) {
	              if (defined(_this.component[option])) {
	                options[option] = _this.component[option];
	              } else {
	                options[option] = _this.view[option];
	              }
	            });

	            _this.componentView = new View(_this.el, scope, options);
	            _this.componentView.bind();

	            Object.keys(_this.observers).forEach(function (key) {
	              var observer = _this.observers[key];
	              var models = _this.componentView.models;

	              var upstream = _this.observe(models, key, (function (key, observer) {
	                return function () {
	                  observer.setValue(_this.componentView.models[key]);
	                };
	              }).call(_this, key, observer));

	              _this.upstreamObservers[key] = upstream;
	            });
	          })();
	        }
	      }
	    },
	    unbind: {

	      // Intercept `Rivets.Binding::unbind` to be called on `@componentView`.

	      value: function unbind() {
	        var _this = this;

	        Object.keys(this.upstreamObservers).forEach(function (key) {
	          _this.upstreamObservers[key].unobserve();
	        });

	        Object.keys(this.observers).forEach(function (key) {
	          _this.observers[key].unobserve();
	        });

	        if (defined(this.componentView)) {
	          this.componentView.unbind.call(this);
	        }
	      }
	    }
	  });

	  return ComponentBinding;
	})(Binding);

	// A text node binding, defined internally to deal with text and element node
	// differences while avoiding it being overwritten.

	var TextBinding = exports.TextBinding = (function (_Binding2) {
	  // Initializes a text binding for the specified view and text node.

	  function TextBinding(view, el, type, keypath) {
	    var options = arguments[4] === undefined ? {} : arguments[4];

	    _classCallCheck(this, TextBinding);

	    this.view = view;
	    this.el = el;
	    this.type = type;
	    this.keypath = keypath;
	    this.options = options;
	    this.formatters = this.options.formatters || [];
	    this.dependencies = [];
	    this.formatterObservers = {};

	    this.binder = {
	      routine: function (node, value) {
	        node.data = defined(value) ? value : "";
	      }
	    };

	    this.sync = this.sync.bind(this);
	  }

	  _inherits(TextBinding, _Binding2);

	  _createClass(TextBinding, {
	    sync: {

	      // Wrap the call to `sync` to avoid function context issues.

	      value: function sync() {
	        _get(Object.getPrototypeOf(TextBinding.prototype), "sync", this).call(this);
	      }
	    }
	  });

	  return TextBinding;
	})(Binding);

/***/ },
/* 6 */
/***/ function(module, exports) {

	

	// Parser and tokenizer for getting the type and value from a string.
	"use strict";

	exports.parseType = parseType;

	// Template parser and tokenizer for mustache-style text content bindings.
	// Parses the template and returns a set of tokens, separating static portions
	// of text from binding declarations.
	exports.parseTemplate = parseTemplate;
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var PRIMITIVE = 0;
	var KEYPATH = 1;
	var TEXT = 0;
	var BINDING = 1;
	function parseType(string) {
	  var type = PRIMITIVE;
	  var value = string;

	  if (/^'.*'$|^".*"$/.test(string)) {
	    value = string.slice(1, -1);
	  } else if (string === "true") {
	    value = true;
	  } else if (string === "false") {
	    value = false;
	  } else if (string === "null") {
	    value = null;
	  } else if (string === "undefined") {
	    value = undefined;
	  } else if (isNaN(Number(string)) === false) {
	    value = Number(string);
	  } else {
	    type = KEYPATH;
	  }

	  return { type: type, value: value };
	}

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
	        lastToken = tokens[tokens.length - 1];

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

/***/ },
/* 7 */
/***/ function(module, exports) {

	"use strict";

	exports.bindEvent = bindEvent;
	exports.unbindEvent = unbindEvent;
	exports.getInputValue = getInputValue;
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
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

	    if ($el.attr("type") === "checkbox") {
	      return $el.is(":checked");
	    } else {
	      return $el.val();
	    }
	  } else {
	    if (el.type === "checkbox") {
	      return el.checked;
	    } else if (el.type === "select-multiple") {
	      var _ret = (function () {
	        var results = [];

	        el.options.forEach(function (option) {
	          if (option.selected) {
	            results.push(option.value);
	          }
	        });

	        return {
	          v: results
	        };
	      })();

	      if (typeof _ret === "object") {
	        return _ret.v;
	      }
	    } else {
	      return el.value;
	    }
	  }
	}

/***/ },
/* 8 */
/***/ function(module, exports) {

	// The default `.` adapter thats comes with Rivets.js. Allows subscribing to
	// properties on plain objects, implemented in ES5 natives using
	// `Object.defineProperty`.

	"use strict";

	var defined = function (value) {
	  return value !== undefined && value !== null;
	};

	var ARRAY_METHODS = ["push", "pop", "shift", "unshift", "sort", "reverse", "splice"];

	var adapter = {
	  id: "_rv",
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
	    var _this = this;

	    var callbacks = this.weakReference(obj).callbacks;

	    if (!defined(callbacks[keypath])) {
	      callbacks[keypath] = [];
	      var desc = Object.getOwnPropertyDescriptor(obj, keypath);

	      if (!(desc && (desc.get || desc.set))) {
	        (function () {
	          var value = obj[keypath];

	          Object.defineProperty(obj, keypath, {
	            enumerable: true,

	            get: function () {
	              return value;
	            },

	            set: function (newValue) {
	              if (newValue !== value) {
	                _this.unobserveMutations(value, obj[_this.id], keypath);
	                value = newValue;
	                var map = _this.weakmap[obj[_this.id]];

	                if (map) {
	                  (function () {
	                    var callbacks = map.callbacks;

	                    if (callbacks[keypath]) {
	                      callbacks[keypath].slice().forEach(function (callback) {
	                        if (callbacks[keypath].indexOf(callback) > -1) {
	                          callback();
	                        }
	                      });
	                    }

	                    _this.observeMutations(newValue, obj[_this.id], keypath);
	                  })();
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

	  set: function (obj, keypath, value) {
	    obj[keypath] = value;
	  }
	};

	module.exports = adapter;

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

	var _taggedTemplateLiteral = function (strings, raw) { return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); };

	var rivets = _interopRequire(__webpack_require__(2));

	var _util = __webpack_require__(7);

	var bindEvent = _util.bindEvent;
	var unbindEvent = _util.unbindEvent;

	var CHANGE_EVENT = "change";

	var defined = function (value) {
	  return value !== undefined && value !== null;
	};

	var getString = function (value) {
	  return defined(value) ? value.toString() : undefined;
	};

	var times = function (n, cb) {
	  for (var i = 0; i < n; i++) {
	    cb();
	  }
	};

	var binders = {
	  // Sets the element's text value.
	  text: function (el, value) {
	    el.textContent = defined(value) ? value : "";
	  },

	  // Sets the element's HTML content.
	  html: function (el, value) {
	    el.innerHTML = defined(value) ? value : "";
	  },

	  // Shows the element when value is true.
	  show: function (el, value) {
	    el.style.display = value ? "" : "none";
	  },

	  // Hides the element when value is true (negated version of `show` binder).
	  hide: function (el, value) {
	    el.style.display = value ? "none" : "";
	  },

	  // Enables the element when value is true.
	  enabled: function (el, value) {
	    el.disabled = !value;
	  },

	  // Disables the element when value is true (negated version of `enabled` binder).
	  disabled: function (el, value) {
	    el.disabled = !!value;
	  },

	  // Checks a checkbox or radio input when the value is true. Also sets the model
	  // property when the input is checked or unchecked (two-way binder).
	  checked: {
	    publishes: true,
	    priority: 2000,

	    bind: function bind(el) {
	      bindEvent(el, CHANGE_EVENT, this.publish);
	    },

	    unbind: function unbind(el) {
	      unbindEvent(el, CHANGE_EVENT, this.publish);
	    },

	    routine: function routine(el, value) {
	      if (el.type === "radio") {
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
	      bindEvent(el, CHANGE_EVENT, this.publish);
	    },

	    unbind: function unbind(el) {
	      unbindEvent(el, CHANGE_EVENT, this.publish);
	    },

	    routine: function routine(el, value) {
	      if (el.type === "radio") {
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
	      if (!(el.tagName === "INPUT" && el.type === "radio")) {
	        this.event = el.tagName === "SELECT" ? "change" : "input";

	        bindEvent(el, this.event, this.publish);
	      }
	    },

	    unbind: function unbind(el) {
	      if (!(el.tagName === "INPUT" && el.type === "radio")) {
	        unbindEvent(el, this.event, this.publish);
	      }
	    },

	    routine: function routine(el, value) {
	      if (el.tagName === "INPUT" && el.type === "radio") {
	        el.setAttribute("value", value);
	      } else if (window.jQuery) {
	        el = jQuery(el);

	        if (getString(value) !== getString(el.val())) {
	          el.val(defined(value) ? value : "");
	        }
	      } else {
	        if (el.type === "select-multiple") {
	          if (value instanceof Array) {
	            el.options.forEach(function (option) {
	              option.selected = value.indexOf(option.value) > -1;
	            });
	          }
	        } else if (getString(value) !== getString(el.value)) {
	          el.value = defined(value) ? value : "";
	        }
	      }
	    }
	  },

	  // Inserts and binds the element and it's child nodes into the DOM when true.
	  "if": {
	    block: true,
	    priority: 4000,

	    bind: function bind(el) {
	      if (!defined(this.marker)) {
	        var attr = [this.view.prefix, this.type].join("-").replace("--", "-");
	        var declaration = el.getAttribute(attr);

	        this.marker = document.createComment(_taggedTemplateLiteral([" rivets: ", " ", " "], [" rivets: ", " ", " "]), this.type, declaration);
	        this.bound = false;

	        el.removeAttribute(attr);
	        el.parentNode.insertBefore(this.marker, el);
	        el.parentNode.removeChild(el);
	      }
	    },

	    unbind: function unbind() {
	      if (defined(this.nested)) {
	        this.nested.unbind();
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
	              _this.nested = rivets.bind(el, models, _this.view.options());
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
	      rivets.binders["if"].bind.call(this, el);
	    },

	    unbind: function unbind() {
	      rivets.binders["if"].unbind.call(this);
	    },

	    routine: function routine(el, value) {
	      rivets.binders["if"].routine.call(this, el, !value);
	    },

	    update: function update(models) {
	      rivets.binders["if"].update.call(this, models);
	    }
	  },

	  // Binds an event handler on the element.
	  "on-*": {
	    "function": true,
	    priority: 1000,

	    unbind: function unbind(el) {
	      if (defined(this.handler)) {
	        unbindEvent(el, this.args[0], this.handler);
	      }
	    },

	    routine: function routine(el, value) {
	      if (defined(this.handler)) {
	        unbindEvent(el, this.args[0], this.handler);
	      }

	      this.handler = this.eventHandler(value);
	      bindEvent(el, this.args[0], this.handler);
	    }
	  },

	  // Appends bound instances of the element in place for each item in the array.
	  "each-*": {
	    block: true,
	    priority: 4000,

	    bind: function bind(el) {
	      if (!defined(this.marker)) {
	        var attr = [this.view.prefix, this.type].join("-").replace("--", "-");
	        this.marker = document.createComment(_taggedTemplateLiteral([" rivets: ", " "], [" rivets: ", " "]), this.type);
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

	    routine: function routine(el, collection) {
	      var _this = this;

	      var modelName = this.args[0];
	      var collection = collection || [];

	      if (this.iterated.length > collection.length) {
	        times(this.iterated.length - collection.length, function () {
	          var view = _this.iterated.pop();
	          view.unbind();
	          _this.marker.parentNode.removeChild(view.els[0]);
	        });
	      }

	      collection.forEach(function (model, index) {
	        var data = { index: index };
	        data[modelName] = model;

	        if (!defined(_this.iterated[index])) {
	          Object.keys(_this.view.models).forEach(function (key) {
	            if (!defined(data[key])) {
	              data[key] = _this.view.models[key];
	            }
	          });

	          var previous = _this.marker;

	          if (_this.iterated.length) {
	            previous = _this.iterated[_this.iterated.length - 1].els[0];
	          }

	          var options = _this.view.options();
	          options.preloadData = true;

	          var template = el.cloneNode(true);
	          var view = rivets.bind(template, data, options);
	          _this.iterated.push(view);
	          _this.marker.parentNode.insertBefore(template, previous.nextSibling);
	        } else if (_this.iterated[index].models[modelName] !== model) {
	          _this.iterated[index].update(data);
	        }
	      });

	      if (el.nodeName === "OPTION") {
	        this.view.bindings.forEach(function (binding) {
	          if (binding.el === _this.marker.parentNode && binding.type === "value") {
	            binding.sync();
	          }
	        });
	      }
	    },

	    update: function update(models) {
	      var _this = this;

	      var data = {};

	      Object.keys(models).forEach(function (key) {
	        if (key !== _this.args[0]) {
	          data[key] = models[key];
	        }
	      });

	      this.iterated.forEach(function (view) {
	        view.update(data);
	      });
	    }
	  },

	  // Adds or removes the class from the element when value is true or false.
	  "class-*": function _class(el, value) {
	    var elClass = " " + el.className + " ";

	    if (!value === elClass.indexOf(" " + this.args[0] + " ") > -1) {
	      if (value) {
	        el.className = "" + el.className + " " + this.args[0];
	      } else {
	        el.className = elClass.replace(" " + this.args[0] + " ", " ").trim();
	      }
	    }
	  },

	  // Sets the attribute on the element. If no binder above is matched it will fall
	  // back to using this binder.
	  "*": function _(el, value) {
	    if (defined(value)) {
	      el.setAttribute(this.type, value);
	    } else {
	      el.removeAttribute(this.type);
	    }
	  }
	};

	module.exports = binders;

/***/ }
/******/ ])
});
;