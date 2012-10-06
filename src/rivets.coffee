#     rivets.js
#     version : 0.3.11
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
    @routine = switch @options.special
      when 'event'     then eventBinding @type
      when 'class'     then classBinding @type
      when 'iteration' then iterationBinding @type
      else Rivets.routines[@type] || attributeBinding @type

    @formatters = @options.formatters || []

  # Returns true|false depending on whether or not the binding should also
  # observe the DOM element for changes in order to propagate those changes
  # back to the model object.
  isBidirectional: =>
    @type in ['value', 'checked', 'unchecked']

  # Applies all the current formatters to the supplied value and returns the
  # formatted value.
  formattedValue: (value) =>
    for formatter in @formatters
      args = formatter.split /\s+/
      id = args.shift()
      value = if @model[id] instanceof Function
        @model[id] value, args...
      else if Rivets.formatters[id]
        Rivets.formatters[id] value, args...

    value

  # Sets the value for the binding. This Basically just runs the binding routine
  # with the suplied value formatted.
  set: (value) =>
    value = if value instanceof Function and @options.special isnt 'event'
      @formattedValue value.call @model
    else
      @formattedValue value

    if @options.special is 'event'
      @currentListener = @routine @el, @model, value, @currentListener
    else if @options.special is 'iteration'
      @routine @el, value, @
    else
      @routine @el, value

  # Syncs up the view binding with the model.
  sync: =>
    @set if @options.bypass
      @model[@keypath]
    else
      Rivets.config.adapter.read @model, @keypath

  # Publishes the value currently set on the input element back to the model.
  publish: =>
    Rivets.config.adapter.publish @model, @keypath, getInputValue @el

  # Subscribes to the model for changes at the specified keypath. Bi-directional
  # routines will also listen for changes on the element to propagate them back
  # to the model.
  bind: =>
    if @options.bypass
      @sync()
    else
      Rivets.config.adapter.subscribe @model, @keypath, @sync
      @sync() if Rivets.config.preloadData

    if @options.dependencies?.length
      for dependency in @options.dependencies
        if /^\./.test dependency
          model = @model
          keypath = dependency.substr 1
        else
          dependency = dependency.split '.'
          model = @view.models[dependency.shift()]
          keypath = dependency.join '.'

        Rivets.config.adapter.subscribe model, keypath, @sync

    if @isBidirectional()
      bindEvent @el, 'change', @publish

  # Unsubscribes from the model and the element.
  unbind: =>
    unless @options.bypass
      Rivets.config.adapter.unsubscribe @model, @keypath, @sync

      if @options.dependencies?.length
        for keypath in @options.dependencies
          Rivets.config.adapter.unsubscribe @model, keypath, @sync

      if @isBidirectional()
        @el.removeEventListener 'change', @publish

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

  # Builds the Rivets.Binding instances for the view.
  build: =>
    @bindings = []
    skipNodes = []
    iterator = null
    bindingRegExp = @bindingRegExp()
    eventRegExp = /^on-/
    classRegExp = /^class-/
    iterationRegExp = /^each-/

    parseNode = (node) =>
      unless node in skipNodes
        for attribute in node.attributes
          if bindingRegExp.test attribute.name
            type = attribute.name.replace bindingRegExp, ''

            if iterationRegExp.test type
              unless @models[type.replace iterationRegExp, '']
                skipNodes.push n for n in node.getElementsByTagName '*'
                iterator = [attribute]

        for attribute in iterator or node.attributes
          if bindingRegExp.test attribute.name
            options = {}

            type = attribute.name.replace bindingRegExp, ''
            pipes = (pipe.trim() for pipe in attribute.value.split '|')
            context = (ctx.trim() for ctx in pipes.shift().split '<')
            path = context.shift()
            splitPath = path.split /\.|:/
            options.formatters = pipes
            model = @models[splitPath.shift()]
            options.bypass = path.indexOf(':') != -1
            keypath = splitPath.join '.'

            if model
              if dependencies = context.shift()
                options.dependencies = dependencies.split /\s+/

              if eventRegExp.test type
                type = type.replace eventRegExp, ''
                options.special = 'event'

              if classRegExp.test type
                type = type.replace classRegExp, ''
                options.special = 'class'

              if iterationRegExp.test type
                type = type.replace iterationRegExp, ''
                options.special = 'iteration'

              binding = new Rivets.Binding node, type, model, keypath, options
              binding.view = @

              @bindings.push binding

          if iterator
            node.removeAttribute(a.name) for a in iterator
            iterator = null
      return

    for el in @els
      parseNode el
      parseNode node for node in el.getElementsByTagName '*'
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
    binding.publish() for binding in @select (b) -> b.isBidirectional()

# Cross-browser event binding.
bindEvent = (el, event, handler, context) ->
  fn = (e) -> handler.call context, e

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

# Returns an event binding routine for the specified event.
eventBinding = (event) -> (el, context, bind, unbind) ->
  unbindEvent el, event, unbind if unbind
  bindEvent el, event, bind, context

# Returns a class binding routine for the specified class name.
classBinding = (name) -> (el, value) ->
  elClass = " #{el.className} "
  hasClass = elClass.indexOf(" #{name} ") != -1

  if !value is hasClass
    el.className = if value
      "#{el.className} #{name}"
    else
      elClass.replace(" #{name} ", ' ').trim()

# Returns an iteration binding routine for the specified collection.
iterationBinding = (name) -> (el, collection, binding) ->
  if binding.iterated?
    for iteration in binding.iterated
      iteration.view.unbind()
      iteration.el.parentNode.removeChild iteration.el
  else
    binding.marker = document.createComment " rivets: each-#{name} "
    el.parentNode.insertBefore binding.marker, el
    el.parentNode.removeChild el

  binding.iterated = []

  for item in collection
    data = {}
    data[n] = m for n, m of binding.view.models
    data[name] = item
    itemEl = el.cloneNode true
    previous = binding.iterated[binding.iterated.length - 1] or binding.marker
    binding.marker.parentNode.insertBefore itemEl, previous.nextSibling ? null

    binding.iterated.push
      el: itemEl
      view: rivets.bind itemEl, data

# Returns an attribute binding routine for the specified attribute. This is what
# is used when there are no matching routines for an identifier.
attributeBinding = (attr) -> (el, value) ->
  if value then el.setAttribute attr, value else el.removeAttribute attr

# Core binding routines.
Rivets.routines =
  enabled: (el, value) ->
    el.disabled = !value
  disabled: (el, value) ->
    el.disabled = !!value
  checked: (el, value) ->
    if el.type is 'radio'
      el.checked = el.value is value
    else
      el.checked = !!value
  unchecked: (el, value) ->
    if el.type is 'radio'
      el.checked = el.value isnt value
    else
      el.checked = !value
  show: (el, value) ->
    el.style.display = if value then '' else 'none'
  hide: (el, value) ->
    el.style.display = if value then 'none' else ''
  html:  (el, value) ->
    el.innerHTML = if value? then value else ''
  value: (el, value) ->
    if el.type is 'select-multiple'
      o.selected = o.value in value for o in el if value?
    else
      el.value = if value? then value else ''
  text: (el, value) ->
    if el.innerText?
      el.innerText = if value? then value else ''
    else
      el.textContent = if value? then value else ''

# Default configuration.
Rivets.config =
  preloadData: true

# Default formatters. There aren't any.
Rivets.formatters = {}

# The rivets module. This is the public interface that gets exported.
rivets =
  # Exposes the core binding routines that can be extended or stripped down.
  routines: Rivets.routines

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
