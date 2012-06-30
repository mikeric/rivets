#     rivets.js
#     version : 0.1.3
#     author : Michael Richards
#     license : MIT

Rivets =
  Helpers: {}

class Rivets.Binding
  constructor: (@el, @adapter, @type, @context, @keypath) ->
    @routine = Rivets.bindings[@type] || Rivets.Helpers.attributeBinding @type

  # Sets a value for this binding. Basically just runs the routine on the
  # element with a suplied value.
  set: (value = null) =>
    @routine @el, value || @adapter.read @context, @keypath

  # Subscribes to the context object for changes on the specific keypath.
  # Conditionally also does the inverse and listens to the element for changes
  # to propogate back to the context object.
  bind: =>
    @adapter.subscribe @context, @keypath, (value) => @set value

    if @type in Rivets.bidirectionals
      @el.addEventListener 'change', (el) =>
        @adapter.publish @context, @keypath, Rivets.Helpers.getInputValue el

# Returns the current input value for the specified element.
Rivets.Helpers.getInputValue = (el) ->
  switch el.type
    when 'text', 'textarea', 'password', 'select-one' then el.value
    when 'checkbox', 'radio' then el.checked

# Returns an attribute binding routine for the specified attribute. This is what
# `registerBinding` falls back to when there is no routine for the binding type.
Rivets.Helpers.attributeBinding = (attr) -> (el, value) ->
  if value then el.setAttribute attr, value else el.removeAttribute attr

# Returns a state binding routine for the specified attribute. Can optionally be
# negatively evaluated. This is used to build a lot of the core state binding
# routines.
Rivets.Helpers.stateBinding = (attr, inverse = false) -> (el, value) ->
  binding = Rivets.Helpers.attributeBinding(attr)
  binding el, if inverse is !value then attr else false

# Core binding routines.
Rivets.bindings =
  checked:
    Rivets.Helpers.stateBinding 'checked'
  selected:
    Rivets.Helpers.stateBinding 'selected'
  disabled:
    Rivets.Helpers.stateBinding 'disabled'
  unchecked:
    Rivets.Helpers.stateBinding 'checked', true
  unselected:
    Rivets.Helpers.stateBinding 'selected', true
  enabled:
    Rivets.Helpers.stateBinding 'disabled', true
  text: (el, value) ->
    el.innerText = value or ''
  html: (el, value) ->
    el.innerHTML = value or ''
  value: (el, value) ->
    el.value = value
  show: (el, value) ->
    el.style.display = if value then '' else 'none'
  hide: (el, value) ->
    el.style.display = if value then 'none' else ''

# Bindings that should also be observed for changes on the DOM element in order
# to propogate those changes back to the model object.
Rivets.bidirectionals = ['value', 'checked', 'unchecked', 'selected', 'unselected']

# The rivets module exposes `register` and `bind` functions to register new
# binding routines and bind contexts to DOM elements.
Rivets.interface =
  register: (routine, routineFunction) ->
    Rivets.bindings[routine] = routineFunction

  bind: (el, adapter, contexts = {}) ->
    for node in el.getElementsByTagName '*'
      for attribute in node.attributes
        if /^data-/.test attribute.name
          type = attribute.name.replace 'data-', ''
          path = attribute.value.split '.'
          context = path.shift()
          keypath = path.join '.'

          binding = new Rivets.Binding node, adapter, type, contexts[context], keypath
          binding.bind()

# Exports rivets for both CommonJS and the browser.
if module?
  module.exports = Rivets.interface
else
  @rivets = Rivets.interface