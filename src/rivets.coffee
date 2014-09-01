# The Rivets namespace.
Rivets =
  options: [
    'prefix'
    'templateDelimiters'
    'rootInterface'
    'preloadData'
    'handler'
  ]

  extensions: [
    'binders'
    'formatters'
    'components'
    'adapters'
  ]

  # The public interface (this is the exported module object).
  public:
    # Global binders.
    binders: {}

    # Global components.
    components: {}

    # Global formatters.
    formatters: {}

    # Global sightglass adapters.
    adapters: {}

    # Default attribute prefix.
    prefix: 'rv'

    # Default template delimiters.
    templateDelimiters: ['{', '}']

    # Default sightglass root interface.
    rootInterface: '.'

    # Preload data by default.
    preloadData: true

    # Default event handler.
    handler: (context, ev, binding) ->
      @call context, ev, binding.view.models

    # Merges an object literal into the corresponding global options.
    configure: (options = {}) ->
      for option, value of options
        if option in ['binders', 'components', 'formatters', 'adapters']
          for key, descriptor of value
            Rivets[option][key] = descriptor
        else
          Rivets.public[option] = value

      return

    # Binds a set of model objects to a parent DOM element and returns a
    # `Rivets.View` instance.
    bind: (el, models = {}, options = {}) ->
      view = new Rivets.View(el, models, options)
      view.bind()
      view
