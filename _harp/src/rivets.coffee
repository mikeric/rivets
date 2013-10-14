# Rivets.js
# =========

# > version: 0.5.10
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
    unless @binder = Rivets.internalBinders[@type] or @view.binders[type]
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
    @model = if @key then @view.models[@key] else @view.models

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

  # Returns an event handler for the binding around the supplied function.
  eventHandler: (fn) =>
    handler = (binding = @).view.config.handler
    (ev) -> handler.call fn, @, ev, binding

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
  update: (models = {}) =>
    if @key
      if models[@key]
        unless @options.bypass
          @view.config.adapter.unsubscribe @model, @keypath, @sync

        @model = models[@key]

        if @options.bypass
          @sync()
        else
          @view.config.adapter.subscribe @model, @keypath, @sync
          @sync() if @view.config.preloadData
    else
      @sync()

    @binder.update?.call @, models

# Rivets.ComponentBinding
# -----------------------

# A component view encapsulated as a binding within it's parent view.
class Rivets.ComponentBinding extends Rivets.Binding
  # Initializes a component binding for the specified view. The raw component
  # element is passed in along with the component type. Attributes and scope
  # inflections are determined based on the components defined attributes.
  constructor: (@view, @el, @type) ->
    @component = Rivets.components[@type]
    @attributes = {}
    @inflections = {}

    for attribute in @el.attributes or []
      if attribute.name in @component.attributes
        @attributes[attribute.name] = attribute.value
      else
        @inflections[attribute.name] = attribute.value

  # Intercepts `Rivets.Binding::sync` since component bindings are not bound to a
  # particular model to update it's value.
  sync: ->

  # Returns an object map using the component's scope inflections.
  locals: (models = @view.models) =>
    result = {}
    result[key] = models[inverse] for key, inverse of @inflections
    result[key] ?= model for key, model of models

    result

  # Intercepts `Rivets.Binding::update` to be called on `@componentView` with a
  # localized map of the models.
  update: (models) =>
    @componentView?.update @locals models

  # Intercepts `Rivets.Binding::bind` to build `@componentView` with a localized
  # map of models from the root view. Bind `@componentView` on subsequent calls.
  bind: =>
    if @componentView?
      @componentView?.bind()
    else
      el = @component.build.call @attributes
      (@componentView = new Rivets.View(el, @locals(), @view.options)).bind()
      @el.parentNode.replaceChild el, @el

  # Intercept `Rivets.Binding::unbind` to be called on `@componentView`.
  unbind: =>
    @componentView?.unbind()

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

  # Regular expression used to match component nodes.
  componentRegExp: =>
    new RegExp "^#{@config.prefix?.toUpperCase() ? 'RV'}-"

  # Parses the DOM tree and builds `Rivets.Binding` instances for every matched
  # binding declaration.
  build: =>
    @bindings = []
    skipNodes = []
    bindingRegExp = @bindingRegExp()
    componentRegExp = @componentRegExp()


    buildBinding = (node, type, declaration) =>
      options = {}

      pipes = (pipe.trim() for pipe in declaration.split '|')
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

      if dependencies = context.shift()
        options.dependencies = dependencies.split /\s+/

      @bindings.push new Rivets.Binding @, node, type, key, keypath, options

    parse = (node) =>
      unless node in skipNodes
        if node.nodeType is Node.TEXT_NODE
          parser = Rivets.TextTemplateParser

          if delimiters = @config.templateDelimiters
            if (tokens = parser.parse(node.data, delimiters)).length
              unless tokens.length is 1 and tokens[0].type is parser.types.text
                [startToken, restTokens...] = tokens
                node.data = startToken.value

                switch startToken.type
                  when 0 then node.data = startToken.value
                  when 1 then buildBinding node, 'textNode', startToken.value

                for token in restTokens
                  node.parentNode.appendChild (text = document.createTextNode token.value)
                  buildBinding text, 'textNode', token.value if token.type is 1
        else if componentRegExp.test node.tagName
          type = node.tagName.replace(componentRegExp, '').toLowerCase()
          @bindings.push new Rivets.ComponentBinding @, node, type

        else if node.attributes?
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
                skipNodes.push n for n in node.childNodes
                attributes = [attribute]

          for attribute in attributes or node.attributes
            if bindingRegExp.test attribute.name
              type = attribute.name.replace bindingRegExp, ''
              buildBinding node, type, attribute.value

        parse childNode for childNode in node.childNodes

    parse el for el in @els

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
    @models[key] = model for key, model of models
    binding.update models for binding in @bindings

# Rivets.TextTemplateParser
# -------------------------

# Rivets.js text template parser and tokenizer for mustache-style text content
# binding declarations.
class Rivets.TextTemplateParser
  @types:
    text: 0
    binding: 1

  # Parses the template and returns a set of tokens, separating static portions
  # of text from binding declarations.
  @parse: (template, delimiters) ->
    tokens = []
    length = template.length
    index = 0
    lastIndex = 0

    while lastIndex < length
      index = template.indexOf delimiters[0], lastIndex

      if index < 0
        tokens.push type: @types.text, value: template.slice lastIndex
        break
      else
        if index > 0 and lastIndex < index
          tokens.push type: @types.text, value: template.slice lastIndex, index

        lastIndex = index + 2
        index = template.indexOf delimiters[1], lastIndex

        if index < 0
          substring = template.slice lastIndex - 2
          lastToken = tokens[tokens.length - 1]

          if lastToken?.type is @types.text
            lastToken.value += substring
          else
            tokens.push type: @types.text, value: substring

          break

        value = template.slice(lastIndex, index).trim()
        tokens.push type: @types.binding, value: value
        lastIndex = index + 2

    tokens

# Rivets.Util
# -----------

# Houses common utility functions used internally by Rivets.js.
Rivets.Util =
  # Create a single DOM event binding.
  bindEvent: (el, event, handler) ->
    if window.jQuery?
      el = jQuery el
      if el.on? then el.on event, handler else el.bind event, handler
    else if window.addEventListener?
      el.addEventListener event, handler, false
    else
      event = 'on' + event
      el.attachEvent event, handler

  # Remove a single DOM event binding.
  unbindEvent: (el, event, handler) ->
    if window.jQuery?
      el = jQuery el
      if el.off? then el.off event, handler else el.unbind event, handler
    else if window.removeEventListener?
      el.removeEventListener event, handler, false
    else
      event = 'on' + event
      el.detachEvent  event, handler

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
      Rivets.Util.bindEvent el, 'change', @publish
    unbind: (el) ->
      Rivets.Util.unbindEvent el, 'change', @publish
    routine: (el, value) ->
      if el.type is 'radio'
        el.checked = el.value?.toString() is value?.toString()
      else
        el.checked = !!value

  unchecked:
    publishes: true
    bind: (el) ->
      Rivets.Util.bindEvent el, 'change', @publish
    unbind: (el) ->
      Rivets.Util.unbindEvent el, 'change', @publish
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
      Rivets.Util.bindEvent el, 'change', @publish
    unbind: (el) ->
      Rivets.Util.unbindEvent el, 'change', @publish
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

  if:
    block: true

    bind: (el) ->
      unless @marker?
        attr = ['data', @view.config.prefix, @type].join('-').replace '--', '-'
        declaration = el.getAttribute attr

        @marker = document.createComment " rivets: #{@type} #{declaration} "

        el.removeAttribute attr
        el.parentNode.insertBefore @marker, el
        el.parentNode.removeChild el

    unbind: ->
      @nested?.unbind()

    routine: (el, value) ->
      if !!value is not @nested?
        if value
          models = {}
          models[key] = model for key, model of @view.models

          options =
            binders: @view.options.binders
            formatters: @view.options.formatters
            config: @view.options.config

          (@nested = new Rivets.View(el, models, options)).bind()
          @marker.parentNode.insertBefore el, @marker.nextSibling
        else
          el.parentNode.removeChild el
          @nested.unbind()
          delete @nested

    update: (models) ->
      @nested.update models

  unless:
    block: true

    bind: (el) ->
      Rivets.binders.if.bind.call @, el

    unbind: ->
      Rivets.binders.if.unbind.call @

    routine: (el, value) ->
      Rivets.binders.if.routine.call @, el, not value

    update: (models) ->
      Rivets.binders.if.update.call @, models

  "on-*":
    function: true

    unbind: (el) ->
      Rivets.Util.unbindEvent el, @args[0], @handler if @handler

    routine: (el, value) ->
      Rivets.Util.unbindEvent el, @args[0], @handler if @handler
      Rivets.Util.bindEvent el, @args[0], @handler = @eventHandler value

  "each-*":
    block: true

    bind: (el) ->
      unless @marker?
        attr = ['data', @view.config.prefix, @type].join('-').replace '--', '-'
        @marker = document.createComment " rivets: #{@type} "
        @iterated = []

        el.removeAttribute attr
        el.parentNode.insertBefore @marker, el
        el.parentNode.removeChild el

    unbind: (el) ->
      view.unbind() for view in @iterated if @iterated?

    routine: (el, collection) ->
      modelName = @args[0]
      collection = collection or []

      if @iterated.length > collection.length
        for i in Array @iterated.length - collection.length
          view = @iterated.pop()
          view.unbind()
          @marker.parentNode.removeChild view.els[0]

      for model, index in collection
        data = {}
        data[modelName] = model

        if not @iterated[index]?
          for key, model of @view.models
            data[key] ?= model

          previous = if @iterated.length
            @iterated[@iterated.length - 1].els[0]
          else
            @marker

          options =
            binders: @view.options.binders
            formatters: @view.options.formatters
            config: {}

          options.config[k] = v for k, v of @view.options.config
          options.config.preloadData = true

          template = el.cloneNode true
          view = new Rivets.View(template, data, options)
          view.bind()
          @iterated.push view

          @marker.parentNode.insertBefore template, previous.nextSibling
        else if @iterated[index].models[modelName] isnt model
          @iterated[index].update data

    update: (models) ->
      data = {}
      
      for key, model of models
        data[key] = model unless key is @args[0]

      view.update data for view in @iterated

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

# Rivets.internalBinders
# ----------------------

# Contextually sensitive binders that are used outside of the standard attribute
# bindings. Put here for fast lookups and to prevent them from being overridden.
Rivets.internalBinders =
  textNode: (node, value) ->
    node.data = value ? ''

# Rivets.components
# -----------------

# Default components (there aren't any), publicly accessible on
# `module.components`. Can be overridden globally or local to a `Rivets.View`
# instance.
Rivets.components = {}

# Rivets.config
# -------------

# Default configuration, publicly accessible on `module.config`. Can be
# overridden globally or local to a `Rivets.View` instance.
Rivets.config =
  preloadData: true
  handler: (context, ev, binding) ->
    @call context, ev, binding.view.models

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
  # Exposes the full Rivets namespace. This is mainly used for isolated testing.
  exports._ = Rivets

  # Exposes the core binding routines that can be extended or stripped down.
  exports.binders = Rivets.binders

  # Exposes the components object to be extended.
  exports.components = Rivets.components

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
