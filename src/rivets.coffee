# rivets.js
# version : 0.1.2
# author : Michael Richards
# license : MIT

registerBinding = (el, adapter, type, context, keypath) ->
  bind = bindings[type] || attributeBinding type
  bind el, adapter.read context, keypath

  adapter.subscribe context, keypath, (value) ->
    bind el, value

  if type in bidirectionals
    el.addEventListener 'change', ->
      adapter.publish context, keypath, getInputValue this

getInputValue = (el) ->
  switch el.type
    when 'text', 'textarea', 'password', 'select-one' then el.value
    when 'checkbox', 'radio' then el.checked

attributeBinding = (attr) -> (el, value) ->
  if value then el.setAttribute attr, value else el.removeAttribute attr

stateBinding = (attr, inverse = false) -> (el, value) ->
  attributeBinding(attr) el, if inverse is !value then attr else false

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

bidirectionals = ['value', 'checked', 'unchecked', 'selected', 'unselected']

rivets =
  bind: (el, adapter, contexts = {}) ->
    for node in el.getElementsByTagName '*'
      for attribute in node.attributes
        if /^data-/.test attribute.name
          type = attribute.name.replace 'data-', ''
          path = attribute.value.split '.'
          context = path.shift()
          keypath = path.join '.'
          registerBinding node, adapter, type, contexts[context], keypath

if module?
  module.exports = rivets
else
  @rivets = rivets