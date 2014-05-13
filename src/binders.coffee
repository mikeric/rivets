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
    element_list = []

    for model, index in collection
      iter_model = iterated_mirror[index]
      # optimize the quickest check
      if model is iter_model
        continue

      # see if we can find this model
      iter_index = iterated_mirror.indexOf model
      if ~ iter_index
        # found it
        # we already know that iter_index isnt index
        # check if this item in @iterated was removed
        if !~ collection.indexOf iter_model
          # this item was removed
          view = @iterated.splice(index, 1)[0]
          view.unbind()
          @marker.parentNode.removeChild view.els[0]
          # reflect in the mirror
          iterated_mirror.splice index, 1
          # correct iter_index if needed
          if index < iter_index
            iter_index -= 1

        # check that this index was not corrected by last removal
        # or was removed itself from the views list
        if iter_index isnt index and iterated_mirror[iter_index]
          # move the view to the right index
          view = @iterated.splice(iter_index, 1)[0]
          @iterated.splice index, 0, view
          # remove the view's element and queue it for inserting later
          element_list.push { el: @marker.parentNode.removeChild(view.els[0]), idx: index }
          # also fix the mirror's order
          iterated_mirror.splice(index, 0, iterated_mirror.splice(iter_index, 1)[0])

      else
        # it's a new model in the collection, so bind it
        data = {}
        data[modelName] = model

        for key, view_model of @view.models
          data[key] ?= view_model

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

        # also add it to the mirror list so it mirrors indices properly
        iterated_mirror.splice index, 0, model

        element_list.push { el: template, idx: index }

    # unbind views that no longer exist in collection
    while @iterated.length > collection.length
      view = @iterated.pop()
      view.unbind()
      @marker.parentNode.removeChild view.els[0]

    # if we have elements in queue, put them back into the DOM
    if element_list.length
      element_list.sort (a, b) ->
        if a.idx < b.idx then -1 else 1

      buffers = []
      last_buffer = null
      # create buffers
      for element in element_list
        if not buffers.length
          last_buffer = new ElementBuffer(element.el, element.idx)
          buffers.push last_buffer
        else
          if not last_buffer.add element.el, element.idx
            last_buffer = new ElementBuffer(element.el, element.idx)
            buffers.push last_buffer

      # insert buffers into DOM
      for buffer in buffers
        index = buffer.first_index
        previous = if index and @iterated[index - 1]
            @iterated[index - 1].els[0]
          else
            @marker
        @marker.parentNode.insertBefore buffer.fragment, previous.nextSibling

    if el.nodeName is 'OPTION'
      for binding in @view.bindings
        if binding.el is @marker.parentNode and binding.type is 'value'
          binding.sync()

class ElementBuffer
  constructor: (element, @last_index) ->
    @fragment = element
    @first_index = @last_index
    @length = 1

  add: (element, index) ->
    if index is @first_index - 1
      @insert element, true
      @first_index = index
      true
    else if index is @last_index + 1
      @insert element
      @last_index = index
      true
    else
      false

  insert: (element, preppend) ->
    if not @wrapped
      fragment = document.createDocumentFragment()
      fragment.appendChild @fragment
      @fragment = fragment
      @wrapped = true
    if preppend
      @fragment.insertBefore element, @fragment.firstChild
    else
      @fragment.appendChild element
    @length += 1

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
  if value?
    el.setAttribute @type, value
  else
    el.removeAttribute @type
