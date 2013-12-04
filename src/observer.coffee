# Rivets.Observer
# ----------------------

# Parses and observes a full keypath with the appropriate adapters. Also
# intelligently re-realizes the keypath when intermediary keys change.
class Rivets.Observer
  # Performs the initial parse, variable instantiation and keypath realization.
  constructor: (@view, @model, @keypath, @callback) ->
    @parse()
    @initialize()

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

  initialize: =>
    @objectPath = []
    @target = @realize()
    @set true, @key, @target, @callback if @target?

  # Updates the keypath. This is called when any intermediary key is changed.
  update: =>
    unless (next = @realize()) is @target
      @set false, @key, @target, @callback if @target?
      @set true, @key, next, @callback if next?

      oldValue = @value()
      @target = next
      @callback() unless @value() is oldValue

  adapter: (key) =>
    @view.adapters[key.interface]

  set: (active, key, obj, callback) =>
    action = if active then 'subscribe' else 'unsubscribe'
    @adapter(key)[action] obj, key.path, callback

  read: (key, obj) =>
    @adapter(key).read obj, key.path

  publish: (value) =>
    if @target?
      @adapter(@key).publish @target, @key.path, value

  value: =>
    @read @key, @target if @target?

  # Realizes the full keypath, attaching observers for every key and correcting
  # old observers to any changed objects in the keypath.
  realize: =>
    current = @model
    unreached = null

    for token, index in @tokens
      if current?
        if @objectPath[index]?
          if current isnt prev = @objectPath[index]
            @set false, token, prev, @update
            @set true, token, current, @update
            @objectPath[index] = current
        else
          @set true, token, current, @update
          @objectPath[index] = current
        
        current = @read token, current
      else
        unreached ?= index

        if prev = @objectPath[index]
          @set false, token, prev, @update

    @objectPath.splice unreached if unreached?
    current

  # Unobserves any current observers set up on the keys.
  unobserve: =>
    for token, index in @tokens
      if obj = @objectPath[index]
        @set false, token, obj, @update
