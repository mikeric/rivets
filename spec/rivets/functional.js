describe('Functional', function() {
  var data, bindData, el, input

  beforeEach(function() {
    adapter = {
      observe: function(obj, keypath, callback) {
        obj.on(keypath, callback)
      },
      unobserve: function(obj, keypath, callback) {
        obj.off(keypath, callback)
      },
      get: function(obj, keypath) {
        return obj.get(keypath)
      },
      set: function(obj, keypath, value) {
        attributes = {}
        attributes[keypath] = value
        obj.set(attributes)
      }
    }

    rivets.sightglass.adapters[':'] = adapter
    rivets.configure({preloadData: true})

    data = new Data({
      foo: 'bar',
      items: [{name: 'a'}, {name: 'b'}]
    })

    bindData = {data: data}

    el = document.createElement('div')
    input = document.createElement('input')
    input.setAttribute('type', 'text')
  })

  describe('Adapter', function() {
    it('should read the initial value', function() {
      sinon.spy(data, 'get')
      el.setAttribute('data-text', 'data:foo')
      rivets.bind(el, bindData)
      data.get.calledWith('foo').should.be.true
    })

    it('should read the initial value unless preloadData is false', function() {
      rivets.configure({preloadData: false})
      sinon.spy(data, 'get')
      el.setAttribute('data-value', 'data:foo')
      rivets.bind(el, bindData)
      data.get.called.should.be.false
    })

    it('should subscribe to updates', function() {
      sinon.spy(data, 'on')
      el.setAttribute('data-value', 'data:foo')
      rivets.bind(el, bindData)
      data.on.called.should.be.true
    })
  })

  describe('Binds', function() {
    describe('Text', function() {
      it('should set the text content of the element', function() {
        el.setAttribute('data-text', 'data:foo')
        rivets.bind(el, bindData)
        el.textContent.should.equal(data.get('foo'))
      })

      it('should correctly handle HTML in the content', function() {
        el.setAttribute('data-text', 'data:foo')
        value = '<b>Fail</b>'
        data.set({foo: value})
        rivets.bind(el, bindData)
        el.textContent.should.equal(value)
      })
    })

    describe('HTML', function() {
      it('should set the html content of the element', function() {
        el.setAttribute('data-html', 'data:foo')
        rivets.bind(el, bindData)
        el.textContent.should.equal(data.get('foo'))
      })

      it('should correctly handle HTML in the content', function() {
        el.setAttribute('data-html', 'data:foo')
        value = '<b>Fail</b>'
        data.set({foo: value})
        rivets.bind(el, bindData)
        el.innerHTML.should.equal(value)
      })
    })

    describe('Value', function() {
      it('should set the value of the element', function() {
        input.setAttribute('data-value', 'data:foo')
        rivets.bind(input, bindData)
        input.value.should.equal(data.get('foo'))
      })
    })

    describe('Multiple', function() {
      it('should bind a list of multiple elements', function() {
        el.setAttribute('data-html', 'data:foo')
        input.setAttribute('data-value', 'data:foo')
        rivets.bind([el, input], bindData)
        el.textContent.should.equal(data.get('foo'))
        input.value.should.equal(data.get('foo'))
      })
    })

    describe('Priority', function() {
      beforeEach(function() {
        rivets.binders.a = {bind: function(){}}
        rivets.binders.b = {bind: function(){}}

        sinon.spy(rivets.binders.a, 'bind')
        sinon.spy(rivets.binders.b, 'bind')

        el.setAttribute('data-a', 'data:foo')
        el.setAttribute('data-b', 'data:foo')
      })

      describe('a:10, b:30', function() {
        beforeEach(function() {
          rivets.binders.a.priority = 10
          rivets.binders.b.priority = 30
          rivets.bind(el, bindData)
        })

        it('should bind b before a', function() {
          rivets.binders.b.bind.calledBefore(rivets.binders.a.bind).should.be.true
        })
      })

      describe('a:5, b:2', function() {
        beforeEach(function() {
          rivets.binders.a.priority = 5
          rivets.binders.b.priority = 2
          rivets.bind(el, bindData)
        })

        it('should bind a before b', function() {
          rivets.binders.a.bind.calledBefore(rivets.binders.b.bind).should.be.true
        })
      })

      describe('a:undefined, b:1', function() {
        beforeEach(function() {
          rivets.binders.b.priority = 1
          rivets.bind(el, bindData)
        })

        it('should bind b before a', function() {
          rivets.binders.b.bind.calledBefore(rivets.binders.a.bind).should.be.true
        })
      })
    })

    describe('Iteration', function() {
      beforeEach(function(){
        list = document.createElement('ul')
        el.appendChild(list)
        listItem = document.createElement('li')
        listItem.setAttribute('data-each-item', 'data:items')
        list.appendChild(listItem)
      })

      it('should loop over a collection and create new instances of that element + children', function() {
        el.getElementsByTagName('li').length.should.equal(1)
        rivets.bind(el, bindData)
        el.getElementsByTagName('li').length.should.equal(2)
      })

      it('should not fail if the collection being bound to is null', function() {
        data.set({ items: null})
        rivets.bind(el, bindData)
        el.getElementsByTagName('li').length.should.equal(0)
      })

      it('should re-loop over the collection and create new instances when the array changes', function() {
        rivets.bind(el, bindData)
        el.getElementsByTagName('li').length.should.equal(2)

        newItems = [{name: 'a'}, {name: 'b'}, {name: 'c'}]
        data.set({items: newItems})
        el.getElementsByTagName('li').length.should.equal(3)
      })

      it('should allow binding to the iterated item as well as any parent contexts', function() {
        span1 = document.createElement('span')
        span1.setAttribute('data-text', 'item.name')
        span2 = document.createElement('span')
        span2.setAttribute('data-text', 'data:foo')
        listItem.appendChild(span1)
        listItem.appendChild(span2)

        rivets.bind(el, bindData)
        el.getElementsByTagName('span')[0].textContent.should.equal('a')
        el.getElementsByTagName('span')[1].textContent.should.equal('bar')
      })

      it('should allow binding to the iterated element directly', function() {
        listItem.setAttribute('data-text', 'item.name')
        listItem.setAttribute('data-class', 'data:foo')
        rivets.bind(el, bindData)
        el.getElementsByTagName('li')[0].textContent.should.equal('a')
        el.getElementsByTagName('li')[0].className.should.equal('bar')
      })

      it('should insert items between any surrounding elements', function(){
        firstItem = document.createElement('li')
        lastItem = document.createElement('li')
        firstItem.textContent = 'first'
        lastItem.textContent = 'last'
        list.appendChild(lastItem)
        list.insertBefore(firstItem, listItem)
        listItem.setAttribute('data-text', 'item.name')

        rivets.bind(el, bindData)

        el.getElementsByTagName('li')[0].textContent.should.equal('first')
        el.getElementsByTagName('li')[1].textContent.should.equal('a')
        el.getElementsByTagName('li')[2].textContent.should.equal('b')
        el.getElementsByTagName('li')[3].textContent.should.equal('last')
      })

      it('should allow binding to the iterated element index', function() {
        listItem.setAttribute('data-index', 'index')
        rivets.bind(el, bindData)
        el.getElementsByTagName('li')[0].getAttribute('index').should.equal('0')
        el.getElementsByTagName('li')[1].getAttribute('index').should.equal('1')
      })

      it('should allow binding to the iterated element index by using the %item% syntax', function() {
        listItem.setAttribute('data-index', '%item%')
        rivets.bind(el, bindData)
        el.getElementsByTagName('li')[0].getAttribute('index').should.equal('0')
        el.getElementsByTagName('li')[1].getAttribute('index').should.equal('1')
      })

      it('should allow the developer to configure the index attribute available in the iteration', function() {
        rivets.configure({
          iterationAlias : function(modelName) {
            return modelName + 'Index';
          }
        });

        listItem.setAttribute('data-index', 'itemIndex')
        rivets.bind(el, bindData)
        el.getElementsByTagName('li')[0].getAttribute('index').should.equal('0')
        el.getElementsByTagName('li')[1].getAttribute('index').should.equal('1')
      })
    })
  })

  describe('Updates', function() {
    it('should change the value', function() {
      el.setAttribute('data-text', 'data:foo')
      rivets.bind(el, bindData)
      data.set({foo: 'some new value'})
      el.textContent.should.equal(data.get('foo'))
    })
  })

  describe('Input', function() {
    it('should update the model value', function() {
      input.setAttribute('data-value', 'data:foo');
      rivets.bind(input, bindData);
      input.value = 'some new value';
      var event = document.createEvent('HTMLEvents');
      event.initEvent('input', true, true);
      input.dispatchEvent(event);
      data.get('foo').should.equal('some new value');
    });

    it('should allow to change the event listened', function() {
      var event;
      input.setAttribute('data-value', 'data:foo');
      input.setAttribute('event-name', 'blur');
      rivets.bind(input, bindData);
      input.value = 'some new value';
      event = document.createEvent('HTMLEvents');
      event.initEvent('input', true, true);
      input.dispatchEvent(event);
      data.get('foo').should.equal('bar');

      event = document.createEvent('HTMLEvents');
      event.initEvent('blur', true, true);
      input.dispatchEvent(event);
      data.get('foo').should.equal('some new value');
    })
  })
})
