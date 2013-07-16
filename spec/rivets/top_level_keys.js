describe('Rivets.Binding', function() {
  var binding;

  beforeEach(function() {
    var el, view;

    rivets.configure({
      adapter: {
        subscribe: function() {},
        unsubscribe: function() {},
        read: function() {},
        publish: function() {}
      }
    });

    el = document.createElement('div');
    el.setAttribute('data-text', 'name');
    view = rivets.bind(el, {name: 'dashkb'});
    binding = view.bindings[0];
  });

  describe('bind()', function() {
    it('can subscribe to top level keys on a model', function() {
      spyOn(rivets.config.adapter, 'subscribe');
      binding.bind();
      expect(
        rivets.config.adapter.subscribe
      ).toHaveBeenCalledWith(
        {name: 'dashkb'},
        'name',
        binding.sync
      );
    });
  });
});
