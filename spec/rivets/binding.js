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
  });

  it('gets assigned the routine function matching the identifier', function() {
    expect(binding.routine).toBe(rivets.routines.text);
  });

  describe('set()', function() {
    it('performs the binding routine with the supplied value', function() {
      spyOn(binding, 'routine');
      binding.set('sweater');
      expect(binding.routine).toHaveBeenCalledWith(el, 'sweater');
    });

    it('applies any formatters to the value before performing the routine', function() {
      rivets.config.formatters = {
        awesome: function(value) { return 'awesome ' + value }
      };
      binding.formatters.push('awesome');
      spyOn(binding, 'routine');
      binding.set('sweater');
      expect(binding.routine).toHaveBeenCalledWith(el, 'awesome sweater');
    });

    describe('on an event binding', function() {
      beforeEach(function() {
        binding.options.special = 'event';
      });

      it('performs the binding routine with the supplied function and current listener', function() {
        spyOn(binding, 'routine');
        func = function() { return 1 + 2; }
        binding.set(func);
        expect(binding.routine).toHaveBeenCalledWith(el, func, undefined);
      });

      it('passes the previously set funcation as the current listener on subsequent calls', function() {
        spyOn(binding, 'routine');
        funca = function() { return 1 + 2; };
        funcb = function() { return 2 + 5; };

        binding.set(funca);
        expect(binding.routine).toHaveBeenCalledWith(el, funca, undefined);

        binding.set(funcb);
        expect(binding.routine).toHaveBeenCalledWith(el, funcb, funca);
      });
    });
  });

  describe('formattedValue()', function() {
    it('applies the current formatters on the supplied value', function() {
      rivets.config.formatters = {
        awesome: function(value) { return 'awesome ' + value }
      };
      binding.formatters.push('awesome');
      expect(binding.formattedValue('hat')).toBe('awesome hat');
    });

    describe('with a multi-argument formatter string', function() {
      beforeEach(function() {
        rivets.config.formatters = {
          awesome: function(value, prefix) {
            return prefix + ' awesome ' + value;
          }
        };
        binding.formatters.push('awesome super');
      });
      
      it('applies the formatter with arguments', function() {
        expect(binding.formattedValue('jacket')).toBe('super awesome jacket');
      });
    });
  });
});
