describe('Functional', function() {
  var data, bindData, el, input;

  beforeEach(function() {
    data = new Data({foo: 'bar'});
    bindData = {data: data};
    el = document.createElement('div');
    input = document.createElement('input');
    input.setAttribute('type', 'text');

    rivets.configure({
      preloadData: true,
      adapter: {
        subscribe: function(obj, keypath, callback) {
          obj.on(keypath, callback);
        },
        read: function(obj, keypath) {
          return obj.get(keypath);
        },
        publish: function(obj, keypath, value) {
          attributes = {};
          attributes[keypath] = value;
          obj.set(attributes);
        }
      }
    });
  });

  describe('Adapter', function() {
    it('should read the initial value', function() {
      spyOn(data, 'get');
      el.setAttribute('data-text', 'data.foo');
      rivets.bind(el, bindData);
      expect(data.get).toHaveBeenCalledWith('foo');
    });

    it('should read the initial value unless preloadData is false', function() {
      rivets.configure({preloadData: false});
      spyOn(data, 'get');
      el.setAttribute('data-value', 'data.foo');
      rivets.bind(el, bindData);
      expect(data.get).not.toHaveBeenCalled();
    });

    it('should subscribe to updates', function() {
      spyOn(data, 'on');
      el.setAttribute('data-value', 'data.foo');
      rivets.bind(el, bindData);
      expect(data.on).toHaveBeenCalled();
    });
  });

  describe('Binds', function() {
    describe('Text', function() {
      it('should set the text content of the element', function() {
        el.setAttribute('data-text', 'data.foo');
        rivets.bind(el, bindData);
        expect(el.textContent || el.innerText).toBe(data.get('foo'));
      });

      it('should correctly handle HTML in the content', function() {
        el.setAttribute('data-text', 'data.foo');
        value = '<b>Fail</b>';
        data.set({foo: value});
        rivets.bind(el, bindData);
        expect(el.textContent || el.innerText).toBe(value);
      });
    });

    describe('HTML', function() {
      it('should set the html content of the element', function() {
        el.setAttribute('data-html', 'data.foo');
        rivets.bind(el, bindData);
        expect(el).toHaveTheTextContent(data.get('foo'));
      });

      it('should correctly handle HTML in the content', function() {
        el.setAttribute('data-html', 'data.foo');
        value = '<b>Fail</b>';
        data.set({foo: value});
        rivets.bind(el, bindData);
        expect(el.innerHTML).toBe(value);
      });
    });

    describe('Value', function() {
      it('should set the value of the element', function() {
        input.setAttribute('data-value', 'data.foo');
        rivets.bind(input, bindData);
        expect(input.value).toBe(data.get('foo'));
      });
    });
  });

  describe('Updates', function() {
    it('should change the value', function() {
      el.setAttribute('data-text', 'data.foo');
      rivets.bind(el, bindData);
      data.set({foo: 'some new value'});
      expect(el).toHaveTheTextContent(data.get('foo'));
    });
  });

  describe('Input', function() {
    it('should update the model value', function() {
      input.setAttribute('data-value', 'data.foo');
      rivets.bind(input, bindData);
      input.value = 'some new value';
      var event = document.createEvent('HTMLEvents')
      event.initEvent('change', true, true);
      input.dispatchEvent(event);
      expect(input.value).toBe(data.get('foo'));
    });
  });
});
