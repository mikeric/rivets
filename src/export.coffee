# Rivets.factory
# --------------

# Rivets.js module factory.
Rivets.factory = (sightglass) ->
  # Integrate sightglass.
  Rivets.sightglass = sightglass

  # Allow access to private members (for testing).
  Rivets.public._ = Rivets

  # Return the public interface.
  Rivets.public

# Exports Rivets.js for CommonJS, AMD and the browser.
if typeof module?.exports is 'object'
  module.exports = Rivets.factory require('sightglass')
else if typeof define is 'function' and define.amd
  define ['sightglass'], (sightglass) ->
    @rivets = Rivets.factory sightglass
else
  @rivets = Rivets.factory sightglass
