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
