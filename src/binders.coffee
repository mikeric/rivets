# Basic set of core binders that are included with Rivets.js.

# Sets the element's text value.
Rivets.binders.text = (el, value) ->
  if el.textContent?
    el.textContent = if value? then value else ''
  else
    el.innerText = if value? then value else ''

# Sets the element's HTML content.
Rivets.binders.html = (el, value) ->
  el.innerHTML = if value? then value else ''

# Shows the element when value is true.
Rivets.binders.show = (el, value) ->
  el.style.display = if value then '' else 'none'

# Hides the element when value is true (negated version of `show` binder).
Rivets.binders.hide = (el, value) ->
  el.style.display = if value then 'none' else ''

# Enables the element when value is true.
Rivets.binders.enabled = (el, value) ->
  el.disabled = !value

# Disables the element when value is true (negated version of `enabled` binder).
Rivets.binders.disabled = (el, value) ->
  el.disabled = !!value

# Checks a checkbox or radio input when the value is true. Also sets the model
# property when the input is checked or unchecked (two-way binder).
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

# Unchecks a checkbox or radio input when the value is true (negated version of
# `checked` binder). Also sets the model property when the input is checked or
# unchecked (two-way binder).
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

# Sets the element's value. Also sets the model property when the input changes
# (two-way binder).
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

# Inserts and binds the element and it's child nodes into the DOM when true.
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

# Removes and unbinds the element and it's child nodes into the DOM when true
# (negated version of `if` binder).
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

# Binds an event handler on the element.
Rivets.binders['on-*'] =
  function: true

  unbind: (el) ->
    Rivets.Util.unbindEvent el, @args[0], @handler if @handler

  routine: (el, value) ->
    Rivets.Util.unbindEvent el, @args[0], @handler if @handler
    Rivets.Util.bindEvent el, @args[0], @handler = @eventHandler value

# Appends bound instances of the element in place for each item in the array.
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
    # mirror is a live copy of the list of all `modelName` models bound to this view
    iterated_mirror = (iter.models[modelName] for iter in @iterated)
    # copy is just a dummy copy of mirror for keeping track of what's to be removed
    iterated_copy = iterated_mirror.slice()

    for model, index in collection
      iter_index = iterated_mirror.indexOf model
      if ~ iter_index
        iterated_copy.splice iterated_copy.indexOf(model), 1
        # make sure index == iter_index
        if iter_index isnt index
          # get the element to append this view's element after
          previous = if index and @iterated.length
            @iterated[index - 1].els[0]
          else
            @marker

          # move the view to the right index
          view = @iterated.splice(iter_index, 1)[0]
          @iterated.splice index, 0, view
          # move the view's element to the right position
          @marker.parentNode.insertBefore view.els[0], previous.nextSibling

          # also fix the mirror's order
          iterated_mirror.splice index, 0, iterated_mirror.splice(iter_index, 1)[0]

      else
        # it's a new model in the collection, so bind it
        data = {}
        data[modelName] = model

        for key, view_model of @view.models
          data[key] ?= view_model

        previous = if index and @iterated.length
          if @iterated[index - 1]
            @iterated[index - 1].els[0]
          else
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
        @iterated.splice index, 0, view

        @marker.parentNode.insertBefore template, previous.nextSibling

    # unbind views that no longer exist in collection
    if iterated_copy.length
      i = @iterated.length
      while i--
        view = @iterated[i]
        if view and ~ iterated_copy.indexOf view.models[modelName]
          @iterated.splice i, 1
          view.unbind()
          @marker.parentNode.removeChild view.els[0]

    if el.nodeName is 'OPTION'
      for binding in @view.bindings
        if binding.el is @marker.parentNode and binding.type is 'value'
          binding.sync()

  update: (models) ->
    data = {}
    
    for key, model of models
      data[key] = model unless key is @args[0]

    view.update data for view in @iterated

# Adds or removes the class from the element when value is true or false.
Rivets.binders['class-*'] = (el, value) ->
  elClass = " #{el.className} "

  if !value is (elClass.indexOf(" #{@args[0]} ") isnt -1)
    el.className = if value
      "#{el.className} #{@args[0]}"
    else
      elClass.replace(" #{@args[0]} ", ' ').trim()

# Sets the attribute on the element. If no binder above is matched it will fall
# back to using this binder.
Rivets.binders['*'] = (el, value) ->
  if value
    el.setAttribute @type, value
  else
    el.removeAttribute @type
