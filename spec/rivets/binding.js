describe('Rivets.Binding', function() {
  var model, el, view, binding;

  beforeEach(function() {
    rivets.configure({
      adapter: {
        subscribe: function() {},
        unsubscribe: function() {},
        read: function() {},
        publish: function() {}
      }
    });

    el = document.createElement('div');
    el.setAttribute('data-text', 'obj.name');
    view = rivets.bind(el, {obj: {}});
    binding = view.bindings[0];
    model = binding.model;
  });

  it('gets assigned the routine function matching the identifier', function() {
    expect(binding.routine).toBe(rivets.routines.text);
  });

  describe('bind()', function() {
    it('subscribes to the model for changes via the adapter', function() {
      spyOn(rivets.config.adapter, 'subscribe');
      binding.bind();
      expect(rivets.config.adapter.subscribe).toHaveBeenCalledWith(model, 'name', binding.sync);
    });

    describe('with preloadData set to true', function() {
      beforeEach(function() {
        rivets.config.preloadData = true;
      });

      it('sets the initial value via the adapter', function() {
        spyOn(binding, 'set');
        spyOn(rivets.config.adapter, 'read');
        binding.bind();
        expect(rivets.config.adapter.read).toHaveBeenCalledWith(model, 'name');
        expect(binding.set).toHaveBeenCalled();
      });
    });

    describe('with the bypass option set to true', function() {
      beforeEach(function() {
        binding.options.bypass = true;
      });

      it('sets the initial value from the model directly', function() {
        spyOn(binding, 'set');
        binding.model.name = 'espresso';
        binding.bind();
        expect(binding.set).toHaveBeenCalledWith('espresso');
      });
    });

    describe('with dependencies', function() {
      beforeEach(function() {
        binding.options.dependencies = ['.fname', '.lname'];
      });

      it('sets up observers on the dependant attributes', function() {
        spyOn(rivets.config.adapter, 'subscribe');
        binding.bind();
        expect(rivets.config.adapter.subscribe).toHaveBeenCalledWith(model, 'fname', binding.sync);
        expect(rivets.config.adapter.subscribe).toHaveBeenCalledWith(model, 'lname', binding.sync);
      });
    });
  });

  describe('set()', function() {
    it('performs the binding routine with the supplied value', function() {
      spyOn(binding, 'routine');
      binding.set('sweater');
      expect(binding.routine).toHaveBeenCalledWith(el, 'sweater');
    });

    it('applies any formatters to the value before performing the routine', function() {
      rivets.formatters.awesome = function(value) { return 'awesome ' + value };
      binding.formatters.push('awesome');
      spyOn(binding, 'routine');
      binding.set('sweater');
      expect(binding.routine).toHaveBeenCalledWith(el, 'awesome sweater');
    });

    it('calls methods with the object as context', function() {
      binding.model = {foo: 'bar'};
      spyOn(binding, 'routine');
      binding.set(function() { return this.foo; });
      expect(binding.routine).toHaveBeenCalledWith(el, binding.model.foo);
    });

    describe('on an event binding', function() {
      beforeEach(function() {
        binding.options.special = 'event';
      });

      it('performs the binding routine with the supplied function and current listener', function() {
        spyOn(binding, 'routine');
        func = function() { return 1 + 2; }
        binding.set(func);
        expect(binding.routine).toHaveBeenCalledWith(el, binding.model, func, undefined);
      });
    });

    describe('on an iteration binding', function(){
      beforeEach(function(){
        binding.options.special = 'iteration';
      });

      it('performs the binding routine with the supplied collection and binding', function() {
        spyOn(binding, 'routine');
        array = [{name: 'a'}, {name: 'b'}];
        binding.set(array);
        expect(binding.routine).toHaveBeenCalledWith(el, array, binding);
      });
    });
  });

  describe('publish()', function() {
    it("should publish the value of a number input", function() {
      numberInput = document.createElement('input');
      numberInput.setAttribute('type', 'number');
      numberInput.setAttribute('data-value', 'obj.num');

      view = rivets.bind(numberInput, {obj: {num: 42}});
      binding = view.bindings[0];
      model = binding.model;

      numberInput.value = 42;

      spyOn(rivets.config.adapter, 'publish');
      binding.publish({target: numberInput});
      expect(rivets.config.adapter.publish).toHaveBeenCalledWith(model, 'num', '42');
    });
  });

  describe('formattedValue()', function() {
    it('applies the current formatters on the supplied value', function() {
      rivets.formatters.awesome = function(value) { return 'awesome ' + value };
      binding.formatters.push('awesome');
      expect(binding.formattedValue('hat')).toBe('awesome hat');
    });

    it('uses formatters on the model', function() {
      model.modelAwesome = function(value) { return 'model awesome ' + value };
      binding.formatters.push('modelAwesome');
      expect(binding.formattedValue('hat')).toBe('model awesome hat');
    });

    describe('with a multi-argument formatter string', function() {
      beforeEach(function() {
        rivets.formatters.awesome = function(value, prefix) {
          return prefix + ' awesome ' + value;
        };
        binding.formatters.push('awesome super');
      });

      it('applies the formatter with arguments', function() {
        expect(binding.formattedValue('jacket')).toBe('super awesome jacket');
      });
    });
  });
});
