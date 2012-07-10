#     rivets.js
#     version : 0.1.11
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
  constructor: (@el, @type, @model, @keypath, @formatters = []) ->
    @routine = Rivets.routines[@type] || attributeBinding @type

  # Sets the value for the binding. This Basically just runs the binding routine
  # with the suplied value and applies any formatters.
  set: (value) =>
    for formatter in @formatters
      value = Rivets.config.formatters[formatter] value

    @routine @el, value

  # Subscribes to the model for changes at the specified keypath. Bi-directional
  # routines will also listen for changes on the element to propagate them back
  # to the model.
  bind: =>
    Rivets.config.adapter.subscribe @model, @keypath, @set

    if Rivets.config.preloadData
      @set Rivets.config.adapter.read @model, @keypath

    if @type in bidirectionals
      # Check to see if addEventListener is available.
      if window.addEventListener
        @el.addEventListener 'change', @publish
      else
      # Assume we are in IE and use attachEvent.
        @el.attachEvent 'change', @publish

  # Publishes the value currently set on the input element back to the model.
  publish: (e) =>
    el = e.target or e.srcElement
    Rivets.config.adapter.publish @model, @keypath, getInputValue el

# A collection of bindings for a parent element.
class Rivets.View
  # The parent DOM element and the model objects for binding are passed into the
  # constructor.
  constructor: (@el, @models) ->
    @build()

  # Regular expression used to match binding attributes.
  bindingRegExp: =>
    prefix = Rivets.config.prefix
    if prefix then new RegExp("^data-#{prefix}-") else /^data-/

  # Builds the Rivets.Binding instances for the view.
  build: =>
    @bindings = []
    bindingRegExp = @bindingRegExp()

    for node in @el.children()
      for attribute in node.attributes
        if bindingRegExp.test attribute.name
          type = attribute.name.replace bindingRegExp, ''
          pipes = (pipe.trim() for pipe in attribute.value.split '|')
          path = pipes.shift().split '.'
          model = @models[path.shift()]
          keypath = path.join '.'

          @bindings.push new Rivets.Binding node, type, model, keypath, pipes

  # Binds all of the current bindings for this view.
  bind: =>
    binding.bind() for binding in @bindings

# Returns the current input value for the specified element.
getInputValue = (el) ->
  switch el.type
    when 'text', 'textarea', 'password', 'select-one' then el.value
    when 'checkbox', 'radio' then el.checked

# Returns an attribute binding routine for the specified attribute. This is what
# `registerBinding` falls back to when there is no routine for the binding type.
attributeBinding = (attr) -> (el, value) ->
  if value then el.setAttribute attr, value else el.removeAttribute attr

# Bindings that should also be observed for changes on the DOM element in order
# to propagate those changes back to the model object.
bidirectionals = ['value', 'checked', 'unchecked', 'selected', 'unselected']

# Core binding routines.
Rivets.routines =
  enabled: (el, value) ->
    el.disabled = !value
  disabled: (el, value) ->
    el.disabled = !!value
  checked: (el, value) ->
    el.checked = !!value
  unchecked: (el, value) ->
    el.checked = !value
  selected: (el, value) ->
    el.selected = !!value
  unselected: (el, value) ->
    el.selected = !value
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
  # Used for setting configuration options.
  configure: (options={}) ->
    for property, value of options
      Rivets.config[property] = value

  # Registers a new binding routine that can be used immediately in views. This
  # is used for adding custom binding routines.
  register: (identifier, routine) ->
    Rivets.routines[identifier] = routine

  # Binds a set of model objects to a parent DOM element. Returns a Rivets.View
  # instance.
  bind: (el, models = {}) ->
    view = new Rivets.View(el, models)
    view.bind()
    view

# Exports rivets for both CommonJS, AMD and the browser.
if module?
  module.exports = rivets
else if typeof define == 'function' and define.amd
  # Define the module for require.js
  define(()->
      return rivets
    )
else
  @rivets = rivets
