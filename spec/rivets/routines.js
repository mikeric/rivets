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
      rivets.routines.text(el, '<em>gluten-free</em>');
      expect(el.textContent || el.innerText).toBe('<em>gluten-free</em>');
      expect(el.innerHTML).toBe('&lt;em&gt;gluten-free&lt;/em&gt;');
    });
  });

  describe('html', function() {
    it("sets the element's HTML content", function() {
      rivets.routines.html(el, '<strong>fixie</strong>');
      expect(el.textContent || el.innerText).toBe('fixie');
      expect(el.innerHTML).toBe('<strong>fixie</strong>');
    });
  });

  describe('value', function() {
    it("sets the element's value", function() {
      rivets.routines.value(input, 'pitchfork');
      expect(input.value).toBe('pitchfork');
    });
  });

  describe('show', function() {
    describe('with a truthy value', function() {
      it('shows the element', function() {
        rivets.routines.show(el, true);
        expect(el.style.display).toBe('');
      });
    });

    describe('with a falsey value', function() {
      it('hides the element', function() {
        rivets.routines.show(el, false);
        expect(el.style.display).toBe('none');
      });
    });
  });

  describe('hide', function() {
    describe('with a truthy value', function() {
      it('hides the element', function() {
        rivets.routines.hide(el, true);
        expect(el.style.display).toBe('none');
      });
    });

    describe('with a falsey value', function() {
      it('shows the element', function() {
        rivets.routines.hide(el, false);
        expect(el.style.display).toBe('');
      });
    });
  });

  describe('enabled', function() {
    describe('with a truthy value', function() {
      it('enables the element', function() {
        rivets.routines.enabled(el, true);
        expect(el.disabled).toBe(false);
      });
    });

    describe('with a falsey value', function() {
      it('disables the element', function() {
        rivets.routines.enabled(el, false);
        expect(el.disabled).toBe(true);
      });
    });
  });

  describe('disabled', function() {
    describe('with a truthy value', function() {
      it('disables the element', function() {
        rivets.routines.disabled(el, true);
        expect(el.disabled).toBe(true);
      });
    });

    describe('with a falsey value', function() {
      it('enables the element', function() {
        rivets.routines.disabled(el, false);
        expect(el.disabled).toBe(false);
      });
    });
  });

  describe('checked', function() {
    describe('with a truthy value', function() {
      it('checks the element', function() {
        rivets.routines.checked(el, true);
        expect(el.checked).toBe(true);
      });
    });

    describe('with a falsey value', function() {
      it('unchecks the element', function() {
        rivets.routines.checked(el, false);
        expect(el.checked).toBe(false);
      });
    });
  });

  describe('unchecked', function() {
    describe('with a truthy value', function() {
      it('unchecks the element', function() {
        rivets.routines.unchecked(el, true);
        expect(el.checked).toBe(false);
      });
    });

    describe('with a falsey value', function() {
      it('checks the element', function() {
        rivets.routines.unchecked(el, false);
        expect(el.checked).toBe(true);
      });
    });
  });

  describe('selected', function() {
    describe('with a truthy value', function() {
      it('selects the element', function() {
        rivets.routines.selected(el, true);
        expect(el.selected).toBe(true);
      });
    });

    describe('with a falsey value', function() {
      it('unselects the element', function() {
        rivets.routines.selected(el, false);
        expect(el.selected).toBe(false);
      });
    });
  });

  describe('unselected', function() {
    describe('with a truthy value', function() {
      it('unselects the element', function() {
        rivets.routines.unselected(el, true);
        expect(el.selected).toBe(false);
      });
    });

    describe('with a falsey value', function() {
      it('selects the element', function() {
        rivets.routines.unselected(el, false);
        expect(el.selected).toBe(true);
      });
    });
  });
});
