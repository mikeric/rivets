import rivets from './rivets'
import {OPTIONS, EXTENSIONS} from './constants'
import {Binding, TextBinding, ComponentBinding} from './bindings'
import {parseTemplate} from './parsers'

const defined = (value) => {
  return value !== undefined && value !== null
}

// A collection of bindings built from a set of parent nodes.
export default class View {
  // The DOM elements and the model objects for binding are passed into the
  // constructor along with any local options that should be used throughout the
  // context of the view and it's bindings.
  constructor(els, models, options = {}) {
    if (els.jquery || els instanceof Array) {
      this.els = els
    } else {
      this.els = [els]
    }

    this.models = models

    EXTENSIONS.forEach(extensionType => {
      this[extensionType] = {}

      if (options[extensionType]) {
        Object.keys(options[extensionType]).forEach(key => {
          this[extensionType][key] = options[extensionType][key]
        })
      }

      Object.keys(rivets[extensionType]).forEach(key => {
        if (!defined(this[extensionType][key])) {
          this[extensionType][key] = rivets[extensionType][key]
        }
      })
    })

    OPTIONS.forEach(option => {
      this[option] = defined(options[option]) ? options[option] : rivets[option]
    })

    this.build()
  }

  options() {
    let options = {}

    EXTENSIONS.concat(OPTIONS).forEach(option => {
      options[option] = this[option]
    })

    return options
  }

  // Regular expression used to match binding attributes.
  bindingRegExp() {
    return new RegExp(`^${this.prefix}-`)
  }

  buildBinding(binding, node, type, declaration) {
    let pipes = declaration.split('|').map(pipe => {
      return pipe.trim()
    })

    let context = pipes.shift().split('<').map(ctx => {
      return ctx.trim()
    })

    let keypath = context.shift()
    let dependencies = context.shift()
    let options = {formatters: pipes}

    if (dependencies) {
      options.dependencies = dependencies.split(/\s+/)
    }

    this.bindings.push(new binding(this, node, type, keypath, options))
  }

  // Parses the DOM tree and builds `Binding` instances for every matched
  // binding declaration.
  build() {
    this.bindings = []

    let parse = node => {
      let block = false

      if (node.nodeType === 3) {
        let delimiters = this.templateDelimiters

        if (delimiters) {
          let tokens = parseTemplate(node.data, delimiters)

          if (tokens.length) {
            if (!(tokens.length === 1 && tokens[0].type === 0)) {
              tokens.forEach(token => {
                let text = document.createTextNode(token.value)
                node.parentNode.insertBefore(text, node)

                if (token.type === 1) {
                  this.buildBinding(TextBinding, text, null, token.value)
                }
              })

              node.parentNode.removeChild(node)
            }
          }
        }
      } else if (node.nodeType === 1) {
        block = this.traverse(node)
      }

      if (!block) {
        Array.prototype.slice.call(node.childNodes).forEach(parse)
      }
    }

    this.els.forEach(parse)

    this.bindings.sort((a, b) => {
      let aPriority = defined(a.binder) ? (a.binder.priority || 0) : 0
      let bPriority = defined(b.binder) ? (b.binder.priority || 0) : 0
      return bPriority - aPriority
    })
  }

  traverse(node) {
    let bindingRegExp = this.bindingRegExp()
    let block = node.nodeName === 'SCRIPT' || node.nodeName === 'STYLE'
    let attributes = null

    Array.prototype.slice.call(node.attributes).forEach(attribute => {
      if (bindingRegExp.test(attribute.name)) {
        let type = attribute.name.replace(bindingRegExp, '')
        let binder = this.binders[type]

        if (!binder) {
          Object.keys(this.binders).forEach(identifier => {
            let value = this.binders[identifier]

            if (identifier !== '*' && identifier.indexOf('*') > -1) {
              let regexp = new RegExp(`^${identifier.replace(/\*/g, '.+')}$`)

              if (regexp.test(type)) {
                binder = value
              }
            }
          })
        }

        if (!defined(binder)) {
          binder = this.binders['*']
        }

        if (binder.block) {
          block = true
          attributes = [attribute]
        }
      }
    })

    attributes = attributes || Array.prototype.slice.call(node.attributes)

    attributes.forEach(attribute => {
      if (bindingRegExp.test(attribute.name)) {
        let type = attribute.name.replace(bindingRegExp, '')
        this.buildBinding(Binding, node, type, attribute.value)
      }
    })

    if (!block) {
      let type = node.nodeName.toLowerCase()

      if (this.components[type] && !node._bound) {
        this.bindings.push(new ComponentBinding(this, node, type))
        block = true
      }
    }

    return block
  }

  // Returns an array of bindings where the supplied function evaluates to true.
  select(fn) {
    return this.bindings.filter(fn)
  }

  // Binds all of the current bindings for this view.
  bind() {
    this.bindings.forEach(binding => {
      binding.bind()
    })
  }

  // Unbinds all of the current bindings for this view.
  unbind() {
    this.bindings.forEach(binding => {
      binding.unbind()
    })
  }

  // Syncs up the view with the model by running the routines on all bindings.
  sync() {
    this.bindings.forEach(binding => {
      binding.sync()
    })
  }

  // Publishes the input values from the view back to the model (reverse sync).
  publish() {
    let publishes = this.select(binding => {
      if (defined(binding.binder)) {
        return binding.binder.publishes
      }
    })

    publishes.forEach(binding => {
      binding.publish()
    })
  }

  // Updates the view's models along with any affected bindings.
  update(models = {}) {
    Object.keys(models).forEach(key => {
      this.models[key] = models[key]
    })

    this.bindings.forEach(binding => {
      if (defined(binding.update)) {
        binding.update(models)
      }
    })
  }
}
