const $ = window.jQuery || window.$

export function bindEvent(el, event, handler) {
  if ($) {
    $(el).on(event, handler)
  } else {
    el.addEventListener(event, handler, false)
  }
}

export function unbindEvent(el, event, handler) {
  if ($) {
    $(el).off(event, handler)
  } else {
    el.removeEventListener(event, handler, false)
  }
}

export function getInputValue(el) {
  if ($) {
    let $el = $(el)
    
    if ($el.attr('type') === 'checkbox') {
      return $el.is(':checked')
    } else {
      return $el.val()
    }
  } else {
    if (el.type === 'checkbox') {
      return el.checked
    } else if (el.type === 'select-multiple') {
      let results = []

      el.options.forEach(option => {
        if (option.selected) {
          results.push(option.value)
        }
      })

      return results
    } else {
      return el.value
    }
  }
}
