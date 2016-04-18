# Basic set of core binders that are included with Rivets.js.

# Sets the element's text value.
Rivets.public.binders.text = (el, value) ->
  if el.textContent?
    el.textContent = if value? then value else ''
  else
    el.innerText = if value? then value else ''

# Sets the element's HTML content.
Rivets.public.binders.html = (el, value) ->
  el.innerHTML = if value? then value else ''

# Shows the element when value is true.
Rivets.public.binders.show = (el, value) ->
  el.style.display = if value then '' else 'none'

# Hides the element when value is true (negated version of `show` binder).
Rivets.public.binders.hide = (el, value) ->
  el.style.display = if value then 'none' else ''

# Enables the element when value is true.
Rivets.public.binders.enabled = (el, value) ->
  el.disabled = !value

# Disables the element when value is true (negated version of `enabled` binder).
Rivets.public.binders.disabled = (el, value) ->
  el.disabled = !!value

# Checks a checkbox or radio input when the value is true. Also sets the model
# property when the input is checked or unchecked (two-way binder).
Rivets.public.binders.checked =
  publishes: true
  priority: 2000

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
Rivets.public.binders.unchecked =
  publishes: true
  priority: 2000

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
Rivets.public.binders.value =
  publishes: true
  priority: 3000

  bind: (el) ->
    unless el.tagName is 'INPUT' and el.type is 'radio'
      @event = if el.tagName is 'SELECT' then 'change' else 'input'
      Rivets.Util.bindEvent el, @event, @publish

  unbind: (el) ->
    unless el.tagName is 'INPUT' and el.type is 'radio'
      Rivets.Util.unbindEvent el, @event, @publish

  routine: (el, value) ->
    if el.tagName is 'INPUT' and el.type is 'radio'
      el.setAttribute 'value', value
    else if window.jQuery?
      el = jQuery el

      if value?.toString() isnt el.val()?.toString()
        el.val if value? then value else ''
    else
      if el.type is 'select-multiple'
        o.selected = o.value in value for o in el if value?
      else if value?.toString() isnt el.value?.toString()
        el.value = if value? then value else ''

# Inserts and binds the element and it's child nodes into the DOM when true.
Rivets.public.binders.if =
  block: true
  priority: 4000

  bind: (el) ->
    unless @marker?
      attr = [@view.prefix, @type].join('-').replace '--', '-'
      declaration = el.getAttribute attr

      @marker = document.createComment " rivets: #{@type} #{declaration} "
      @bound = false

      el.removeAttribute attr
      el.parentNode.insertBefore @marker, el
      el.parentNode.removeChild el

  unbind: ->
    if @nested
      @nested.unbind()
      @bound = false

  routine: (el, value) ->
    if !!value is not @bound
      if value
        models = {}
        models[key] = model for key, model of @view.models

        (@nested or= new Rivets.View(el, models, @view.options())).bind()
        @marker.parentNode.insertBefore el, @marker.nextSibling
        @bound = true
      else
        el.parentNode.removeChild el
        @nested.unbind()
        @bound = false

  update: (models) ->
    @nested?.update models

# Removes and unbinds the element and it's child nodes into the DOM when true
# (negated version of `if` binder).
Rivets.public.binders.unless =
  block: true
  priority: 4000

  bind: (el) ->
    Rivets.public.binders.if.bind.call @, el

  unbind: ->
    Rivets.public.binders.if.unbind.call @

  routine: (el, value) ->
    Rivets.public.binders.if.routine.call @, el, not value

  update: (models) ->
    Rivets.public.binders.if.update.call @, models

# Binds an event handler on the element.
Rivets.public.binders['on-*'] =
  function: true
  priority: 1000

  unbind: (el) ->
    Rivets.Util.unbindEvent el, @args[0], @handler if @handler

  routine: (el, value) ->
    Rivets.Util.unbindEvent el, @args[0], @handler if @handler
    Rivets.Util.bindEvent el, @args[0], @handler = @eventHandler value

# Appends bound instances of the element in place for each item in the array.
Rivets.public.binders['each-*'] =
  block: true
  priority: 4000

  bind: (el) ->
    unless @marker?
      attr = [@view.prefix, @type].join('-').replace '--', '-'
      @marker = document.createComment " rivets: #{@type} "
      @iterated = []

      el.removeAttribute attr
      el.parentNode.insertBefore @marker, el
      el.parentNode.removeChild el
    else
      for view in @iterated
        view.bind()
    return;

  unbind: (el) ->
    view.unbind() for view in @iterated if @iterated?
    return

  routine: (el, collection) ->
    modelName = @args[0]
    collection = collection or []

    if @iterated.length > collection.length
      for i in Array @iterated.length - collection.length
        view = @iterated.pop()
        view.unbind()
        @marker.parentNode.removeChild view.els[0]

    for model, index in collection
      data = {index}
      data[Rivets.public.iterationAlias modelName] = index
      data[modelName] = model

      if not @iterated[index]?
        for key, model of @view.models
          data[key] ?= model

        previous = if @iterated.length
          @iterated[@iterated.length - 1].els[0]
        else
          @marker

        options = @view.options()
        options.preloadData = true

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
    return

  update: (models) ->
    data = {}

    for key, model of models
      data[key] = model unless key is @args[0]

    view.update data for view in @iterated
    return

# Adds or removes the class from the element when value is true or false.
Rivets.public.binders['class-*'] = (el, value) ->
  elClass = " #{el.className} "

  if !value is (elClass.indexOf(" #{@args[0]} ") isnt -1)
    el.className = if value
      "#{el.className} #{@args[0]}"
    else
      elClass.replace(" #{@args[0]} ", ' ').trim()

# Sets the attribute on the element. If no binder above is matched it will fall
# back to using this binder.
Rivets.public.binders['*'] = (el, value) ->
  if value?
    el.setAttribute @type, value
  else
    el.removeAttribute @type
