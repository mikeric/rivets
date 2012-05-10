# rivets.js
# version : 0.1.1
# author : Michael Richards
# license : MIT

window.rivets = do ->
  registerBinding = (el, adapter, type, context, keypath) ->
    bind = bindings[type] || attributeBinding type
    bind el, adapter.read context, keypath

    adapter.subscribe context, keypath, (value) ->
      bind el, value

    if type in bidirectionalBindings
      el.addEventListener 'change', ->
        adapter.publish context, keypath, getInputValue this

  setAttribute = (el, attr, value, mirrored=false) ->
    if value
      el.setAttribute attr, if mirrored then attr else value
    else
      el.removeAttribute attr

  getInputValue = (el) ->
    switch el.type
      when 'text', 'textarea', 'password', 'select-one' then el.value
      when 'checkbox' then el.checked

  bindings =
    show: (el, value) ->
      el.style.display = if value then '' else 'none'
    hide: (el, value) ->
      el.style.display = if value then 'none' else ''
    enabled: (el, value) ->
      setAttribute el, 'disabled', !value, true
    disabled: (el, value) ->
      setAttribute el, 'disabled', value, true
    checked: (el, value) ->
      setAttribute el, 'checked', value, true
    unchecked: (el, value) ->
      setAttribute el, 'checked', !value, true
    selected: (el, value) ->
      setAttribute el, 'selected', value, true
    unselected: (el, value) ->
      setAttribute el, 'checked', !value, true
    text: (el, value) ->
      el.innerHTML = value or ''
    value: (el, value) ->
      el.value = value

  attributeBinding = (attr) ->
    (el, value) ->
      setAttribute el, attr, value

  bidirectionalBindings = ['value', 'checked', 'unchecked', 'selected', 'unselected']

  bind: (el, adapter, contexts={}) ->
    nodes = el.getElementsByTagName '*'

    [0..(nodes.length - 1)].forEach (n) ->
      node = nodes[n]
      
      if node.attributes.length > 0
        [0..(node.attributes.length - 1)].forEach (n) ->
          attribute = node.attributes[n]

          if /^data-/.test attribute.name
            type = attribute.name.replace 'data-', ''
            path = attribute.value.split '.'
            context = path.shift()
            keypath = path.join '.'
            registerBinding node, adapter, type, contexts[context], keypath
