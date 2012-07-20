#     rivets.js
#     version : 0.2.1
#     author : Michael Richards
#     license : MIT

# The Rivets namespace.
Rivets = {}

# Polyfill For String::trim.
unless String::trim then String::trim = -> @replace /^\s+|\s+$/g, ""

# A single binding between a model attribute and a DOM element.
class Rivets.Binding
  # All information about the binding is passed into the constructor; the DOM
  # element, the routine identifier, the model object and the keypath at which
  # to listen for changes.
  constructor: (@el, @type, @bindType, @model, @keypath, @formatters = []) ->
    if @bindType is "event"
      @routine = eventBinding @type
    else
      @routine = Rivets.routines[@type] || attributeBinding @type

  # Sets the value for the binding. This Basically just runs the binding routine
  # with the suplied value and applies any formatters.
  set: (value) =>
    for formatter in @formatters
      value = Rivets.config.formatters[formatter] value

    if @bindType is "event"
      @routine @el, value, @currentListener
      @currentListener = value
    else
      @routine @el, value

  # Subscribes to the model for changes at the specified keypath. Bi-directional
  # routines will also listen for changes on the element to propagate them back
  # to the model.
  bind: =>
    Rivets.config.adapter.subscribe @model, @keypath, @set

    if Rivets.config.preloadData
      @set Rivets.config.adapter.read @model, @keypath

    if @bindType is "bidirectional"
      bindEvent @el, 'change', @publish

  # Publishes the value currently set on the input element back to the model.
  publish: (e) =>
    el = e.target or e.srcElement
    Rivets.config.adapter.publish @model, @keypath, getInputValue el

  # Unsubscribes from the model and the element.
  unbind: =>
    Rivets.config.adapter.unsubscribe @model, @keypath, @set

    if @bindType is "bidirectional"
      @el.removeEventListener 'change', @publish

# A collection of bindings for a parent element.
class Rivets.View
  # The parent DOM element and the model objects for binding are passed into the
  # constructor.
  constructor: (@el, @models) ->
    @el = @el.get(0) if @el.jquery
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
          bindType = "attribute"
          type = attribute.name.replace bindingRegExp, ''
          pipes = (pipe.trim() for pipe in attribute.value.split '|')
          path = pipes.shift().split '.'
          model = @models[path.shift()]
          keypath = path.join '.'

          if eventRegExp.test type
            type = type.replace eventRegExp, ''
            bindType = "event"
          else if type in bidirectionals
            bindType = "bidirectional"

          @bindings.push new Rivets.Binding node, type, bindType, model, keypath, pipes

    parseNode @el
    parseNode node for node in @el.getElementsByTagName '*'

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
    when 'text', 'textarea', 'password', 'select-one', 'radio' then el.value
    when 'checkbox' then el.checked

# Returns an element binding routine for the specified attribute.
eventBinding = (event) -> (el, bind, unbind) ->
    bindEvent el, event, bind if bind
    unbindEvent el, event, unbind if unbind

# Returns an attribute binding routine for the specified attribute. This is what
# is used when there are no matching routines for an identifier.
attributeBinding = (attr) -> (el, value) ->
  if value then el.setAttribute attr, value else el.removeAttribute attr

# Bindings that should also be observed for changes on the DOM element in order
# to propagate those changes back to the model object.
bidirectionals = ['value', 'checked', 'unchecked']

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
    el.value = value
  text: (el, value) ->
    if el.innerText?
      el.innerText = value or ''
    else
      el.textContent = value or ''

# Default configuration.
Rivets.config =
  preloadData: true

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
