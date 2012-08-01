#     rivets.js
#     version : 0.2.6
#     author : Michael Richards
#     license : MIT

# The Rivets namespace.
Rivets = {}

# Polyfill For String::trim.
unless String::trim then String::trim = -> @replace /^\s+|\s+$/g, ""

# A single binding between a model attribute and a DOM element.
class Rivets.Binding
  # All information about the binding is passed into the constructor; the DOM
  # element, the type of binding, the model object and the keypath at which
  # to listen for changes.
  constructor: (@el, @type, @model, @keypath, @options = {}) ->
    if @options.special is "event"
      @routine = eventBinding @type
    else
      @routine = Rivets.routines[@type] || attributeBinding @type

    @formatters = @options.formatters || []

  # Bindings that should also observe the DOM element for changes in order to
  # propagate those changes back to the model object.
  bidirectionals: ['value', 'checked', 'unchecked']

  # Applies all the current formatters to the supplied value and returns the
  # formatted value.
  formattedValue: (value) =>
    for formatter in @formatters
      args = formatter.split /\s+/
      id = args.shift()
      value = if @model[id] instanceof Function
        @model[id] value, args...
      else if Rivets.config.formatters[id]
        Rivets.config.formatters[id] value, args...

    value

  # Sets the value for the binding. This Basically just runs the binding routine
  # with the suplied value formatted.
  set: (value) =>
    value = @formattedValue value

    if @options.special is "event"
      @routine @el, value, @currentListener
      @currentListener = value
    else
      value = value() if value instanceof Function
      @routine @el, value

  # Subscribes to the model for changes at the specified keypath. Bi-directional
  # routines will also listen for changes on the element to propagate them back
  # to the model.
  bind: =>
    if @options.bypass
      @set @model[@keypath]
    else
      Rivets.config.adapter.subscribe @model, @keypath, @set

      if Rivets.config.preloadData
        @set Rivets.config.adapter.read @model, @keypath

    if @options.dependencies?.length
      @reset = (value) =>
        @set if @options.bypass
          @model[@keypath]
        else
          Rivets.config.adapter.read @model, @keypath
        
      for keypath in @options.dependencies
        Rivets.config.adapter.subscribe @model, keypath, @reset

    if @type in @bidirectionals
      bindEvent @el, 'change', @publish

  # Publishes the value currently set on the input element back to the model.
  publish: (e) =>
    el = e.target or e.srcElement
    Rivets.config.adapter.publish @model, @keypath, getInputValue el

  # Unsubscribes from the model and the element.
  unbind: =>
    Rivets.config.adapter.unsubscribe @model, @keypath, @set

    if @options.dependencies?.length
      for keypath in @options.dependencies
        Rivets.config.adapter.unsubscribe @model, keypath, @reset

    if @type in @bidirectionals
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
    bindingRegExp = @bindingRegExp()
    eventRegExp = /^on-/

    parseNode = (node) =>
      for attribute in node.attributes
        if bindingRegExp.test attribute.name
          options = {}

          type = attribute.name.replace bindingRegExp, ''
          pipes = (pipe.trim() for pipe in attribute.value.split '|')
          context = (ctx.trim() for ctx in pipes.shift().split '>')
          path = context.shift().split /(\.|:)/
          options.formatters = pipes
          model = @models[path.shift()]
          options.bypass = path.shift() is ':'
          keypath = path.join()

          if dependencies = context.shift()
            options.dependencies = dependencies.split /\s+/

          if eventRegExp.test type
            type = type.replace eventRegExp, ''
            options.special = "event"

          @bindings.push new Rivets.Binding node, type, model, keypath, options

    for el in @els
      parseNode el
      parseNode node for node in el.getElementsByTagName '*'

  # Binds all of the current bindings for this view.
  bind: =>
    binding.bind() for binding in @bindings

  # Unbinds all of the current bindings for this view.
  unbind: =>
    binding.unbind() for binding in @bindings

# Cross-browser event binding
bindEvent = (el, event, fn) ->
  # Check to see if addEventListener is available.
  if window.addEventListener
    el.addEventListener event, fn
  else
  # Assume we are in IE and use attachEvent.
    el.attachEvent event, fn

unbindEvent = (el, event, fn) ->
  # Check to see if addEventListener is available.
  if window.removeEventListener
    el.removeEventListener event, fn
  else
  # Assume we are in IE and use attachEvent.
    el.detachEvent event, fn

# Returns the current input value for the specified element.
getInputValue = (el) ->
  switch el.type
    when 'checkbox' then el.checked
    else el.value

# Returns an event binding routine for the specified event.
eventBinding = (event) -> (el, bind, unbind) ->
  bindEvent el, event, bind if bind
  unbindEvent el, event, unbind if unbind

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
    el.innerHTML = value or ''
  value: (el, value) ->
    el.value = value or ''
  text: (el, value) ->
    if el.innerText?
      el.innerText = value or ''
    else
      el.textContent = value or ''

# Default configuration.
Rivets.config =
  preloadData: true
  formatters: {}

# The rivets module. This is the public interface that gets exported.
rivets =
  # Exposes the core binding routines that can be extended or stripped down.
  routines: Rivets.routines

  # Exposes the rivets configuration options. These can be set manually or from
  # rivets.configure with an object literal.
  config: Rivets.config

  # Sets configuration options by merging an object literal.
  configure: (options={}) ->
    for property, value of options
      Rivets.config[property] = value

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
