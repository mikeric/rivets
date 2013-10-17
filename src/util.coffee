# Rivets.Util
# -----------

# Houses common utility functions used internally by Rivets.js.
Rivets.Util =
  # Create a single DOM event binding.
  bindEvent: (el, event, handler) ->
    if window.jQuery?
      el = jQuery el
      if el.on? then el.on event, handler else el.bind event, handler
    else if window.addEventListener?
      el.addEventListener event, handler, false
    else
      event = 'on' + event
      el.attachEvent event, handler

  # Remove a single DOM event binding.
  unbindEvent: (el, event, handler) ->
    if window.jQuery?
      el = jQuery el
      if el.off? then el.off event, handler else el.unbind event, handler
    else if window.removeEventListener?
      el.removeEventListener event, handler, false
    else
      event = 'on' + event
      el.detachEvent  event, handler

  # Get the current value of an input node.
  getInputValue: (el) ->
    if window.jQuery?
      el = jQuery el

      switch el[0].type
        when 'checkbox' then el.is ':checked'
        else el.val()
    else
      switch el.type
        when 'checkbox' then el.checked
        when 'select-multiple' then o.value for o in el when o.selected
        else el.value
