class KeypathObserver
  constructor: (@view, @model, @keypath, @callback) ->
    @interfaces = (k for k, v of @view.adapters)
    @objectPath = []
    @tokens = Rivets.KeypathParser.parse @keypath, @interfaces, @view.config.rootInterface
    @root = @tokens.shift()
    @key = @tokens.pop()
    @target = @realize()

  update: =>
    unless (next = @realize()) is @target
      @callback @target = next

  realize: =>
    current = @view.adapters[@root.interface].read @view.models, @root.path

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
