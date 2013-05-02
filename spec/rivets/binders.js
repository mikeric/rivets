describe("Rivets.binders", function() {
  var context;
  beforeEach(function() {
    context = {
      publish: function() {}
    }
  });

  describe("value", function() {
    var el;
    beforeEach(function() {
      el = document.createElement('input');
    });

    it("unbinds the same bound function", function() {
      var boundFn;
      spyOn(el, 'addEventListener').andCallFake(function(event, fn) {
        boundFn = fn;
      });
      rivets.binders.value.bind.call(context, el);

      spyOn(el, 'removeEventListener').andCallFake(function(event, fn) {
        expect(fn).toBe(boundFn);
      });

      rivets.binders.value.unbind.call(context, el);
    });
  });
});
