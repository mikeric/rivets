describe("Rivets.observer", function() {
  it("should unbind all change events on unobserve", function() {
    var model = {a: {b: {c: 'foo'}}}
    var called_count = 0

    var obs = new rivets._.Observer(rivets, model, 'a.b.c', function() {
      called_count += 1
    })

    model.a.b.c = 'bar'
    called_count.should.equal(1)

    obs.unobserve()

    model.a.b.c = 'baz'
    called_count.should.equal(1)
  })
})
