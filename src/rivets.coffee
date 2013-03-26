#     rivets.js
#     version : 0.4.5
#     author : Michael Richards
#     license : MIT

# The Rivets namespace.
Rivets = {}

# Polyfill For String::trim.
unless String::trim then String::trim = -> @replace /^\s+|\s+$/g, ''

# A single binding between a model attribute and a DOM element.
class Rivets.Binding
  # All information about the binding is passed into the constructor; the DOM
  # element, the type of binding, the model object and the keypath at which
  # to listen for changes.
  constructor: (@el, @type, @model, @keypath, @options = {}) ->
    unless @binder = Rivets.binders[type]
      for identifier, value of Rivets.binders
        if identifier isnt '*' and identifier.indexOf('*') isnt -1
          regexp = new RegExp "^#{identifier.replace('*', '.+')}$"
          if regexp.test type
            @binder = value
            @args = new RegExp("^#{identifier.replace('*', '(.+)')}$").exec type
            @args.shift()

    @binder or= Rivets.binders['*']

    if @binder instanceof Function
      @binder = {routine: @binder}

    @formatters = @options.formatters || []

  # Applies all the current formatters to the supplied value and returns the
  # formatted value.
  formattedValue: (value) =>
    model = @model
    for formatter in @formatters
      args = formatter.split /\s+/
      id = args.shift()

      formatter = if model[id] instanceof Function
        model[id]
      else
        Rivets.formatters[id]

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
      Rivets.config.adapter.read @model, @keypath

  # Publishes the value currently set on the input element back to the model.
  publish: => 
    value = getInputValue @el

    for formatter in @formatters.slice(0).reverse()
      args = formatter.split /\s+/
      id = args.shift()

      if Rivets.formatters[id]?.publish
        value = Rivets.formatters[id].publish value, args...

    Rivets.config.adapter.publish @model, @keypath, value

  # Subscribes to the model for changes at the specified keypath. Bi-directional
  # routines will also listen for changes on the element to propagate them back
  # to the model.
  bind: =>
    @binder.bind?.call @, @el

    if @options.bypass
      @sync()
    else
      Rivets.config.adapter.subscribe @model, @keypath, @sync
      @sync() if Rivets.config.preloadData

    loopDeps @, (model, keypath) => Rivets.config.adapter.subscribe model, keypath, @sync

  # Unsubscribes from the model and the element.
  unbind: =>
    @binder.unbind?.call @, @el

    unless @options.bypass
      Rivets.config.adapter.unsubscribe @model, @keypath, @sync

    loopDeps @, (model, keypath) => Rivets.config.adapter.unsubscribe model, keypath, @sync

loopDeps = (binder, callback) ->
  if binder.options.dependencies?.length
    for dependency in binder.options.dependencies
      if /^\./.test dependency
        model = binder.model
        keypath = dependency.substr 1
      else
        dependency = dependency.split '.'
        model = binder.view.models[dependency.shift()]
        keypath = dependency.join '.'

    callback model, keypath

expressionRegex = /(.*?)\{\{([^{}]+)\}\}/

createSubExpressionBinder = (outerBinding, values, i) ->
  values[i] = null
  routine: (el, value) ->
      values[i] = value
      outerBinding.sync()

defaultExpressionParser = (view, node, type, models, value) ->
  if expressionRegex.test value
    binding = new Rivets.Binding node, type, models

    values = []
    subs = []
    while value && expressionRegex.test value
      matches = expressionRegex.exec value
      value = value.substring matches[0].length
      values[values.length] = matches[1] if matches[1]
      subs[subs.length] = subBinding = defaultExpressionParser view, null, '*', models, matches[2]
      subBinding.binder = createSubExpressionBinder binding, values, values.length
    values[values.length] = value if value
    bindMethod = binding.bind
    unbindMethod = binding.unbind
    binding.sync = ->
      binding.set values.join ''

    # Publishes the value currently set on the input element back to the model.
    binding.publish = ->
      # can't really do anything with this

    # Subscribes to the model for changes at the specified keypath. Bi-directional
    # routines will also listen for changes on the element to propagate them back
    # to the model.
    binding.bind = ->
      bindMethod()

      for sub in subs
        sub.bind()

    # Unsubscribes from the model and the element.
    binding.unbind = ->
      unbindMethod()

      for sub in subs
        sub.unbind()

    return binding

  pipes = (pipe.trim() for pipe in value.split '|')
  context = (ctx.trim() for ctx in pipes.shift().split '<')
  path = context.shift()
  splitPath = path.split /\.|:/
  options = {}
  options.formatters = pipes
  options.bypass = path.indexOf(':') != -1
  options.bindContext = models
  if splitPath[0]
    model = models[splitPath.shift()]
  else
    model = models
    splitPath.shift()
  keypath = splitPath.join '.'

  if model
    if dependencies = context.shift()
      options.dependencies = dependencies.split /\s+/

    binding = new Rivets.Binding node, type, model, keypath, options
    binding.view = view

  binding

# A collection of bindings built from a set of parent elements.
class Rivets.View
  # The DOM elements and the model objects for binding are passed into the
  # constructor.
  constructor: (@els, @models) ->
    @els = [@els] unless (@els.jquery || @els instanceof Array)
    @build()

  # Regular expression used to match binding attributes.
  bindingRegExp: =>
    prefix = Rivets.config.prefix
    if prefix then new RegExp("^data-#{prefix}-") else /^data-/

  # Parses the DOM tree and builds Rivets.Binding instances for every matched
  # binding declaration. Subsequent calls to build will replace the previous
  # Rivets.Binding instances with new ones, so be sure to unbind them first.
  build: =>
    @bindings = []
    skipNodes = []
    bindingRegExp = @bindingRegExp()

    parse = (node) =>
      unless node in skipNodes
        for attribute in node.attributes
          if bindingRegExp.test attribute.name
            type = attribute.name.replace bindingRegExp, ''
            unless binder = Rivets.binders[type]
              for identifier, value of Rivets.binders
                if identifier isnt '*' and identifier.indexOf('*') isnt -1
                  regexp = new RegExp "^#{identifier.replace('*', '.+')}$"
                  if regexp.test type
                    binder = value

            binder or= Rivets.binders['*']

            if binder.block
              skipNodes.push n for n in node.getElementsByTagName '*'
              attributes = [attribute]

        for attribute in attributes or node.attributes
          if bindingRegExp.test attribute.name
            type = attribute.name.replace bindingRegExp, ''
            binding = defaultExpressionParser @, node, type, @models, attribute.value

            if binding
              @bindings.push binding

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

# Cross-browser event binding.
bindEvent = (el, event, handler, context, bindContext) ->
  fn = (e) -> handler.call context, e, bindContext

  # Check to see if jQuery is loaded.
  if window.jQuery?
    el = jQuery el
    if el.on? then el.on event, fn else el.bind event, fn
  # Check to see if addEventListener is available.
  else if window.addEventListener?
    el.addEventListener event, fn, false
  else
    # Assume we are in IE and use attachEvent.
    event = 'on' + event
    el.attachEvent event, fn

  fn

# Cross-browser event unbinding.
unbindEvent = (el, event, fn) ->
  # Check to see if jQuery is loaded.
  if window.jQuery?
    el = jQuery el
    if el.off? then el.off event, fn else el.unbind event, fn
  # Check to see if addEventListener is available.
  else if window.removeEventListener
    el.removeEventListener event, fn, false
  else
  # Assume we are in IE and use attachEvent.
    event = 'on' + event
    el.detachEvent  event, fn

# Returns the current input value for the specified element.
getInputValue = (el) ->
  switch el.type
    when 'checkbox' then el.checked
    when 'select-multiple' then o.value for o in el when o.selected
    else el.value

iterate = (collection, callback) ->
  if Rivets.config.adapter.iterate
    Rivets.config.adapter.iterate collection, callback
  else
    callback(item, i) for item, i in collection

# Core binding routines.
Rivets.binders =
  enabled: (el, value) ->
    el.disabled = !value

  disabled: (el, value) ->
    el.disabled = !!value

  checked:
    publishes: true
    bind: (el) ->
      @currentListener = bindEvent el, 'change', @publish
    unbind: (el) ->
      unbindEvent el, 'change', @currentListener
    routine: (el, value) ->
      if el.type is 'radio'
        el.checked = el.value is value
      else
        el.checked = !!value

  unchecked:
    publishes: true
    bind: (el) ->
      @currentListener = bindEvent el, 'change', @publish
    unbind: (el) ->
      unbindEvent el, 'change', @currentListener
    routine: (el, value) ->
      if el.type is 'radio'
        el.checked = el.value isnt value
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
      @currentListener = bindEvent el, 'change', @publish
    unbind: (el) ->
      unbindEvent el, 'change', @currentListener
    routine: (el, value) ->
      if el.type is 'select-multiple'
        o.selected = o.value in value for o in el if value?
      else
        el.value = if value? then value else ''

  text: (el, value) ->
    if el.innerText?
      el.innerText = if value? then value else ''
    else
      el.textContent = if value? then value else ''

  "on-*":
    function: true
    routine: (el, value) ->
      firstArg = @args[0]
      currentListener = @currentListener
      unbindEvent el, firstArg, currentListener if currentListener
      @currentListener = bindEvent el, firstArg, value, @model, @options.bindContext

  "each-*":
    block: true
    bind: (el, collection) ->
      el.removeAttribute ['data', rivets.config.prefix, @type].join('-').replace '--', '-'
    routine: (el, collection) ->
      if @iterated?
        for view in @iterated
          view.unbind()
          e.parentNode.removeChild e for e in view.els
      else
        @marker = document.createComment " rivets: #{@type} "
        el.parentNode.insertBefore @marker, el
        el.parentNode.removeChild el

      @iterated = iterated = []

      if collection
        iterate collection, (item, i) =>
          data = {}
          data[n] = m for n, m of @view.models
          data[@args[0]] = item
          data["#{@args[0]}_index"] = i
          itemEl = el.cloneNode true
          if iterated.length > 0
            previous = iterated[iterated.length - 1].els[0]
          else
            previous = @marker
          @marker.parentNode.insertBefore itemEl, previous.nextSibling ? null
          iterated.push rivets.bind itemEl, data

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

# Default configuration.
Rivets.config =
  preloadData: true

# Default formatters. There aren't any.
Rivets.formatters = {}

# The rivets module. This is the public interface that gets exported.
rivets =
  # Exposes the core binding routines that can be extended or stripped down.
  binders: Rivets.binders

  # Exposes the formatters object to be extended.
  formatters: Rivets.formatters

  # Exposes the rivets configuration options. These can be set manually or from
  # rivets.configure with an object literal.
  config: Rivets.config

  # Sets configuration options by merging an object literal.
  configure: (options={}) ->
    for property, value of options
      Rivets.config[property] = value
    return

  # Binds a set of model objects to a parent DOM element. Returns a Rivets.View
  # instance.
  bind: (el, models = {}) ->
    view = new Rivets.View(el, models)
    view.bind()
    view

# Exports rivets for both CommonJS and the browser.
if module?
  module.exports = rivets
else
  @rivets = rivets
