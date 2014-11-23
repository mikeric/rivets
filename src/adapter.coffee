# The default `.` adapter thats comes with Rivets.js. Allows subscribing to
# properties on POJSOs, implemented in ES5 natives using
# `Object.defineProperty`.
Rivets.public.adapters['.'] =
  id: '_rv'
  counter: 0
  weakmap: {}

  weakReference: (obj) ->
    unless obj.hasOwnProperty @id
      id = @counter++
      Object.defineProperty obj, @id, value: id

    @weakmap[obj[@id]] or= callbacks: {}

  cleanupWeakReference: (ref, id) ->
    unless Object.keys(ref.callbacks).length
      unless ref.pointers and Object.keys(ref.pointers).length
        delete @weakmap[id]

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
    if Array.isArray(obj) and obj[@id]?
      map = @weakReference obj
      pointers = map.pointers[ref]

      if (idx = pointers.indexOf(keypath)) >= 0
        pointers.splice idx, 1

      delete map.pointers[ref] unless pointers.length
      @cleanupWeakReference map, obj[@id]

  observe: (obj, keypath, callback) ->
    callbacks = @weakReference(obj).callbacks

    unless callbacks[keypath]?
      callbacks[keypath] = []
      value = obj[keypath]

      Object.defineProperty obj, keypath,
        enumerable: true
        get: -> value
        set: (newValue) =>
          if newValue isnt value
            @unobserveMutations value, obj[@id], keypath
            value = newValue

            if callbacks[keypath]
              callback() for callback in callbacks[keypath].slice() when callback in callbacks[keypath]
            @observeMutations newValue, obj[@id], keypath

    unless callback in callbacks[keypath]
      callbacks[keypath].push callback

    @observeMutations obj[keypath], obj[@id], keypath

  unobserve: (obj, keypath, callback) ->
    map = @weakmap[obj[@id]]
    callbacks = map.callbacks[keypath]

    if (idx = callbacks.indexOf(callback)) >= 0
      callbacks.splice idx, 1

      unless callbacks.length
        delete map.callbacks[keypath]

    @unobserveMutations obj[keypath], obj[@id], keypath
    @cleanupWeakReference map, obj[@id]

  get: (obj, keypath) ->
    obj[keypath]

  set: (obj, keypath, value) ->
    obj[keypath] = value
