Use `rivets.configure` to set the following configuration options for your app. Note that all configuration options can be overridden locally to a particular view if needed.

#### Prefix

To prevent attribute collision, Rivets.js scopes attributes that are prefixed with the value set on `config.prefix`. By default it is set to `rv` so that binding declarations are written as `rv-value`, but you can set this to whatever you like.

```javascript
rivets.configure({
  prefix: 'special'
})
```

#### Data preloading

Set the `preloadData` option to `false` if you don't want your bindings to be bootstrapped with the current model values immediately on bind. This option is set to `true` by default.

```javascript
rivets.configure({
  preloadData: false
})
```

#### Template delimiters

Rivets.js allows interpolating text content with bindings. The delimiters around the bindings are configurable by setting the `config.templateDelimiters` option. By default the template delimiters are single curcly-braces, but you can set this to whatever you like. This is also useful if you have another templating system running over your templates before or after Rivets.js that uses the same delimiters. You can tune Rivets.js differently to avoid any conflicts.

```javascript
rivets.configure({
  templateDelimiters: ['{', '}']
})
```

#### Event handlers

Rivets.js comes with an `on-*` binder for attaching event handlers to DOM nodes on a particular event. Depending on your workflow, you may want to augment how Rivets.js calls your event handlers. The `handler` function lets you do just that.

The default event handler behaves like a standard DOM event handler &mdash; called in the context of the event target, passing in the event object as the first argument &mdash; but with a second argument as the model scope of the view.

```javascript
rivets.configure({
  handler: function(target, event, binding) {
    this.call(target, event, binding.view.models)
  }
})
```

The `config.handler` function is called in the context of the original event handler, passed in the event target (`target`), event object (`event`), and the `Rivets.Binding` instance (`binding`). Using these objects, you can augment the call to the original handler function however you like.
