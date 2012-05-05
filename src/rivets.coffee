# rivets.js
# version : 0.1.0
# author : Michael Richards
# license : MIT

window.rivets = do ->
  registerBinding = (el, interface, type, context, keypath) ->
    bindings[type] el, interface.read(context, keypath)

    interface.subscribe context, keypath, (value) ->
      bindings[type] el, value

    if inputValue = getInputValue el
      interface.publish context, keypath, inputValue

  setAttribute = (el, attr, value, mirrored=false) ->
    if value
      $(el).attr attr, if mirrored then attr else value
    else
      $(el).removeAttr attr

  getInputValue = (el) ->
    switch $(el).attr 'type'
      when 'text', 'textarea', 'password', 'select-one' then $(this).val()
      when 'checkbox' then $(this).is ':checked'

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

  bindableAttributes = ['id', 'class', 'name', 'src', 'href', 'alt', 'title', 'placeholder']

  for attr in bindableAttributes
    do (attr) ->
      bindings[attr] = (el, value) ->
        setAttribute el, attr, value

  bind: (el, interface, contexts={}) ->
    $(el).add($('*', el)).each ->
      target = this
      nodeMap = target.attributes
      
      if nodeMap.length > 0
        [0..(nodeMap.length - 1)].forEach (n) ->
          node = nodeMap[n]
          
          if /^data-/.test node.name
            type = node.name.replace 'data-', ''

            if _.include _.keys(bindings), type
              path = node.value.split '.'
              context = path.shift()
              keypath = path.join '.'
              registerBinding $(target), interface, type, contexts[context], keypath
