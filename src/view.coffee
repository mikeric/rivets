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

        parse childNode for childNode in (n for n in node.childNodes)

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
