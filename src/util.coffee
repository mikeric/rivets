# Rivets.Util
# -----------

if typeof window != 'undefined'
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
