# Rivets.View
# -----------

# A collection of bindings built from a set of parent nodes.
class Rivets.View
  # The DOM elements and the model objects for binding are passed into the
  # constructor along with any local options that should be used throughout the
  # context of the view and it's bindings.
  constructor: (@els, @models, options = {}) ->
    @els = [@els] unless (@els.jquery or @els instanceof Array)

    for option in Rivets.extensions
      @[option] = {}
      @[option][k] = v for k, v of options[option] if options[option]
      @[option][k] ?= v for k, v of Rivets.public[option]

    for option in Rivets.options
      @[option] = options[option] ? Rivets.public[option]

    @build()

  options: =>
    options = {}

    for option in Rivets.extensions.concat Rivets.options
      options[option] = @[option]

    options

  # Regular expression used to match binding attributes.
  bindingRegExp: =>
    new RegExp "^#{@prefix}-"

  buildBinding: (binding, node, type, declaration) =>
    options = {}

    pipes = (pipe.trim() for pipe in declaration.match /((?:'[^']*')*(?:(?:[^\|']*(?:'[^']*')+[^\|']*)+|[^\|]+))|^$/g)
    context = (ctx.trim() for ctx in pipes.shift().split '<')
    keypath = context.shift()

    options.formatters = pipes

    if dependencies = context.shift()
      options.dependencies = dependencies.split /\s+/

    @bindings.push new Rivets[binding] @, node, type, keypath, options

  # Parses the DOM tree and builds `Rivets.Binding` instances for every matched
  # binding declaration.
  build: =>
    @bindings = []

    parse = (node) =>
      if node.nodeType is 3
        parser = Rivets.TextTemplateParser

        if delimiters = @templateDelimiters
          if (tokens = parser.parse(node.data, delimiters)).length
            unless tokens.length is 1 and tokens[0].type is parser.types.text
              for token in tokens
                text = document.createTextNode token.value
                node.parentNode.insertBefore text, node

                if token.type is 1
                  @buildBinding 'TextBinding', text, null, token.value
              node.parentNode.removeChild node
      else if node.nodeType is 1
        block = @traverse node

      unless block
        parse childNode for childNode in (n for n in node.childNodes)
      return

    parse el for el in @els

    @bindings.sort (a, b) ->
      (b.binder?.priority or 0) - (a.binder?.priority or 0)

    return

  traverse: (node) =>
    bindingRegExp = @bindingRegExp()
    block = node.nodeName is 'SCRIPT' or node.nodeName is 'STYLE'

    for attribute in node.attributes
      if bindingRegExp.test attribute.name
        type = attribute.name.replace bindingRegExp, ''

        unless binder = @binders[type]
          for identifier, value of @binders
            if identifier isnt '*' and identifier.indexOf('*') isnt -1
              regexp = new RegExp "^#{identifier.replace(/\*/g, '.+')}$"
              if regexp.test type
                binder = value

        binder or= @binders['*']

        if binder.block
          block = true
          attributes = [attribute]

    for attribute in attributes or node.attributes
      if bindingRegExp.test attribute.name
        type = attribute.name.replace bindingRegExp, ''
        @buildBinding 'Binding', node, type, attribute.value

    unless block
      type = node.nodeName.toLowerCase()

      if @components[type] and not node._bound
        @bindings.push new Rivets.ComponentBinding @, node, type
        block = true

    block

  # Returns an array of bindings where the supplied function evaluates to true.
  select: (fn) =>
    binding for binding in @bindings when fn binding

  # Binds all of the current bindings for this view.
  bind: =>
    binding.bind() for binding in @bindings
    return

  # Unbinds all of the current bindings for this view.
  unbind: =>
    binding.unbind() for binding in @bindings
    return

  # Syncs up the view with the model by running the routines on all bindings.
  sync: =>
    binding.sync?() for binding in @bindings
    return

  # Publishes the input values from the view back to the model (reverse sync).
  publish: =>
    binding.publish() for binding in @select (b) -> b.binder?.publishes
    return

  # Updates the view's models along with any affected bindings.
  update: (models = {}) =>
    @models[key] = model for key, model of models
    binding.update? models for binding in @bindings
    return
