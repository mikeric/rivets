describe("Rivets.observer", function() {
  it("should unbind all change events on unobserve", function() {
    var model = {
      a: {
        b: {
          c: 'foo'
        }
      }
    };

    var called_count = 0;

    var obs = new rivets._.Observer(rivets, model, 'a.b.c', function() {
      called_count += 1;
    });

    model.a.b.c = 'bar';
    expect(called_count).toBe(1);

    obs.unobserve();

    model.a.b.c = 'baz';
    expect(called_count).toBe(1);
  });
});
