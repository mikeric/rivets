$(document).ready(function() {
  $('#hamburger').on('click', function() {
    menu = $('#menu')

    if(menu.data('open')) {
      menu.attr('style', 'display: none')
      menu.data('open', false)
    } else {
      menu.attr('style', 'display: block !important; float: left')
      menu.data('open', true)
    }
  })
})
