describe('Component binding', function() {
  var scope, element, component, componentRoot

  beforeEach(function() {
    element = document.createElement('div')
    element.innerHTML = '<test></test>'
    componentRoot = element.firstChild
    scope = { name: 'Rivets' }
    component = rivets.components.test = {
      initialize: sinon.stub().returns(scope),
      template: function() {}
    }
  })

  it('renders "template" as a string', function() {
    rivets.components.test.template = function() {return '<h1>test</h1>'}
    rivets.bind(element)

    componentRoot.innerHTML.should.equal(component.template())
  })

  describe('initialize()', function() {
    var locals

    beforeEach(function() {
      locals = { object: { name: 'Rivets locals' } }
      componentRoot.setAttribute('item', 'object')
    })

    it('receives element as first argument and attributes as second', function() {
      rivets.bind(element, locals)

      component.initialize.calledWith(componentRoot, { item: locals.object }).should.be.true
    })

    it('receives primitives attributes', function() {
      componentRoot.setAttribute('primitivestring', "'value'")
      componentRoot.setAttribute('primitivenumber', "42")
      componentRoot.setAttribute('primitiveboolean', "true")
      rivets.bind(element, locals)

      component.initialize.calledWith(componentRoot, { item: locals.object,
        primitivestring: 'value',
        primitivenumber: 42,
        primitiveboolean: true })
      .should.be.true
    })

    it('returns attributes assigned to "static" property as they are', function() {
      var type = 'text'

      component.static = ['type']
      componentRoot.setAttribute('type', type)
      rivets.bind(element, locals)

      component.initialize.calledWith(componentRoot, { item: locals.object, type: type }).should.be.true
    })
  })

  describe('when "template" is a function', function() {
    it('renders returned string as component template', function() {
      component.template = sinon.stub().returns('<h1>{ name }</h1>')
      rivets.bind(element)

      componentRoot.innerHTML.should.equal('<h1>' + scope.name + '</h1>')
    })
  })

  describe('when associate view is unbound', function() {
    var view, model

    beforeEach(function() {
      componentRoot.setAttribute('title', 'title')
      component.template = sinon.stub().returns('{ name }');
      model = { title: 'Component' }
      view = rivets.bind(element, model)
    })

    it('destroyes observers', function() {
      var originalTitle = model.title += 'new'
      view.unbind()
      model.title += 'update'

      scope.title.should.equal(originalTitle)
    })

    it('unbinds internal view bindings', function() {
      var originalName = scope.name
      view.unbind()
      scope.name += 'smth else'

      componentRoot.innerHTML.should.equal(originalName)
    })

    it('calls "unbind" method of the component', function() {
      component.unbind = sinon.spy()
      view.unbind()

      component.unbind.calledWith(scope).should.be.true
    })
  })
})
