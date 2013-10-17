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
