# Rivets.factory
# --------------

# Rivets.js module factory.
Rivets.factory = (exports) ->
  # Exposes the full Rivets namespace. This is mainly used for isolated testing.
  exports._ = Rivets

  # Exposes the binders object.
  exports.binders = Rivets.binders

  # Exposes the components object.
  exports.components = Rivets.components

  # Exposes the formatters object.
  exports.formatters = Rivets.formatters

  # Exposes the adapters object.
  exports.adapters = Rivets.adapters

  # Exposes the config object.
  exports.config = Rivets.config

  # Merges an object literal onto the config object.
  exports.configure = (options={}) ->
    for property, value of options
      Rivets.config[property] = value
    return

  # Binds a set of model objects to a parent DOM element and returns a
  # `Rivets.View` instance.
  exports.bind = (el, models = {}, options = {}) ->
    view = new Rivets.View(el, models, options)
    view.bind()
    view

# Exports Rivets.js for CommonJS, AMD and the browser.
if typeof exports == 'object'
  Rivets.factory(exports)
else if typeof define == 'function' && define.amd
  define ['exports'], (exports) ->
    Rivets.factory(@rivets = exports)
    return exports
else
  Rivets.factory(@rivets = {})
