describe("Rivets.binders", function() {
  var context

  beforeEach(function() {
    context = {
      publish: function() {}
    }
  })

  describe("value", function() {
    var el

    beforeEach(function() {
      el = document.createElement('input')
    })

    it("unbinds the same bound function", function() {
      var boundFn

      sinon.stub(el, 'addEventListener', function(event, fn) {
        boundFn = fn
      })

      rivets.binders.value.bind.call(context, el)

      sinon.stub(el, 'removeEventListener', function(event, fn) {
        fn.should.equal(boundFn)
      })

      rivets.binders.value.unbind.call(context, el)
    })
  })

  describe("each-*", function() {
    var fragment;
    var el;
    var model;

    beforeEach(function() {
      fragment = document.createDocumentFragment();
      el = document.createElement("li");
      el.setAttribute("rv-each-item", "items");
      el.setAttribute("rv-text", "item.val");

      fragment.appendChild(el);

      model = { items: [{val: 0},{val: 1},{val: 2}] };
    });

    it("binds to the model creating a list item for each element in items", function() {
      var view = rivets.bind(fragment, model);

      // one child for each element in the model plus 1 for the comment placeholder
      Should(fragment.childNodes.length).be.exactly(model.items.length + 1);
    });

    it("reflects changes to the model into the DOM", function() {
      var view = rivets.bind(fragment, model);
      Should(fragment.childNodes[1].textContent).be.exactly("0");

      model.items[0].val = "howdy";
      Should(fragment.childNodes[1].textContent).be.exactly("howdy");
    });

    it("reflects changes to the model into the DOM after unbind/bind", function() {
      var view = rivets.bind(fragment, model);
      Should(fragment.childNodes[1].textContent).be.exactly("0");

      view.unbind();
      view.bind();
      model.items[0].val = "howdy";
      Should(fragment.childNodes[1].textContent).be.exactly("howdy");
    });

    it("lets you pop an item", function() {
      var view = rivets.bind(fragment, model);
      var originalLength  = model.items.length;

      // one child for each element in the model plus 1 for the comment placeholder
      Should(fragment.childNodes.length).be.exactly(model.items.length + 1);

      model.items.pop();
      Should(model.items.length).be.exactly(originalLength - 1);
      Should(fragment.childNodes.length).be.exactly(model.items.length + 1);
    })

    it("lets you push an item", function() {
      var view = rivets.bind(fragment, model);
      var originalLength  = model.items.length;

      // one child for each element in the model plus 1 for the comment placeholder
      Should(fragment.childNodes.length).be.exactly(model.items.length + 1);

      model.items.push({val: 3});
      Should(model.items.length).be.exactly(originalLength + 1);
      Should(fragment.childNodes.length).be.exactly(model.items.length + 1);
    });

    it("lets you push an item after unbind/bind", function() {
      var view = rivets.bind(fragment, model);
      var originalLength  = model.items.length;

      // one child for each element in the model plus 1 for the comment placeholder
      Should(fragment.childNodes.length).be.exactly(model.items.length + 1);

      view.unbind();
      view.bind();

      model.items.push({val: 3});
      Should(model.items.length).be.exactly(originalLength + 1);
      Should(fragment.childNodes.length).be.exactly(model.items.length + 1);
    });
  });

  describe("if", function() {
    var fragment;
    var el;
    var model;

    beforeEach(function() {
      fragment = document.createDocumentFragment();
      el = document.createElement("div");
      el.setAttribute("rv-if", "data.show");
      el.innerHTML = "{ data.count }";

      fragment.appendChild(el);

      model = { data: {
        show: true,
        count: 1
      } };
    });

    it("shows element with bound key inside if the value is true", function() {
      var view = rivets.bind(fragment, model);

      // one child for the original div plus 1 for the comment placeholder
      Should(fragment.childNodes.length).be.exactly(2);
      Should(fragment.childNodes[1].innerHTML).be.exactly("1");
    });

    it("hides if the value is false", function() {
      var view = rivets.bind(fragment, model);

      model.data.show = false;

      // 1 for the comment placeholder
      Should(fragment.childNodes.length).be.exactly(1);
    });

    it("keeps binding when element becomes visible again", function() {
      var view = rivets.bind(fragment, model);

      model.data.show = false;
      model.data.count = 2;
      model.data.show = true;

      // one child for the original div plus 1 for the comment placeholder
      Should(fragment.childNodes.length).be.exactly(2);
      Should(fragment.childNodes[1].innerHTML).be.exactly("2");
    });

    it("hides if the value is falsey - zero", function() {
      var view = rivets.bind(fragment, model);

      model.data.show = 0;
      // 1 for the comment placeholder
      Should(fragment.childNodes.length).be.exactly(1);
    });

    it("hides if the value is falsey - empty string", function() {
      var view = rivets.bind(fragment, model);

      model.data.show = "";
      // 1 for the comment placeholder
      Should(fragment.childNodes.length).be.exactly(1);
    });

    it("hides if the value is falsey - undefined", function() {
      var view = rivets.bind(fragment, model);

      model.data.show = undefined;
      // 1 for the comment placeholder
      Should(fragment.childNodes.length).be.exactly(1);
    });

    it("rebindes nested if", function() {
       var nestedEl = document.createElement("div")
       nestedEl.setAttribute("rv-if", "data.showNested");
       nestedEl.innerHTML = "{ data.countNested }";
       el.appendChild(nestedEl);
  
       var view = rivets.bind(fragment, model);
  
       model.data.countNested = "1";
       model.data.showNested = true;
       Should(nestedEl.innerHTML).be.exactly("1");
       model.data.show = false;
       model.data.show = true;
       model.data.countNested = "42";
  
       Should(nestedEl.innerHTML).be.exactly("42");
     });
  });
});
