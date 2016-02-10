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

    it("calls function with the model as context", function() {
      model.obj = {
        name: 'foo',
        fn: function() {
          return this.name;
        }
      }
      var el = document.createElement('div')
      el.setAttribute('rv-text', 'obj.fn | call')
      rivets.bind(el, model)
      el.innerText.should.equal('foo')
    })
  })
});
