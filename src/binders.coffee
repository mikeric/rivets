# Core binders that are included with Rivets.js.
Rivets.binders.enabled = (el, value) ->
  el.disabled = !value

Rivets.binders.disabled = (el, value) ->
  el.disabled = !!value

Rivets.binders.checked =
  publishes: true
  bind: (el) ->
    Rivets.Util.bindEvent el, 'change', @publish
  unbind: (el) ->
    Rivets.Util.unbindEvent el, 'change', @publish
  routine: (el, value) ->
    if el.type is 'radio'
      el.checked = el.value?.toString() is value?.toString()
    else
      el.checked = !!value

Rivets.binders.unchecked =
  publishes: true
  bind: (el) ->
    Rivets.Util.bindEvent el, 'change', @publish
  unbind: (el) ->
    Rivets.Util.unbindEvent el, 'change', @publish
  routine: (el, value) ->
    if el.type is 'radio'
      el.checked = el.value?.toString() isnt value?.toString()
    else
      el.checked = !value

Rivets.binders.show = (el, value) ->
  el.style.display = if value then '' else 'none'

Rivets.binders.hide = (el, value) ->
  el.style.display = if value then 'none' else ''

Rivets.binders.html = (el, value) ->
  el.innerHTML = if value? then value else ''

Rivets.binders.value =
  publishes: true
  bind: (el) ->
    Rivets.Util.bindEvent el, 'change', @publish
  unbind: (el) ->
    Rivets.Util.unbindEvent el, 'change', @publish
  routine: (el, value) ->
    if window.jQuery?
      el = jQuery el

      if value?.toString() isnt el.val()?.toString()
        el.val if value? then value else ''
    else
      if el.type is 'select-multiple'
        o.selected = o.value in value for o in el if value?
      else if value?.toString() isnt el.value?.toString()
        el.value = if value? then value else ''

Rivets.binders.text = (el, value) ->
  if el.textContent?
    el.textContent = if value? then value else ''
  else
    el.innerText = if value? then value else ''

Rivets.binders.if =
  block: true

  bind: (el) ->
    unless @marker?
      attr = [@view.config.prefix, @type].join('-').replace '--', '-'
      declaration = el.getAttribute attr

      @marker = document.createComment " rivets: #{@type} #{declaration} "

      el.removeAttribute attr
      el.parentNode.insertBefore @marker, el
      el.parentNode.removeChild el

  unbind: ->
    @nested?.unbind()

  routine: (el, value) ->
    if !!value is not @nested?
      if value
        models = {}
        models[key] = model for key, model of @view.models

        options =
          binders: @view.options.binders
          formatters: @view.options.formatters
          adapters: @view.options.adapters
          config: @view.options.config

        (@nested = new Rivets.View(el, models, options)).bind()
        @marker.parentNode.insertBefore el, @marker.nextSibling
      else
        el.parentNode.removeChild el
        @nested.unbind()
        delete @nested

  update: (models) ->
    @nested?.update models

Rivets.binders.unless =
  block: true

  bind: (el) ->
    Rivets.binders.if.bind.call @, el

  unbind: ->
    Rivets.binders.if.unbind.call @

  routine: (el, value) ->
    Rivets.binders.if.routine.call @, el, not value

  update: (models) ->
    Rivets.binders.if.update.call @, models

Rivets.binders['on-*'] =
  function: true

  unbind: (el) ->
    Rivets.Util.unbindEvent el, @args[0], @handler if @handler

  routine: (el, value) ->
    Rivets.Util.unbindEvent el, @args[0], @handler if @handler
    Rivets.Util.bindEvent el, @args[0], @handler = @eventHandler value

Rivets.binders['each-*'] =
  block: true

  bind: (el) ->
    unless @marker?
      attr = [@view.config.prefix, @type].join('-').replace '--', '-'
      @marker = document.createComment " rivets: #{@type} "
      @iterated = []

      el.removeAttribute attr
      el.parentNode.insertBefore @marker, el
      el.parentNode.removeChild el

  unbind: (el) ->
    view.unbind() for view in @iterated if @iterated?

  routine: (el, collection) ->
    modelName = @args[0]
    collection = collection or []

    if @iterated.length > collection.length
      for i in Array @iterated.length - collection.length
        view = @iterated.pop()
        view.unbind()
        @marker.parentNode.removeChild view.els[0]

    for model, index in collection
      data = {}
      data[modelName] = model

      if not @iterated[index]?
        for key, model of @view.models
          data[key] ?= model

        previous = if @iterated.length
          @iterated[@iterated.length - 1].els[0]
        else
          @marker

        options =
          binders: @view.options.binders
          formatters: @view.options.formatters
          adapters: @view.options.adapters
          config: {}

        options.config[k] = v for k, v of @view.options.config
        options.config.preloadData = true

        template = el.cloneNode true
        view = new Rivets.View(template, data, options)
        view.bind()
        @iterated.push view

        @marker.parentNode.insertBefore template, previous.nextSibling
      else if @iterated[index].models[modelName] isnt model
        @iterated[index].update data

    if el.nodeName is 'OPTION'
      for binding in @view.bindings
        if binding.el is @marker.parentNode and binding.type is 'value'
          binding.sync()

  update: (models) ->
    data = {}
    
    for key, model of models
      data[key] = model unless key is @args[0]

    view.update data for view in @iterated

Rivets.binders['class-*'] = (el, value) ->
  elClass = " #{el.className} "

  if !value is (elClass.indexOf(" #{@args[0]} ") isnt -1)
    el.className = if value
      "#{el.className} #{@args[0]}"
    else
      elClass.replace(" #{@args[0]} ", ' ').trim()

Rivets.binders['*'] = (el, value) ->
  if value
    el.setAttribute @type, value
  else
    el.removeAttribute @type
