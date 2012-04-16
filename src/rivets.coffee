# rivets.js
# version : 0.1.0
# author : Michael Richards
# license : MIT

window.rivets = do ->
  registerBinding = (el, interface, contexts, type, callback) ->
    $("*[data-#{type}]", el).each ->
      path = $(this).attr("data-#{type}").split '.'
      context = path.shift()
      keypath = path.join '.'

      callback this, interface.read contexts[context], keypath

      interface.subscribe contexts[context], keypath, (value) =>
        callback this, value

      if inputValue = getInputValue this
        interface.publish contexts[context], keypath, inputValue

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
    for type, callback of bindings
      registerBinding el, interface, contexts, type, callback