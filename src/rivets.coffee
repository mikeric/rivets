#     rivets.js
#     version : 0.1.3
#     author : Michael Richards
#     license : MIT

# Registers a specific binding routine between a model object and a DOM element.
# All information for that routine is passed in when calling this function; the
# specific element to bind to, an adapter interface for the model object, the
# type of binding, the context object and the keypath at which to subscribe to
# on the model object.
registerBinding = (el, adapter, type, context, keypath) ->
  bind = bindings[type] || attributeBinding type
  bind el, adapter.read context, keypath

  adapter.subscribe context, keypath, (value) ->
    bind el, value

  if type in bidirectionals
    el.addEventListener 'change', ->
      adapter.publish context, keypath, getInputValue this

# Returns the current input value for the specified element.
getInputValue = (el) ->
  switch el.type
    when 'text', 'textarea', 'password', 'select-one' then el.value
    when 'checkbox', 'radio' then el.checked

# Returns an attribute binding routine for the specified attribute. This is what
# `registerBinding` falls back to when there is no routine for the binding type.
attributeBinding = (attr) -> (el, value) ->
  if value then el.setAttribute attr, value else el.removeAttribute attr

# Returns a state binding routine for the specified attribute. Can optionally be
# negatively evaluated. This is used to build a lot of the core state binding
# routines.
stateBinding = (attr, inverse = false) -> (el, value) ->
  attributeBinding(attr) el, if inverse is !value then attr else false

# Core binding routines.
bindings =
  checked:
    stateBinding 'checked'
  selected:
    stateBinding 'selected'
  disabled:
    stateBinding 'disabled'
  unchecked:
    stateBinding 'checked', true
  unselected:
    stateBinding 'selected', true
  enabled:
    stateBinding 'disabled', true
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
bidirectionals = ['value', 'checked', 'unchecked', 'selected', 'unselected']

# The rivets module exposes `register` and `bind` functions to register new
# binding routines and bind contexts to DOM elements.
rivets =
  register: (routine, routineFunction) ->
    bindings[routine] = routineFunction

  bind: (el, adapter, contexts = {}) ->
    for node in el.getElementsByTagName '*'
      for attribute in node.attributes
        if /^data-/.test attribute.name
          type = attribute.name.replace 'data-', ''
          path = attribute.value.split '.'
          context = path.shift()
          keypath = path.join '.'
          registerBinding node, adapter, type, contexts[context], keypath

# Exports rivets for both CommonJS and the browser.
if module?
  module.exports = rivets
else
  @rivets = rivets