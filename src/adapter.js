// The default `.` adapter thats comes with Rivets.js. Allows subscribing to
// properties on plain objects, implemented in ES5 natives using
// `Object.defineProperty`.

const defined = (value) => {
  return value !== undefined && value !== null
}

const ARRAY_METHODS = [
  'push',
  'pop',
  'shift',
  'unshift',
  'sort',
  'reverse',
  'splice'
]

const adapter = {
  id: '_rv',
  counter: 0,
  weakmap: {},

  weakReference: function(obj) {
    if (!obj.hasOwnProperty(this.id)) {
      let id = this.counter++

      Object.defineProperty(obj, this.id, {
        value: id
      })
    }

    if (!this.weakmap[obj[this.id]]) {
      this.weakmap[obj[this.id]] = {
        callbacks: {}
      }
    }

    return this.weakmap[obj[this.id]]
  },

  cleanupWeakReference: function(ref, id) {
    if (!Object.keys(ref.callbacks).length) {
      if (!(ref.pointers && Object.keys(ref.pointers).length)) {
        delete this.weakmap[id]
      }
    }
  },

  stubFunction: function(obj, fn) {
    let original = obj[fn]
    let map = this.weakReference(obj)
    let weakmap = this.weakmap

    obj[fn] = (...args) => {
      let response = original.apply(obj, args)

      Object.keys(map.pointers).forEach(r => {
        let k = map.pointers[r]

        if (defined(weakmap[r])) {
          if (weakmap[r].callbacks[k] instanceof Array) {
            weakmap[r].callbacks[k].forEach(callback => {
              callback()
            })
          }
        }
      })

      return response
    }
  },

  observeMutations: function(obj, ref, keypath) {
    if (obj instanceof Array) {
      let map = this.weakReference(obj)

      if (!defined(map.pointers)) {
        map.pointers = {}

        ARRAY_METHODS.forEach(fn => {
          this.stubFunction(obj, fn)
        })
      }

      if (!defined(map.pointers[ref])) {
        map.pointers[ref] = []
      }

      if (map.pointers[ref].indexOf(keypath) === -1) {
        map.pointers[ref].push(keypath)
      }
    }
  },

  unobserveMutations: function(obj, ref, keypath) {
    if ((obj instanceof Array) && defined(obj[this.id])) {
      let map = this.weakmap[obj[this.id]]

      if (map) {
        let pointers = map.pointers[ref]

        if (pointers) {
          let idx = pointers.indexOf(keypath)

          if (idx > -1) {
            pointers.splice(idx, 1)
          }

          if (!pointers.length) {
            delete map.pointers[ref]
          }

          this.cleanupWeakReference(map, obj[this.id])
        }
      }
    }
  },

  observe: function(obj, keypath, callback) {
    let callbacks = this.weakReference(obj).callbacks

    if (!defined(callbacks[keypath])) {
      callbacks[keypath] = []
      let desc = Object.getOwnPropertyDescriptor(obj, keypath)

      if (!(desc && (desc.get || desc.set))) {
        let value = obj[keypath]

        Object.defineProperty(obj, keypath, {
          enumerable: true,

          get: () => {
            return value
          },

          set: newValue => {
            if (newValue !== value) {
              this.unobserveMutations(value, obj[this.id], keypath)
              value = newValue
              let map = this.weakmap[obj[this.id]]

              if (map) {
                let callbacks = map.callbacks

                if (callbacks[keypath]) {
                  callbacks[keypath].slice().forEach(callback => {
                    if (callbacks[keypath].indexOf(callback) > -1) {
                      callback()
                    }
                  })
                }

                this.observeMutations(newValue, obj[this.id], keypath)
              }
            }
          }
        })
      }
    }

    if (callbacks[keypath].indexOf(callback) === -1) {
      callbacks[keypath].push(callback)
    }

    this.observeMutations(obj[keypath], obj[this.id], keypath)
  },

  unobserve: function(obj, keypath, callback) {
    let map = this.weakmap[obj[this.id]]

    if (map) {
      let callbacks = map.callbacks[keypath]

      if (callbacks) {
        let idx = callbacks.indexOf(callback)

        if (idx > -1) {
          callbacks.splice(idx, 1)

          if (!callbacks.length) {
            delete map.callbacks[keypath]
          }
        }

        this.unobserveMutations(obj[keypath], obj[this.id], keypath)
        this.cleanupWeakReference(map, obj[this.id])
      }
    }
  },

  get: function(obj, keypath) {
    return obj[keypath]
  },

  set: (obj, keypath, value) => {
    obj[keypath] = value
  }
}

export default adapter
