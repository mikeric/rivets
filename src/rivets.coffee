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

    # Binds some data to a template / element. Returns a Rivets.View instance.
    bind: (el, models = {}, options = {}) ->
      view = new Rivets.View(el, models, options)
      view.bind()
      view

    # Initializes a new instance of a component on the specified element and
    # returns a Rivets.View instance.
    init: (component, el, data = {}) ->
      el ?= document.createElement 'div'
      component = Rivets.public.components[component]
      el.innerHTML = component.template.call @, el
      scope = component.initialize.call @, el, data

      view = new Rivets.View(el, scope)
      view.bind()
      view
