# The default `.` adapter thats comes with Rivets.js. Allows subscribing to
# properties on POJSOs, implemented in ES5 natives using
# `Object.defineProperty`.
Rivets.adapters['.'] =
  id: '_rv'
  counter: 0
  weakmap: {}

  weakReference: (obj) ->
    unless obj.hasOwnProperty @id
      id = @counter++

      @weakmap[id] =
        callbacks: {}

      Object.defineProperty obj, @id, value: id

    @weakmap[obj[@id]]

  stubFunction: (obj, fn) ->
    original = obj[fn]
    map = @weakReference obj
    weakmap = @weakmap

    obj[fn] = ->
      response = original.apply obj, arguments

      for r, k of map.pointers
        callback() for callback in weakmap[r]?.callbacks[k] ? []

      response

  observeMutations: (obj, ref, keypath) ->
    if Array.isArray obj
      map = @weakReference obj

      unless map.pointers?
        map.pointers = {}
        functions = ['push', 'pop', 'shift', 'unshift', 'sort', 'reverse', 'splice']
        @stubFunction obj, fn for fn in functions

      map.pointers[ref] ?= []

      unless keypath in map.pointers[ref]
        map.pointers[ref].push keypath

  unobserveMutations: (obj, ref, keypath) ->
    if Array.isArray obj and obj[@id]?
      if keypaths = @weakReference(obj).pointers?[ref]
        idx = keypaths.indexOf(keypath)
        if idx >= 0
          keypaths.splice idx, 1

  subscribe: (obj, keypath, callback) ->
    callbacks = @weakReference(obj).callbacks

    unless callbacks[keypath]?
      callbacks[keypath] = []
      value = obj[keypath]

      Object.defineProperty obj, keypath,
        enumerable: true
        get: -> value
        set: (newValue) =>
          if newValue isnt value
            value = newValue
            callback() for callback in callbacks[keypath].slice() when callback in callbacks[keypath]
            @observeMutations newValue, obj[@id], keypath

    unless callback in callbacks[keypath]
      callbacks[keypath].push callback

    @observeMutations obj[keypath], obj[@id], keypath

  unsubscribe: (obj, keypath, callback) ->
    callbacks = @weakmap[obj[@id]].callbacks[keypath]

    idx = callbacks.indexOf(callback);
    if idx >= 0
      callbacks.splice idx, 1
    @unobserveMutations obj[keypath], obj[@id], keypath

  read: (obj, keypath) ->
    obj[keypath]

  publish: (obj, keypath, value) ->
    obj[keypath] = value
