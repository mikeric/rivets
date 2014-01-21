describe("Rivets.binders", function() {
  var context;
  beforeEach(function() {
    context = {
      publish: function() {}
    }
  });

  describe("value", function() {
    var el;
    beforeEach(function() {
      el = document.createElement('input');
    });

    it("unbinds the same bound function", function() {
      var boundFn;
      spyOn(el, 'addEventListener').andCallFake(function(event, fn) {
        boundFn = fn;
      });
      rivets.binders.value.bind.call(context, el);

      spyOn(el, 'removeEventListener').andCallFake(function(event, fn) {
        expect(fn).toBe(boundFn);
      });

      rivets.binders.value.unbind.call(context, el);
    });
  });

  describe('each-*', function() {
    var el, view;

    afterEach(function() {
      el.parentNode.removeChild(el);
    });

    it('should undo all DOM modifications when unbound', function() {
      el = document.createElement('div');
      el.innerHTML = '<span rv-each-item="items" class="item">{ item }</span>';

      document.body.appendChild(el);

      expect(document.querySelectorAll('[rv-each-item]').length).toEqual(1);

      view = rivets.bind(el, { items: [ 'banana', 'lettuce' ] });

      expect(document.querySelectorAll('[rv-each-item]').length).toEqual(0);
      expect(document.querySelectorAll('span.item').length).toEqual(2);

      view.unbind();

      expect(document.querySelectorAll('[rv-each-item]').length).toEqual(1);
      expect(document.querySelectorAll('span.item').length).toEqual(1);
    });

    it('should stay functional after rebinding', function() {
      var template = [
        '<select name="currency" rv-value="model.currency">',
          '<option rv-each-currency="user.currencies" rv-value="currency">',
            '{ currency }',
          '</option>',
        '</select>'
      ].join('');

      var createView = function(el) {
        return rivets.bind(el, {
          model: {
            currency: 'USD'
          },
          user: {
            currencies: [ 'EUR', 'JPY', 'USD' ]
          }
        });
      };

      el = document.createElement('div');
      el.innerHTML = template;
      view = createView(el);

      document.body.appendChild(el);

      expect(document.querySelectorAll('option').length).toBe(3);
      expect(document.querySelector('select').value).toEqual('USD');

      view.update({
        model: {
          currency: 'EUR'
        }
      });

      expect(document.querySelector('select').value).toEqual('EUR');

      view.update({
        user: {
          currencies: [ 'EUR', 'JOD', 'JPD', 'USD' ]
        }
      });

      expect(document.querySelectorAll('option').length).toBe(4);
      expect(document.querySelectorAll('option[value=""]').length).toBe(0);
      expect(document.querySelector('select').value).toEqual('EUR');

      view.unbind();
      view = createView(el);

      expect(document.querySelectorAll('option').length).toBe(3);
      expect(document.querySelectorAll('option[value=""]').length).toBe(0);
      expect(document.querySelector('select').value).toEqual('USD');

      view.unbind();
    });
  }); // each-* binder
});
