Rivets.js comes with an `on-*` binder for attaching event handlers to DOM nodes on a particular event. Depending on your workflow, you may want to augment how Rivets.js calls your event handlers. The `handler` function lets you do just that.

The default event handler behaves like a standard DOM event handler --- called in the context of the event target, passing in the event object as the first argument --- but with a second argument for the full model scope of that view.

    rivets.configure({
      handler: function(target, event, binding) {
        this.call(target, event, binding.view.models)
      }
    })

As you can see, the `handler` function gets called in the context of the original event handler, passing in the event target, event object, and the `Rivets.Binding` instance as arguments. You can then use the `Rivets.Binding` instance to pass in additional arguments to your event handlers.
