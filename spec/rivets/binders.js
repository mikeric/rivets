describe("Rivets.binders", function() {
  var context

  beforeEach(function() {
    context = {
      publish: function() {}
    }
  })

  describe("value", function() {
    var el

    beforeEach(function() {
      el = document.createElement('input')
    })

    it("unbinds the same bound function", function() {
      var boundFn

      sinon.stub(el, 'addEventListener', function(event, fn) {
        boundFn = fn
      })

      rivets.binders.value.bind.call(context, el)

      sinon.stub(el, 'removeEventListener', function(event, fn) {
        fn.should.equal(boundFn)
      })

      rivets.binders.value.unbind.call(context, el)
    })
  })
})
