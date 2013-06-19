describe('Rivets.View', function() {
  var models, el, view, opts;

  beforeEach(function() {
    rivets.configure({
      adapter: {
        subscribe: function() {},
        unsubscribe: function() {},
        read: function() {},
        publish: function() {}
      }
    });

    models = { obj: {} };
    el = document.createElement('div');
    opts = {};
    view = rivets.bind(el, models, opts);
  });

  describe('#modelsRef', function() {

    it('should default to models object', function() {
      expect(view.modelsRef).toBe(models);
    });

    it('should override with option.modelsRef', function() {
      opts = { modelsRef: {} };
      view = rivets.bind(el, models, opts);
      expect(view.modelsRef).toBe(opts.modelsRef);
    });
  });
});
