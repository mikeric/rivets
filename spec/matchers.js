beforeEach(function() {
  this.addMatchers({
    toHaveTheTextContent: function(expected) {
      var el = this.actual;
      actual = el.textContent || el.innerText;
      this.message = function() {
        return "Expected '" + actual + "' to be '" + expected + "'";
      }
      return actual === expected;
    }
  });
});
