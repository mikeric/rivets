import rivets from './rivets'
import {parseType} from './parsers'
import {getInputValue} from './util'
import {EXTENSIONS, OPTIONS} from './constants'

const defined = (value) => {
  return value !== undefined && value !== null
}

// A single binding between a model attribute and a DOM element.
export class Binding {
  // All information about the binding is passed into the constructor; the
  // containing view, the DOM node, the type of binding, the model object and the
  // keypath at which to listen for changes.
  constructor(view, el, type, keypath, options = {}) {
    this.view = view
    this.el = el
    this.type = type
    this.keypath = keypath
    this.options = options
    this.formatters = options.formatters || []
    this.dependencies = []
    this.formatterObservers = {}
    this.model = undefined
    this.setBinder()

    this.bind = this.bind.bind(this)
    this.unbind = this.unbind.bind(this)
    this.sync = this.sync.bind(this)
    this.publish = this.publish.bind(this)
  }

  // Sets the binder to use when binding and syncing.
  setBinder() {
    this.binder = this.view.binders[this.type]

    if (!this.binder) {
      Object.keys(this.view.binders).forEach(identifier => {
        let value = this.view.binders[identifier]

        if (identifier !== '*' && identifier.indexOf('*') > -1) {
          let regexp = new RegExp(`^${identifier.replace(/\*/g, '.+')}$`)

          if (regexp.test(this.type)) {
            this.binder = value
            this.args = new RegExp(`^${identifier.replace(/\*/g, '(.+)')}$`).exec(this.type)
            this.args.shift()
          }
        }
      })
    }

    if (!defined(this.binder)) {
      this.binder = this.view.binders['*']
    }

    if (this.binder instanceof Function) {
      this.binder = {routine: this.binder}
    }
  }

  // Observes the object keypath to run the provided callback.
  observe(obj, keypath, callback) {
    return rivets.sightglass(obj, keypath, callback, {
      root: this.view.rootInterface,
      adapters: this.view.adapters
    })
  }

  parseTarget() {
    let token = parseType(this.keypath)

    if (token.type === 0) {
      this.value = token.value
    } else {
      this.observer = this.observe(this.view.models, this.keypath, this.sync)
      this.model = this.observer.target
    }
  }

  // Applies all the current formatters to the supplied value and returns the
  // formatted value.
  formattedValue(value) {
    this.formatters.forEach((formatterStr, fi) => {
      let args = formatterStr.match(/[^\s']+|'([^']|'[^\s])*'|"([^"]|"[^\s])*"/g)
      let id = args.shift()
      let formatter = this.view.formatters[id]
      let processedArgs = []

      args = args.map(parseType)

      args.forEach((arg, ai) => {
        if (arg.type === 0) {
          processedArgs.push(arg.value)
        } else {
          if (!defined(this.formatterObservers[fi])) {
            this.formatterObservers[fi] = {}
          }

          let observer = this.formatterObservers[fi][ai]

          if (!observer) {
            observer = this.observe(this.view.models, arg.value, this.sync)
            this.formatterObservers[fi][ai] = observer
          }

          processedArgs.push(observer.value())
        }
      })


      if (formatter && (formatter.read instanceof Function)) {
        value = formatter.read(value, ...processedArgs)
      } else if (formatter instanceof Function) {
        value = formatter(value, ...processedArgs)
      }
    })

    return value
  }

  // Returns an event handler for the binding around the supplied function.
  eventHandler(fn) {
    let binding = this
    let handler = binding.view.handler

    return function(ev) {
      handler.call(fn, this, ev, binding)
    }
  }

  // Sets the value for the binding. This Basically just runs the binding routine
  // with the suplied value formatted.
  set(value) {
    if ((value instanceof Function) && !this.binder.function) {
      value = this.formattedValue(value.call(this.model))
    } else {
      value = this.formattedValue(value)
    }

    if (this.binder.routine) {
      this.binder.routine.call(this, this.el, value)
    }
  }

  // Syncs up the view binding with the model.
  sync() {
    if (this.observer) {
      if (this.model !== this.observer.target) {
        let deps = this.options.dependencies

        this.dependencies.forEach(observer => {
          observer.unobserve()
        })

        this.dependencies = []
        this.model = this.observer.target

        if (defined(this.model) && deps && deps.length) {
          deps.forEach(dependency => {
            let observer = this.observe(this.model, dependency, this.sync)
            this.dependencies.push(observer)
          })
        }
      }

      this.set(this.observer.value())
    } else {
      this.set(this.value)
    }
  }

  // Publishes the value currently set on the input element back to the model.
  publish() {
    if (this.observer) {
      let value = this.getValue(this.el)

      this.formatters.slice(0).reverse().forEach(formatter => {
        let args = formatter.split(/\s+/)
        let id = args.shift()
        let f = this.view.formatters[id]

        if (defined(f) && f.publish) {
          value = f.publish(value, ...args)
        }
      })

      this.observer.setValue(value)
    }
  }

  // Subscribes to the model for changes at the specified keypath. Bi-directional
  // routines will also listen for changes on the element to propagate them back
  // to the model.
  bind() {
    this.parseTarget()

    if (defined(this.binder.bind)) {
      this.binder.bind.call(this, this.el)
    }

    if (defined(this.model) && defined(this.options.dependencies)) {
      this.options.dependencies.forEach(dependency => {
        let observer = this.observe(this.model, dependency, this.sync)
        this.dependencies.push(observer)
      })
    }

    if (this.view.preloadData) {
      this.sync()
    }
  }

  // Unsubscribes from the model and the element.
  unbind() {
    if (defined(this.binder.unbind)) {
      this.binder.unbind.call(this, this.el)
    }

    if (defined(this.observer)) {
      this.observer.unobserve()
    }


    this.dependencies.forEach(observer => {
      observer.unobserve()
    })

    this.dependencies = []

    Object.keys(this.formatterObservers).forEach(fi => {
      let args = this.formatterObservers[fi]

      Object.keys(args).forEach(ai => {
        args[ai].unobserve()
      })
    })

    this.formatterObservers = {}
  }

  // Updates the binding's model from what is currently set on the view. Unbinds
  // the old model first and then re-binds with the new model.
  update(models = {}) {
    if (defined(this.observer)) {
      this.model = this.observer.target
    }

    if (defined(this.binder.update)) {
      this.binder.update.call(this, models)
    }
  }

  // Returns elements value
  getValue(el) {
    if (this.binder && defined(this.binder.getValue)) {
      return this.binder.getValue.call(this, el)
    } else {
      return getInputValue(el)
    }
  }
}

// component view encapsulated as a binding within it's parent view.
export class ComponentBinding extends Binding {
  // Initializes a component binding for the specified view. The raw component
  // element is passed in along with the component type. Attributes and scope
  // inflections are determined based on the components defined attributes.
  constructor(view, el, type) {
    this.view = view
    this.el = el
    this.type = type
    this.component = this.view.components[this.type]
    this.static = {}
    this.observers = {}
    this.upstreamObservers = {}

    let bindingRegExp = view.bindingRegExp()

    if (this.el.attributes) {
      let attribute = null
      for (let i = 0 ; i < this.el.attributes.length ; i++) {
        attribute = this.el.attributes[i]
        if (!bindingRegExp.test(attribute.name)) {
          let propertyName = this.camelCase(attribute.name)
          let stat = this.component.static
          // Parse attribute value to check type (primitive, keypath...)
          let token = parseType(attribute.value)
          if (stat && stat.indexOf(propertyName) > -1) {
            this.static[propertyName] = attribute.value
          } else if (token.type === 0){
            this.static[propertyName] = token.value
          } else {
            this.observers[propertyName] = attribute.value
          }
        }
      }
    }
  }


  // Intercepts `Rivets.Binding::sync` since component bindings are not bound to
  // a particular model to update it's value.
  sync() {}

  // Intercepts `Rivets.Binding::update` since component bindings are not bound
  // to a particular model to update it's value.
  update() {}

  // Intercepts `Rivets.Binding::publish` since component bindings are not bound
  // to a particular model to update it's value.
  publish() {}

  // Returns an object map using the component's scope inflections.
  locals() {
    let result = {}

    Object.keys(this.static).forEach(key => {
      result[key] = this.static[key]
    })

    Object.keys(this.observers).forEach(key => {
      result[key] = this.observers[key].value()
    })

    return result
  }

  // Returns a camel-cased version of the string. Used when translating an
  // element's attribute name into a property name for the component's scope.
  camelCase(string) {
    return string.replace(/-([a-z])/g, grouped => {
      grouped[1].toUpperCase()
    })
  }

  // Intercepts `Rivets.Binding::bind` to build `@componentView` with a localized
  // map of models from the root view. Bind `@componentView` on subsequent calls.
  bind() {
    if (!this.bound) {
      Object.keys(this.observers).forEach(key => {
        let keypath = this.observers[key]

        this.observers[key] = this.observe(this.view.models, keypath, (key => {
          return () => {
            this.componentView.models[key] = this.observers[key].value()
          }
        }).call(this, key))
      })

      this.bound = true
    }

    if (defined(this.componentView)) {
      this.componentView.bind()
    } else {
      this.el.innerHTML = this.component.template.call(this)
      let scope = this.component.initialize.call(this, this.el, this.locals())
      this.el._bound = true

      let options = {}

      EXTENSIONS.forEach(extensionType => {
        options[extensionType] = {}

        if (this.component[extensionType]) {
          Object.keys(this.component[extensionType]).forEach(key => {
            options[extensionType][key] = this.component[extensionType][key]
          })
        }

        Object.keys(this.view[extensionType]).forEach(key => {
          if (!defined(options[extensionType][key])) {
            options[extensionType][key] = this.view[extensionType][key]
          }
        })
      })

      OPTIONS.forEach(option => {
        if (defined(this.component[option])) {
          options[option] = this.component[option]
        } else {
          options[option] = this.view[option]
        }
      })

      this.componentView = rivets.bind(this.el, scope, options)

      Object.keys(this.observers).forEach(key => {
        let observer = this.observers[key]
        let models = this.componentView.models

        let upstream = this.observe(models, key, ((key, observer) => {
          return () => {
            observer.setValue(this.componentView.models[key])
          }
        }).call(this, key, observer))

        this.upstreamObservers[key] = upstream
      })
    }
  }

  // Intercept `Rivets.Binding::unbind` to be called on `@componentView`.
  unbind() {
    Object.keys(this.upstreamObservers).forEach(key => {
      this.upstreamObservers[key].unobserve()
    })

    Object.keys(this.observers).forEach(key => {
      this.observers[key].unobserve()
    })

    if (defined(this.componentView)) {
      this.componentView.unbind.call(this)
    }
  }
}

// A text node binding, defined internally to deal with text and element node
// differences while avoiding it being overwritten.
export class TextBinding extends Binding {
  // Initializes a text binding for the specified view and text node.
  constructor(view, el, type, keypath, options = {}) {
    this.view = view
    this.el = el
    this.type = type
    this.keypath = keypath
    this.options = options
    this.formatters = this.options.formatters || []
    this.dependencies = []
    this.formatterObservers = {}

    this.binder = {
      routine: (node, value) => {
        node.data = defined(value) ? value : ''
      }
    }

    this.sync = this.sync.bind(this)
  }

  // Wrap the call to `sync` to avoid function context issues.
  sync() {
    super.sync()
  }
}
