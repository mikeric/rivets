describe('Routines', function() {
  var el, input, trueRadioInput, falseRadioInput, checkboxInput;

  var createInputElement = function(type, value) {
    var elem = document.createElement('input');
    elem.setAttribute('type', type);
    if (value !== undefined){
      elem.setAttribute('value', value);
    }
    document.body.appendChild(elem);
    return elem;
  };

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
    document.body.appendChild(el);

    input = createInputElement('text');

    // to test the radio input scenario when its value is "true"
    trueRadioInput = createInputElement('radio', 'true');
    
    // to test the radio input scenario when its value is "false"
    falseRadioInput = createInputElement('radio', 'false');

    // to test the checkbox input scenario
    checkboxInput = createInputElement('checkbox');

  });

  afterEach(function(){
    el.parentNode.removeChild(el);
    input.parentNode.removeChild(input);
    trueRadioInput.parentNode.removeChild(trueRadioInput);
    falseRadioInput.parentNode.removeChild(falseRadioInput);
    checkboxInput.parentNode.removeChild(checkboxInput);
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
    describe('with a checkbox input', function() {
      describe('and a truthy value', function() {
        it('checks the checkbox input', function() {
          rivets.binders.checked.routine(checkboxInput, true);
          expect(checkboxInput.checked).toBe(true);
        });
      });

      describe('with a falsey value', function() {
        it('unchecks the checkbox input', function() {
          rivets.binders.checked.routine(checkboxInput, false);
          expect(checkboxInput.checked).toBe(false);
        });
      });
    });

    describe('with a radio input with value="true"', function() {
      describe('and a truthy value', function() {
        it('checks the radio input', function() {
          rivets.binders.checked.routine(trueRadioInput, true);
          expect(trueRadioInput.checked).toBe(true);
        });
      });

      describe('with a falsey value', function() {
        it('unchecks the radio input', function() {
          rivets.binders.checked.routine(trueRadioInput, false);
          expect(trueRadioInput.checked).toBe(false);
        });
      });
    });

    describe('with a radio input with value="false"', function() {
      describe('and a truthy value', function() {
        it('checks the radio input', function() {
          rivets.binders.checked.routine(falseRadioInput, true);
          expect(falseRadioInput.checked).toBe(false);
        });
      });

      describe('with a falsey value', function() {
        it('unchecks the radio input', function() {
          rivets.binders.checked.routine(falseRadioInput, false);
          expect(falseRadioInput.checked).toBe(true);
        });
      });
    });
  });

  describe('unchecked', function() {
    describe('and a truthy value', function() {
      describe('and a truthy value', function() {
        it('checks the checkbox input', function() {
          rivets.binders.unchecked.routine(checkboxInput, true);
          expect(checkboxInput.checked).toBe(false);
        });
      });

      describe('with a falsey value', function() {
        it('unchecks the checkbox input', function() {
          rivets.binders.unchecked.routine(checkboxInput, false);
          expect(checkboxInput.checked).toBe(true);
        });
      });
    });

    describe('with a radio input with value="true"', function() {
      describe('and a truthy value', function() {
        it('checks the radio input', function() {
          rivets.binders.unchecked.routine(trueRadioInput, true);
          expect(trueRadioInput.checked).toBe(false);
        });
      });

      describe('with a falsey value', function() {
        it('unchecks the radio input', function() {
          rivets.binders.unchecked.routine(trueRadioInput, false);
          expect(trueRadioInput.checked).toBe(true);
        });
      });
    });

    describe('with a radio input with value="false"', function() {
      describe('and a truthy value', function() {
        it('checks the radio input', function() {
          rivets.binders.unchecked.routine(falseRadioInput, true);
          expect(falseRadioInput.checked).toBe(true);
        });
      });

      describe('with a falsey value', function() {
        it('unchecks the radio input', function() {
          rivets.binders.unchecked.routine(falseRadioInput, false);
          expect(falseRadioInput.checked).toBe(false);
        });
      });
    });
  });
});
