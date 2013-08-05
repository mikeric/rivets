describe('Functional', function() {
  var data, bindData, el, input;

  beforeEach(function() {
    adapter = {
      subscribe: function(obj, keypath, callback) {
        obj.on(keypath, callback);
      },
      unsubscribe: function(obj, keypath, callback) {
        obj.off(keypath, callback);
      },
      read: function(obj, keypath) {
        return obj.get(keypath);
      },
      publish: function(obj, keypath, value) {
        attributes = {};
        attributes[keypath] = value;
        obj.set(attributes);
      }
    };

    rivets.adapters[':'] = adapter;
    rivets.configure({preloadData: true});

    data = new Data({
      foo: 'bar',
      items: [{name: 'a'}, {name: 'b'}]
    });

    bindData = {data: data};

    el = document.createElement('div');
    input = document.createElement('input');
    input.setAttribute('type', 'text');
  });

  describe('Adapter', function() {
    it('should read the initial value', function() {
      spyOn(data, 'get');
      el.setAttribute('data-text', 'data:foo');
      rivets.bind(el, bindData);
      expect(data.get).toHaveBeenCalledWith('foo');
    });

    it('should read the initial value unless preloadData is false', function() {
      rivets.configure({preloadData: false});
      spyOn(data, 'get');
      el.setAttribute('data-value', 'data:foo');
      rivets.bind(el, bindData);
      expect(data.get).not.toHaveBeenCalled();
    });

    it('should subscribe to updates', function() {
      spyOn(data, 'on');
      el.setAttribute('data-value', 'data:foo');
      rivets.bind(el, bindData);
      expect(data.on).toHaveBeenCalled();
    });
  });

  describe('Binds', function() {
    describe('Text', function() {
      it('should set the text content of the element', function() {
        el.setAttribute('data-text', 'data:foo');
        rivets.bind(el, bindData);
        debugger
        expect(el.textContent || el.innerText).toBe(data.get('foo'));
      });

      it('should correctly handle HTML in the content', function() {
        el.setAttribute('data-text', 'data:foo');
        value = '<b>Fail</b>';
        data.set({foo: value});
        rivets.bind(el, bindData);
        expect(el.textContent || el.innerText).toBe(value);
      });
    });

    describe('HTML', function() {
      it('should set the html content of the element', function() {
        el.setAttribute('data-html', 'data:foo');
        rivets.bind(el, bindData);
        expect(el).toHaveTheTextContent(data.get('foo'));
      });

      it('should correctly handle HTML in the content', function() {
        el.setAttribute('data-html', 'data:foo');
        value = '<b>Fail</b>';
        data.set({foo: value});
        rivets.bind(el, bindData);
        expect(el.innerHTML).toBe(value);
      });
    });

    describe('Value', function() {
      it('should set the value of the element', function() {
        input.setAttribute('data-value', 'data:foo');
        rivets.bind(input, bindData);
        expect(input.value).toBe(data.get('foo'));
      });
    });
    
    describe('Multiple', function() {
      it('should bind a list of multiple elements', function() {
        el.setAttribute('data-html', 'data:foo');
        input.setAttribute('data-value', 'data:foo');
        rivets.bind([el, input], bindData);
        expect(el).toHaveTheTextContent(data.get('foo'));
        expect(input.value).toBe(data.get('foo'));
      });
    });

    describe('Iteration', function() {
      beforeEach(function(){
        list = document.createElement('ul');
        el.appendChild(list);
        listItem = document.createElement('li');
        listItem.setAttribute('data-each-item', 'data:items');
        list.appendChild(listItem);
      });

      it('should loop over a collection and create new instances of that element + children', function() {
        expect(el.getElementsByTagName('li').length).toBe(1);
        rivets.bind(el, bindData);
        expect(el.getElementsByTagName('li').length).toBe(2);
      });

      it('should not fail if the collection being bound to is null', function() {
        data.set({ items: null});
        rivets.bind(el, bindData);
        expect(el.getElementsByTagName('li').length).toBe(0);
      });

      it('should re-loop over the collection and create new instances when the array changes', function() {
        rivets.bind(el, bindData);
        expect(el.getElementsByTagName('li').length).toBe(2);

        newItems = [{name: 'a'}, {name: 'b'}, {name: 'c'}];
        data.set({items: newItems});
        expect(el.getElementsByTagName('li').length).toBe(3);
      });

      it('should allow binding to the iterated item as well as any parent contexts', function() {
        span1 = document.createElement('span');
        span1.setAttribute('data-text', 'item.name')
        span2 = document.createElement('span');
        span2.setAttribute('data-text', 'data:foo')
        listItem.appendChild(span1);
        listItem.appendChild(span2);

        rivets.bind(el, bindData);
        expect(el.getElementsByTagName('span')[0]).toHaveTheTextContent('a');
        expect(el.getElementsByTagName('span')[1]).toHaveTheTextContent('bar');
      });

      it('should allow binding to the iterated element directly', function() {
        listItem.setAttribute('data-text', 'item.name');
        listItem.setAttribute('data-class', 'data:foo');
        rivets.bind(el, bindData);
        expect(el.getElementsByTagName('li')[0]).toHaveTheTextContent('a');
        expect(el.getElementsByTagName('li')[0].className).toBe('bar');
      });

      it('should insert items between any surrounding elements', function(){
        firstItem = document.createElement('li');
        lastItem = document.createElement('li');
        firstItem.textContent = 'first';
        lastItem.textContent = 'last';
        list.appendChild(lastItem);
        list.insertBefore(firstItem, listItem);

        listItem.setAttribute('data-text', 'item.name');

        rivets.bind(el, bindData);
        expect(el.getElementsByTagName('li')[0]).toHaveTheTextContent('first');
        expect(el.getElementsByTagName('li')[1]).toHaveTheTextContent('a');
        expect(el.getElementsByTagName('li')[2]).toHaveTheTextContent('b');
        expect(el.getElementsByTagName('li')[3]).toHaveTheTextContent('last');
      })

    });
  });

  describe('Updates', function() {
    it('should change the value', function() {
      el.setAttribute('data-text', 'data:foo');
      rivets.bind(el, bindData);
      data.set({foo: 'some new value'});
      expect(el).toHaveTheTextContent(data.get('foo'));
    });
  });

  describe('Input', function() {
    it('should update the model value', function() {
      input.setAttribute('data-value', 'data:foo');
      rivets.bind(input, bindData);
      input.value = 'some new value';
      var event = document.createEvent('HTMLEvents')
      event.initEvent('change', true, true);
      input.dispatchEvent(event);
      expect(input.value).toBe(data.get('foo'));
    });
  });
});
