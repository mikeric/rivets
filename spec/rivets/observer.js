describe("Rivets.observer", function() {
  it("should unbind all change events on unobserve", function() {
    var model = {
      a: {
        b: {
          c: 'foo'
        }
      }
    };

    var was_called = false;

    var obs = new rivets._.Observer(rivets, model, 'a.b.c', function() {
      was_called = true;
    });

    obs.unobserve();

    model.a.b.c = 'bar';
    expect(was_called).toBe(false);
  });
});
