describe('Routines', function() {
  var el, input;

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
    input = document.createElement('input');
    input.setAttribute('type', 'text');
  });

  describe('text', function() {
    it("sets the element's text content", function() {
      rivets.binders.text(el, '<em>gluten-free</em>');
      expect(el.textContent || el.innerText).toBe('<em>gluten-free</em>');
      expect(el.innerHTML).toBe('&lt;em&gt;gluten-free&lt;/em&gt;');
    });

    it("sets the element's text content to zero when a numeric zero is passed", function() {
        rivets.binders.text(el, 0);
        expect(el.textContent || el.innerText).toBe('0');
        expect(el.innerHTML).toBe('0');
    });
  });

  describe('html', function() {
    it("sets the element's HTML content", function() {
      rivets.binders.html(el, '<strong>fixie</strong>');
      expect(el.textContent || el.innerText).toBe('fixie');
      expect(el.innerHTML).toBe('<strong>fixie</strong>');
    });

    it("sets the element's HTML content to zero when a zero value is passed", function() {
      rivets.binders.html(el, 0);
        expect(el.textContent || el.innerText).toBe('0');
        expect(el.innerHTML).toBe('0');
    });
  });

  describe('value', function() {
    it("sets the element's value", function() {
      rivets.binders.value.routine(input, 'pitchfork');
      expect(input.value).toBe('pitchfork');
    });
    
    it("applies a default value to the element when the model doesn't contain it", function() {
      rivets.binders.value.routine(input, undefined);
      expect(input.value).toBe('');
    });

    it("sets the element's value to zero when a zero value is passed", function() {
      rivets.binders.value.routine(input, 0);
      expect(input.value).toBe('0');
    });
  });

  describe('show', function() {
    describe('with a truthy value', function() {
      it('shows the element', function() {
        rivets.binders.show(el, true);
        expect(el.style.display).toBe('');
      });
    });

    describe('with a falsey value', function() {
      it('hides the element', function() {
        rivets.binders.show(el, false);
        expect(el.style.display).toBe('none');
      });
    });
  });

  describe('hide', function() {
    describe('with a truthy value', function() {
      it('hides the element', function() {
        rivets.binders.hide(el, true);
        expect(el.style.display).toBe('none');
      });
    });

    describe('with a falsey value', function() {
      it('shows the element', function() {
        rivets.binders.hide(el, false);
        expect(el.style.display).toBe('');
      });
    });
  });

  describe('enabled', function() {
    describe('with a truthy value', function() {
      it('enables the element', function() {
        rivets.binders.enabled(el, true);
        expect(el.disabled).toBe(false);
      });
    });

    describe('with a falsey value', function() {
      it('disables the element', function() {
        rivets.binders.enabled(el, false);
        expect(el.disabled).toBe(true);
      });
    });
  });

  describe('disabled', function() {
    describe('with a truthy value', function() {
      it('disables the element', function() {
        rivets.binders.disabled(el, true);
        expect(el.disabled).toBe(true);
      });
    });

    describe('with a falsey value', function() {
      it('enables the element', function() {
        rivets.binders.disabled(el, false);
        expect(el.disabled).toBe(false);
      });
    });
  });

  describe('checked', function() {
    describe('with a truthy value', function() {
      it('checks the element', function() {
        rivets.binders.checked.routine(el, true);
        expect(el.checked).toBe(true);
      });
    });

    describe('with a falsey value', function() {
      it('unchecks the element', function() {
        rivets.binders.checked.routine(el, false);
        expect(el.checked).toBe(false);
      });
    });
  });

  describe('unchecked', function() {
    describe('with a truthy value', function() {
      it('unchecks the element', function() {
        rivets.binders.unchecked.routine(el, true);
        expect(el.checked).toBe(false);
      });
    });

    describe('with a falsey value', function() {
      it('checks the element', function() {
        rivets.binders.unchecked.routine(el, false);
        expect(el.checked).toBe(true);
      });
    });
  });
});
