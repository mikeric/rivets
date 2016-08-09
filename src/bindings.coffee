# Rivets.Binding
# --------------

# A single binding between a model attribute and a DOM element.
class Rivets.Binding
  # All information about the binding is passed into the constructor; the
  # containing view, the DOM node, the type of binding, the model object and the
  # keypath at which to listen for changes.
  constructor: (@view, @el, @type, @keypath, @options = {}) ->
    @formatters = @options.formatters or []
    @dependencies = []
    @formatterObservers = {}
    @model = undefined
    @setBinder()

  # Sets the binder to use when binding and syncing.
  setBinder: =>
    unless @binder = @view.binders[@type]
      for identifier, value of @view.binders
        if identifier isnt '*' and identifier.indexOf('*') isnt -1
          regexp = new RegExp "^#{identifier.replace(/\*/g, '.+')}$"
          if regexp.test @type
            @binder = value
            @args = new RegExp("^#{identifier.replace(/\*/g, '(.+)')}$").exec @type
            @args.shift()

    @binder or= @view.binders['*']
    @binder = {routine: @binder} if @binder instanceof Function

  observe: (obj, keypath, callback) =>
    Rivets.sightglass obj, keypath, callback,
      root: @view.rootInterface
      adapters: @view.adapters

  parseTarget: =>
    token = Rivets.TypeParser.parse @keypath

    if token.type is Rivets.TypeParser.types.primitive
      @value = token.value
    else
      @observer = @observe @view.models, @keypath, @sync
      @model = @observer.target

  parseFormatterArguments: (args, formatterIndex) =>
    args = (Rivets.TypeParser.parse(arg) for arg in args)
    processedArgs = []

    for arg, ai in args
      processedArgs.push if arg.type is Rivets.TypeParser.types.primitive
        arg.value
      else
        @formatterObservers[formatterIndex] or= {}

        unless observer = @formatterObservers[formatterIndex][ai]
          observer = @observe @view.models, arg.value, @sync
          @formatterObservers[formatterIndex][ai] = observer

        observer.value()

    processedArgs

  # Applies all the current formatters to the supplied value and returns the
  # formatted value.
  formattedValue: (value) =>
    for formatter, fi in @formatters
      args = formatter.match /[^\s']+|'([^']|'[^\s])*'|"([^"]|"[^\s])*"/g
      id = args.shift()
      formatter = @view.formatters[id]

      processedArgs = @parseFormatterArguments args, fi

      if formatter?.read instanceof Function
        value = formatter.read.call @model, value, processedArgs...
      else if formatter instanceof Function
        value = formatter.call @model, value, processedArgs...

    value

  # Returns an event handler for the binding around the supplied function.
  eventHandler: (fn) =>
    handler = (binding = @).view.handler
    (ev) -> handler.call fn, @, ev, binding

  # Sets the value for the binding. This Basically just runs the binding routine
  # with the suplied value formatted.
  set: (value) =>
    # Since 0.9 : doesn't execute function unless backward compatibility is active
    value = if (value instanceof Function and !@binder.function and Rivets.public.executeFunctions)
      @formattedValue value.call @model
    else
      @formattedValue value

    @binder.routine?.call @, @el, value

  # Syncs up the view binding with the model.
  sync: =>
    @set if @observer
      if @model isnt @observer.target
        observer.unobserve() for observer in @dependencies
        @dependencies = []

        if (@model = @observer.target)? and @options.dependencies?.length
          for dependency in @options.dependencies
            observer = @observe @model, dependency, @sync
            @dependencies.push observer

      @observer.value()
    else
      @value

  # Publishes the value currently set on the input element back to the model.
  publish: =>
    if @observer
      value = @getValue @el
      lastformatterIndex = @formatters.length - 1

      for formatter, fiReversed in @formatters.slice(0).reverse()
        fi = lastformatterIndex - fiReversed
        args = formatter.split /\s+/
        id = args.shift()

        processedArgs = @parseFormatterArguments args, fi

        if @view.formatters[id]?.publish
          value = @view.formatters[id].publish value, processedArgs...

      @observer.setValue value

  # Subscribes to the model for changes at the specified keypath. Bi-directional
  # routines will also listen for changes on the element to propagate them back
  # to the model.
  bind: =>
    @parseTarget()
    @binder.bind?.call @, @el

    if @model? and @options.dependencies?.length
      for dependency in @options.dependencies
        observer = @observe @model, dependency, @sync
        @dependencies.push observer

    @sync() if @view.preloadData

  # Unsubscribes from the model and the element.
  unbind: =>
    @binder.unbind?.call @, @el
    @observer?.unobserve()

    observer.unobserve() for observer in @dependencies
    @dependencies = []

    for fi, args of @formatterObservers
      observer.unobserve() for ai, observer of args

    @formatterObservers = {}

  # Updates the binding's model from what is currently set on the view. Unbinds
  # the old model first and then re-binds with the new model.
  update: (models = {}) =>
    @model = @observer?.target
    @binder.update?.call @, models

  # Returns elements value
  getValue: (el) =>
    if @binder and @binder.getValue?
      @binder.getValue.call @, el
    else
      Rivets.Util.getInputValue el

# Rivets.ComponentBinding
# -----------------------

# A component view encapsulated as a binding within it's parent view.
class Rivets.ComponentBinding extends Rivets.Binding
  # Initializes a component binding for the specified view. The raw component
  # element is passed in along with the component type. Attributes and scope
  # inflections are determined based on the components defined attributes.
  constructor: (@view, @el, @type) ->
    @component = @view.components[@type]
    @static = {}
    @observers = {}
    @upstreamObservers = {}

    bindingRegExp = view.bindingRegExp()

    for attribute in @el.attributes or []
      unless bindingRegExp.test attribute.name
        propertyName = @camelCase attribute.name

        token = Rivets.TypeParser.parse(attribute.value)

        if propertyName in (@component.static ? [])
          @static[propertyName] = attribute.value
        else if token.type is Rivets.TypeParser.types.primitive
          @static[propertyName] = token.value
        else
          @observers[propertyName] = attribute.value

  # Intercepts `Rivets.Binding::sync` since component bindings are not bound to
  # a particular model to update it's value.
  sync: ->

  # Intercepts `Rivets.Binding::update` since component bindings are not bound
  # to a particular model to update it's value.
  update: ->

  # Intercepts `Rivets.Binding::publish` since component bindings are not bound
  # to a particular model to update it's value.
  publish: ->

  # Returns an object map using the component's scope inflections.
  locals: =>
    result = {}

    for key, value of @static
      result[key] = value

    for key, observer of @observers
      result[key] = observer.value()

    result

  # Returns a camel-cased version of the string. Used when translating an
  # element's attribute name into a property name for the component's scope.
  camelCase: (string) ->
    string.replace /-([a-z])/g, (grouped) ->
      grouped[1].toUpperCase()

  # Intercepts `Rivets.Binding::bind` to build `@componentView` with a localized
  # map of models from the root view. Bind `@componentView` on subsequent calls.
  bind: =>
    unless @bound
      for key, keypath of @observers
        @observers[key] = @observe @view.models, keypath, ((key) => =>
          @componentView.models[key] = @observers[key].value()
        ).call(@, key)

      @bound = true

    if @componentView?
      @componentView.bind()
    else
      @el.innerHTML = @component.template.call this
      scope = @component.initialize.call @, @el, @locals()
      @el._bound = true

      options = {}

      for option in Rivets.extensions
        options[option] = {}
        options[option][k] = v for k, v of @component[option] if @component[option]
        options[option][k] ?= v for k, v of @view[option]

      for option in Rivets.options
        options[option] = @component[option] ? @view[option]

      @componentView = new Rivets.View(Array.prototype.slice.call(@el.childNodes), scope, options)
      @componentView.bind()

      for key, observer of @observers
        @upstreamObservers[key] = @observe @componentView.models, key, ((key, observer) => =>
          observer.setValue @componentView.models[key]
        ).call(@, key, observer)
    return

  # Intercept `Rivets.Binding::unbind` to be called on `@componentView`.
  unbind: =>
    for key, observer of @upstreamObservers
      observer.unobserve()

    for key, observer of @observers
      observer.unobserve()

    @componentView?.unbind.call @

# Rivets.TextBinding
# -----------------------

# A text node binding, defined internally to deal with text and element node
# differences while avoiding it being overwritten.
class Rivets.TextBinding extends Rivets.Binding
  # Initializes a text binding for the specified view and text node.
  constructor: (@view, @el, @type, @keypath, @options = {}) ->
    @formatters = @options.formatters or []
    @dependencies = []
    @formatterObservers = {}

  # A standard routine binder used for text node bindings.
  binder:
    routine: (node, value) ->
      node.data = value ? ''

  # Wrap the call to `sync` in fat-arrow to avoid function context issues.
  sync: =>
    super
