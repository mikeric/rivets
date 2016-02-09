describe("Rivets.formatters", function() {

  describe("call", function() {
    var model

    beforeEach(function() {
      model = {
        fn: function(arg1, arg2) {
          return '' + arg1 + arg2;
        }
      }
    })

    it("calls function with arguments", function() {
      rivets.formatters['call'](model.fn, 'foo', 'bar').should.equal('foobar')
    })
  })
});
