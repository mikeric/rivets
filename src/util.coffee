# Rivets.Util
# -----------

if 'jQuery' of window
  [bindMethod, unbindMethod] = if 'on' of jQuery.prototype then ['on', 'off'] else ['bind', 'unbind']
  
  Rivets.Util =
    bindEvent: (el, event, handler) -> jQuery(el)[bindMethod] event, handler
    unbindEvent: (el, event, handler) -> jQuery(el)[unbindMethod] event, handler
    getInputValue: (el) ->
      $el = jQuery el

      if $el.attr('type') is 'checkbox' then $el.is ':checked'
      else do $el.val
else
  Rivets.Util =
    bindEvent: do ->
      if 'addEventListener' of window then return (el, event, handler) ->
        el.addEventListener event, handler, false

      (el, event, handler) -> el.attachEvent 'on' + event, handler
    unbindEvent: do ->
      if 'removeEventListener' of window then return (el, event, handler) ->
        el.removeEventListener event, handler, false
      
      (el, event, handler) -> el.detachEvent 'on' + event, handler
    getInputValue: (el) ->
      if el.type is 'checkbox' then el.checked
      else if el.type is 'select-multiple' then o.value for o in el when o.selected
      else el.value
