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
