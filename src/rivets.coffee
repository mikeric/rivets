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
      $(el).bind 'change', ->
        adapter.publish context, keypath, getInputValue this

  setAttribute = (el, attr, value, mirrored=false) ->
    if value
      $(el).attr attr, if mirrored then attr else value
    else
      $(el).removeAttr attr

  getInputValue = (el) ->
    switch $(el).attr 'type'
      when 'text', 'textarea', 'password', 'select-one' then $(el).val()
      when 'checkbox' then $(el).is ':checked'

  bindings =
    show: (el, value) ->
      if value then $(el).show() else $(el).hide()
    hide: (el, value) ->
      if value then $(el).hide() else $(el).show()
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
      $(el).text value or ''
    value: (el, value) ->
      $(el).val value

  attributeBinding = (attr) ->
    (el, value) ->
      setAttribute el, attr, value

  bidirectionalBindings = ['value', 'checked', 'unchecked', 'selected', 'unselected']

  bind: (el, adapter, contexts={}) ->
    $(el).add($('*', el)).each ->
      target = this
      nodeMap = target.attributes

      if nodeMap.length > 0
        [0..(nodeMap.length - 1)].forEach (n) ->
          node = nodeMap[n]

          if /^data-/.test node.name
            type = node.name.replace 'data-', ''
            path = node.value.split '.'
            context = path.shift()
            keypath = path.join '.'
            registerBinding $(target), adapter, type, contexts[context], keypath
