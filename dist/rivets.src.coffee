# The Rivets namespace.
Rivets =
  # Binder definitions, publicly accessible on `module.binders`. Can be
  # overridden globally or local to a `Rivets.View` instance.
  binders: {}

  # Component definitions, publicly accessible on `module.components`. Can be
  # overridden globally or local to a `Rivets.View` instance.
  components: {}

  # Formatter definitions, publicly accessible on `module.formatters`. Can be
  # overridden globally or local to a `Rivets.View` instance.
  formatters: {}

  # Adapter definitions, publicly accessible on `module.adapters`. Can be
  # overridden globally or local to a `Rivets.View` instance.
  adapters: {}

  # The default configuration, publicly accessible on `module.config`. Can be
  # overridden globally or local to a `Rivets.View` instance.
  config:
    prefix: 'rv'
    templateDelimiters: ['{', '}']
    rootInterface: '.'
    preloadData: true

    handler: (context, ev, binding) ->
      @call context, ev, binding.view.models

# Rivets.Util
# -----------

if 'jQuery' of window
  [bindMethod, unbindMethod] = if 'on' of jQuery then ['on', 'off'] else ['bind', 'unbind']
  
  Rivets.Util =
    bindEvent: (el, event, handler) -> jQuery(el)[bindMethod] event, handler
    unbindEvent: (el, event, handler) -> jQuery(el)[unbindMethod] event, handler
    getInputValue: (el) ->
      $el = jQuery el

      if $el.attr('type') is 'checkbox' then $el.is ':checked'
      else do $el.val

else
  Rivets.Util =
    bindEvent: do ->
      if 'addEventListener' of window then return (el, event, handler) ->
        el.addEventListener event, handler, false

      (el, event, handler) -> el.attachEvent 'on' + event, handler
    unbindEvent: do ->
      if 'removeEventListener' of window then return (el, event, handler) ->
        el.removeEventListener event, handler, false
      
      (el, event, handler) -> el.detachEvent 'on' + event, handler
    getInputValue: (el) ->
      if el.type is 'checkbox' then el.checked
      else if el.type is 'select-multiple' then o.value for o in el when o.selected
      else el.value

do ->
  common =
    outerHTML: (el) ->
      return el.outerHTML if el.outerHTML?
      wrap = document.createElement('div')
      wrap.appendChild(el.cloneNode(true))
      return wrap.innerHTML
    escapeHTML: (html) ->
      return html
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
    unescapeHTML: (html) ->
      return html
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
    nodeFromHTML: (html) ->
      wrap = document.createElement('div')
      wrap.innerHTML = html
      return wrap.childNodes[0]

  for own key, value of common
    Rivets.Util[key] = value

# Rivets.View
# -----------

# A collection of bindings built from a set of parent nodes.
class Rivets.View
  # The DOM elements and the model objects for binding are passed into the
  # constructor along with any local options that should be used throughout the
  # context of the view and it's bindings.
  constructor: (@els, @models, @options = {}) ->
    @els = [@els] unless (@els.jquery || @els instanceof Array)

    for option in ['config', 'binders', 'formatters', 'adapters']
      @[option] = {}
      @[option][k] = v for k, v of @options[option] if @options[option]
      @[option][k] ?= v for k, v of Rivets[option]

    @build()

  # Regular expression used to match binding attributes.
  bindingRegExp: =>
    new RegExp "^#{@config.prefix}-"

  # Regular expression used to match component nodes.
  componentRegExp: =>
    new RegExp "^#{@config.prefix.toUpperCase()}-"

  # Parses the DOM tree and builds `Rivets.Binding` instances for every matched
  # binding declaration.
  build: =>
    @bindings = []
    skipNodes = []
    bindingRegExp = @bindingRegExp()
    componentRegExp = @componentRegExp()

    buildBinding = (binding, node, type, declaration) =>
      options = {}

      pipes = (pipe.trim() for pipe in declaration.split '|')
      context = (ctx.trim() for ctx in pipes.shift().split '<')
      keypath = context.shift()

      options.formatters = pipes

      if dependencies = context.shift()
        options.dependencies = dependencies.split /\s+/

      @bindings.push new Rivets[binding] @, node, type, keypath, options

    parse = (node) =>
      unless node in skipNodes
        if node.nodeType is 8
          for identifier, value of @binders
            if value.revive
              if revived = value.revive(node)
                node = revived
                break

        if node.nodeType is 3
          parser = Rivets.TextTemplateParser

          if delimiters = @config.templateDelimiters
            if (tokens = parser.parse(node.data, delimiters)).length
              unless tokens.length is 1 and tokens[0].type is parser.types.text
                for token in tokens
                  text = document.createTextNode token.value
                  node.parentNode.insertBefore text, node

                  if token.type is 1
                    buildBinding 'TextBinding', text, null, token.value
                node.parentNode.removeChild node
        else if componentRegExp.test node.tagName
          type = node.tagName.replace(componentRegExp, '').toLowerCase()
          @bindings.push new Rivets.ComponentBinding @, node, type

        else if node.attributes?
          for attribute in node.attributes
            if bindingRegExp.test attribute.name
              type = attribute.name.replace bindingRegExp, ''
              unless binder = @binders[type]
                for identifier, value of @binders
                  if identifier isnt '*' and identifier.indexOf('*') isnt -1
                    regexp = new RegExp "^#{identifier.replace('*', '.+')}$"
                    if regexp.test type
                      binder = value

              binder or= @binders['*']

              if binder.block
                skipNodes.push n for n in node.childNodes
                attributes = [attribute]

          for attribute in attributes or node.attributes
            if bindingRegExp.test attribute.name
              type = attribute.name.replace bindingRegExp, ''
              buildBinding 'Binding', node, type, attribute.value

        childNode = node.firstChild
        while childNode
          parse childNode
          childNode = childNode.nextSibling

    parse el for el in @els

    return

  # Returns an array of bindings where the supplied function evaluates to true.
  select: (fn) =>
    binding for binding in @bindings when fn binding

  # Binds all of the current bindings for this view.
  bind: =>
    binding.bind() for binding in @bindings

  # Unbinds all of the current bindings for this view.
  unbind: =>
    binding.unbind() for binding in @bindings

  # Syncs up the view with the model by running the routines on all bindings.
  sync: =>
    binding.sync() for binding in @bindings

  # Publishes the input values from the view back to the model (reverse sync).
  publish: =>
    binding.publish() for binding in @select (b) -> b.binder.publishes

  # Updates the view's models along with any affected bindings.
  update: (models = {}) =>
    @models[key] = model for key, model of models
    binding.update models for binding in @bindings

# Rivets.Binding
# --------------

# A single binding between a model attribute and a DOM element.
class Rivets.Binding
  # All information about the binding is passed into the constructor; the
  # containing view, the DOM node, the type of binding, the model object and the
  # keypath at which to listen for changes.
  constructor: (@view, @el, @type, @keypath, @options = {}) ->
    @formatters = @options.formatters || []
    @dependencies = []
    @setBinder()
    @setObserver()

  # Sets the binder to use when binding and syncing.
  setBinder: =>
    unless @binder = @view.binders[@type]
      for identifier, value of @view.binders
        if identifier isnt '*' and identifier.indexOf('*') isnt -1
          regexp = new RegExp "^#{identifier.replace('*', '.+')}$"
          if regexp.test @type
            @binder = value
            @args = new RegExp("^#{identifier.replace('*', '(.+)')}$").exec @type
            @args.shift()

    @binder or= @view.binders['*']
    @binder = {routine: @binder} if @binder instanceof Function

  # Sets a keypath observer that will notify this binding when any intermediary
  # keys are changed.
  setObserver: =>
    @observer = new Rivets.KeypathObserver @view, @view.models, @keypath, (obs) =>
      @unbind true if @key
      @model = obs.target
      @bind true if @key
      @sync()

    @key = @observer.key
    @model = @observer.target

  # Applies all the current formatters to the supplied value and returns the
  # formatted value.
  formattedValue: (value) =>
    for formatter in @formatters
      args = formatter.split /\s+/
      id = args.shift()
      formatter = @view.formatters[id]

      if formatter?.read instanceof Function
        value = formatter.read value, args...
      else if formatter instanceof Function
        value = formatter value, args...

    value

  # Returns an event handler for the binding around the supplied function.
  eventHandler: (fn) =>
    handler = (binding = @).view.config.handler
    (ev) -> handler.call fn, @, ev, binding

  # Sets the value for the binding. This Basically just runs the binding routine
  # with the suplied value formatted.
  set: (value) =>
    value = if value instanceof Function and !@binder.function
      @formattedValue value.call @model
    else
      @formattedValue value

    @binder.routine?.call @, @el, value

  # Syncs up the view binding with the model.
  sync: =>
    @set if @key
      @view.adapters[@key.interface].read @model, @key.path
    else
      @model

  # Publishes the value currently set on the input element back to the model.
  publish: =>
    value = Rivets.Util.getInputValue @el

    for formatter in @formatters.slice(0).reverse()
      args = formatter.split /\s+/
      id = args.shift()

      if @view.formatters[id]?.publish
        value = @view.formatters[id].publish value, args...

    @view.adapters[@key.interface].publish @model, @key.path, value

  # Subscribes to the model for changes at the specified keypath. Bi-directional
  # routines will also listen for changes on the element to propagate them back
  # to the model.
  bind: (silent = false) =>
    @binder.bind?.call @, @el unless silent
    @view.adapters[@key.interface].subscribe(@model, @key.path, @sync) if @key
    @sync() if @view.config.preloadData unless silent

    if @options.dependencies?.length
      for dependency in @options.dependencies
        observer = new Rivets.KeypathObserver @view, @model, dependency, (obs, prev) =>
          key = obs.key
          @view.adapters[key.interface].unsubscribe prev, key.path, @sync
          @view.adapters[key.interface].subscribe obs.target, key.path, @sync
          @sync()

        key = observer.key
        @view.adapters[key.interface].subscribe observer.target, key.path, @sync
        @dependencies.push observer

  # Unsubscribes from the model and the element.
  unbind: (silent = false) =>
    unless silent
      @binder.unbind?.call @, @el
      @observer.unobserve()

    @view.adapters[@key.interface].unsubscribe(@model, @key.path, @sync) if @key

    if @dependencies.length
      for obs in @dependencies
        key = obs.key
        @view.adapters[key.interface].unsubscribe obs.target, key.path, @sync

      @dependencies = []

  # Updates the binding's model from what is currently set on the view. Unbinds
  # the old model first and then re-binds with the new model.
  update: (models = {}) =>
    @binder.update?.call @, models

# Rivets.ComponentBinding
# -----------------------

# A component view encapsulated as a binding within it's parent view.
class Rivets.ComponentBinding extends Rivets.Binding
  # Initializes a component binding for the specified view. The raw component
  # element is passed in along with the component type. Attributes and scope
  # inflections are determined based on the components defined attributes.
  constructor: (@view, @el, @type) ->
    @component = Rivets.components[@type]
    @attributes = {}
    @inflections = {}

    for attribute in @el.attributes or []
      if attribute.name in @component.attributes
        @attributes[attribute.name] = attribute.value
      else
        @inflections[attribute.name] = attribute.value

  # Intercepts `Rivets.Binding::sync` since component bindings are not bound to
  # a particular model to update it's value.
  sync: ->

  # Returns an object map using the component's scope inflections.
  locals: (models = @view.models) =>
    result = {}

    for key, inverse of @inflections
      result[key] = (result[key] or models)[path] for path in inverse.split '.'

    result[key] ?= model for key, model of models
    result

  # Intercepts `Rivets.Binding::update` to be called on `@componentView` with a
  # localized map of the models.
  update: (models) =>
    @componentView?.update @locals models

  # Intercepts `Rivets.Binding::bind` to build `@componentView` with a localized
  # map of models from the root view. Bind `@componentView` on subsequent calls.
  bind: =>
    if @componentView?
      @componentView?.bind()
    else
      el = @component.build.call @attributes
      (@componentView = new Rivets.View(el, @locals(), @view.options)).bind()
      @el.parentNode.replaceChild el, @el

  # Intercept `Rivets.Binding::unbind` to be called on `@componentView`.
  unbind: =>
    @componentView?.unbind()

# Rivets.TextBinding
# -----------------------

# A text node binding, defined internally to deal with text and element node
# differences while avoiding it being overwritten.
class Rivets.TextBinding extends Rivets.Binding
  # Initializes a text binding for the specified view and text node.
  constructor: (@view, @el, @type, @keypath, @options = {}) ->
    @formatters = @options.formatters || []
    @dependencies = []
    @setObserver()

  # A standard routine binder used for text node bindings.
  binder:
    routine: (node, value) ->
      node.data = value ? ''

  # Wrap the call to `sync` in fat-arrow to avoid function context issues.
  sync: =>
    super

# Rivets.KeypathParser
# --------------------

# Parser and tokenizer for keypaths in binding declarations.
class Rivets.KeypathParser
  # Parses the keypath and returns a set of adapter interface + path tokens.
  @parse: (keypath, interfaces, root) ->
    tokens = []
    current = {interface: root, path: ''}

    for index in [0...keypath.length] by 1
      char = keypath.charAt index
      if char in interfaces
        tokens.push current
        current = {interface: char, path: ''}
      else
        current.path += char

    tokens.push current
    tokens

# Rivets.TextTemplateParser
# -------------------------

# Rivets.js text template parser and tokenizer for mustache-style text content
# binding declarations.
class Rivets.TextTemplateParser
  @types:
    text: 0
    binding: 1

  # Parses the template and returns a set of tokens, separating static portions
  # of text from binding declarations.
  @parse: (template, delimiters) ->
    tokens = []
    length = template.length
    index = 0
    lastIndex = 0

    while lastIndex < length
      index = template.indexOf delimiters[0], lastIndex

      if index < 0
        tokens.push type: @types.text, value: template.slice lastIndex
        break
      else
        if index > 0 and lastIndex < index
          tokens.push type: @types.text, value: template.slice lastIndex, index

        lastIndex = index + delimiters[0].length
        index = template.indexOf delimiters[1], lastIndex

        if index < 0
          substring = template.slice lastIndex - delimiters[1].length
          lastToken = tokens[tokens.length - 1]

          if lastToken?.type is @types.text
            lastToken.value += substring
          else
            tokens.push type: @types.text, value: substring

          break

        value = template.slice(lastIndex, index).trim()
        tokens.push type: @types.binding, value: value
        lastIndex = index + delimiters[1].length

    tokens

# Rivets.KeypathObserver
# ----------------------

# Parses and observes a full keypath with the appropriate adapters. Also
# intelligently re-realizes the keypath when intermediary keys change.
class Rivets.KeypathObserver
  # Performs the initial parse, variable instantiation and keypath realization.
  constructor: (@view, @model, @keypath, @callback) ->
    @parse()
    @objectPath = []
    @target = @realize()

  # Parses the keypath using the interfaces defined on the view. Sets variables
  # for the tokenized keypath, as well as the end key.
  parse: =>
    interfaces = (k for k, v of @view.adapters)

    if @keypath[0] in interfaces
      root = @keypath[0]
      path = @keypath.substr 1
    else
      root = @view.config.rootInterface
      path = @keypath

    @tokens = Rivets.KeypathParser.parse path, interfaces, root
    @key = @tokens.pop()

  # Updates the keypath. This is called when any intermediate key is changed.
  update: =>
    unless (next = @realize()) is @target
      prev = @target
      @target = next
      @callback @, prev

  # Realizes the full keypath, attaching observers for every key and correcting
  # old observers to any changed objects in the keypath.
  realize: =>
    current = @model

    for token, index in @tokens
      if @objectPath[index]?
        if current isnt prev = @objectPath[index]
          @view.adapters[token.interface].unsubscribe prev, token.path, @update
          @view.adapters[token.interface].subscribe current, token.path, @update
          @objectPath[index] = current
      else
        @view.adapters[token.interface].subscribe current, token.path, @update
        @objectPath[index] = current

      current = @view.adapters[token.interface].read current, token.path

    current

  # Unobserves any current observers set up on the keys.
  unobserve: =>
    for token, index in @tokens
      if obj = @objectPath[index]
        @view.adapters[token.interface].unsubscribe obj, token.path, @update

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
      
      template = Rivets.Util.escapeHTML(Rivets.Util.outerHTML(el))
      @marker = document.createComment " rivets: #{@type} @#{declaration}@ @#{template}@ "

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
  
  revive: (el) ->
    match = el.data.match(/\s*rivets:\s*if\s+@.*?@\s+@([\s\S]*)@\s*/)
    if match
      template = Rivets.Util.unescapeHTML(match[1])
      revived = Rivets.Util.nodeFromHTML(template)
      el.parentNode.insertBefore(revived, el.nextSibling)
      el.parentNode.removeChild(el)
      return revived
    return null

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
      
      template = Rivets.Util.escapeHTML(Rivets.Util.outerHTML(el))
      @marker = document.createComment " rivets: @#{@type}@ @#{template}@ "
      @endMarker = document.createComment " rivets-end "
      
      @iterated = []

      el.removeAttribute attr
      el.parentNode.insertBefore @marker, el
      el.parentNode.insertBefore @endMarker, @marker.nextSibling
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
  
  revive: (el) ->
    match = el.data.match /\s*rivets:\s*@.*?@\s+@([\s\S]*)@\s*/
    if match
      template = Rivets.Util.unescapeHTML(match[1])
      revived = Rivets.Util.nodeFromHTML(template)

      sibling = el.nextSibling
      while sibling
        if sibling.nodeType == 8 and sibling.data.match /\s*rivets-end\s*/
          el.parentNode.removeChild(sibling)
          break
        nextSibling = sibling.nextSibling
        sibling.parentNode.removeChild(sibling)
        sibling = nextSibling

      el.parentNode.insertBefore(revived, el.nextSibling)
      el.parentNode.removeChild(el)
      return revived
    return null

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

# The default `.` adapter thats comes with Rivets.js. Allows subscribing to
# properties on POJSOs, implemented in ES5 natives using
# `Object.defineProperty`.
Rivets.adapters['.'] =
  id: '_rv'
  counter: 0
  weakmap: {}

  weakReference: (obj) ->
    unless obj[@id]?
      id = @counter++

      @weakmap[id] =
        callbacks: {}

      Object.defineProperty obj, @id, value: id

    @weakmap[obj[@id]]

  stubFunction: (obj, fn) ->
    original = obj[fn]
    map = @weakReference obj
    weakmap = @weakmap

    obj[fn] = ->
      response = original.apply obj, arguments

      for r, k of map.pointers
        callback() for callback in weakmap[r]?.callbacks[k] ? []

      response

  observeMutations: (obj, ref, keypath) ->
    if Array.isArray obj
      map = @weakReference obj

      unless map.pointers?
        map.pointers = {}
        functions = ['push', 'pop', 'shift', 'unshift', 'sort', 'reverse', 'splice']
        @stubFunction obj, fn for fn in functions

      map.pointers[ref] ?= []

      unless keypath in map.pointers[ref]
        map.pointers[ref].push keypath

  unobserveMutations: (obj, ref, keypath) ->
    if Array.isArray obj and obj[@id]?
      if keypaths = @weakReference(obj).pointers?[ref]
        keypaths.splice keypaths.indexOf(keypath), 1

  subscribe: (obj, keypath, callback) ->
    callbacks = @weakReference(obj).callbacks

    unless callbacks[keypath]?
      callbacks[keypath] = []
      value = obj[keypath]

      Object.defineProperty obj, keypath,
        get: -> value
        set: (newValue) =>
          if newValue isnt value
            value = newValue
            callback() for callback in callbacks[keypath]
            @observeMutations newValue, obj[@id], keypath

    unless callback in callbacks[keypath]
      callbacks[keypath].push callback

    @observeMutations obj[keypath], obj[@id], keypath

  unsubscribe: (obj, keypath, callback) ->
    callbacks = @weakmap[obj[@id]].callbacks[keypath]
    callbacks.splice callbacks.indexOf(callback), 1
    @unobserveMutations obj[keypath], obj[@id], keypath

  read: (obj, keypath) ->
    obj[keypath]

  publish: (obj, keypath, value) ->
    obj[keypath] = value

# Rivets.factory
# --------------

# Rivets.js module factory.
Rivets.factory = (exports) ->
  # Exposes the full Rivets namespace. This is mainly used for isolated testing.
  exports._ = Rivets

  # Exposes the binders object.
  exports.binders = Rivets.binders

  # Exposes the components object.
  exports.components = Rivets.components

  # Exposes the formatters object.
  exports.formatters = Rivets.formatters

  # Exposes the adapters object.
  exports.adapters = Rivets.adapters

  # Exposes the config object.
  exports.config = Rivets.config

  # Merges an object literal onto the config object.
  exports.configure = (options={}) ->
    for property, value of options
      Rivets.config[property] = value
    return

  # Binds a set of model objects to a parent DOM element and returns a
  # `Rivets.View` instance.
  exports.bind = (el, models = {}, options = {}) ->
    view = new Rivets.View(el, models, options)
    view.bind()
    view

# Exports Rivets.js for CommonJS, AMD and the browser.
if typeof exports == 'object'
  Rivets.factory(exports)
else if typeof define == 'function' && define.amd
  define ['exports'], (exports) ->
    Rivets.factory(@rivets = exports)
    return exports
else
  Rivets.factory(@rivets = {})
