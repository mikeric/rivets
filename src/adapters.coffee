# The default `.` adapter thats comes with Rivets.js. Allows subscribing to
# properties on POJSOs, implemented in ES5 natives using
# `Object.defineProperty`.
Rivets.adapters['.'] =
  id: '_rv'
  counter: 0
  weakmap: {}

  subscribe: (obj, keypath, callback) ->
    unless obj[@id]?
      obj[@id] = @counter++
      @weakmap[obj[@id]] = {}

    map = @weakmap[obj[@id]]

    unless map[keypath]?
      map[keypath] = []
      value = obj[keypath]

      Object.defineProperty obj, keypath,
        get: -> value
        set: (newValue) ->
          if newValue isnt value
            value = newValue
            callback() for callback in map[keypath]

    unless callback in map[keypath]
      map[keypath].push callback

  unsubscribe: (obj, keypath, callback) ->
    callbacks = @weakmap[obj[@id]][keypath]
    callbacks.splice callbacks.indexOf(callback), 1

  read: (obj, keypath) ->
    obj[keypath]

  publish: (obj, keypath, value) ->
    obj[keypath] = value
