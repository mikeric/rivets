describe('Rivets.Binding', function() {
  var model, el, view, binding, opts;

  beforeEach(function() {
    rivets.config.prefix = 'data'
    adapter = rivets.adapters['.']

    el = document.createElement('div');
    el.setAttribute('data-text', 'obj.name');

    view = rivets.bind(el, {obj: {}});
    binding = view.bindings[0];
    model = binding.model;
  });

  it('gets assigned the proper binder routine matching the identifier', function() {
    expect(binding.binder.routine).toBe(rivets.binders.text);
  });

  describe('bind()', function() {
    it('subscribes to the model for changes via the adapter', function() {
      spyOn(adapter, 'subscribe');
      binding.bind();
      expect(adapter.subscribe).toHaveBeenCalledWith(model, 'name', binding.sync);
    });

    it("calls the binder's bind method if one exists", function() {
      expect(function(){
        binding.bind();
      }).not.toThrow(new Error());

      binding.binder.bind = function(){};
      spyOn(binding.binder, 'bind');
      binding.bind();
      expect(binding.binder.bind).toHaveBeenCalled();
    });

    describe('with preloadData set to true', function() {
      beforeEach(function() {
        rivets.config.preloadData = true;
      });

      it('sets the initial value via the adapter', function() {
        spyOn(binding, 'set');
        spyOn(adapter, 'read');
        binding.bind();
        expect(adapter.read).toHaveBeenCalledWith(model, 'name');
        expect(binding.set).toHaveBeenCalled();
      });
    });

    describe('with dependencies', function() {
      beforeEach(function() {
        binding.options.dependencies = ['.fname', '.lname'];
      });

      it('sets up observers on the dependant attributes', function() {
        spyOn(adapter, 'subscribe');
        binding.bind();
        expect(adapter.subscribe).toHaveBeenCalledWith(model, 'fname', binding.sync);
        expect(adapter.subscribe).toHaveBeenCalledWith(model, 'lname', binding.sync);
      });
    });
  });

  describe('unbind()', function() {
    it("calls the binder's unbind method if one exists", function() {
      expect(function(){
        binding.unbind();
      }).not.toThrow(new Error());

      binding.binder.unbind = function(){};
      spyOn(binding.binder, 'unbind');
      binding.unbind();
      expect(binding.binder.unbind).toHaveBeenCalled();
    });
  });

  describe('set()', function() {
    it('performs the binding routine with the supplied value', function() {
      spyOn(binding.binder, 'routine');
      binding.set('sweater');
      expect(binding.binder.routine).toHaveBeenCalledWith(el, 'sweater');
    });

    it('applies any formatters to the value before performing the routine', function() {
      view.formatters.awesome = function(value) { return 'awesome ' + value; };
      binding.formatters.push('awesome');
      spyOn(binding.binder, 'routine');
      binding.set('sweater');
      expect(binding.binder.routine).toHaveBeenCalledWith(el, 'awesome sweater');
    });

    it('calls methods with the object as context', function() {
      binding.model = {foo: 'bar'};
      spyOn(binding.binder, 'routine');
      binding.set(function() { return this.foo; });
      expect(binding.binder.routine).toHaveBeenCalledWith(el, binding.model.foo);
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

      spyOn(adapter, 'publish');
      binding.publish({target: numberInput});
      expect(adapter.publish).toHaveBeenCalledWith(model, 'num', '42');
    });
  });

  describe('publishTwoWay()', function() {

    it('applies a two-way read formatter to function same as a single-way', function() {
      view.formatters.awesome = {
        read: function(value) { return 'awesome ' + value; },
      };
      binding.formatters.push('awesome');
      spyOn(binding.binder, 'routine');
      binding.set('sweater');
      expect(binding.binder.routine).toHaveBeenCalledWith(el, 'awesome sweater');
    });

    it("should publish the value of a number input", function() {
      rivets.formatters.awesome = {
        publish: function(value) { return 'awesome ' + value; },
      };

      numberInput = document.createElement('input');
      numberInput.setAttribute('type', 'number');
      numberInput.setAttribute('data-value', 'obj.num | awesome');

      view = rivets.bind(numberInput, {obj: {num: 42}});
      binding = view.bindings[0];
      model = binding.model;

      numberInput.value = 42;

      spyOn(adapter, 'publish');
      binding.publish({target: numberInput});
      expect(adapter.publish).toHaveBeenCalledWith(model, 'num', 'awesome 42');
    });

    it("should format a value in both directions", function() {
      rivets.formatters.awesome = {
        publish: function(value) { return 'awesome ' + value; },
        read: function(value) { return value + ' is awesome'; }
      };
      valueInput = document.createElement('input');
      valueInput.setAttribute('type','text');
      valueInput.setAttribute('data-value', 'obj.name | awesome');

      view = rivets.bind(valueInput, {obj: { name: 'nothing' }});
      binding = view.bindings[0];
      model = binding.model;

      spyOn(adapter, 'publish');
      valueInput.value = 'charles';
      binding.publish({target: valueInput});
      expect(adapter.publish).toHaveBeenCalledWith(model, 'name', 'awesome charles');

      spyOn(binding.binder, 'routine');
      binding.set('fred');
      expect(binding.binder.routine).toHaveBeenCalledWith(valueInput, 'fred is awesome');
    });

    it("should not fail or format if the specified binding function doesn't exist", function() {
      rivets.formatters.awesome = { };
      valueInput = document.createElement('input');
      valueInput.setAttribute('type','text');
      valueInput.setAttribute('data-value', 'obj.name | awesome');

      view = rivets.bind(valueInput, {obj: { name: 'nothing' }});
      binding = view.bindings[0];
      model = binding.model;

      spyOn(adapter, 'publish');
      valueInput.value = 'charles';
      binding.publish({target: valueInput});
      expect(adapter.publish).toHaveBeenCalledWith(model, 'name', 'charles');

      spyOn(binding.binder, 'routine');
      binding.set('fred');
      expect(binding.binder.routine).toHaveBeenCalledWith(valueInput, 'fred');
    });


    it("should apply read binders left to right, and write binders right to left", function() {
      rivets.formatters.totally = {
        publish: function(value) { return value + ' totally'; },
        read: function(value) { return value + ' totally'; }
      };
      rivets.formatters.awesome = {
        publish: function(value) { return value + ' is awesome'; },
        read: function(value) { return value + ' is awesome'; }
      };

      valueInput = document.createElement('input');
      valueInput.setAttribute('type','text');
      valueInput.setAttribute('data-value', 'obj.name | awesome | totally');

      view = rivets.bind(valueInput, {obj: { name: 'nothing' }});
      binding = view.bindings[0];
      model = binding.model;

      spyOn(binding.binder, 'routine');
      binding.set('fred');
      expect(binding.binder.routine).toHaveBeenCalledWith(valueInput, 'fred is awesome totally');

      spyOn(adapter, 'publish');
      valueInput.value = 'fred';
      binding.publish({target: valueInput});
      expect(adapter.publish).toHaveBeenCalledWith(model, 'name', 'fred totally is awesome');
    });

     it("binders in a chain should be skipped if they're not there", function() {
      rivets.formatters.totally = {
        publish: function(value) { return value + ' totally'; },
        read: function(value) { return value + ' totally'; }
      };
      rivets.formatters.radical = {
        publish: function(value) { return value + ' is radical'; },
      };
      rivets.formatters.awesome = function(value) { return value + ' is awesome'; };

      valueInput = document.createElement('input');
      valueInput.setAttribute('type','text');
      valueInput.setAttribute('data-value', 'obj.name | awesome | radical | totally');

      view = rivets.bind(valueInput, {obj: { name: 'nothing' }});
      binding = view.bindings[0];
      model = binding.model;

      spyOn(binding.binder, 'routine');
      binding.set('fred');
      expect(binding.binder.routine).toHaveBeenCalledWith(valueInput, 'fred is awesome totally');

      spyOn(adapter, 'publish');
      valueInput.value = 'fred';
      binding.publish({target: valueInput});
      expect(adapter.publish).toHaveBeenCalledWith(model, 'name', 'fred totally is radical');
    });

  });

  describe('formattedValue()', function() {
    it('applies the current formatters on the supplied value', function() {
      view.formatters.awesome = function(value) { return 'awesome ' + value; };
      binding.formatters.push('awesome');
      expect(binding.formattedValue('hat')).toBe('awesome hat');
    });

    describe('with a multi-argument formatter string', function() {
      beforeEach(function() {
        view.formatters.awesome = function(value, prefix) {
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
