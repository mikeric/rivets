class KeypathObserver
  constructor: (@view, @model, @keypath, @callback) ->
    @parse()
    @objectPath = []
    @target = @realize()

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

  update: =>
    unless (next = @realize()) is @target
      prev = @target
      @target = next
      @callback @, prev

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
