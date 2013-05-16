# Rivets.js
# =========

# > version: 0.5.2
# > author: Michael Richards
# > license: MIT
# >
# > http://rivetsjs.com/

# ---

# The Rivets namespace.
Rivets = {}

# Polyfill For `String::trim`.
unless String::trim then String::trim = -> @replace /^\s+|\s+$/g, ''

# Rivets.Binding
# --------------

# A single binding between a model attribute and a DOM element.
class Rivets.Binding
  # All information about the binding is passed into the constructor; the
  # containing view, the DOM node, the type of binding, the model object and the
  # keypath at which to listen for changes.
  constructor: (@view, @el, @type, @key, @keypath, @options = {}) ->
    unless @binder = @view.binders[type]
      for identifier, value of @view.binders
        if identifier isnt '*' and identifier.indexOf('*') isnt -1
          regexp = new RegExp "^#{identifier.replace('*', '.+')}$"
          if regexp.test type
            @binder = value
            @args = new RegExp("^#{identifier.replace('*', '(.+)')}$").exec type
            @args.shift()

    @binder or= @view.binders['*']
    @binder = {routine: @binder} if @binder instanceof Function
    @formatters = @options.formatters || []
    @model = @view.models[@key]

  # Applies all the current formatters to the supplied value and returns the
  # formatted value.
  formattedValue: (value) =>
    for formatter in @formatters
      args = formatter.split /\s+/
      id = args.shift()

      formatter = if @model[id] instanceof Function
        @model[id]
      else
        @view.formatters[id]

      if formatter?.read instanceof Function
        value = formatter.read value, args...
      else if formatter instanceof Function
        value = formatter value, args...

    value

  # Sets the value for the binding. This Basically just runs the binding routine
  # with the suplied value formatted.
  set: (value) =>
    value = if value instanceof Function and !@binder.function
      @formattedValue value.call @model
    else
      @formattedValue value

    @binder.routine?.call @, @el, value

  # Syncs up the view binding with the model.
  sync: =>
    @set if @options.bypass
      @model[@keypath]
    else
      @view.config.adapter.read @model, @keypath

  # Publishes the value currently set on the input element back to the model.
  publish: =>
    value = Rivets.Util.getInputValue @el

    for formatter in @formatters.slice(0).reverse()
      args = formatter.split /\s+/
      id = args.shift()

      if @view.formatters[id]?.publish
        value = @view.formatters[id].publish value, args...

    @view.config.adapter.publish @model, @keypath, value

  # Subscribes to the model for changes at the specified keypath. Bi-directional
  # routines will also listen for changes on the element to propagate them back
  # to the model.
  bind: =>
    @binder.bind?.call @, @el

    if @options.bypass
      @sync()
    else
      @view.config.adapter.subscribe @model, @keypath, @sync
      @sync() if @view.config.preloadData

    if @options.dependencies?.length
      for dependency in @options.dependencies
        if /^\./.test dependency
          model = @model
          keypath = dependency.substr 1
        else
          dependency = dependency.split '.'
          model = @view.models[dependency.shift()]
          keypath = dependency.join '.'

        @view.config.adapter.subscribe model, keypath, @sync

  # Unsubscribes from the model and the element.
  unbind: =>
    @binder.unbind?.call @, @el

    unless @options.bypass
      @view.config.adapter.unsubscribe @model, @keypath, @sync

    if @options.dependencies?.length
      for dependency in @options.dependencies
        if /^\./.test dependency
          model = @model
          keypath = dependency.substr 1
        else
          dependency = dependency.split '.'
          model = @view.models[dependency.shift()]
          keypath = dependency.join '.'

        @view.config.adapter.unsubscribe model, keypath, @sync

  # Updates the binding's model from what is currently set on the view. Unbinds
  # the old model first and then re-binds with the new model.
  update: =>
    @unbind()
    @model = @view.models[@key]
    @bind()

# Rivets.View
# -----------

# A collection of bindings built from a set of parent nodes.
class Rivets.View
  # The DOM elements and the model objects for binding are passed into the
  # constructor along with any local options that should be used throughout the
  # context of the view and it's bindings.
  constructor: (@els, @models, @options = {}) ->
    @els = [@els] unless (@els.jquery || @els instanceof Array)

    for option in ['config', 'binders', 'formatters']
      @[option] = {}
      @[option][k] = v for k, v of @options[option] if @options[option]
      @[option][k] ?= v for k, v of Rivets[option]

    @build()

  # Regular expression used to match binding attributes.
  bindingRegExp: =>
    prefix = @config.prefix
    if prefix then new RegExp("^data-#{prefix}-") else /^data-/

  # Parses the DOM tree and builds `Rivets.Binding` instances for every matched
  # binding declaration. Subsequent calls to build will replace the previous
  # `Rivets.Binding` instances with new ones, so be sure to unbind them first.
  build: =>
    @bindings = []
    skipNodes = []
    bindingRegExp = @bindingRegExp()

    parse = (node) =>
      unless node in skipNodes
        for attribute in node.attributes
          if bindingRegExp.test attribute.name
            type = attribute.name.replace bindingRegExp, ''
            unless binder = @binders[type]
              for identifier, value of @binders
                if identifier isnt '*' and identifier.indexOf('*') isnt -1
                  regexp = new RegExp "^#{identifier.replace('*', '.+')}$"
                  if regexp.test type
                    binder = value

            binder or= @binders['*']

            if binder.block
              skipNodes.push n for n in node.getElementsByTagName '*'
              attributes = [attribute]

        for attribute in attributes or node.attributes
          if bindingRegExp.test attribute.name
            options = {}
            type = attribute.name.replace bindingRegExp, ''
            pipes = (pipe.trim() for pipe in attribute.value.split '|')
            context = (ctx.trim() for ctx in pipes.shift().split '<')
            path = context.shift()
            splitPath = path.split /\.|:/
            options.formatters = pipes
            options.bypass = path.indexOf(':') != -1
            if splitPath[0]
              key = splitPath.shift()
            else
              key = null
              splitPath.shift()
            keypath = splitPath.join '.'

            if @models[key]?
              if dependencies = context.shift()
                options.dependencies = dependencies.split /\s+/

              @bindings.push new Rivets.Binding @, node, type, key, keypath, options

        attributes = null if attributes

      return

    for el in @els
      parse el
      parse node for node in el.getElementsByTagName '*' when node.attributes?

    return

  # Returns an array of bindings where the supplied function evaluates to true.
  select: (fn) =>
    binding for binding in @bindings when fn binding

  # Binds all of the current bindings for this view.
  bind: =>
    binding.bind() for binding in @bindings

  # Unbinds all of the current bindings for this view.
  unbind: =>
    binding.unbind() for binding in @bindings

  # Syncs up the view with the model by running the routines on all bindings.
  sync: =>
    binding.sync() for binding in @bindings

  # Publishes the input values from the view back to the model (reverse sync).
  publish: =>
    binding.publish() for binding in @select (b) -> b.binder.publishes

  # Updates the view's models along with any affected bindings.
  update: (models = {}) =>
    for key, model of models
      @models[key] = model
      binding.update() for binding in @select (b) -> b.key is key

# Rivets.Util
# -----------

# Houses common utility functions used internally by Rivets.js.
Rivets.Util =
  # Create a single DOM event binding.
  bindEvent: (el, event, handler, view) ->
    fn = (ev) -> handler.call @, ev, view

    if window.jQuery?
      el = jQuery el
      if el.on? then el.on event, fn else el.bind event, fn
    else if window.addEventListener?
      el.addEventListener event, fn, false
    else
      event = 'on' + event
      el.attachEvent event, fn

    fn

  # Remove a single DOM event binding.
  unbindEvent: (el, event, fn) ->
    if window.jQuery?
      el = jQuery el
      if el.off? then el.off event, fn else el.unbind event, fn
    else if window.removeEventListener
      el.removeEventListener event, fn, false
    else
      event = 'on' + event
      el.detachEvent  event, fn

  # Get the current value of an input node.
  getInputValue: (el) ->
    if window.jQuery?
      el = jQuery el

      switch el[0].type
        when 'checkbox' then el.is ':checked'
        else el.val()
    else
      switch el.type
        when 'checkbox' then el.checked
        when 'select-multiple' then o.value for o in el when o.selected
        else el.value

# Rivets.binders
# --------------

# Core binders that are included with Rivets.js, publicly available on
# `module.binders`. Can be overridden globally or local to a `Rivets.View`
# instance.
Rivets.binders =
  enabled: (el, value) ->
    el.disabled = !value

  disabled: (el, value) ->
    el.disabled = !!value

  checked:
    publishes: true
    bind: (el) ->
      @currentListener = Rivets.Util.bindEvent el, 'change', @publish
    unbind: (el) ->
      Rivets.Util.unbindEvent el, 'change', @currentListener
    routine: (el, value) ->
      if el.type is 'radio'
        el.checked = el.value?.toString() is value?.toString()
      else
        el.checked = !!value

  unchecked:
    publishes: true
    bind: (el) ->
      @currentListener = Rivets.Util.bindEvent el, 'change', @publish
    unbind: (el) ->
      Rivets.Util.unbindEvent el, 'change', @currentListener
    routine: (el, value) ->
      if el.type is 'radio'
        el.checked = el.value?.toString() isnt value?.toString()
      else
        el.checked = !value

  show: (el, value) ->
    el.style.display = if value then '' else 'none'

  hide: (el, value) ->
    el.style.display = if value then 'none' else ''

  html: (el, value) ->
    el.innerHTML = if value? then value else ''

  value:
    publishes: true
    bind: (el) ->
      @currentListener = Rivets.Util.bindEvent el, 'change', @publish
    unbind: (el) ->
      Rivets.Util.unbindEvent el, 'change', @currentListener
    routine: (el, value) ->
      if window.jQuery?
        el = jQuery el

        if value?.toString() isnt el.val()?.toString()
          el.val if value? then value else ''
      else
        if el.type is 'select-multiple'
          o.selected = o.value in value for o in el if value?
        else if value?.toString() isnt el.value?.toString()
          el.value = if value? then value else ''

  text: (el, value) ->
    if el.innerText?
      el.innerText = if value? then value else ''
    else
      el.textContent = if value? then value else ''

  "on-*":
    function: true
    routine: (el, value) ->
      Rivets.Util.unbindEvent el, @args[0], @currentListener if @currentListener
      @currentListener = Rivets.Util.bindEvent el, @args[0], value, @view

  "each-*":
    block: true
    bind: (el, collection) ->
      el.removeAttribute ['data', @view.config.prefix, @type].join('-').replace '--', '-'
    unbind: (el, collection) ->
      view.unbind() for view in @iterated if @iterated?
    routine: (el, collection) ->
      if @iterated?
        for view in @iterated
          view.unbind()
          e.parentNode.removeChild e for e in view.els
      else
        @marker = document.createComment " rivets: #{@type} "
        el.parentNode.insertBefore @marker, el
        el.parentNode.removeChild el

      @iterated = []

      if collection
        for item in collection
          data = {}
          data[n] = m for n, m of @view.models
          data[@args[0]] = item
          itemEl = el.cloneNode true

          previous = if @iterated.length
            @iterated[@iterated.length - 1].els[0]
          else
            @marker

          @marker.parentNode.insertBefore itemEl, previous.nextSibling ? null
          options = 
            binders: @view.options.binders
            formatters: @view.options.binders
            config: {}
          options.config[k] = v for k, v of @view.options.config if @view.options.config
          # Ensure preloadData is set to true since child elements won't get initiated otherwise until the next change (which might not be the first)
          options.config.preloadData = true

          view = new Rivets.View(itemEl, data, options)
          view.bind()
          @iterated.push view

  "class-*": (el, value) ->
    elClass = " #{el.className} "

    if !value is (elClass.indexOf(" #{@args[0]} ") isnt -1)
      el.className = if value
        "#{el.className} #{@args[0]}"
      else
        elClass.replace(" #{@args[0]} ", ' ').trim()

  "*": (el, value) ->
    if value
      el.setAttribute @type, value
    else
      el.removeAttribute @type

# Rivets.config
# -------------

# Default configuration, publicly accessible on `module.config`. Can be
# overridden globally or local to a `Rivets.View` instance.
Rivets.config =
  preloadData: true

# Rivets.formatters
# -----------------

# Default formatters (there aren't any), publicly accessible on
# `module.formatters`. Can be overridden globally or local to a `Rivets.View`
# instance.
Rivets.formatters = {}

# Rivets.factory
# --------------

# The Rivets.js module factory.
Rivets.factory = (exports) ->
  # Exposes the core binding routines that can be extended or stripped down.
  exports.binders = Rivets.binders

  # Exposes the formatters object to be extended.
  exports.formatters = Rivets.formatters

  # Exposes the rivets configuration options. These can be set manually or from
  # rivets.configure with an object literal.
  exports.config = Rivets.config

  # Sets configuration options by merging an object literal.
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

# Export
# ------

# Exports Rivets.js for CommonJS, AMD and the browser.
if typeof exports == 'object'
  Rivets.factory(exports)
else if typeof define == 'function' && define.amd
  define ['exports'], (exports) ->
    Rivets.factory(@rivets = exports)
    return exports
else
  Rivets.factory(@rivets = {})
