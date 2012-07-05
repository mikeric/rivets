# Rivets.js

Rivets.js is a declarative, observer-based DOM-binding facility that plays well with existing frameworks and supports multiple contexts. It aims to be lightweight (1.2KB minified and gzipped), extensible, and configurable to work with any event-driven model.

## Disclaimer

Rivets.js is alpha software. While it should work well enough for prototyping and weekend projects, it is still undergoing major development. APIs are subject to change.

## Usage

No contrived example here yet, but the `rivets` module is simple. It exposes three main functions; a `configure` function that is used to set configuration options and the adapter interface, a `register` function that is used to register custom data bindings and a `bind` function that is used to bind a set of context objects to a DOM element.

The `bind` function takes two arguments; the parent DOM element that you wish to bind to and a set of context objects.

    rivets.bind(el, {user: currentUser, item: item});

Context objects are referenced in your data-binding declarations using dot-notation:

    <input type="text" data-value="currentUser.email">
    <input type="checkbox" data-enabled="item.active">

Configuring Rivets.js is required before anything can be bound, as binding is dependant on having an adapter defined. Here's a sample configuration for using Rivets.js with Backbone.js.

    rivets.configure({
      adapter: {
        subscribe: function(obj, keypath, callback) {
          obj.on('change:' + keypath, function(m, v) { callback(v) });
        },
        read: function(obj, keypath) {
          return obj.get(keypath);
        },
        publish: function(obj, keypath, value) {
          obj.set(keypath, value);
        }
      }
    });

To add custom data bindings, use the `register` function and pass in an identifier for the binding as well as the binding function. Binding functions take two arguments; `el` which is the DOM element and `value` which is any new incoming value from the observed context object.

    rivets.register('active', function(el, value){
      el.className = value ? 'active' : 'inactive';
    });

#### Available bindings:

- **data-text**: one-way binding that sets the node's text.
- **data-html**: one-way binding that sets the node's html content.
- **data-value**: two-way binding that sets the node's value.
- **data-show**: one-way binding that sets the node's display state.
- **data-hide**: one-way inverse binding that sets the node's display state.
- **data-enabled**: one-way binding that sets the node's enabled state.
- **data-disabled**: one-way inverse binding that sets the node's enabled state.
- **data-checked**: two-way binding that sets the node's checked state.
- **data-unchecked**: two-way inverse binding that sets the node's checked state.
- **data-selected**: two-way binding that sets the node's selected state.
- **data-unselected**: two-way inverse binding that sets the node's checked state.
- **data-[attribute]**: one-way binding that sets the node's attribute value.

## Adapters

Rivets.js is model interface-agnostic, meaning it can work with any event-driven model by way of defining an adapter. This makes it trivial to set up Rivets.js to work with frameworks like [Backbone.js](http://documentcloud.github.com/backbone/), [Spine.js](http://spinejs.com/) and [Stapes.js](http://hay.github.com/stapes/) with minimal configuration.

An adapter is just an object that responds to `subscribe`, `read` and `publish`.

#### subscribe(obj, keypath, callback)

- **obj**: The model object that we want to subscribe to for attribute changes. These are what get passed in as context objects when calling `rivets.bind`.
- **keypath**: The attribute name that we want to scope to when subscribing to the model's attribute changes. This would most commonly be a single key or a nested keypath (support for nested keypaths depends on if your model object publishes events on nested attribute changes). You may define and intercept this value in any format, for example if your model object uses `author[profile][bio]` instead of `author.profile.bio`.
- **callback**: The function that performs the binding routine. Call this function with the new attribute value.

#### read(obj, keypath)

- **obj**: The model object that we want to read the attribute from.
- **keypath**: The attribute name that we want to read from the model object.

#### publish(obj, keypath, value)

- **obj**: The model object that we want to set the new attribute value on.
- **keypath**: The attribute name that we want to set on the model object.
- **value**: The new attribute value that we want to set on the model.