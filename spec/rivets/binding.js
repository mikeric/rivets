describe('Rivets.Binding', function() {
  var model, el, view, binding, opts

  beforeEach(function() {
    rivets.prefix = 'data'
    adapter = rivets.adapters['.']

    el = document.createElement('div')
    el.setAttribute('data-text', 'obj.name')

    view = rivets.bind(el, {obj: {name: 'test'}})
    binding = view.bindings[0]
    model = binding.model
  })

  it('gets assigned the proper binder routine matching the identifier', function() {
    binding.binder.routine.should.equal(rivets.binders.text)
  })

  describe('bind()', function() {
    it('subscribes to the model for changes via the adapter', function() {
      sinon.spy(adapter, 'observe')
      binding.bind()
      adapter.observe.calledWith(model, 'name', binding.sync).should.be.true
    })

    it("calls the binder's bind method if one exists", function() {
      binding.bind.should.not.throw()

      binding.binder.bind = function(){}
      sinon.spy(binding.binder, 'bind')
      binding.bind()
      binding.binder.bind.called.should.be.true
    })

    describe('with preloadData set to true', function() {
      beforeEach(function() {
        rivets.preloadData = true
      })

      it('sets the initial value', function() {
        sinon.spy(binding, 'set')
        binding.bind()
        binding.set.calledWith('test').should.be.true
      })
    })

    describe('with dependencies', function() {
      beforeEach(function() {
        binding.options.dependencies = ['.fname', '.lname']
      })

      it('sets up observers on the dependant attributes', function() {
        binding.bind()
        adapter.observe.calledWith(model, 'fname', binding.sync).should.be.true
        adapter.observe.calledWith(model, 'lname', binding.sync).should.be.true
      })
    })
  })

  describe('unbind()', function() {
    it("calls the binder's unbind method if one exists", function() {
      binding.unbind.should.not.throw()

      binding.binder.unbind = function(){}
      sinon.spy(binding.binder, 'unbind')
      binding.unbind()
      binding.binder.unbind.called.should.be.true
    })
  })

  describe('set()', function() {
    it('performs the binding routine with the supplied value', function() {
      sinon.spy(binding.binder, 'routine')
      binding.set('sweater')
      binding.binder.routine.calledWith(el, 'sweater').should.be.true
    })

    it('applies any formatters to the value before performing the routine', function() {
      view.formatters.awesome = function(value) { return 'awesome ' + value }

      binding.formatters.push('awesome')
      sinon.spy(binding.binder, 'routine')
      binding.set('sweater')
      binding.binder.routine.calledWith(el, 'awesome sweater').should.be.true
    })

    it('calls methods with the object as context', function() {
      binding.model = {foo: 'bar'}
      sinon.spy(binding.binder, 'routine')
      binding.set(function() { return this.foo })
      binding.binder.routine.calledWith(el, binding.model.foo).should.be.true
    })
  })

  describe('publish()', function() {
    it("should publish the value of a number input", function() {
      numberInput = document.createElement('input')
      numberInput.setAttribute('type', 'number')
      numberInput.setAttribute('data-value', 'obj.num')

      view = rivets.bind(numberInput, {obj: {num: 42}})
      binding = view.bindings[0]
      model = binding.model

      numberInput.value = 42

      sinon.spy(adapter, 'set')
      binding.publish({target: numberInput})
      adapter.set.calledWith(model, 'num', '42').should.be.true
    })
  })

  describe('publishTwoWay()', function() {
    it('applies a two-way read formatter to function same as a single-way', function() {
      view.formatters.awesome = {
        read: function(value) { return 'awesome ' + value }
      }

      binding.formatters.push('awesome')
      sinon.spy(binding.binder, 'routine')
      binding.set('sweater')
      binding.binder.routine.calledWith(el, 'awesome sweater').should.be.true
    })

    it("should publish the value of a number input", function() {
      rivets.formatters.awesome = {
        publish: function(value) { return 'awesome ' + value }
      }

      numberInput = document.createElement('input')
      numberInput.setAttribute('type', 'number')
      numberInput.setAttribute('data-value', 'obj.num | awesome')

      view = rivets.bind(numberInput, {obj: {num: 42}})
      binding = view.bindings[0]
      model = binding.model

      numberInput.value = 42

      binding.publish({target: numberInput})
      adapter.set.calledWith(model, 'num', 'awesome 42').should.be.true
    })

    it("should format a value in both directions", function() {
      rivets.formatters.awesome = {
        publish: function(value) { return 'awesome ' + value },
        read: function(value) { return value + ' is awesome' }
      }

      valueInput = document.createElement('input')
      valueInput.setAttribute('type','text')
      valueInput.setAttribute('data-value', 'obj.name | awesome')

      view = rivets.bind(valueInput, {obj: { name: 'nothing' }})
      binding = view.bindings[0]
      model = binding.model

      valueInput.value = 'charles'
      binding.publish({target: valueInput})
      adapter.set.calledWith(model, 'name', 'awesome charles').should.be.true

      sinon.spy(binding.binder, 'routine')
      binding.set('fred')
      binding.binder.routine.calledWith(valueInput, 'fred is awesome').should.be.true
    })

    it("should not fail or format if the specified binding function doesn't exist", function() {
      rivets.formatters.awesome = { }
      valueInput = document.createElement('input')
      valueInput.setAttribute('type','text')
      valueInput.setAttribute('data-value', 'obj.name | awesome')

      view = rivets.bind(valueInput, {obj: { name: 'nothing' }})
      binding = view.bindings[0]
      model = binding.model

      valueInput.value = 'charles'
      binding.publish({target: valueInput})
      adapter.set.calledWith(model, 'name', 'charles').should.be.true

      binding.set('fred')
      binding.binder.routine.calledWith(valueInput, 'fred').should.be.true
    })

    it("should apply read binders left to right, and write binders right to left", function() {
      rivets.formatters.totally = {
        publish: function(value) { return value + ' totally' },
        read: function(value) { return value + ' totally' }
      }

      rivets.formatters.awesome = {
        publish: function(value) { return value + ' is awesome' },
        read: function(value) { return value + ' is awesome' }
      }

      valueInput = document.createElement('input')
      valueInput.setAttribute('type','text')
      valueInput.setAttribute('data-value', 'obj.name | awesome | totally')

      view = rivets.bind(valueInput, {obj: { name: 'nothing' }})
      binding = view.bindings[0]
      model = binding.model

      binding.set('fred')
      binding.binder.routine.calledWith(valueInput, 'fred is awesome totally').should.be.true

      valueInput.value = 'fred'
      binding.publish({target: valueInput})
      adapter.set.calledWith(model, 'name', 'fred totally is awesome').should.be.true
    })

    it("binders in a chain should be skipped if they're not there", function() {
      rivets.formatters.totally = {
        publish: function(value) { return value + ' totally' },
        read: function(value) { return value + ' totally' }
      }

      rivets.formatters.radical = {
        publish: function(value) { return value + ' is radical' },
      }

      rivets.formatters.awesome = function(value) { return value + ' is awesome' }

      valueInput = document.createElement('input')
      valueInput.setAttribute('type','text')
      valueInput.setAttribute('data-value', 'obj.name | awesome | radical | totally')

      view = rivets.bind(valueInput, {obj: { name: 'nothing' }})
      binding = view.bindings[0]
      model = binding.model

      binding.set('fred')
      binding.binder.routine.calledWith(valueInput, 'fred is awesome totally').should.be.true

      valueInput.value = 'fred'
      binding.publish({target: valueInput})
      adapter.set.calledWith(model, 'name', 'fred totally is radical').should.be.true
    })
  })

  describe('formattedValue()', function() {
    it('applies the current formatters on the supplied value', function() {
      view.formatters.awesome = function(value) { return 'awesome ' + value }
      binding.formatters.push('awesome')
      binding.formattedValue('hat').should.equal('awesome hat')
    })

    describe('with a multi-argument formatter string', function() {
      beforeEach(function() {
        view.formatters.awesome = function(value, prefix) {
          return prefix + ' awesome ' + value
        }

        binding.formatters.push("awesome 'super'")
      })

      it('applies the formatter with arguments', function() {
        binding.formattedValue('jacket').should.equal('super awesome jacket')
      })
    })
  })
})
