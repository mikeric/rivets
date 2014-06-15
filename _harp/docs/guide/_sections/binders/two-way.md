Two-way binders, like one-way binders, can update the DOM when a model property changes (model-to-view) but can also update the model when the user interacts with the DOM (view-to-model), such as updating a control input, clicking an element or interacting with a third-party widget.

In order to update the model when the user interacts with the DOM, you need to tell Rivets.js how to bind and unbind to that DOM element to set the value on the model. Instead of defining the binder as a single function, two-way binders are defined as an object containing a few extra functions.

```javascript
rivets.binders.toggle = {
  bind: function(el) {
    adapter = this.config.adapters[this.key.interface]
    model = this.model
    keypath = this.keypath

    this.callback = function() {
      value = adapter.read(model, keypath)
      adapter.publish(model, keypath, !value)
    }

    $(el).on('click', this.callback)
  },

  unbind: function(el) {
    $(el).off('click', this.callback)
  },

  routine: function(el, value) {
    $(el)[value ? 'addClass' : 'removeClass']('enabled')
  }
}
```

